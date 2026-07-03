#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
奎壁山摩西分海 — 年度潮汐資料一鍵更新
======================================
用法: 雙擊「更新潮汐資料.bat」, 或 python update-tide-data.py [西元年]
流程: 抓澎管處 12 個月表 → 解析驗證 → 計算加值欄位 → 產出 assets/tide-{年}.json
     → 自動更新 moses.html 與 sitemap.xml → 提示 commit
若該年 JSON 已存在, 會先做比對(黃金測試)再詢問是否覆蓋。
資料來源: 澎湖國家風景區管理處 https://www.penghu-nsa.gov.tw/Services/Tidenew
"""
import sys, os, re, json, math, datetime, urllib.request, time
from html.parser import HTMLParser

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
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
    t = max(0, min(h * 60 + m + minutes, 23 * 60 + 59))
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
    return out, stats

# ============ 4. 網站檔案自動更新 ============
def update_site(year, version):
    mp = os.path.join(ROOT, 'moses.html')
    s = open(mp, encoding='utf-8').read()
    orig = s
    s = re.sub(r"/assets/tide-\d{4}\.json\?v=[0-9a-z]+", f"/assets/tide-{year}.json?v={version}", s)
    s = re.sub(r'min="\d{4}-01-01" max="\d{4}-12-31"', f'min="{year}-01-01" max="{year}-12-31"', s)
    s = re.sub(r'資料涵蓋 \d{4} 全年', f'資料涵蓋 {year} 全年', s)
    s = re.sub(r'「\d+ 年北寮赤嶼陸連島海域乾滿潮潮汐預報表」', f'「{year - 1911} 年北寮赤嶼陸連島海域乾滿潮潮汐預報表」', s)
    today = datetime.date.today()
    s = re.sub(r'資料更新：\d{4}-\d{2}', f'資料更新：{today.year}-{today.month:02d}', s)
    n_changed = sum(1 for a, b in [(orig, s)] if a != b)
    open(mp, 'w', encoding='utf-8').write(s)
    sp = os.path.join(ROOT, 'sitemap.xml')
    x = open(sp, encoding='utf-8').read()
    x2 = re.sub(r'(<loc>https://www\.kiwi-villa\.com/moses</loc>\s*<lastmod>)\d{4}-\d{2}-\d{2}',
                lambda m: m.group(1) + today.isoformat(), x)
    open(sp, 'w', encoding='utf-8').write(x2)
    return n_changed, x != x2

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
def main():
    default_year = datetime.date.today().year + 1
    arg = sys.argv[1] if len(sys.argv) > 1 else input(f'要更新哪一年的資料？(直接按 Enter = {default_year}) ').strip()
    year = int(arg) if arg else default_year
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
    out_path = os.path.join(ROOT, 'assets', f'tide-{year}.json')

    if os.path.exists(out_path):
        diffs = compare_existing(days, out_path)
        if diffs:
            print(f'\n⚠ 與現有 tide-{year}.json 有 {len(diffs)} 天差異（例：{diffs[:3]}）')
            if input('要覆蓋嗎？(y/N) ').lower() != 'y':
                print('已取消。')
                sys.exit(0)
        else:
            print(f'\n✓ 黃金測試 PASS：解析結果與現有 tide-{year}.json 完全一致！')
            if input('檔案無變化，仍要重寫並更新網頁年份嗎？(y/N) ').lower() != 'y':
                print('完成（無變更）。')
                sys.exit(0)

    version = datetime.date.today().strftime('%Y%m%d')
    meta = {'generated': datetime.date.today().isoformat(), 'year': year,
            'source': f'澎湖國家風景區管理處 {roc}年北寮赤嶼陸連島海域乾滿潮潮汐預報表',
            'sourceUrl': 'https://www.penghu-nsa.gov.tw/Services/Tidenew',
            'levelMethod': '月相近似+潮齡1.5天, 全年三分位',
            'params': {'arriveLead': ARRIVE_LEAD, 'returnBefore': RETURN_BEFORE},
            'disclaimer': '實際開放以現場管制(旗幟/廣播)為準'}
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump({'meta': meta, 'days': days}, f, ensure_ascii=False, separators=(',', ':'))
    print(f'\n✓ 已產出 assets/tide-{year}.json（{os.path.getsize(out_path):,} bytes）')
    print(f'  場次 {stats["sessions"]}／夜間不開放 {stats["closed"]}／日出場 {stats["sunrise"]}')

    update_site(year, version)
    print(f'✓ 已更新 moses.html（fetch 版本 {version}、日期範圍、來源年份）與 sitemap.xml')
    print('\n=== 完成！請用 git 提交變更並合併回 main 部署 ===')
    print('   建議先本地預覽確認：python -m http.server 8000 → localhost:8000/moses.html')

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('\n已取消。')
