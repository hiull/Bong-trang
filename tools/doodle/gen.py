# Trình tạo bộ hình doodle cho "Bống tráng" → assets/img/doodles.js
# Mỗi hình vẽ trên khung 64×64 bằng các hình cơ bản, nét được làm run nhẹ như vẽ tay.
import math, random, json, re

OUT = "#5D4037"
C = dict(cream="#FFF6EC", tan="#F5D9A8", tan2="#E8B86D", pink="#FF9DB8", hot="#FF5C8A", lpink="#FFD6E2",
         red="#FF6B6B", dred="#D84343", orange="#FFAA55", yel="#FFD95A", lyel="#FFF0A8", green="#9CCC65",
         lgreen="#D7EDB5", dgreen="#5E9B3A", blue="#9AD3F5", lblue="#DDF2FF", purple="#C3A6FF", grey="#D9D2CC",
         dgrey="#8D8580", skin="#FFE0C4", hair="#6D4C41", black="#4E342E", white="#FFFFFF", brown="#B07A4C",
         meat="#B5523B", tea="#C98B4B", milk="#E9CBA7", gold="#FFC94D", sky="#CDE9FF")

SW = 2.6  # độ dày nét viền

class Icon:
    def __init__(self, seed):
        self.rng = random.Random(seed)
        self.parts = []

    # ---------- hình học ----------
    def _wobble(self, pts, closed, amp):
        n = len(pts)
        if n < 3:
            return pts
        f1, f2 = self.rng.uniform(0.15, 0.3), self.rng.uniform(0.45, 0.8)
        p1, p2 = self.rng.uniform(0, 6.28), self.rng.uniform(0, 6.28)
        out = []
        acc = 0.0
        for i in range(n):
            x, y = pts[i]
            a = pts[(i - 1) % n] if (closed or i > 0) else pts[i]
            b = pts[(i + 1) % n] if (closed or i < n - 1) else pts[i]
            tx, ty = b[0] - a[0], b[1] - a[1]
            L = math.hypot(tx, ty) or 1
            nx, ny = -ty / L, tx / L
            if i > 0:
                acc += math.hypot(x - pts[i - 1][0], y - pts[i - 1][1])
            d = amp * (0.6 * math.sin(acc * f1 + p1) + 0.4 * math.sin(acc * f2 + p2))
            out.append((x + nx * d, y + ny * d))
        return out

    @staticmethod
    def _path(pts, closed):
        n = len(pts)
        f = lambda v: str(int(round(v * 2)) / 2).rstrip("0").rstrip(".") if abs(v * 2 - round(v * 2)) < 1e-9 or True else v
        if n == 2:
            return "M%s %sL%s %s" % (f(pts[0][0]), f(pts[0][1]), f(pts[1][0]), f(pts[1][1]))
        d = "M%s %s" % (f(pts[0][0]), f(pts[0][1]))
        rng = range(n) if closed else range(n - 1)
        for i in rng:
            p0 = pts[(i - 1) % n] if (closed or i > 0) else pts[i]
            p1 = pts[i]
            p2 = pts[(i + 1) % n]
            p3 = pts[(i + 2) % n] if (closed or i + 2 < n) else p2
            c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
            c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
            d += "C%s %s %s %s %s %s" % (f(c1[0]), f(c1[1]), f(c2[0]), f(c2[1]), f(p2[0]), f(p2[1]))
        return d + ("Z" if closed else "")

    @staticmethod
    def _rot(pts, cx, cy, deg):
        if not deg:
            return pts
        a = math.radians(deg)
        ca, sa = math.cos(a), math.sin(a)
        return [(cx + (x - cx) * ca - (y - cy) * sa, cy + (x - cx) * sa + (y - cy) * ca) for x, y in pts]

    @staticmethod
    def _subdiv(pts, closed, step=6.0):
        out = []
        n = len(pts)
        for i in range(n if closed else n - 1):
            a, b = pts[i], pts[(i + 1) % n]
            L = math.hypot(b[0] - a[0], b[1] - a[1])
            k = max(1, int(L / step))
            for j in range(k):
                t = j / k
                out.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t))
        if not closed:
            out.append(pts[-1])
        return out

    def shape(self, pts, fill, stroke=True, amp=0.55, sw=SW, offset=True, opacity=None):
        pts = self._subdiv(pts, True) if len(pts) < 14 else pts
        if fill and fill != "none":
            fp = self._wobble(pts, True, amp * 0.9)
            dx, dy = (0.8, 1.0) if offset and stroke else (0, 0)
            fp = [(x + dx, y + dy) for x, y in fp]
            op = ' opacity="%s"' % opacity if opacity else ""
            self.parts.append('<path d="%s" fill="%s"%s/>' % (self._path(fp, True), fill, op))
        if stroke:
            sp = self._wobble(pts, True, amp)
            self.parts.append('<path d="%s" fill="none" stroke="%s" stroke-width="%s" stroke-linejoin="round"/>' % (self._path(sp, True), OUT if stroke is True else stroke, sw))
        return self

    # ---------- hình cơ bản ----------
    def ellipse(self, cx, cy, rx, ry, fill, rot=0, **kw):
        n = max(9, int((rx + ry) * 0.5))
        pts = [(cx + rx * math.cos(2 * math.pi * i / n), cy + ry * math.sin(2 * math.pi * i / n)) for i in range(n)]
        return self.shape(self._rot(pts, cx, cy, rot), fill, **kw)

    def circle(self, cx, cy, r, fill, **kw):
        return self.ellipse(cx, cy, r, r, fill, **kw)

    def rrect(self, x, y, w, h, r, fill, rot=0, **kw):
        r = min(r, w / 2, h / 2)
        pts = []
        for (cx, cy, a0) in [(x + w - r, y + r, -90), (x + w - r, y + h - r, 0), (x + r, y + h - r, 90), (x + r, y + r, 180)]:
            for k in range(3):
                a = math.radians(a0 + k * 45)
                pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
        return self.shape(self._rot(pts, x + w / 2, y + h / 2, rot), fill, **kw)

    def poly(self, pts, fill, rot=0, **kw):
        cx = sum(p[0] for p in pts) / len(pts)
        cy = sum(p[1] for p in pts) / len(pts)
        return self.shape(self._rot(pts, cx, cy, rot), fill, **kw)

    def blob(self, cx, cy, r, fill, lobes=6, depth=0.18, **kw):
        n = max(18, lobes * 4)
        pts = [(cx + r * (1 + depth * math.cos(lobes * 2 * math.pi * i / n)) * math.cos(2 * math.pi * i / n),
                cy + r * (1 + depth * math.cos(lobes * 2 * math.pi * i / n)) * math.sin(2 * math.pi * i / n)) for i in range(n)]
        return self.shape(pts, fill, **kw)

    def heart(self, cx, cy, s, fill, rot=0, **kw):
        pts = []
        for i in range(22):
            t = 2 * math.pi * i / 22
            x = 16 * math.sin(t) ** 3
            y = -(13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t))
            pts.append((cx + x * s / 16, cy + y * s / 16))
        return self.shape(self._rot(pts, cx, cy, rot), fill, **kw)

    def star(self, cx, cy, r, fill, points=5, inner=0.48, rot=0, **kw):
        pts = []
        for i in range(points * 2):
            rr = r if i % 2 == 0 else r * inner
            a = -math.pi / 2 + math.pi * i / points
            pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
        return self.shape(self._rot(pts, cx, cy, rot), fill, **kw)

    def line(self, pts, color=OUT, sw=SW, amp=0.35):
        if len(pts) > 2:
            sp = self._wobble(self._subdiv(pts, False, 7), False, amp)
        else:
            sp = self._wobble(self._subdiv(pts, False, 7), False, amp) if math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]) > 8 else pts
        self.parts.append('<path d="%s" fill="none" stroke="%s" stroke-width="%s" stroke-linecap="round" stroke-linejoin="round"/>' % (self._path(sp, False), color, sw))
        return self

    def arc(self, cx, cy, r, a0, a1, color=OUT, sw=SW):
        n = max(4, int(abs(a1 - a0) / 15))
        pts = [(cx + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)), cy + r * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]
        return self.line(pts, color, sw, amp=0.2)

    def dot(self, cx, cy, r, color=OUT):
        self.parts.append('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="%s"/>' % (cx, cy, r, color))
        return self

    def shine(self, x, y, l=5):
        return self.line([(x, y), (x + l * 0.4, y - l)], C["white"], 2.2, 0.1)

    def svg(self):
        return "".join(self.parts)


ICONS = {}
MAP = {}
_seed = [100]

def icon(name, *emojis):
    def deco(fn):
        _seed[0] += 7
        ic = Icon(_seed[0])
        fn(ic)
        ICONS[name] = ic.svg()
        for e in emojis:
            MAP[e] = name
        return fn
    return deco

# ================= MẶT NGƯỜI (chibi) =================
def face(ic, cx=32, cy=28, r=15, mood="smile", skin=C["skin"], blush=True):
    ic.circle(cx, cy, r, skin)
    ey = cy + r * 0.12
    if mood == "smile":
        ic.dot(cx - r * 0.38, ey, 1.9).dot(cx + r * 0.38, ey, 1.9)
        ic.arc(cx, cy + r * 0.28, r * 0.22, 20, 160, sw=2)
    if blush:
        ic.ellipse(cx - r * 0.62, ey + r * 0.28, r * 0.17, r * 0.1, C["pink"], stroke=False, offset=False)
        ic.ellipse(cx + r * 0.62, ey + r * 0.28, r * 0.17, r * 0.1, C["pink"], stroke=False, offset=False)

