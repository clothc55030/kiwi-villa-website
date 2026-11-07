"""產生 /location「期遇在哪裡？」的澎湖地圖（inline SVG），寫進 public/location.html 的 MAP:BEGIN／MAP:END 之間。

海岸線用內政部 1:1 萬村里界（taiwan-atlas 套件重新發布的 TopoJSON，源自政府資料開放平臺「村里界圖」），
畫馬公、湖西、白沙、西嶼四個鄉市＋周邊小島；配色、字體由 location.html 的 .pm-* 樣式控制。

2026-11-03 疊 Google 地圖核對過：海岸線大致吻合，只有北寮東岸（湖西風車一帶）Google 多畫了約 300～500 公尺的陸地。
國土測繪中心的通用電子地圖與航照都跟村里界一致（海岸是一條斜直的沙灘，外面是淺海礁岩），
Google 應該是把退潮才露出的潮間帶也畫成陸地，所以不要照 Google 改；OpenStreetMap 在這一段也跟村里界一樣。

用法（專案根目錄）：
    pip install shapely
    python tools/make-location-map.py                  # 下載資料（第一次）並更新 public/location.html
    python tools/make-location-map.py --preview x.html # 另存一份預覽頁，不改 location.html

要改標示的位置、文字或車程：改下方 KIWI／POIS／TOWN_LABELS（座標用經緯度，文字位置用 SVG 單位的位移）；
要改顏色、字級：改 location.html 的 .pm-* 樣式（MAP-CSS:BEGIN／END 之間）。
改完跑 python tools/verify_site_integrity.py，並在手機與桌機看一次文字有沒有壓到陸地。
"""
import argparse, io, json, math, os, re, sys, tarfile, tempfile, urllib.request

from shapely.geometry import Polygon, MultiPolygon, LineString, Point, box
from shapely.ops import unary_union

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = os.path.join(ROOT, "public", "location.html")
DATA_URL = "https://registry.npmjs.org/taiwan-atlas/-/taiwan-atlas-2021.9.20.tgz"   # 內含 villages-10t.json（村里／鄉鎮界）
DATA_FILE = os.path.join(tempfile.gettempdir(), "taiwan-atlas-2021.9.20-villages-10t.json")

# 畫面範圍（經緯度）與輸出寬度（SVG 單位）。改範圍的話，下面的文字位移要重新排
LON0, LON1, LAT0, LAT1 = 119.458, 119.708, 23.503, 23.698
W = 1000
TOWNS = ["西嶼鄉", "白沙鄉", "馬公市", "湖西鄉"]

KIWI = {"lon": 119.5818157, "lat": 23.5868758,             # Google 商家官方 Pin（與 JSON-LD 相同）
        "name": "期遇度假會館", "en": "Kiwi Villa", "dx": 22, "dy": -104}
POIS = [  # 座標皆為 Google 地圖上該地點的位置（2026-11-03 核對）
    # 南海遊客中心（馬公港南海碼頭，新營路 25 號）；市區與碼頭都約 9 分鐘
    {"id": "port", "lon": 119.5725091, "lat": 23.5664648, "name": "馬公市區・碼頭", "time": "車程約 9 分鐘",
     "dx": -169, "dy": 94, "anchor": "end", "curve": -0.25},
    # 澎湖機場（航廈）
    {"id": "air", "lon": 119.6294323, "lat": 23.5607993, "name": "澎湖機場", "time": "車程約 12 分鐘",
     "dx": 18, "dy": 100, "anchor": "start", "curve": 0.2},
    # 奎壁山摩西分海（湖西鄉北寮村；步道從奎壁山 23.597237, 119.6719483 走到赤嶼 23.5986111, 119.6752778）
    {"id": "moses", "lon": 119.672563, "lat": 23.5978987, "name": "奎壁山摩西分海", "time": "車程約 18 分鐘",
     "dx": -12, "dy": -111, "anchor": "middle", "curve": -0.16},
]
TOWN_LABELS = [  # 鄉市名的位置（經緯度，文字中心）；sea=True 表示標在海面上
    {"zh": "西嶼", "en": "Xiyu", "lon": 119.4818, "lat": 23.6087, "sea": True},   # 西嶼太窄放不下字，標在島西側海面
    {"zh": "白沙", "en": "Baisha", "lon": 119.5945, "lat": 23.6559},   # 再往南「白」字會壓到港子西邊的海灣
    {"zh": "湖西", "en": "Huxi", "lon": 119.6685, "lat": 23.5730},
    {"zh": "馬公", "en": "Magong", "lon": 119.5900, "lat": 23.5587},   # 市區碼頭東南邊；以前標在南邊的澎南半島，看起來像馬公在那裡
]

