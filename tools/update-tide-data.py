#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
奎壁山摩西分海 — 年度潮汐資料一鍵更新
======================================
用法: 雙擊「更新潮汐資料.bat」, 或 python update-tide-data.py [西元年]
      python update-tide-data.py 2027 --from-json   不重抓官方資料，只用現有 assets/tide-2027.json 重建頁面
流程: 抓澎管處 12 個月表 → 解析驗證 → 計算加值欄位與精選場次 → 產出 assets/tide-{年}.json
     → 自動更新 moses.html（標題/描述/OG、結構化資料、精選場次清單、資料檔版本）、llms.txt 與 sitemap.xml
     → 改完會自我檢查：頁面上不能殘留舊年份，否則不寫入並列出位置
若該年 JSON 已存在, 會先做比對(黃金測試)再詢問是否覆蓋。
資料來源: 澎湖國家風景區管理處 https://www.penghu-nsa.gov.tw/Services/Tidenew
"""
import sys, os, re, json, math, datetime, urllib.request, time, hashlib
from html.parser import HTMLParser

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, 'public') if os.path.exists(os.path.join(ROOT, 'public')) else ROOT
URL_TPLS = [
    "https://www.penghu-nsa.gov.tw/Services/Tidenew/{roc}{mm:02d}tide.htm",
    "https://www.penghu-nsa.gov.tw/TravelGuide/Tidenew/{roc}{mm:02d}tide.htm",
]
UA = {"User-Agent": "Mozilla/5.0 (tide-data-updater; kiwi-villa.com)"}

# ============ 1. HTML 表格解析 ============
class TableParser(HTMLParser):
    """抽出頁面第一個 <table> 的所有列, 每格為合併空白後的純文字"""
    def __init__(self):
        super().__init__()
        self.rows, self._row, self._cell = [], None, None
        self._table_depth = 0
        self._done = False
    def handle_starttag(self, tag, attrs):
        if self._done: return
        if tag == 'table':
            self._table_depth += 1
        elif self._table_depth and tag == 'tr':
            self._row = []
        elif self._table_depth and tag in ('td', 'th'):
            self._cell = []
    def handle_endtag(self, tag):
        if self._done: return
        if tag == 'table' and self._table_depth:
            self._table_depth -= 1
            if self._table_depth == 0:
                self._done = True
        elif tag in ('td', 'th') and self._cell is not None:
            txt = re.sub(r'\s+', ' ', ''.join(self._cell)).strip()
            if self._row is not None:
                self._row.append(txt)
            self._cell = None
        elif tag == 'tr' and self._row is not None:
            if self._row:
                self.rows.append(self._row)
            self._row = None
    def handle_data(self, data):
        if self._cell is not None:
            self._cell.append(data)

WEEKDAY_FIX = {'㇐': '一', '—': '一', '–': '一'}
WEEKDAYS = '一二三四五六日'
TIME_RE = re.compile(r'^\d{2}:\d{2}$')
WINDOW_RE = re.compile(r'^\d{2}:\d{2}\s*-\s*\d{2}:\d{2}$')

def norm_weekday(t):
    t = t.strip()
    return WEEKDAY_FIX.get(t, t)

def norm_time(t):
    t = t.strip().replace('：', ':')
    m = re.search(r'(\d{1,2}):(\d{2})', t)
    if not m:
        raise ValueError(f'無法解析時刻: {t!r}')
    return f'{int(m.group(1)):02d}:{m.group(2)}'

def parse_month(html_text, year, month):
    """回傳 [{date, weekday, special, sessions:[{highTide,lowTide,window}]}]"""
    tp = TableParser()
    tp.feed(html_text)
    rows = tp.rows
    if not rows:
        raise ValueError('頁面中找不到表格')
    header = rows[0]
    has_special = any('特定日' in c.replace(' ', '') for c in header)
    ncols = len(header)
    days, cur = [], None
    for row in rows[1:]:
        if len(row) >= ncols - 1 and row[0].strip().isdigit():
            d = int(row[0])
            if has_special:
                special = '特' in row[2]
                ht, lt, w = row[3], row[4], row[5] if len(row) > 5 else ''
            else:
                special = False
                ht, lt, w = row[2], row[3], row[4] if len(row) > 4 else ''
            cur = {'date': f'{year}-{month:02d}-{d:02d}',
                   'weekday': norm_weekday(row[1]), 'special': special,
                   'sessions': []}
            days.append(cur)
        elif len(row) == 3 and cur is not None:
            ht, lt, w = row
        else:
            raise ValueError(f'{month}月出現無法辨識的列({len(row)}欄): {row[:3]}...')
        w = w.strip()
        sess = {'highTide': norm_time(ht), 'lowTide': norm_time(lt), 'window': w}
        cur['sessions'].append(sess)
    return days

# ============ 2. 驗證 ============
def validate(all_days, year):
    errs = []
    expect = (datetime.date(year, 12, 31) - datetime.date(year, 1, 1)).days + 1
    if len(all_days) != expect:
        errs.append(f'天數 {len(all_days)} ≠ {expect}')
    seen = set()
    for d in all_days:
        dt = datetime.date.fromisoformat(d['date'])
        if d['date'] in seen:
            errs.append(f'{d["date"]} 重複')
        seen.add(d['date'])
        if WEEKDAYS[dt.weekday()] != d['weekday']:
            errs.append(f'{d["date"]} 星期不符: 表載{d["weekday"]} 曆算{WEEKDAYS[dt.weekday()]}')
        if not d['sessions']:
            errs.append(f'{d["date"]} 無場次')
        for s in d['sessions']:
            for k in ('highTide', 'lowTide'):
                if not TIME_RE.match(s[k]):
                    errs.append(f'{d["date"]} {k} 格式錯: {s[k]}')
    return errs

# ============ 3. 加值計算 (月相潮差 + NOAA 日出日落 + 行程時刻) ============
SYNODIC = 29.530588853
EPOCH = datetime.datetime(2000, 1, 6, 18, 14)
TIDE_AGE = 1.5
LAT, LON, TZ = 23.5987, 119.6222, 8
ARRIVE_LEAD = {'big': 40, 'mid': 30, 'small': 20}
RETURN_BEFORE = 30

def moon_dist(d):
    dt = datetime.datetime(d.year, d.month, d.day, 4, 0)
    age = ((dt - EPOCH).total_seconds() / 86400.0 - TIDE_AGE) % SYNODIC
    return min(min(age, SYNODIC - age), abs(age - SYNODIC / 2))

_sun_cache = {}
def sun_times(d):
    if d in _sun_cache:
        return _sun_cache[d]
    doy = d.timetuple().tm_yday
    g = 2 * math.pi / 365 * (doy - 1 + 0.5)
    eqt = 229.18 * (0.000075 + 0.001868 * math.cos(g) - 0.032077 * math.sin(g)
          - 0.014615 * math.cos(2 * g) - 0.040849 * math.sin(2 * g))
    dec = (0.006918 - 0.399912 * math.cos(g) + 0.070257 * math.sin(g)
           - 0.006758 * math.cos(2 * g) + 0.000907 * math.sin(2 * g)
           - 0.002697 * math.cos(3 * g) + 0.00148 * math.sin(3 * g))
    la = math.radians(LAT)
    cosha = (math.cos(math.radians(90.833)) / (math.cos(la) * math.cos(dec))
             - math.tan(la) * math.tan(dec))
    ha = math.degrees(math.acos(max(-1, min(1, cosha))))
    def hm(mu):
        t = mu + TZ * 60
        return f'{int(t // 60):02d}:{int(t % 60):02d}'
    r = (hm(720 - 4 * (LON + ha) - eqt), hm(720 - 4 * (LON - ha) - eqt))
    _sun_cache[d] = r
    return r

def hm_add(hm, minutes):
    h, m = map(int, hm.split(':'))
    t = ((h * 60 + m + minutes) % 1440 + 1440) % 1440  # 跨午夜取模
    return f'{t // 60:02d}:{t % 60:02d}'

def to_min(hm):
    return int(hm[:2]) * 60 + int(hm[3:])

def time_tag(start):
    h = int(start[:2])
    return 'dawn' if h < 8 else 'morning' if h < 11 else 'noon' if h < 14 else 'afternoon' if h < 17 else 'evening'

def enrich(all_days, year):
    dates = [datetime.date.fromisoformat(d['date']) for d in all_days]
    dists = sorted(moon_dist(x) for x in dates)
    t1, t2 = dists[len(dists) // 3], dists[len(dists) * 2 // 3]
    out, stats = {}, {'sessions': 0, 'closed': 0, 'sunrise': 0}
    for day in all_days:
        dt = datetime.date.fromisoformat(day['date'])
        v = moon_dist(dt)
        lv = 'big' if v <= t1 else 'mid' if v <= t2 else 'small'
        sessions = []
        for s in day['sessions']:
            w = s['window'].strip()
            if '-' not in w or ':' not in w or len(w) < 11:
                sessions.append({'ht': s['highTide'], 'lt': s['lowTide'], 'closed': 1, 'note': w})
                stats['closed'] += 1
                continue
            start, end = [norm_time(x) for x in w.split('-')]
            theo = hm_add(s['highTide'], 180)
            if to_min(start) - to_min(theo) <= 20:
                show = 'full'
            elif to_min(start) < to_min(s['lowTide']):
                show = 'partial'
            else:
                show = 'none'
            sess = {'ht': s['highTide'], 'lt': s['lowTide'], 'o': start, 'c': end,
                    'arr': hm_add(start, -ARRIVE_LEAD[lv] if show == 'full' else -10),
                    'ret': hm_add(end, -RETURN_BEFORE), 'tag': time_tag(start), 'show': show}
            mg = hm_add(s['lowTide'], 150)
            if to_min(mg) <= to_min(sun_times(dt)[1]) + 30:
                sess['mg'] = mg
            if day['special'] and sess['tag'] == 'dawn' and show != 'none' \
               and to_min(start) <= to_min(sun_times(dt)[0]) + 60:
                sess['sun'] = 1
                sess['sr'] = sun_times(dt)[0]
                stats['sunrise'] += 1
            sessions.append(sess)
            stats['sessions'] += 1
        out[day['date']] = {'w': day['weekday'], 'sp': 1 if day['special'] else 0,
                            'lv': lv, 's': sessions}
    mark_highlights(out)
    return out, summarize(out)

# ============ 3b. 精選場次（頁面 JS 與靜態清單共用這一份規則） ============
WEEKEND = ('六', '日')
DAYTIME = ('morning', 'noon', 'afternoon')
HL_RULE = ('sun=完美日出場(日出場且開門時分海尚未開始); '
           'wk=週末大潮場(週六日+大潮+白天場+可看完整分海, 同一個週末只取第一場)')

def mark_highlights(days):
    """在場次上標記 hl：'sun' 完美日出場、'wk' 週末大潮場。頁面 JS 只顯示今天以後有標記的場次。"""
    last_weekend = None
    for k in sorted(days):
        d = days[k]
        dt = datetime.date.fromisoformat(k)
        for s in d['s']:
            s.pop('hl', None)
            if s.get('closed'):
                continue
            if s.get('sun') and s.get('show') == 'full':
                s['hl'] = 'sun'
            elif (d['lv'] == 'big' and d['w'] in WEEKEND and s.get('show') == 'full'
                  and s.get('tag') in DAYTIME):
                saturday = dt - datetime.timedelta(days=dt.weekday() - 5)
                if saturday != last_weekend:
                    s['hl'] = 'wk'
                    last_weekend = saturday
    return days

def summarize(days):
    st = {'sessions': 0, 'closed': 0, 'sunrise': 0, 'hl_sun': 0, 'hl_wk': 0}
    for d in days.values():
        for s in d['s']:
            if s.get('closed'):
                st['closed'] += 1
                continue
            st['sessions'] += 1
            st['sunrise'] += 1 if s.get('sun') else 0
            st['hl_sun'] += 1 if s.get('hl') == 'sun' else 0
            st['hl_wk'] += 1 if s.get('hl') == 'wk' else 0
    return st

ZH_DIGITS = '〇一二三四五六七八九'

def zh_num(n):
    if n < 10:
        return ZH_DIGITS[n]
    if n < 100:
        tens, ones = divmod(n, 10)
        return ('' if tens == 1 else ZH_DIGITS[tens]) + '十' + (ZH_DIGITS[ones] if ones else '')
    return str(n)

def highlight_items(days):
    """回傳 (完美日出場 <li> 清單, 週末大潮場 <li> 清單)，格式與頁面 JS 產生的一致"""
    sun, wk = [], []
    for k in sorted(days):
        for s in days[k]['s']:
            if s.get('hl') == 'sun':
                sun.append((k, days[k], s))
            elif s.get('hl') == 'wk':
                wk.append((k, days[k], s))
    n_weekend_sun = sum(1 for k, d, s in sun if d['w'] in WEEKEND)

    def label(k, d):
        return f'<strong>{int(k[5:7])}/{int(k[8:10])}（{d["w"]}）</strong>'
    sun_li = []
    for k, d, s in sun:
        tag = ''
        if d['w'] in WEEKEND:
            tag = '（唯一假日場）' if n_weekend_sun == 1 else '（假日場）'
        # 日出多半早於開門前的建議抵達時間：先寫看日出要幾點到岸邊（日出前 15 分），再寫幾點回閘門口（與查詢器時間軸一致）
        sun_li.append(f'<li>{label(k, d)}日出 {s["sr"]}・{hm_add(s["sr"], -15)} 前到岸邊、{s["arr"]} 回閘門口{tag}</li>')
    wk_li = [f'<li>{label(k, d)}{s["o"]}–{s["c"]}・{s["arr"]} 前抵達</li>' for k, d, s in wk]
    return sun_li, wk_li

def replace_list(html, ul_id, items, empty_msg):
    m = re.search(rf'(<ul id="{ul_id}">)(.*?)(\n([ \t]*)</ul>)', html, re.S)
    if not m:
        raise SystemExit(f'✗ moses.html 找不到 <ul id="{ul_id}">（版面可能被改過，請把這段訊息貼給 Claude）')
    indent = m.group(4) + '    '
    body = items or [f'<li class="hl-empty">{empty_msg}</li>']
    return html[:m.start(2)] + ''.join('\n' + indent + li for li in body) + html[m.end(2):]

# ============ 4. 網站檔案自動更新 ============
# moses.html 裡「可以留著舊年份」的行：頁尾版權、資料檔版本表（跨年時保留去年）、資料更新日期
YEAR_OK_MARKERS = ('&copy;', 'const TIDE_FILES', '資料更新：')

def update_site(year, version, days, stats, data_refreshed=True):
    """改好 moses.html / llms.txt / sitemap.xml；moses.html 先在記憶體改完並自我檢查，通過才寫入"""
    yr, roc, today = str(year), year - 1911, datetime.date.today()
    mp = os.path.join(PUB, 'moses.html')
    s = open(mp, encoding='utf-8').read()
    m = re.search(r'<title>[^<]*?(\d{4}) 潮汐表', s)
    if not m:
        raise SystemExit('✗ moses.html 的 <title> 找不到「YYYY 潮汐表」，無法判斷頁面目前的年份')
    old = m.group(1)
    year_re = re.compile(rf'(?<!\d){old}(?!\d)')

    # 1) <head>：title、description、OG／Twitter
    h = s.index('</head>')
    s = year_re.sub(yr, s[:h]) + s[h:]
    # 2) Dataset 結構化資料（名稱、描述、temporalCoverage、contentUrl）
    s = re.sub(r'<script type="application/ld\+json">.*?</script>',
               lambda mm: year_re.sub(yr, mm.group(0)) if '"Dataset"' in mm.group(0) else mm.group(0),
               s, flags=re.S)
    # 3) 資料檔版本表：只留「去年＋今年」，12 月更新後到跨年前，兩年的日期都查得到
    mm = re.search(r'const TIDE_FILES = (\{[^}]*\});', s)
    if not mm:
        raise SystemExit('✗ moses.html 找不到 const TIDE_FILES（版面可能被改過，請把這段訊息貼給 Claude）')
    files = json.loads(mm.group(1))
    files[yr] = version
    files = {k: files[k] for k in sorted(files) if int(k) >= year - 1}
    s = s[:mm.start(1)] + json.dumps(files) + s[mm.end(1):]
    # 4) 查詢器的年份文字與日期範圍（JS 載入資料後還會依實際年份再設定一次）
    s = re.sub(r'(<span id="tide-years">)[^<]*(</span>)', rf'\g<1>{yr}\g<2>', s)
    s = re.sub(r'min="\d{4}-01-01" max="\d{4}-12-31"', f'min="{yr}-01-01" max="{yr}-12-31"', s)
    # 5) 精選場次（靜態清單給搜尋引擎與 AI 讀；瀏覽器上 JS 會只留今天以後的場次）
    sun_li, wk_li = highlight_items(days)
    s = re.sub(r'(<h2 id="hl-title">)\d{4}', rf'\g<1>{yr}', s)
    s = re.sub(r'從全年 \d+ 個通行場次', f'從全年 {stats["sessions"]} 個通行場次', s)
    s = re.sub(r'全年僅 \d+ 場', f'全年僅 {len(sun_li)} 場', s)
    s = re.sub(r'\d{4} 年(?:只有這[〇一二三四五六七八九十]+天|沒有這樣的日子)',
               f'{yr} 年只有這{zh_num(len(sun_li))}天' if sun_li else f'{yr} 年沒有這樣的日子', s)
    s = replace_list(s, 'hl-sun', sun_li, f'{yr} 年沒有符合條件的日出場。')
    s = replace_list(s, 'hl-wk', wk_li, f'{yr} 年沒有符合條件的週末大潮場。')
    # 6) 資料來源與更新日期
    s = re.sub(r'「\d+ 年北寮赤嶼陸連島海域乾滿潮潮汐預報表」', f'「{roc} 年北寮赤嶼陸連島海域乾滿潮潮汐預報表」', s)
    if data_refreshed:   # --from-json 只重建頁面、資料沒變，就不改「資料更新」日期
        s = re.sub(r'資料更新：\d{4}-\d{2}', f'資料更新：{today.year}-{today.month:02d}', s)

    # 7) 自我檢查：不通過就不寫入
    problems = []
    if old != yr:
        for i, line in enumerate(s.splitlines(), 1):
            if year_re.search(line) and not any(k in line for k in YEAR_OK_MARKERS):
                problems.append(f'第 {i} 行仍是 {old} 年：{line.strip()[:90]}')
    for must in (f'{yr} 潮汐表', f'tide-{yr}.json', f'"temporalCoverage": "{yr}-01-01/{yr}-12-31"',
                 f'"{yr}": "{version}"'):
        if must not in s:
            problems.append(f'找不到預期內容：{must}')
    for b in re.findall(r'<script type="application/ld\+json">(.*?)</script>', s, re.S):
        try:
            json.loads(b)
        except json.JSONDecodeError as e:
            problems.append(f'JSON-LD 無法解析：{e}')
    if not s.rstrip().endswith('</html>'):
        problems.append('檔尾不是 </html>（可能被截斷）')
    if problems:
        print('\n✗ moses.html 更新後的檢查沒通過，已取消寫入（請把以下訊息貼給 Claude）:')
        for p in problems:
            print('  -', p)
        sys.exit(1)
    open(mp, 'w', encoding='utf-8').write(s)

    # llms.txt（給 AI 讀的網站摘要）
    lp = os.path.join(PUB, 'llms.txt')
    if os.path.exists(lp):
        l = open(lp, encoding='utf-8').read()
        l2 = re.sub(r'提供 \d{4} 全年奎壁山摩西分海', f'提供 {yr} 全年奎壁山摩西分海', l)
        if l2 != l:
            open(lp, 'w', encoding='utf-8').write(l2)
        elif f'提供 {yr} 全年奎壁山摩西分海' not in l:
            print('⚠ llms.txt 找不到摩西分海那一行的年份，請手動確認')
    # sitemap.xml
    sp = os.path.join(PUB, 'sitemap.xml')
    x = open(sp, encoding='utf-8').read()
    x2 = re.sub(r'(<loc>https://www\.kiwi-villa\.com/moses</loc>\s*<lastmod>)\d{4}-\d{2}-\d{2}',
                lambda mm2: mm2.group(1) + today.isoformat(), x)
    open(sp, 'w', encoding='utf-8').write(x2)
    return files

# ============ 5. 黃金比對 ============
def compare_existing(new_days, path):
    old = json.load(open(path, encoding='utf-8'))['days']
    diffs = []
    for k in sorted(set(old) | set(new_days)):
        a, b = old.get(k), new_days.get(k)
        if a != b:
            diffs.append(k)
    return diffs

# ============ main ============
def fetch_and_build(year, out_path):
    """抓官方 12 個月表 → 驗證 → 加值計算；回傳 (meta, days, stats)，使用者取消時回傳 None"""
    roc = year - 1911
    print(f'\n=== 開始更新 {year} 年（民國 {roc} 年）摩西分海資料 ===\n')
    all_days = []
    for mm in range(1, 13):
        html_text, last_err = None, None
        for tpl in URL_TPLS:
            url = tpl.format(roc=roc, mm=mm)
            for attempt in range(2):
                try:
                    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
                        html_text = r.read().decode('utf-8', 'replace')
                    break
                except Exception as e:
                    last_err = e
                    time.sleep(1.5)
            if html_text:
                break
        if not html_text:
            print(f'✗ {mm} 月抓取失敗（{last_err}）')
            print(f'  官方可能尚未公布 {roc} 年表（通常於前一年 12 月左右公布），請之後再試。')
            sys.exit(1)
        month_days = parse_month(html_text, year, mm)
        all_days.extend(month_days)
        print(f'✓ {mm:2d} 月：{len(month_days)} 天 / {sum(len(d["sessions"]) for d in month_days)} 場')
        time.sleep(0.6)

    errs = validate(all_days, year)
    if errs:
        print('\n✗ 驗證未通過（官方版式可能調整了，請把以下訊息回報給 Claude）:')
        for e in errs[:10]:
            print('  -', e)
        sys.exit(1)
    print('\n✓ 驗證通過（天數 / 星期 / 時刻格式）')

    days, stats = enrich(all_days, year)

    if os.path.exists(out_path):
        diffs = compare_existing(days, out_path)
        if diffs:
            print(f'\n⚠ 與現有 tide-{year}.json 有 {len(diffs)} 天差異（例：{diffs[:3]}）')
            if input('要覆蓋嗎？(y/N) ').lower() != 'y':
                print('已取消。')
                return None
        else:
            print(f'\n✓ 黃金測試 PASS：解析結果與現有 tide-{year}.json 完全一致！')
            if input('檔案無變化，仍要重寫並更新網頁年份嗎？(y/N) ').lower() != 'y':
                print('完成（無變更）。')
                return None

    meta = {'generated': datetime.date.today().isoformat(), 'year': year,
            'source': f'澎湖國家風景區管理處 {roc}年北寮赤嶼陸連島海域乾滿潮潮汐預報表',
            'sourceUrl': 'https://www.penghu-nsa.gov.tw/Services/Tidenew',
            'levelMethod': '月相近似+潮齡1.5天, 全年三分位',
            'params': {'arriveLead': ARRIVE_LEAD, 'returnBefore': RETURN_BEFORE},
            'disclaimer': '實際開放以現場管制(旗幟/廣播)為準'}
    return meta, days, stats

def main():
    argv = sys.argv[1:]
    from_json = '--from-json' in argv
    args = [a for a in argv if not a.startswith('--')]
    default_year = datetime.date.today().year + 1
    if args:
        year = int(args[0])
    elif from_json:
        print('用法：python update-tide-data.py 2027 --from-json')
        sys.exit(1)
    else:
        arg = input(f'要更新哪一年的資料？(直接按 Enter = {default_year}) ').strip()
        year = int(arg) if arg else default_year
    out_path = os.path.join(PUB, 'assets', f'tide-{year}.json')

    # 防呆：頁面已經是比較新的年份時，再跑舊年份會把網頁改回去
    page = open(os.path.join(PUB, 'moses.html'), encoding='utf-8').read()
    mm = re.search(r'const TIDE_FILES = (\{[^}]*\});', page)
    newest = max(map(int, json.loads(mm.group(1)))) if mm else year
    if newest > year and input(f'⚠ 網頁目前已是 {newest} 年資料，確定要改回 {year} 年嗎？(y/N) ').lower() != 'y':
        print('已取消。')
        sys.exit(0)

    if from_json:
        if not os.path.exists(out_path):
            print(f'✗ 找不到 assets/tide-{year}.json')
            sys.exit(1)
        print(f'\n=== 用現有 assets/tide-{year}.json 重建頁面（不重新抓官方資料）===\n')
        data = json.load(open(out_path, encoding='utf-8'))
        meta, days = data['meta'], mark_highlights(data['days'])
        stats = summarize(days)
    else:
        built = fetch_and_build(year, out_path)
        if built is None:
            sys.exit(0)
        meta, days, stats = built

    meta['highlights'] = HL_RULE
    payload = json.dumps({'meta': meta, 'days': days}, ensure_ascii=False, separators=(',', ':'))
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(payload)
    version = hashlib.sha1(payload.encode('utf-8')).hexdigest()[:10]   # 內容一變版本就變，瀏覽器不會吃到舊快取
    print(f'✓ 已產出 assets/tide-{year}.json（{os.path.getsize(out_path):,} bytes，版本 {version}）')
    print(f'  場次 {stats["sessions"]}／夜間不開放 {stats["closed"]}／日出場 {stats["sunrise"]}'
          f'／精選：完美日出場 {stats["hl_sun"]}、週末大潮場 {stats["hl_wk"]}')

    files = update_site(year, version, days, stats, data_refreshed=not from_json)
    print(f'✓ 已更新 moses.html（年份、標題與描述、結構化資料、精選場次清單；頁面載入 {"、".join(files)} 年資料）')
    print('✓ 已更新 llms.txt 與 sitemap.xml')
    print('\n=== 完成！請用 git 提交變更並合併回 main 部署 ===')
    print('   提醒：去年的 assets/tide-*.json 請先保留（跨年那幾週頁面還會用到）')
    print('   建議先本地預覽確認：python -m http.server 8000 --directory public → localhost:8000/moses.html')

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('\n已取消。')