def body(ic, color, y=44, collar=None):
    ic.rrect(11, y, 42, 30, 13, color)
    if collar:
        ic.poly([(26, y), (32, y + 7), (38, y)], collar)

def hair_cap(ic, color=C["hair"], cy=28, r=15):
    ic.poly([(32 - r - 1, cy + 1), (32 - r + 1, cy - 9), (32 - 8, cy - r - 1), (32 + 6, cy - r - 1), (32 + r - 1, cy - 8), (32 + r + 1, cy + 1),
             (32 + r - 4, cy - 4), (32 + 4, cy - 7), (32 - 4, cy - 5), (32 - r + 4, cy - 3)], color)

def hair_long_back(ic, color=C["hair"]):
    ic.rrect(15, 14, 34, 40, 14, color)

# ================= NGUYÊN LIỆU =================
@icon("bt_soi", "🍜")
def _(ic):
    ic.ellipse(32, 44, 24, 10, C["tan2"])
    ic.blob(32, 36, 19, C["tan"], lobes=9, depth=0.08)
    for k in range(5):
        y = 26 + k * 4
        ic.line([(18 + k, y), (24, y - 3), (30, y + 1), (36, y - 3), (42, y + 1), (46 - k, y - 2)], C["tan2"], 2)
    ic.dot(26, 30, 1.6, C["red"]).dot(38, 34, 1.6, C["dgreen"])

@icon("kho_bo", "🥩")
def _(ic):
    ic.rrect(10, 22, 40, 10, 5, C["meat"], rot=-18)
    ic.rrect(14, 34, 40, 10, 5, "#C96A4A", rot=12)
    ic.rrect(20, 14, 30, 9, 4, "#A84834", rot=-35)
    ic.line([(18, 26), (40, 20)], "#E8907A", 1.8).line([(22, 39), (44, 42)], "#E8907A", 1.8)

@icon("trung_cut", "🥚")
def _(ic):
    ic.ellipse(24, 36, 11, 14, C["cream"], rot=-12)
    ic.ellipse(41, 38, 10, 13, "#F7E6CC", rot=14)
    for (x, y) in [(21, 30), (27, 38), (23, 44), (39, 33), (44, 42), (38, 45)]:
        ic.dot(x, y, 1.4, C["brown"])
    ic.shine(19, 28, 4)

@icon("xoai", "🥭")
def _(ic):
    ic.ellipse(28, 32, 17, 21, C["green"], rot=25)
    ic.ellipse(24, 30, 6, 10, C["lgreen"], rot=25, stroke=False, offset=False)
    ic.line([(40, 14), (46, 8)], C["dgreen"], 3)
    for k in range(4):
        ic.line([(42 + k * 3, 40), (46 + k * 3, 54)], C["lyel"], 2.4)

@icon("rau_ram", "🌿")
def _(ic):
    ic.line([(32, 58), (32, 18)], C["dgreen"], 3)
    for (y, side, rot) in [(42, -1, -40), (30, 1, 40), (20, -1, -30)]:
        cx = 32 + side * 10
        ic.ellipse(cx, y, 11, 5, C["green"], rot=rot)
        ic.line([(32, y + 2), (cx + side * 8, y - side * 0 - 4)], C["dgreen"], 1.6)

@icon("dau_phong", "🥜")
def _(ic):
    for (x, y, r) in [(22, 34, 0), (42, 30, 20)]:
        ic.poly([(x - 9, y - 6), (x - 3, y - 12), (x + 4, y - 10), (x + 7, y - 4), (x + 4, y + 2), (x + 8, y + 8), (x + 4, y + 14), (x - 4, y + 14), (x - 8, y + 8), (x - 6, y)], C["tan2"], rot=r)
        ic.dot(x - 2, y - 4, 1.2, C["brown"]).dot(x + 1, y + 6, 1.2, C["brown"])

@icon("tac", "🍋")
def _(ic):
    ic.circle(24, 34, 14, "#A8D45A")
    ic.ellipse(20, 29, 4, 3, C["lgreen"], stroke=False, offset=False)
    ic.line([(26, 20), (30, 14)], C["dgreen"], 2.4)
    ic.ellipse(30, 13, 5, 2.5, C["green"], rot=-30)
    ic.circle(44, 42, 11, C["lyel"])
    ic.circle(44, 42, 7.5, "#E4F59A", stroke=False, offset=False)
    for a in range(0, 360, 60):
        ic.line([(44, 42), (44 + 7 * math.cos(math.radians(a)), 42 + 7 * math.sin(math.radians(a)))], "#C6D96B", 1.4)

@icon("hanh_phi", "🧅")
def _(ic):
    ic.ellipse(32, 46, 22, 8, C["tan"])
    for (x, y, r) in [(22, 38, 6), (34, 34, 7), (44, 40, 6), (28, 28, 5), (40, 26, 5)]:
        ic.circle(x, y, r, "#E6A44A")
        ic.circle(x, y, r * 0.45, "#F4CE86", stroke=False, offset=False)

@icon("ly", "🥤")
def _(ic):
    ic.poly([(16, 16), (48, 16), (43, 58), (21, 58)], C["lblue"])
    ic.rrect(13, 12, 38, 7, 3, C["white"])
    ic.line([(22, 26), (24, 50)], C["white"], 2.4)

@icon("tra", "🫖")
def _(ic):
    ic.line([(46, 30), (58, 22), (58, 18)], OUT, 3.2)
    ic.arc(16, 38, 7, 90, 270, OUT, 3)
    ic.ellipse(32, 40, 18, 15, "#F6C9A8")
    ic.rrect(22, 22, 20, 7, 3, "#EBA97E")
    ic.circle(32, 19, 3.5, "#EBA97E")
    ic.line([(20, 40), (44, 40)], C["white"], 2)
    ic.dot(26, 46, 1.6, C["hot"]).dot(32, 47, 1.6, C["hot"]).dot(38, 46, 1.6, C["hot"])

@icon("da", "🧊")
def _(ic):
    ic.rrect(10, 28, 22, 22, 5, C["lblue"], rot=-10)
    ic.rrect(30, 20, 22, 22, 5, "#C8EBFF", rot=12)
    ic.rrect(26, 38, 18, 18, 5, C["lblue"], rot=5)
    ic.shine(15, 36, 5).shine(36, 28, 5)

@icon("sa_te", "🌶️", "🌶")
def _(ic):
    ic.poly([(14, 22), (22, 16), (40, 22), (52, 38), (50, 50), (42, 48), (32, 34)], C["red"])
    ic.poly([(12, 22), (14, 14), (22, 16), (18, 22)], C["green"])
    ic.line([(13, 15), (8, 9)], C["dgreen"], 2.6)
    ic.shine(30, 27, 6)

@icon("kho_muc", "🦑")
def _(ic):
    ic.poly([(32, 6), (46, 26), (42, 38), (22, 38), (18, 26)], "#F6D7C3")
    for x in (22, 28, 34, 40):
        ic.line([(x, 38), (x - 2, 48), (x + 2, 56)], "#E9B89D", 3)
    ic.dot(27, 28, 1.8).dot(37, 28, 1.8)

@icon("bt_tron", "⚪")
def _(ic):
    ic.circle(32, 32, 23, "#FBEFD9")
    ic.circle(32, 32, 17, "#F6E2BD", stroke=False, offset=False)
    for (x, y) in [(24, 24), (38, 22), (42, 36), (28, 40), (34, 31), (20, 34)]:
        ic.dot(x, y, 1.2, "#D9B98A")

@icon("hanh_la", "🌱")
def _(ic):
    for (x, r) in [(24, -14), (32, 0), (40, 14)]:
        ic.rrect(x - 3, 10, 6, 36, 3, C["green"], rot=r)
    ic.rrect(20, 42, 24, 14, 5, C["white"])
    ic.line([(26, 56), (24, 60)], C["tan2"], 1.6).line([(32, 56), (32, 61)], C["tan2"], 1.6).line([(38, 56), (40, 60)], C["tan2"], 1.6)

def bottle(ic, color, cap):
    ic.rrect(18, 18, 28, 40, 10, color)
    ic.poly([(26, 18), (38, 18), (35, 8), (29, 8)], cap)
    ic.rrect(30, 3, 4, 6, 2, cap)
    ic.rrect(22, 30, 20, 14, 4, C["white"])
    ic.heart(32, 37, 4.5, color, stroke=False, offset=False)

@icon("mayo", "🥫")
def _(ic):
    bottle(ic, "#FFE57A", C["red"])

@icon("tuong_ot", "🔴")
def _(ic):
    bottle(ic, C["red"], C["green"])

@icon("muoi_tom", "🧂")
def _(ic):
    ic.rrect(19, 22, 26, 36, 8, "#FFB38A")
    ic.rrect(19, 12, 26, 12, 5, C["grey"])
    for x in (25, 32, 39):
        ic.dot(x, 17, 1.4)
    ic.line([(24, 34), (40, 34)], C["white"], 2).line([(24, 44), (40, 44)], C["white"], 2)