KX = math.cos(math.radians((LAT0 + LAT1) / 2))
K = W / ((LON1 - LON0) * KX)
H = round((LAT1 - LAT0) * K)
M_PER_UNIT = (LON1 - LON0) * KX * 111320 / W       # 1 個 SVG 單位約 25 公尺


def P(lon, lat):
    return ((lon - LON0) * KX * K, (LAT1 - lat) * K)


def load_topo(path=None):
    if path:
        return json.load(open(path, encoding="utf-8"))
    if not os.path.exists(DATA_FILE):
        print("下載村里界資料…", DATA_URL)
        with urllib.request.urlopen(DATA_URL) as r, tarfile.open(fileobj=io.BytesIO(r.read()), mode="r:gz") as t:
            data = t.extractfile("package/villages-10t.json").read()
        open(DATA_FILE, "wb").write(data)
    return json.load(open(DATA_FILE, encoding="utf-8"))


def decode(topo):
    sx, sy = topo["transform"]["scale"]
    tx, ty = topo["transform"]["translate"]
    arcs = []
    for arc in topo["arcs"]:
        x = y = 0
        pts = []
        for dx, dy in arc:
            x += dx; y += dy
            pts.append(P(x * sx + tx, y * sy + ty))
        arcs.append(pts)

    def ring(ids):
        pts = []
        for i in ids:
            a = arcs[i] if i >= 0 else arcs[~i][::-1]
            pts.extend(a if not pts else a[1:])
        return pts

    def geom(g):
        if g["type"] == "Polygon":
            rs = [ring(r) for r in g["arcs"]]
            return Polygon(rs[0], rs[1:])
        return MultiPolygon([Polygon(ring(p[0]), [ring(r) for r in p[1:]]) for p in g["arcs"]])

    towns = {}
    for g in topo["objects"]["towns"]["geometries"]:
        p = g["properties"]
        if p.get("COUNTYNAME") == "澎湖縣" and p["TOWNNAME"] in TOWNS:
            s = geom(g)
            towns[p["TOWNNAME"]] = s if s.is_valid else s.buffer(0)
    return towns


def parts(g):
    return list(getattr(g, "geoms", [g]))


def path_d(geom, closed=True):
    out = []
    for g in parts(geom):
        if g.is_empty:
            continue
        rings = [g.exterior, *g.interiors] if isinstance(g, Polygon) else [g]
        for r in rings:
            c = list(r.coords)
            if closed and len(c) > 1 and c[0] == c[-1]:
                c = c[:-1]
            if len(c) < 2:
                continue
            out.append("M" + " ".join(f"{x:.1f} {y:.1f}" for x, y in c) + ("Z" if closed else ""))
    return "".join(out)


def bridges(raw, land):
    """原始資料裡橋是一條很細的陸地；平滑後會被去掉，改用線畫回來（只留兩端都接到陸地的細長條）。"""
    out = []
    for piece in parts(raw.difference(land.buffer(0.8))):
        if piece.area < 2:
            continue
        rect = piece.minimum_rotated_rectangle
        c = list(rect.exterior.coords)[:4]
        e = [(c[i], c[(i + 1) % 4]) for i in range(4)]
        e.sort(key=lambda s: LineString(s).length)
        a = ((e[0][0][0] + e[0][1][0]) / 2, (e[0][0][1] + e[0][1][1]) / 2)
        b = ((e[1][0][0] + e[1][1][0]) / 2, (e[1][0][1] + e[1][1][1]) / 2)
        line = LineString([a, b])
        width = LineString(e[0]).length
        if line.length < 12 or width > 3.2:
            continue
        if land.distance(Point(a)) < 4 and land.distance(Point(b)) < 4 and land.distance(line.interpolate(0.5, normalized=True)) > 3:
            out.append(line)
    return out


