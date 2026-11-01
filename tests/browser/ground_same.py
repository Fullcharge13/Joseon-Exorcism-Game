"""바닥 그리기 회귀 시험(v18.4, Playwright)
사용: python3 tests/browser/ground_same.py [옛.html] [새.html]   (옛 판을 안 주면 git의 v18.3 618165f)
분위기 효과 「끔」과 절약 모드에서는 바닥이 옛 판과 한 점도 다르지 않아야 한다(10막 × 두 자리).
「켬」에서는 조각 경계(128px)에 이음매가 없는지: 조각 경계 양쪽 줄의 같은 색 비율이 다른 줄과 비슷한지 본다."""
import sys, pathlib, subprocess, tempfile, io
from playwright.sync_api import sync_playwright
from PIL import Image, ImageChops
ROOT = pathlib.Path(__file__).resolve().parents[2]
old = sys.argv[1] if len(sys.argv) > 1 else None
new = sys.argv[2] if len(sys.argv) > 2 else str(ROOT / 'index.html')
if not old:
    tmp = pathlib.Path(tempfile.mkdtemp()) / 'v183.html'
    tmp.write_text(subprocess.run(['git', '-C', str(ROOT), 'show', '618165f:index.html'], capture_output=True, text=True, check=True).stdout, encoding='utf8'); old = str(tmp)
# 바닥만: 요괴·물건·장애물·효과 없이 바닥 그리기만 부른다(buf를 PNG로)
SNAP = """(o)=>{meta.set.vfx=o.v;meta.set.perf=o.perf;applyPerf();show(null);newGame('seonbi','gilil',0,'normal');G.queue.length=0;show(null);G.stage=o.st;
 const cx=o.x,cy=o.y;const hk=buf.width>W?2:1;b.setTransform(hk,0,0,hk,0,0);b.imageSmoothingEnabled=false;
 for(let i=0;i<8;i++)drawGround(cx,cy);return buf.toDataURL('image/png');}"""
def shots(path, v, perf):
    out = []
    with sync_playwright() as p:
        br = p.chromium.launch(); ctx = br.new_context(viewport={'width': 1280, 'height': 720}); ctx.add_init_script("window.requestAnimationFrame=()=>0;")
        ctx.route('**/fonts.g*/**', lambda r: r.abort()); pg = ctx.new_page(); pg.goto('file://' + str(pathlib.Path(path).resolve())); pg.wait_for_timeout(400)
        for st in range(10):
            for (x, y) in ((-200, -120), (1337, -811)):
                d = pg.evaluate(SNAP, {'st': st, 'v': v, 'perf': perf, 'x': x, 'y': y})
                out.append(Image.open(io.BytesIO(__import__('base64').b64decode(d.split(',')[1]))).convert('RGB'))
        br.close()
    return out
fails = []
for v, perf in (('off', 'high'), ('on', 'low')):
    a, b = shots(old, v, perf), shots(new, v, perf)
    for i, (x, y) in enumerate(zip(a, b)):
        if x.size != y.size or ImageChops.difference(x, y).getbbox():
            fails.append(f'{v}/{perf} {i//2+1}막 자리{i%2}: 옛 판과 다름 {ImageChops.difference(x, y).getbbox() if x.size == y.size else "크기"}')
# 켬: 같은 세상 자리를 조각 경계가 다른 두 카메라에서 그려 겹친 부분이 한 점도 다르지 않아야 한다(가로·세로 경계 모두, 이음매·잘림 없음)
PAIR = """(o)=>{meta.set.vfx='on';meta.set.perf='high';applyPerf();show(null);newGame('seonbi','gilil',0,'normal');G.queue.length=0;show(null);G.stage=o.st;
 const hk=buf.width>W?2:1,shot=(cx,cy)=>{b.setTransform(hk,0,0,hk,0,0);b.imageSmoothingEnabled=false;for(let i=0;i<60;i++)drawGround(cx,cy);return buf.toDataURL('image/png');};
 return {a:shot(o.x,o.y),b:shot(o.x+o.dx,o.y+o.dy),hk};}"""
import base64
with sync_playwright() as p:
    br = p.chromium.launch()
    for vname, vopt in (('pc', dict(viewport={'width': 1280, 'height': 720})), ('phone', dict(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, device_scale_factor=2))):
        ctx = br.new_context(**vopt); ctx.add_init_script("window.requestAnimationFrame=()=>0;"); ctx.route('**/fonts.g*/**', lambda r: r.abort())
        pg = ctx.new_page(); pg.goto('file://' + str(pathlib.Path(new).resolve())); pg.wait_for_timeout(400)
        for st in range(10):
            r = pg.evaluate(PAIR, {'st': st, 'x': -213, 'y': -147, 'dx': 77, 'dy': 53})
            A = Image.open(io.BytesIO(base64.b64decode(r['a'].split(',')[1]))).convert('RGB'); B = Image.open(io.BytesIO(base64.b64decode(r['b'].split(',')[1]))).convert('RGB')
            k = r['hk']; dx, dy = 77 * k, 53 * k; w, h = A.size
            d = ImageChops.difference(A.crop((dx, dy, w, h)), B.crop((0, 0, w - dx, h - dy))).getbbox()
            if d: fails.append(f'{vname} 켬 {st+1}막: 카메라를 옮기면 바닥이 달라짐(이음매·잘림) {d}')
        ctx.close()
    br.close()
if fails: print(f'FAIL ground_same ({len(fails)})\n  ' + '\n  '.join(fails[:20])); sys.exit(1)
print('PASS ground_same (끔·절약 모드 바닥 10막 × 2자리가 v18.3과 같음, 켬에서 카메라를 옮겨도 겹친 바닥이 한 점도 다르지 않음 · 휴대폰·PC)')