@icon("bo_beo", "🧈")
def _(ic):
    ic.poly([(8, 40), (40, 30), (56, 38), (24, 50)], C["cream"])
    ic.poly([(16, 34), (38, 26), (50, 32), (28, 40)], C["yel"])
    ic.poly([(16, 34), (28, 40), (28, 46), (16, 40)], "#F2BE3C")
    ic.shine(30, 32, 4)

@icon("xuc_xich", "🌭")
def _(ic):
    ic.rrect(6, 24, 52, 16, 8, "#E96A5A", rot=-12)
    ic.line([(14, 32), (50, 24)], "#F4A28F", 2)
    for x in (18, 30, 42):
        ic.line([(x, 26), (x + 3, 34)], "#B94436", 1.6)

@icon("cha_bong", "🟫")
def _(ic):
    ic.blob(32, 36, 19, "#D6A26A", lobes=8, depth=0.16)
    for k in range(5):
        ic.line([(20 + k * 5, 30 + (k % 2) * 6), (24 + k * 5, 26 + (k % 2) * 6), (27 + k * 5, 32 + (k % 2) * 6)], "#A9733F", 1.6)

@icon("bt_phoi_suong", "📃")
def _(ic):
    ic.rrect(10, 12, 44, 42, 8, "#FFF9EE", rot=-6)
    ic.rrect(14, 16, 36, 34, 6, "#F7EBD3", rot=-6, stroke=False, offset=False)
    for (x, y) in [(22, 24), (34, 22), (42, 32), (26, 38), (36, 42)]:
        ic.dot(x, y, 1.2, "#D9C29A")

@icon("thit_luoc", "🥓")
def _(ic):
    ic.rrect(8, 22, 48, 20, 8, "#F6B9B0", rot=-8)
    ic.line([(12, 30), (52, 24)], C["white"], 3.2)
    ic.line([(12, 37), (52, 31)], "#E68A7E", 1.8)

@icon("rau_song", "🥬")
def _(ic):
    ic.blob(32, 32, 21, "#B8E07A", lobes=7, depth=0.14)
    ic.line([(32, 54), (32, 16)], C["dgreen"], 2.2)
    for y in (24, 32, 40):
        ic.line([(32, y + 6), (22, y)], C["dgreen"], 1.6).line([(32, y + 6), (42, y)], C["dgreen"], 1.6)

@icon("nuoc_cham", "🫙")
def _(ic):
    ic.ellipse(32, 30, 22, 8, "#C96B3C")
    ic.poly([(10, 30), (54, 30), (46, 50), (18, 50)], C["white"])
    ic.ellipse(32, 30, 18, 5, "#D9793F", stroke=False, offset=False)
    ic.dot(26, 29, 1.4, C["red"]).dot(36, 30, 1.4, C["red"])

@icon("nuoc_mia", "🎋")
def _(ic):
    for (x, r) in [(22, -10), (34, 4), (44, 16)]:
        ic.rrect(x - 4, 8, 9, 50, 4, "#9CCB5B", rot=r)
        for y in (20, 32, 44):
            ic.line([(x - 4, y), (x + 4, y)], C["dgreen"], 1.8)

@icon("pho_mai", "🧀")
def _(ic):
    ic.poly([(8, 44), (50, 20), (56, 30), (56, 48), (14, 52)], C["yel"])
    ic.poly([(8, 44), (50, 20), (56, 30), (14, 52)], "#FFE58A", stroke=False, offset=False)
    for (x, y, r) in [(24, 44, 3.2), (38, 40, 2.6), (46, 46, 2.2), (44, 30, 2)]:
        ic.circle(x, y, r, "#F2C23D", sw=1.6)

@icon("tom_kho", "🦐")
def _(ic):
    pts = []
    for i in range(20):
        a = math.radians(200 - i * 11)
        pts.append((32 + 18 * math.cos(a), 34 + 16 * math.sin(a)))
    for i in range(20):
        a = math.radians(200 - (19 - i) * 11)
        pts.append((32 + 9 * math.cos(a), 34 + 7 * math.sin(a)))
    ic.shape(pts, "#FF9E6B")
    for a in (160, 120, 80, 40):
        r1, r2 = 9, 18
        ic.line([(32 + r1 * math.cos(math.radians(-a)), 34 + r1 * math.sin(math.radians(-a)) * 0.8), (32 + r2 * math.cos(math.radians(-a)), 34 + r2 * math.sin(math.radians(-a)) * 0.9)], "#E2733F", 1.4)
    ic.dot(16, 30, 1.6)

@icon("tran_chau", "⚫")
def _(ic):
    for (x, y) in [(20, 40), (32, 44), (44, 40), (26, 30), (38, 30), (32, 20)]:
        ic.circle(x, y, 7, C["black"])
        ic.dot(x - 2, y - 2, 1.4, "#9E8B85")

# ================= MÓN ĂN =================
@icon("dish_tron", "🥗", "🥣")
def _(ic):
    ic.poly([(14, 22), (50, 22), (54, 54), (10, 54)], "#F4FBFF", opacity="0.95")
    ic.ellipse(32, 44, 18, 9, C["tan"], stroke=False, offset=False)
    for (x, y, c) in [(22, 42, C["meat"]), (30, 46, C["green"]), (38, 41, C["yel"]), (44, 47, C["red"]), (34, 38, C["dgreen"])]:
        ic.circle(x, y, 2.6, c, sw=1.4)
    ic.poly([(14, 22), (22, 12), (32, 20), (42, 12), (50, 22)], "#F4FBFF")
    ic.rrect(26, 17, 12, 5, 2, C["hot"])

def cup(ic, liquid, top=None, straw=C["hot"]):
    ic.line([(36, 4), (40, 26)], straw, 4)
    ic.poly([(16, 20), (48, 20), (43, 58), (21, 58)], C["lblue"])
    ic.poly([(18, 28), (46, 28), (43, 56), (21, 56)], liquid, stroke=False, offset=False)
    ic.rrect(13, 16, 38, 7, 3, C["white"])
    if top:
        top(ic)
    ic.line([(22, 30), (24, 50)], C["white"], 2.2)

@icon("dish_tra", "🍵")
def _(ic):
    def t(ic):
        ic.rrect(24, 30, 8, 8, 2, C["lblue"], sw=1.4).rrect(34, 34, 8, 8, 2, C["lblue"], sw=1.4)
    cup(ic, "#D8964F", t)

@icon("dish_tra_tac", "🍹")
def _(ic):
    def t(ic):
        ic.circle(44, 20, 8, "#C8E36A").circle(44, 20, 5, "#E8F5A8", stroke=False, offset=False)
    cup(ic, "#E3A85C", t)

@icon("dish_tra_sua", "🧋")
def _(ic):
    def t(ic):
        for (x, y) in [(26, 50), (32, 52), (38, 50), (29, 45), (35, 46)]:
            ic.dot(x, y, 2.6, C["black"])
    cup(ic, C["milk"], t, straw="#FF9DB8")

@icon("dish_mia", "🍶")
def _(ic):
    def t(ic):
        ic.line([(20, 34), (44, 34)], "#E8F5C0", 2)
    cup(ic, "#CFE58A", t, straw=C["green"])

@icon("dish_nuong", "🍕", "🌮")
def _(ic):
    pts = [(8 + 48 * (i / 20), 40 - 26 * math.sin(math.pi * i / 20)) for i in range(21)]
    ic.shape(pts + [(56, 42), (8, 42)], "#F2C98A")
    ic.poly([(10, 40), (54, 40), (50, 48), (14, 48)], "#E7A85C")
    ic.ellipse(32, 30, 13, 6, C["yel"], stroke=False, offset=False)
    for (x, y, c) in [(22, 30, C["green"]), (32, 24, C["red"]), (40, 30, C["green"]), (28, 34, "#E96A5A")]:
        ic.circle(x, y, 2.4, c, sw=1.2)
    ic.line([(16, 34), (22, 31), (28, 35), (34, 31), (40, 35), (46, 31)], C["cream"], 1.8)

@icon("dish_cuon", "🌯")
def _(ic):
    ic.rrect(6, 26, 30, 16, 8, "#FFF6E4", rot=-20)
    ic.rrect(26, 26, 30, 16, 8, "#FFF6E4", rot=20)
    ic.ellipse(13, 37, 5, 7, "#B8E07A", rot=-20)
    ic.ellipse(51, 37, 5, 7, "#F6B9B0", rot=20)
    ic.line([(14, 28), (26, 22)], "#E9DCC4", 1.6).line([(38, 22), (50, 28)], "#E9DCC4", 1.6)

@icon("combo", "💝")
def _(ic):
    ic.rrect(14, 28, 36, 28, 5, C["pink"])
    ic.rrect(10, 22, 44, 10, 4, C["hot"])
    ic.line([(32, 22), (32, 56)], C["yel"], 4)
    ic.heart(24, 16, 7, C["yel"], rot=-20).heart(40, 16, 7, C["yel"], rot=20)
    ic.heart(32, 42, 7, C["lpink"])

@icon("bag_tied", "🎀")
def _(ic):
    ic.heart(20, 32, 11, C["hot"], rot=-90)
    ic.heart(44, 32, 11, C["hot"], rot=90)
    ic.circle(32, 32, 6, C["pink"])
    ic.line([(28, 36), (22, 54)], C["hot"], 4).line([(36, 36), (42, 54)], C["hot"], 4)