def chaikin(geom, n=2):
    """把多邊形的折角切圓（Chaikin 演算法），海岸線看起來比較像手繪的曲線。"""
    def ring(coords):
        pts = list(coords)[:-1]
        for _ in range(n):
            new = []
            for i, p0 in enumerate(pts):
                p1 = pts[(i + 1) % len(pts)]
                new += [(0.75 * p0[0] + 0.25 * p1[0], 0.75 * p0[1] + 0.25 * p1[1]),
                        (0.25 * p0[0] + 0.75 * p1[0], 0.25 * p0[1] + 0.75 * p1[1])]
            pts = new
        return pts
    out = []
    for g in parts(geom):
        if len(g.exterior.coords) < 4:
            continue
        p = Polygon(ring(g.exterior.coords), [ring(r.coords) for r in g.interiors if len(r.coords) >= 4])
        out.append(p if p.is_valid else p.buffer(0))
    return unary_union(out)


def text(cls, x, y, anchor, main, sub=None, sub_cls=None, sub_dy="1.3em"):
    s = f'<text class="{cls}" x="{x:.0f}" y="{y:.0f}" text-anchor="{anchor}">{main}'
    if sub:
        s += f'<tspan class="{sub_cls}" x="{x:.0f}" dy="{sub_dy}">{sub}</tspan>'
    return s + "</text>"


def build(data=None):
    towns = decode(load_topo(data))
    view = box(-20, -20, W + 20, H + 20)
    raw = unary_union([p for g in towns.values() for p in parts(g) if view.contains(p.representative_point())])
    # 平滑：去掉碼頭棧橋等細碎凸起（寬 < 約 75 m），填平很窄的小灣，轉角變圓
    land = raw.buffer(-1.5, quad_segs=4).buffer(1.5, quad_segs=4)
    land = land.buffer(2.0, quad_segs=4).buffer(-2.0, quad_segs=4)
    # 面積 < 120（約 7.5 公頃）的小礁拿掉：手機上只剩 4px 的點，像雜訊，也會黏在文字旁邊
    land = unary_union([p for p in parts(land) if p.area > 120])
    brs = bridges(raw, land)
    land = chaikin(land.simplify(0.5, preserve_topology=True)).simplify(0.3, preserve_topology=True)

    frame = box(0, 0, W, H)
    depth = [frame.intersection(land.buffer(d, quad_segs=10).simplify(1.4).boundary) for d in (13, 32)]   # 海圖線很淡，粗略一點就好

    kx, ky = P(KIWI["lon"], KIWI["lat"])
    o = [f'<svg class="pm" viewBox="0 0 {W} {H}" role="img" aria-labelledby="pm-title pm-desc" xmlns="http://www.w3.org/2000/svg">',
         '<title id="pm-title">期遇度假會館位置地圖</title>',
         '<desc id="pm-desc">澎湖本島地圖：期遇度假會館位於馬公市西衛里，開車到馬公市區與碼頭約 9 分鐘、澎湖機場約 12 分鐘、奎壁山摩西分海約 18 分鐘。</desc>',
         f'<rect class="pm-sea" width="{W}" height="{H}"/>']
    for i, r in enumerate(depth):
        o.append(f'<path class="pm-depth pm-depth{i + 1}" d="{path_d(r, closed=False)}"/>')
    if brs:
        o.append(f'<path class="pm-bridge" d="{"".join(path_d(b, closed=False) for b in brs)}"/>')
    o.append(f'<path class="pm-land" d="{path_d(land)}"/>')

    for t in TOWN_LABELS:
        x, y = P(t["lon"], t["lat"])
        o.append(text("pm-town pm-town-sea" if t.get("sea") else "pm-town", x, y, "middle", t["zh"], t["en"], "pm-town-en", "1.2em"))

    for p in POIS:      # 期遇 → 各地點的點狀弧線
        x, y = P(p["lon"], p["lat"])
        mx, my = (kx + x) / 2, (ky + y) / 2
        cx, cy = mx - (y - ky) * p["curve"], my + (x - kx) * p["curve"]
        o.append(f'<path class="pm-route" d="M{kx:.1f} {ky:.1f}Q{cx:.1f} {cy:.1f} {x:.1f} {y:.1f}"/>')

    for p in POIS:
        x, y = P(p["lon"], p["lat"])
        lx, ly = x + p["dx"], y + p["dy"]
        # 引線從點連到文字邊緣：文字在下方就接到第一行上緣，在上方就接到第二行下緣
        ex = lx + (14 if p["anchor"] == "end" else -6 if p["anchor"] == "start" else 0)
        ey = ly - 34 if p["dy"] > 0 else ly + 50
        o.append(f'<g class="pm-poi">')
        o.append(f'<line class="pm-leader" x1="{x:.1f}" y1="{y:.1f}" x2="{ex:.1f}" y2="{ey:.1f}"/>')
        o.append(f'<circle class="pm-dot" cx="{x:.1f}" cy="{y:.1f}" r="7"/>')
        o.append(text("pm-name", lx, ly, p["anchor"], p["name"], p["time"], "pm-time", "1.35em"))
        o.append('</g>')

    lx, ly = kx + KIWI["dx"], ky + KIWI["dy"]
    o += ['<g class="pm-kiwi">',
          f'<circle class="pm-halo2" cx="{kx:.1f}" cy="{ky:.1f}" r="34"/>',
          f'<circle class="pm-halo1" cx="{kx:.1f}" cy="{ky:.1f}" r="20"/>',
          f'<line class="pm-leader pm-leader-kiwi" x1="{kx + 2:.1f}" y1="{ky - 12:.1f}" x2="{lx - 6:.1f}" y2="{ly + 52:.1f}"/>',
          f'<circle class="pm-pin" cx="{kx:.1f}" cy="{ky:.1f}" r="10"/>',
          text("pm-kiwi-name", lx, ly, "end", KIWI["name"], KIWI["en"], "pm-kiwi-en", "1.25em"),
          '</g>']

    km2 = 2000 / M_PER_UNIT
    o.append(f'<g class="pm-north" transform="translate({W - 50} 52)"><path d="M0 -24L8 8L0 2L-8 8Z"/><text y="34" text-anchor="middle">N</text></g>')
    o.append(f'<g class="pm-scale" transform="translate(36 {H - 34})"><path d="M0 0H{km2:.1f}M0 -6V0M{km2:.1f} -6V0"/>'
             f'<text x="{km2 / 2:.1f}" y="-14" text-anchor="middle">2 km</text></g>')
    o.append('</svg>')
    return "\n".join(o)