@icon("egg_fried", "🍳")
def _(ic):
    ic.blob(32, 32, 22, C["white"], lobes=5, depth=0.12)
    ic.circle(34, 30, 9, C["yel"])
    ic.shine(31, 27, 3)

@icon("burnt", "⬛")
def _(ic):
    ic.blob(32, 36, 20, "#4E3B36", lobes=6, depth=0.12)
    ic.dot(24, 34, 2, "#2E2220").dot(36, 40, 2.4, "#2E2220").dot(40, 30, 1.6, "#2E2220")
    ic.line([(26, 14), (22, 8), (26, 4)], C["dgrey"], 2).line([(36, 14), (40, 8), (36, 3)], C["dgrey"], 2)

@icon("flatbread", "🫓")
def _(ic):
    ic.ellipse(32, 34, 24, 16, "#F2C98A")
    for (x, y) in [(22, 30), (34, 28), (42, 38), (28, 40)]:
        ic.ellipse(x, y, 3, 2, "#D99A55", stroke=False, offset=False)

# ================= KHÁCH & NHÂN VẬT =================
@icon("student", "🧑‍🎓")
def _(ic):
    body(ic, C["white"], collar=C["blue"])
    ic.line([(18, 46), (20, 64)], C["blue"], 4).line([(46, 46), (44, 64)], C["blue"], 4)
    face(ic)
    hair_cap(ic, C["black"])

@icon("farmer", "👩‍🌾")
def _(ic):
    body(ic, "#8FC97A", collar=C["cream"])
    hair_long_back(ic, C["black"])
    face(ic)
    ic.poly([(6, 22), (32, 0), (58, 22)], C["tan"])
    ic.line([(14, 18), (32, 4), (50, 18)], C["tan2"], 1.6).line([(22, 20), (32, 9), (42, 20)], C["tan2"], 1.6)

@icon("office_m", "👨‍💼", "🧑‍💼")
def _(ic):
    body(ic, "#7FA7D6", collar=C["white"])
    ic.poly([(30, 46), (34, 46), (36, 58), (32, 62), (28, 58)], C["red"])
    face(ic)
    hair_cap(ic, C["hair"])

@icon("office_f", "👩‍💼")
def _(ic):
    hair_long_back(ic, "#7B4B3A")
    body(ic, "#B88FD9", collar=C["white"])
    face(ic)
    hair_cap(ic, "#7B4B3A")

@icon("grandma", "👵")
def _(ic):
    body(ic, "#C9A5D9", collar=C["cream"])
    face(ic)
    hair_cap(ic, "#E8E2DC")
    ic.circle(32, 10, 6, "#E8E2DC")
    ic.circle(26, 30, 4.2, "none", sw=1.6).circle(38, 30, 4.2, "none", sw=1.6).line([(30, 30), (34, 30)], OUT, 1.4)

@icon("boy", "🧑")
def _(ic):
    body(ic, C["orange"], collar=C["cream"])
    face(ic)
    hair_cap(ic, C["hair"])

@icon("tomortle")
def _(ic):
    body(ic, C["pink"], collar=C["white"])
    face(ic)
    hair_cap(ic, C["black"])
    ic.line([(19, 15), (16, 10)], C["black"], 2.6).line([(44, 14), (48, 10)], C["black"], 2.6)
    ic.heart(32, 54, 6, C["hot"])

@icon("shipper")
def _(ic):
    body(ic, "#4DB6AC", collar=C["yel"])
    face(ic)
    ic.poly([(14, 26), (16, 14), (26, 8), (38, 8), (48, 14), (50, 26)], "#43A047")
    ic.rrect(12, 24, 40, 5, 2, "#2E7D32")
    ic.line([(24, 12), (40, 12)], C["white"], 2)

@icon("friend_a")
def _(ic):
    hair_long_back(ic, "#A0522D")
    body(ic, "#FFB74D", collar=C["white"])
    face(ic)
    hair_cap(ic, "#A0522D")
    ic.heart(44, 14, 4, C["hot"])

@icon("friend_b")
def _(ic):
    body(ic, "#81C784", collar=C["white"])
    face(ic)
    ic.blob(32, 17, 15, C["black"], lobes=9, depth=0.12)
    ic.circle(26, 30, 4.2, "none", sw=1.6).circle(38, 30, 4.2, "none", sw=1.6).line([(30, 30), (34, 30)], OUT, 1.4)

@icon("friend_c")
def _(ic):
    body(ic, "#64B5F6", collar=C["white"])
    face(ic)
    ic.poly([(14, 24), (18, 12), (32, 8), (46, 12), (50, 22)], "#E57373")
    ic.rrect(40, 18, 20, 6, 3, "#E57373")

@icon("friend_d")
def _(ic):
    body(ic, "#BA68C8", collar=C["white"])
    face(ic)
    hair_cap(ic, "#5D3A1A")
    ic.ellipse(50, 26, 6, 12, "#5D3A1A", rot=20)
    ic.circle(46, 18, 3, C["yel"])

@icon("chi_lan")
def _(ic):
    hair_long_back(ic, C["black"])
    body(ic, "#F48FB1", collar=C["white"])
    face(ic)
    hair_cap(ic, C["black"])
    ic.rrect(21, 26, 9, 7, 2, "none", sw=1.6).rrect(34, 26, 9, 7, 2, "none", sw=1.6).line([(30, 29), (34, 29)], OUT, 1.4)

@icon("chu_tu", "🧔")
def _(ic):
    body(ic, "#90A4AE", collar=C["cream"])
    face(ic)
    ic.poly([(15, 22), (18, 12), (32, 8), (46, 12), (49, 22)], "#1E88E5")
    ic.rrect(14, 20, 40, 5, 2, "#1565C0")
    ic.blob(32, 38, 6, C["hair"], lobes=2, depth=0.3)

@icon("be_na", "👧")
def _(ic):
    body(ic, C["white"], collar="#5C6BC0")
    face(ic)
    hair_cap(ic, "#4E342E")
    ic.circle(14, 32, 6, "#4E342E").circle(50, 32, 6, "#4E342E")
    ic.dot(16, 26, 2.4, C["hot"]).dot(48, 26, 2.4, C["hot"])

@icon("owner", "👩‍🍳")
def _(ic):
    hair_long_back(ic, "#5D3A1A")
    body(ic, C["cream"])
    ic.rrect(20, 48, 24, 20, 5, C["pink"])
    ic.heart(32, 55, 4, C["hot"], stroke=False, offset=False)
    face(ic)
    hair_cap(ic, "#5D3A1A")
    ic.poly([(20, 14), (24, 10), (28, 14)], C["hot"]).circle(24, 13, 2.4, C["pink"])

# ================= THÚ CƯNG =================
def cat(ic, fill, spots=None, sleepy=False, paw=False):
    ic.ellipse(36, 46, 20, 12, fill)
    ic.line([(54, 46), (60, 38), (58, 32)], OUT, 3)
    ic.poly([(12, 22), (16, 8), (24, 18)], fill).poly([(32, 18), (40, 8), (42, 22)], fill)
    ic.circle(27, 30, 15, fill)
    if spots:
        for (x, y, r, c) in spots:
            ic.circle(x, y, r, c, stroke=False, offset=False)
    if sleepy:
        ic.arc(21, 31, 3, 20, 160, sw=1.8).arc(33, 31, 3, 20, 160, sw=1.8)
    else:
        ic.dot(21, 30, 2).dot(33, 30, 2)
    ic.dot(27, 35, 1.4, C["hot"])
    ic.line([(12, 34), (6, 33)], OUT, 1.2).line([(42, 34), (48, 33)], OUT, 1.2)
    if paw:
        ic.ellipse(46, 18, 5, 8, fill, rot=15)

@icon("miu", "🐈")
def _(ic):
    cat(ic, "#FFB35C", spots=[(30, 18, 3, "#F08C2E"), (44, 44, 4, "#F08C2E")], sleepy=True)

@icon("cat_calico", "🐱")
def _(ic):
    cat(ic, C["white"], spots=[(20, 22, 5, "#F2A65A"), (34, 24, 4, C["black"]), (42, 48, 5, "#F2A65A"), (28, 50, 4, C["black"])])

@icon("lucky_cat", "😺")
def _(ic):
    cat(ic, C["white"], spots=[(22, 20, 3, C["red"])], paw=True)
    ic.circle(36, 52, 4, C["gold"])

@icon("dog", "🐶")
def _(ic):
    ic.ellipse(36, 48, 19, 11, C["white"])
    ic.blob(28, 30, 15, C["white"], lobes=8, depth=0.07)
    ic.ellipse(14, 30, 6, 11, "#E0C9B5", rot=15).ellipse(42, 30, 6, 11, "#E0C9B5", rot=-15)
    ic.dot(23, 29, 2).dot(33, 29, 2).ellipse(28, 35, 3, 2, OUT, stroke=False, offset=False)
    ic.line([(54, 46), (60, 38)], OUT, 3)

@icon("hamster", "🐹")
def _(ic):
    ic.ellipse(32, 38, 22, 18, "#F4C28D")
    ic.ellipse(32, 44, 14, 10, C["cream"], stroke=False, offset=False)
    ic.circle(16, 22, 5, "#F4C28D").circle(48, 22, 5, "#F4C28D")
    ic.dot(25, 34, 2).dot(39, 34, 2).dot(32, 39, 1.4, C["hot"])
    ic.ellipse(20, 40, 4, 2.5, C["pink"], stroke=False, offset=False).ellipse(44, 40, 4, 2.5, C["pink"], stroke=False, offset=False)

# ================= MẶT CẢM XÚC =================
def mood(ic, fill=C["yel"]):
    ic.circle(32, 32, 24, fill)

@icon("m_smile", "🙂")
def _(ic):
    mood(ic); ic.dot(24, 28, 2.6).dot(40, 28, 2.6).arc(32, 34, 9, 20, 160)

@icon("m_huff", "😤")
def _(ic):
    mood(ic, "#FFC27A"); ic.line([(18, 22), (28, 26)]).line([(46, 22), (36, 26)]).dot(24, 30, 2.4).dot(40, 30, 2.4).line([(26, 42), (38, 42)])
    ic.blob(12, 46, 5, C["white"], lobes=4).blob(52, 46, 5, C["white"], lobes=4)

@icon("m_love", "😍")
def _(ic):
    mood(ic); ic.heart(23, 28, 6, C["hot"]).heart(41, 28, 6, C["hot"]).arc(32, 36, 10, 10, 170)

@icon("m_confused", "😕")
def _(ic):
    mood(ic); ic.dot(24, 28, 2.6).dot(40, 28, 2.6).line([(22, 44), (30, 40), (36, 43), (42, 40)])

@icon("m_angry", "😠")
def _(ic):
    mood(ic, "#FF8A6B"); ic.line([(18, 22), (28, 27)]).line([(46, 22), (36, 27)]).dot(24, 31, 2.4).dot(40, 31, 2.4).arc(32, 48, 8, 200, 340)

@icon("m_yum", "😋", "😜")
def _(ic):
    mood(ic); ic.arc(24, 30, 3, 200, 340, sw=2.2).arc(40, 30, 3, 200, 340, sw=2.2).arc(32, 36, 10, 10, 170)
    ic.ellipse(36, 46, 4, 5, C["hot"])

@icon("m_blush", "🥰")
def _(ic):
    mood(ic); ic.arc(24, 30, 3, 200, 340, sw=2.2).arc(40, 30, 3, 200, 340, sw=2.2).arc(32, 36, 9, 20, 160)
    ic.ellipse(18, 38, 4, 2.5, C["pink"], stroke=False, offset=False).ellipse(46, 38, 4, 2.5, C["pink"], stroke=False, offset=False)
    ic.heart(52, 12, 5, C["hot"]).heart(12, 16, 4, C["hot"])

@icon("m_shy", "😳")
def _(ic):
    mood(ic); ic.circle(24, 28, 4.5, C["white"], sw=1.8).circle(40, 28, 4.5, C["white"], sw=1.8).dot(24, 28, 1.8).dot(40, 28, 1.8)
    ic.ellipse(18, 38, 5, 3, C["pink"], stroke=False, offset=False).ellipse(46, 38, 5, 3, C["pink"], stroke=False, offset=False).line([(28, 44), (36, 44)])

@icon("m_devil", "😈")
def _(ic):
    ic.poly([(12, 16), (14, 2), (24, 12)], C["purple"]).poly([(52, 16), (50, 2), (40, 12)], C["purple"])
    mood(ic, C["purple"]); ic.line([(18, 24), (28, 28)]).line([(46, 24), (36, 28)]).dot(24, 32, 2.4).dot(40, 32, 2.4).arc(32, 34, 11, 20, 160)

@icon("m_tired", "😩")
def _(ic):
    mood(ic); ic.line([(18, 28), (28, 26)]).line([(46, 28), (36, 26)]).ellipse(32, 44, 6, 5, "#C0392B")

@icon("m_wink", "😉", "😏")
def _(ic):
    mood(ic); ic.dot(24, 28, 2.6).line([(36, 28), (44, 28)]).arc(32, 34, 9, 20, 160)

@icon("m_kiss", "😚")
def _(ic):
    mood(ic); ic.arc(24, 30, 3, 200, 340, sw=2.2).arc(40, 30, 3, 200, 340, sw=2.2).circle(32, 42, 3, C["hot"], sw=1.6)
    ic.heart(52, 18, 5, C["hot"])

@icon("m_catlove", "😻")
def _(ic):
    ic.poly([(10, 20), (14, 4), (24, 14)], "#FFB35C").poly([(54, 20), (50, 4), (40, 14)], "#FFB35C")
    ic.circle(32, 34, 22, "#FFB35C"); ic.heart(24, 30, 5, C["hot"]).heart(40, 30, 5, C["hot"]).arc(32, 38, 6, 20, 160)

@icon("eyes", "👀")
def _(ic):
    ic.ellipse(22, 32, 10, 13, C["white"]).ellipse(42, 32, 10, 13, C["white"])
    ic.dot(25, 34, 4.5).dot(45, 34, 4.5)

@icon("arm", "💪")
def _(ic):
    ic.poly([(8, 50), (24, 46), (30, 30), (24, 18), (34, 14), (42, 28), (52, 30), (56, 44), (44, 54), (10, 58)], C["skin"])
    ic.arc(46, 40, 6, 200, 320, sw=1.8)

# ================= TRÁI TIM & LẤP LÁNH =================
@icon("heart", "❤️", "❤")
def _(ic):
    ic.heart(32, 34, 22, C["red"]); ic.shine(20, 24, 6)

@icon("heart_white", "🤍")
def _(ic):
    ic.heart(32, 34, 22, C["grey"])

@icon("heart_gold", "💛")
def _(ic):
    ic.heart(32, 34, 22, C["gold"]); ic.shine(20, 24, 6)

@icon("hearts2", "💕", "💞", "🫶")
def _(ic):
    ic.heart(24, 38, 16, C["hot"], rot=-12); ic.heart(44, 22, 12, C["pink"], rot=14); ic.shine(16, 30, 4)

@icon("heart_sparkle", "💖")
def _(ic):
    ic.heart(30, 36, 20, C["hot"]); ic.shine(20, 28, 5)
    ic.star(52, 14, 7, C["yel"], points=4, inner=0.35, sw=1.8).star(10, 14, 5, C["yel"], points=4, inner=0.35, sw=1.6)

@icon("heart_grow", "💗")
def _(ic):
    ic.heart(32, 34, 22, C["pink"]); ic.heart(32, 34, 12, C["hot"], stroke=False, offset=False)

@icon("heart_broken", "💔")
def _(ic):
    ic.heart(32, 34, 22, C["red"]); ic.line([(32, 16), (27, 28), (36, 36), (30, 52)], C["cream"], 3)

@icon("love_letter", "💌")
def _(ic):
    ic.rrect(8, 18, 48, 34, 5, C["white"])
    ic.line([(8, 20), (32, 38), (56, 20)])
    ic.heart(32, 38, 8, C["hot"])

@icon("sparkle", "✨")
def _(ic):
    ic.star(26, 34, 18, C["yel"], points=4, inner=0.3)
    ic.star(48, 14, 8, C["yel"], points=4, inner=0.3, sw=2)
    ic.star(50, 46, 6, C["lyel"], points=4, inner=0.3, sw=1.8)

@icon("dizzy", "💫")
def _(ic):
    ic.star(42, 20, 12, C["yel"], inner=0.45)
    pts = [(32 + (6 + i * 0.9) * math.cos(i * 0.5), 36 + (6 + i * 0.9) * math.sin(i * 0.5)) for i in range(28)]
    ic.line(pts, C["orange"], 2.4, amp=0.1)

@icon("star", "⭐", "★")
def _(ic):
    ic.star(32, 34, 26, C["yel"]); ic.shine(24, 26, 5)

@icon("star_empty", "☆")
def _(ic):
    ic.star(32, 34, 26, "#EFE3DA")

@icon("party", "🎉")
def _(ic):
    ic.poly([(8, 58), (22, 20), (44, 42)], C["purple"])
    ic.line([(16, 40), (30, 48)], C["yel"], 2.4).line([(19, 30), (36, 44)], C["pink"], 2.4)
    for (x, y, c) in [(36, 12, C["hot"]), (48, 20, C["yel"]), (54, 34, C["green"]), (42, 6, C["blue"])]:
        ic.rrect(x - 3, y - 2, 6, 4, 1, c, sw=1.2)
    ic.line([(30, 18), (34, 10), (30, 4)], C["hot"], 2).line([(46, 32), (54, 28), (60, 32)], C["blue"], 2)

@icon("gift", "🎁")
def _(ic):
    ic.rrect(10, 26, 44, 30, 4, C["pink"])
    ic.rrect(8, 20, 48, 10, 3, C["hot"])
    ic.rrect(28, 20, 8, 36, 2, C["yel"])
    ic.heart(24, 14, 8, C["yel"], rot=-50).heart(40, 14, 8, C["yel"], rot=50)

@icon("balloon", "🎈")
def _(ic):
    ic.ellipse(32, 26, 16, 19, C["red"]); ic.shine(24, 20, 6)
    ic.poly([(29, 45), (35, 45), (32, 50)], C["red"])
    ic.line([(32, 50), (28, 56), (34, 62)], OUT, 1.6)