PREVIEW = """<!doctype html><html lang="zh-TW"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Inter:wght@300;400;500&family=LXGW+WenKai+TC:wght@400&display=swap">
<style>body{margin:0;background:#162431;font-family:Inter,-apple-system,BlinkMacSystemFont,'PingFang TC','Noto Sans CJK TC','Microsoft JhengHei',sans-serif}.wrap{padding:40px 0}%s</style></head>
<body><div class="wrap"><figure class="map-figure">%s</figure></div></body></html>"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--preview", help="另存預覽頁（不改 location.html）")
    ap.add_argument("--data", help="已下載的 villages-10t.json（不給就自動下載）")
    a = ap.parse_args()
    svg = build(a.data)
    page = open(PAGE, encoding="utf-8").read()
    if a.preview:
        css = re.search(r"/\* MAP-CSS:BEGIN \*/(.*?)/\* MAP-CSS:END \*/", page, re.S)
        open(a.preview, "w", encoding="utf-8").write(PREVIEW % (css.group(1) if css else "", svg))
        print("預覽：", a.preview, f"（SVG {len(svg.encode()) / 1024:.1f} KB）")
        return
    new, n = re.subn(r"(<!-- MAP:BEGIN[^>]*-->)(.*?)(<!-- MAP:END -->)", lambda m: m.group(1) + "\n" + svg + "\n" + m.group(3), page, flags=re.S)
    if n != 1:
        sys.exit("location.html 找不到 MAP:BEGIN／MAP:END 標記")
    open(PAGE, "w", encoding="utf-8").write(new)
    print(f"已更新 public/location.html（SVG {len(svg.encode()) / 1024:.1f} KB）")


if __name__ == "__main__":
    main()