@icon("coin", "🪙")
def _(ic):
    ic.circle(32, 32, 24, C["gold"]); ic.circle(32, 32, 16, C["yel"], sw=1.8)
    ic.line([(32, 22), (32, 42)], "#C9932A", 3).line([(26, 28), (38, 28)], "#C9932A", 2.4)
    ic.shine(20, 22, 6)

@icon("money_bag", "💰")
def _(ic):
    ic.blob(32, 40, 19, C["tan2"], lobes=3, depth=0.06)
    ic.poly([(24, 20), (40, 20), (36, 12), (28, 12)], C["tan2"])
    ic.line([(24, 22), (40, 22)], C["brown"], 3)
    ic.circle(32, 40, 8, C["gold"], sw=1.8)

@icon("fire", "🔥")
def _(ic):
    ic.poly([(32, 4), (44, 22), (50, 18), (52, 36), (46, 54), (32, 60), (18, 54), (12, 38), (16, 24), (22, 30), (24, 16)], C["orange"])
    ic.poly([(32, 26), (40, 40), (38, 52), (32, 56), (26, 52), (24, 42)], C["yel"], stroke=False, offset=False)

@icon("drops", "💦")
def _(ic):
    for (x, y, s) in [(22, 34, 1), (42, 24, 0.8), (44, 46, 0.7)]:
        ic.poly([(x, y - 14 * s), (x + 9 * s, y + 2 * s), (x, y + 10 * s), (x - 9 * s, y + 2 * s)], C["blue"])

@icon("puff", "💨")
def _(ic):
    ic.blob(36, 32, 14, C["white"], lobes=5, depth=0.12); ic.blob(18, 38, 9, C["white"], lobes=4, depth=0.12)
    ic.line([(4, 24), (16, 24)], OUT, 2).line([(2, 32), (10, 32)], OUT, 2)

@icon("zzz", "💤")
def _(ic):
    ic.line([(30, 10), (46, 10), (30, 26), (46, 26)], C["blue"], 3.4)
    ic.line([(14, 32), (26, 32), (14, 44), (26, 44)], C["blue"], 3)
    ic.line([(34, 44), (42, 44), (34, 54), (42, 54)], C["blue"], 2.6)

@icon("bolt", "⚡")
def _(ic):
    ic.poly([(36, 4), (16, 36), (30, 36), (24, 60), (48, 26), (34, 26), (42, 4)], C["yel"])

# ================= GIAO DIỆN =================
@icon("lock", "🔒")
def _(ic):
    ic.arc(32, 26, 11, 180, 360, OUT, 4)
    ic.rrect(14, 26, 36, 30, 6, C["gold"]); ic.dot(32, 38, 3).line([(32, 40), (32, 47)], OUT, 3)

@icon("phone", "📱")
def _(ic):
    ic.rrect(18, 6, 28, 52, 7, C["purple"]); ic.rrect(22, 12, 20, 36, 3, C["lblue"]); ic.dot(32, 53, 2)

@icon("book", "📖")
def _(ic):
    ic.poly([(32, 16), (8, 10), (8, 50), (32, 56)], C["white"]).poly([(32, 16), (56, 10), (56, 50), (32, 56)], C["lpink"])
    for y in (24, 32, 40):
        ic.line([(14, y - 4), (26, y)], C["grey"], 1.8).line([(38, y), (50, y - 4)], C["pink"], 1.8)

@icon("envelope", "✉️", "✉")
def _(ic):
    ic.rrect(6, 16, 52, 34, 5, C["white"]); ic.line([(7, 18), (32, 38), (57, 18)])
    ic.heart(46, 42, 5, C["hot"])

@icon("save", "💾")
def _(ic):
    ic.rrect(10, 10, 44, 44, 6, C["purple"]); ic.rrect(18, 10, 24, 14, 2, C["white"]); ic.rrect(18, 34, 28, 18, 3, C["lpink"])

@icon("clipboard", "📋")
def _(ic):
    ic.rrect(12, 10, 40, 48, 6, C["tan2"]); ic.rrect(17, 16, 30, 38, 3, C["white"]); ic.rrect(24, 6, 16, 8, 3, C["grey"])
    for y in (26, 34, 42):
        ic.line([(22, y), (42, y)], C["grey"], 2)

@icon("memo", "📝")
def _(ic):
    ic.rrect(10, 10, 36, 46, 4, C["white"])
    for y in (20, 28, 36, 44):
        ic.line([(16, y), (38, y)], C["blue"], 1.8)
    ic.rrect(34, 18, 8, 34, 3, C["yel"], rot=35)

@icon("box", "📦")
def _(ic):
    ic.poly([(8, 24), (32, 14), (56, 24), (56, 50), (32, 60), (8, 50)], C["tan2"])
    ic.line([(8, 24), (32, 34), (56, 24)]).line([(32, 34), (32, 60)])

@icon("shopbag", "🛍️", "🛍")
def _(ic):
    ic.arc(32, 22, 9, 180, 360, OUT, 3)
    ic.rrect(10, 22, 44, 36, 5, C["pink"]); ic.heart(32, 40, 8, C["white"])

@icon("gear", "⚙️", "⚙")
def _(ic):
    ic.star(32, 32, 26, C["grey"], points=8, inner=0.78)
    ic.circle(32, 32, 8, C["white"])

@icon("tools", "🛠️", "🛠")
def _(ic):
    ic.rrect(28, 6, 8, 52, 3, C["dgrey"], rot=45); ic.rrect(28, 6, 8, 52, 3, C["tan2"], rot=-45)
    ic.circle(14, 14, 7, C["grey"])

@icon("palette", "🎨")
def _(ic):
    ic.blob(32, 34, 24, C["tan"], lobes=3, depth=0.06); ic.circle(40, 44, 5, C["cream"])
    for (x, y, c) in [(20, 26, C["red"]), (32, 20, C["yel"]), (44, 26, C["blue"]), (20, 40, C["green"])]:
        ic.circle(x, y, 4.5, c, sw=1.6)

@icon("plate", "🍽️", "🍽")
def _(ic):
    ic.ellipse(32, 36, 24, 18, C["white"]); ic.ellipse(32, 36, 15, 10, C["lblue"], sw=1.6)
    ic.line([(6, 10), (6, 56)], C["dgrey"], 2.6).line([(58, 10), (58, 56)], C["dgrey"], 2.6)

@icon("log", "🪵")
def _(ic):
    ic.rrect(8, 22, 44, 22, 10, C["brown"]); ic.ellipse(50, 33, 7, 11, C["tan"]); ic.arc(50, 33, 4, 0, 300, C["tan2"], 1.4)

@icon("stool", "🪑")
def _(ic):
    ic.ellipse(32, 20, 22, 8, "#E53935")
    ic.poly([(14, 22), (50, 22), (46, 56), (40, 56), (32, 32), (24, 56), (18, 56)], "#E53935")

@icon("fan", "🌀")
def _(ic):
    ic.circle(32, 28, 22, C["lblue"])
    for a in (0, 120, 240):
        ic.ellipse(32 + 10 * math.cos(math.radians(a)), 28 + 10 * math.sin(math.radians(a)), 10, 5, C["blue"], rot=a + 30, sw=1.6)
    ic.circle(32, 28, 3, C["white"], sw=1.6).line([(32, 50), (32, 60)], OUT, 3).line([(22, 60), (42, 60)], OUT, 3)

@icon("music", "🎵")
def _(ic):
    ic.line([(26, 46), (26, 12), (48, 8), (48, 40)], OUT, 3.4)
    ic.ellipse(20, 46, 7, 5, C["purple"], rot=-20).ellipse(42, 40, 7, 5, C["purple"], rot=-20)

@icon("handfan", "🪭")
def _(ic):
    pts = [(32, 52)] + [(32 + 26 * math.cos(math.radians(a)), 52 - 26 * math.sin(math.radians(a))) for a in range(20, 161, 10)]
    ic.shape(pts, C["pink"])
    for a in (40, 70, 100, 130):
        ic.line([(32, 52), (32 + 24 * math.cos(math.radians(a)), 52 - 24 * math.sin(math.radians(a)))], C["hot"], 1.6)
    ic.rrect(29, 50, 6, 10, 2, C["brown"])

@icon("pause", "⏸")
def _(ic):
    ic.rrect(16, 12, 11, 40, 4, C["white"]); ic.rrect(37, 12, 11, 40, 4, C["white"])

@icon("trash", "🗑")
def _(ic):
    ic.poly([(14, 20), (50, 20), (46, 58), (18, 58)], C["grey"])
    ic.rrect(10, 12, 44, 8, 3, C["dgrey"]); ic.rrect(26, 6, 12, 7, 2, C["dgrey"])
    for x in (25, 32, 39):
        ic.line([(x, 28), (x, 50)], C["white"], 2)

@icon("check_box", "✅")
def _(ic):
    ic.rrect(8, 8, 48, 48, 10, C["green"]); ic.line([(18, 32), (28, 42), (46, 22)], C["white"], 5)

@icon("check", "✓")
def _(ic):
    ic.line([(12, 34), (26, 48), (52, 16)], C["dgreen"], 6)

@icon("cross", "✕")
def _(ic):
    ic.line([(16, 16), (48, 48)], OUT, 5).line([(48, 16), (16, 48)], OUT, 5)

@icon("warn", "⚠️", "⚠")
def _(ic):
    ic.poly([(32, 6), (58, 54), (6, 54)], C["yel"]); ic.line([(32, 22), (32, 38)], OUT, 4.4); ic.dot(32, 46, 3)

@icon("arrow_left", "←")
def _(ic):
    ic.line([(52, 32), (14, 32)], OUT, 5).line([(28, 16), (12, 32), (28, 48)], OUT, 5)

@icon("tri_left", "◀")
def _(ic):
    ic.poly([(14, 32), (48, 12), (48, 52)], C["pink"])

@icon("tri_right", "▶")
def _(ic):
    ic.poly([(50, 32), (16, 12), (16, 52)], C["pink"])

@icon("hand", "✋")
def _(ic):
    for (x, h) in [(18, 22), (26, 30), (34, 32), (42, 28)]:
        ic.rrect(x - 4, 40 - h, 8, h + 6, 4, C["skin"], sw=2)
    ic.rrect(14, 30, 34, 28, 12, C["skin"]); ic.rrect(44, 34, 14, 7, 3.5, C["skin"], rot=-40, sw=2)

@icon("pointer", "👆")
def _(ic):
    ic.rrect(26, 4, 11, 32, 5, C["skin"])
    ic.rrect(16, 28, 34, 30, 12, C["skin"])
    for x in (30, 38):
        ic.line([(x, 30), (x, 38)], OUT, 1.6)

@icon("people", "👥")
def _(ic):
    for (x, c) in [(22, C["purple"]), (42, C["pink"])]:
        ic.circle(x, 22, 9, C["skin"]); ic.rrect(x - 13, 34, 26, 22, 10, c)

@icon("bulb", "💡")
def _(ic):
    ic.circle(32, 26, 18, C["lyel"]); ic.rrect(24, 42, 16, 12, 3, C["grey"])
    ic.line([(26, 30), (32, 36), (38, 30)], C["orange"], 2)

@icon("lantern", "🏮")
def _(ic):
    ic.line([(32, 2), (32, 10)], OUT, 2)
    ic.rrect(26, 8, 12, 5, 2, C["gold"])
    ic.ellipse(32, 30, 18, 17, C["red"])
    ic.line([(32, 14), (32, 46)], C["dred"], 1.6).arc(32, 30, 9, 100, 260, C["dred"], 1.6).arc(32, 30, 9, -80, 80, C["dred"], 1.6)
    ic.rrect(26, 45, 12, 5, 2, C["gold"]); ic.line([(30, 50), (29, 60)], C["gold"], 2).line([(34, 50), (35, 60)], C["gold"], 2)

@icon("red_envelope", "🧧")
def _(ic):
    ic.rrect(14, 6, 36, 52, 5, C["dred"]); ic.poly([(14, 10), (32, 24), (50, 10)], C["red"]); ic.circle(32, 26, 6, C["gold"])

@icon("xmas_tree", "🎄")
def _(ic):
    ic.poly([(32, 4), (50, 24), (42, 24), (56, 42), (44, 42), (58, 56), (6, 56), (20, 42), (8, 42), (22, 24), (14, 24)], "#4CAF50")
    ic.rrect(28, 54, 8, 8, 2, C["brown"]); ic.star(32, 6, 6, C["yel"], sw=1.6)
    for (x, y, c) in [(26, 30, C["red"]), (38, 36, C["yel"]), (24, 46, C["blue"]), (42, 50, C["red"])]:
        ic.circle(x, y, 2.6, c, sw=1.2)

@icon("blossom", "🌸")
def _(ic):
    for a in range(0, 360, 72):
        ic.circle(32 + 12 * math.cos(math.radians(a - 90)), 32 + 12 * math.sin(math.radians(a - 90)), 10, C["lpink"])
    ic.circle(32, 32, 6, C["pink"])

@icon("blossom_y", "🌼")
def _(ic):
    for a in range(0, 360, 72):
        ic.circle(32 + 12 * math.cos(math.radians(a - 90)), 32 + 12 * math.sin(math.radians(a - 90)), 10, C["yel"])
    ic.circle(32, 32, 6, C["orange"])

@icon("bouquet", "💐")
def _(ic):
    ic.poly([(18, 34), (46, 34), (36, 60), (28, 60)], C["lblue"])
    for (x, y, c) in [(22, 24, C["hot"]), (34, 18, C["yel"]), (44, 26, C["pink"]), (30, 30, C["red"]), (40, 34, C["purple"])]:
        ic.circle(x, y, 7, c, sw=2)
    ic.rrect(26, 42, 12, 5, 2, C["hot"])

@icon("moon", "🌕")
def _(ic):
    ic.circle(32, 32, 24, C["lyel"]); ic.circle(24, 26, 4, "#F3E28E", sw=1.4).circle(38, 38, 3, "#F3E28E", sw=1.4)

@icon("fish_lantern", "🐟")
def _(ic):
    ic.ellipse(28, 32, 20, 13, C["orange"]); ic.poly([(46, 32), (60, 20), (60, 44)], C["red"])
    ic.dot(18, 29, 2.2); ic.arc(30, 32, 7, -60, 60, C["dred"], 1.6)

@icon("leaf", "🍃")
def _(ic):
    ic.ellipse(28, 30, 20, 9, C["green"], rot=-30); ic.line([(12, 40), (44, 20)], C["dgreen"], 1.6)
    ic.ellipse(44, 44, 12, 6, C["lgreen"], rot=20)

@icon("chocolate", "🍫")
def _(ic):
    ic.rrect(10, 14, 44, 36, 4, "#7B4B3A")
    for x in (24, 38):
        ic.line([(x, 16), (x, 48)], "#5D3528", 2)
    ic.line([(12, 32), (52, 32)], "#5D3528", 2)
    ic.poly([(10, 38), (54, 30), (54, 50), (10, 50)], C["red"])

@icon("sun", "☀️", "☀")
def _(ic):
    for a in range(0, 360, 45):
        ic.line([(32 + 20 * math.cos(math.radians(a)), 32 + 20 * math.sin(math.radians(a))), (32 + 28 * math.cos(math.radians(a)), 32 + 28 * math.sin(math.radians(a)))], C["orange"], 3)
    ic.circle(32, 32, 15, C["yel"]); ic.dot(27, 30, 1.8).dot(37, 30, 1.8).arc(32, 34, 5, 20, 160, sw=1.8)

@icon("wind", "🌬️", "🌬")
def _(ic):
    ic.line([(6, 24), (40, 24), (48, 18), (44, 10), (36, 12)], C["blue"], 3.4)
    ic.line([(6, 36), (50, 36), (58, 42), (54, 50), (46, 48)], C["blue"], 3.4)
    ic.line([(12, 48), (30, 48)], C["blue"], 3)

@icon("hot_face", "🥵")
def _(ic):
    mood(ic, "#FF8A6B"); ic.arc(24, 30, 3, 200, 340, sw=2.2).arc(40, 30, 3, 200, 340, sw=2.2)
    ic.ellipse(32, 44, 6, 4, "#C0392B"); ic.ellipse(36, 50, 4, 5, C["hot"])
    ic.poly([(52, 14), (56, 22), (52, 26), (48, 22)], C["blue"])

@icon("rain", "🌧️", "🌧")
def _(ic):
    ic.blob(32, 24, 18, C["grey"], lobes=5, depth=0.14)
    for x in (20, 32, 44):
        ic.line([(x, 46), (x - 4, 58)], C["blue"], 3)

@icon("backpack", "🎒")
def _(ic):
    ic.arc(32, 16, 8, 180, 360, OUT, 3)
    ic.rrect(12, 14, 40, 44, 12, "#FF8A65"); ic.rrect(18, 36, 28, 16, 5, "#FFAB91"); ic.line([(24, 42), (40, 42)], OUT, 2)

@icon("sunset", "🌅")
def _(ic):
    ic.rrect(4, 10, 56, 44, 8, "#FFC3A0"); ic.arc(32, 44, 14, 180, 360, C["orange"], 4)
    ic.ellipse(32, 44, 13, 12, C["orange"], stroke=False, offset=False)
    ic.rrect(4, 44, 56, 10, 4, C["blue"]); ic.line([(14, 49), (26, 49)], C["white"], 2).line([(36, 50), (50, 50)], C["white"], 2)

@icon("potted", "🪴")
def _(ic):
    ic.poly([(18, 36), (46, 36), (42, 60), (22, 60)], "#E2895A"); ic.rrect(16, 32, 32, 7, 3, "#C96F44")
    for (x, y, c) in [(20, 20, C["hot"]), (32, 14, C["pink"]), (44, 20, C["hot"]), (26, 28, C["green"]), (38, 28, C["green"])]:
        ic.circle(x, y, 7, c, sw=2)

@icon("scooter", "🛵")
def _(ic):
    ic.circle(16, 48, 8, C["grey"]).circle(48, 48, 8, C["grey"])
    ic.poly([(12, 40), (24, 26), (40, 26), (54, 40), (40, 46), (22, 46)], C["red"])
    ic.line([(44, 26), (50, 12), (56, 12)], OUT, 3)

@icon("helmet", "⛑️", "⛑")
def _(ic):
    ic.poly([(8, 40), (12, 22), (24, 12), (40, 12), (52, 22), (56, 40)], "#43A047"); ic.rrect(6, 38, 52, 7, 3, "#2E7D32")
    ic.line([(28, 16), (28, 36)], C["white"], 3).line([(22, 26), (34, 26)], C["white"], 3)


# ---------------- Mùa 2: quầy chè ----------------
def che_cup(ic, layers, top=None):
    # cốc nhựa trong, các lớp màu từ dưới lên
    ic.poly([(16, 14), (48, 14), (44, 58), (20, 58)], C["lblue"])
    h = 40.0 / max(1, len(layers))
    for k, col in enumerate(layers):
        y1 = 57 - k * h
        y0 = y1 - h
        t0 = (y0 - 14) / 44.0
        t1 = (y1 - 14) / 44.0
        ic.poly([(16 + 4 * t0 + 1.5, y0), (48 - 4 * t0 - 1.5, y0), (48 - 4 * t1 - 1.5, y1), (16 + 4 * t1 + 1.5, y1)], col, stroke=False, offset=False)
    ic.rrect(13, 10, 38, 7, 3, C["white"])
    if top:
        top(ic)
    ic.line([(22, 22), (24, 50)], C["white"], 2.2)

@icon("che", "🍧")
def _(ic):
    def top(ic):
        ic.blob(32, 9, 9, "#EAF7FF", lobes=7, depth=0.15)
    che_cup(ic, ["#E8D27A", "#A2453B", "#7FD1C7", "#FFFDF5"], top)

@icon("sua_chua_ly", "🍦")
def _(ic):
    def top(ic):
        ic.blob(32, 9, 10, C["white"], lobes=8, depth=0.12)
        ic.dot(29, 7, 1.6, C["hot"]).dot(36, 9, 1.6, C["hot"])
    che_cup(ic, ["#F6C445", "#FFF8EE", "#FFF8EE"], top)

@icon("combo_he", "🌴")
def _(ic):
    ic.line([(30, 58), (32, 26)], C["brown"], 5)
    for (dx, dy, r) in [(-14, -2, -25), (14, -2, 25), (-10, -10, -60), (10, -10, 60)]:
        ic.ellipse(32 + dx, 24 + dy, 13, 5, C["green"], rot=r)
    ic.circle(29, 30, 3, C["tan2"]).circle(35, 30, 3, C["tan2"])
    ic.circle(50, 14, 6, C["yel"])

@icon("coc_che", "🥃")
def _(ic):
    ic.poly([(16, 14), (48, 14), (44, 58), (20, 58)], C["lblue"])
    ic.rrect(13, 10, 38, 7, 3, C["white"])
    ic.line([(22, 22), (24, 50)], C["white"], 2.4)

def bowl_of(ic, fill, dots=None, dotc=None):
    ic.ellipse(32, 46, 24, 10, C["cream"])
    ic.blob(32, 38, 17, fill, lobes=8, depth=0.12)
    if dots:
        for (x, y) in dots:
            ic.dot(x, y, 2.2, dotc)

@icon("dau_xanh", "🟢")
def _(ic):
    bowl_of(ic, "#E8D27A", [(24, 34), (30, 30), (38, 33), (34, 40), (26, 41), (42, 39)], "#C9A93E")

@icon("dau_do", "🫘")
def _(ic):
    for (x, y, r) in [(22, 34, -20), (34, 30, 15), (44, 40, -10), (30, 44, 30), (18, 46, 5)]:
        ic.ellipse(x, y, 8, 5.5, "#A2453B", rot=r)
        ic.shine(x - 3, y - 2, 3)

@icon("sua_chua", "🥛")
def _(ic):
    ic.rrect(18, 18, 28, 38, 8, C["white"])
    ic.rrect(16, 12, 32, 8, 3, C["lpink"])
    ic.rrect(22, 30, 20, 10, 3, C["lpink"], stroke=False, offset=False)
    ic.dot(32, 35, 2, C["hot"])

@icon("nuoc_cot_dua", "🥥")
def _(ic):
    ic.circle(32, 36, 20, "#8D6E63")
    ic.circle(32, 36, 14, "#FFFDF5", stroke=False, offset=False)
    ic.dot(26, 22, 1.8, C["black"]).dot(32, 20, 1.8, C["black"]).dot(38, 22, 1.8, C["black"])
    ic.shine(26, 32, 4)

@icon("suong_sao", "🌑")
def _(ic):
    for (x, y) in [(20, 30), (36, 26), (28, 42), (44, 40)]:
        ic.rrect(x - 7, y - 7, 14, 14, 3, "#3B3030", rot=12)
        ic.shine(x - 3, y - 4, 3)

@icon("mit", "🍈")
def _(ic):
    for (x, y, r) in [(24, 36, -20), (40, 32, 20)]:
        ic.ellipse(x, y, 11, 15, "#F6C445", rot=r)
        ic.ellipse(x, y + 1, 5, 9, "#FFE38A", rot=r, stroke=False, offset=False)

@icon("thach", "💠")
def _(ic):
    cols = ["#7FD1C7", "#FF9DB8", "#C3A6FF", "#FFD95A"]
    k = 0
    for (x, y) in [(18, 28), (34, 24), (26, 42), (42, 40)]:
        ic.rrect(x - 7, y - 7, 14, 14, 3, cols[k % 4], rot=-8)
        ic.shine(x - 3, y - 4, 3)
        k += 1

@icon("nep_cam", "🟣")
def _(ic):
    bowl_of(ic, "#6B2E5C", [(24, 34), (30, 30), (38, 33), (34, 40), (26, 41), (42, 39)], "#9C5A8A")

@icon("dua_nao", "☁️", "☁")
def _(ic):
    ic.ellipse(32, 46, 22, 8, C["tan"])
    for k in range(9):
        x = 16 + (k * 7) % 32
        y = 30 + (k * 5) % 14
        ic.rrect(x, y, 9, 3, 1.5, C["white"], rot=(k * 37) % 90 - 45)

@icon("co_hanh", "👩‍🏫")
def _(ic):
    hair_long_back(ic, C["hair"])
    body(ic, "#81C784", collar=C["white"])
    face(ic)
    hair_cap(ic, C["hair"])
    ic.circle(26, 28, 4.5, "none", sw=1.6).circle(38, 28, 4.5, "none", sw=1.6).line([(30.5, 28), (33.5, 28)], OUT, 1.4)



@icon("chuong_gio", "🎐")
def _(ic):
    ic.line([(32, 6), (32, 14)], OUT, 2)
    ic.ellipse(32, 22, 12, 9, C["lblue"])
    ic.line([(32, 30), (32, 46)], OUT, 1.6)
    ic.rrect(26, 46, 12, 12, 2, C["lpink"])
    ic.dot(28, 22, 1.6, C["hot"]).dot(36, 22, 1.6, C["hot"])

@icon("gau_bong", "🧸")
def _(ic):
    ic.circle(20, 18, 7, C["tan2"]).circle(44, 18, 7, C["tan2"])
    ic.circle(32, 28, 14, C["tan2"])
    ic.ellipse(32, 50, 15, 11, C["tan2"])
    ic.ellipse(32, 32, 6, 4, C["tan"])
    ic.dot(26, 25, 1.8, OUT).dot(38, 25, 1.8, OUT).dot(32, 30, 1.6, OUT)
    ic.heart(32, 50, 5, C["hot"])



@icon("crystal_ball", "🔮")
def _(ic):
    ic.rrect(16, 48, 32, 10, 3, C["tan2"])
    ic.circle(32, 30, 19, C["purple"])
    ic.ellipse(25, 23, 5, 7, C["white"], rot=-25)
    ic.star(40, 34, 4, C["gold"])
    ic.dot(34, 22, 1.4, C["white"])



@icon("wheel_fortune", "☸️", "☸")
def _(ic):
    ic.circle(32, 32, 24, C["gold"])
    ic.circle(32, 32, 17, C["cream"])
    for k in range(8):
        import math
        a = k * math.pi / 4
        ic.line([(32 + 6 * math.cos(a), 32 + 6 * math.sin(a)), (32 + 17 * math.cos(a), 32 + 17 * math.sin(a))], OUT, 2)
    ic.circle(32, 32, 6, C["purple"])
    for k in range(8):
        a = k * math.pi / 4 + math.pi / 8
        ic.dot(32 + 21 * math.cos(a), 32 + 21 * math.sin(a), 1.6, C["dred"])


if __name__ == "__main__":
    import sys
    out = sys.argv[1]
    data = "".join(['"%s":%s,' % (k, json.dumps(v)) for k, v in ICONS.items()])
    js = ("// doodles.js — Bộ hình vẽ tay kiểu doodle (SVG) thay cho emoji. Tự tạo bằng code, thuộc dự án.\n"
          "// DOODLES: id → nội dung SVG (khung 64×64). DOODLE_MAP: emoji → id (game tự đổi emoji sang hình khi hiển thị).\n"
          "window.DOODLES = {" + data.rstrip(",") + "};\n"
          "window.DOODLE_MAP = " + json.dumps(MAP, ensure_ascii=False) + ";\n")
    open(out, "w", encoding="utf8").write(js)
    print(len(ICONS), "icons,", len(MAP), "emoji,", len(js) // 1024, "KB")
