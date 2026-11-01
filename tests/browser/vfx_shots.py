"""분위기 층 캡처(v18.2, Playwright): 10막 × 켬·약하게·끔 × 휴대폰·PC → tests/browser/out/vfx/
사용: python3 tests/browser/vfx_shots.py [게임.html]
같은 씨앗·같은 장면(요괴 40·깨진 옹기·요괴 탄·경고 장판). 막별 끔/켬 비교 그림 vfx_compare_N.png도 만든다(PC)."""
import sys, pathlib
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from vfx_scene import INIT, SCENE
ROOT = pathlib.Path(__file__).resolve().parents[2]
game = sys.argv[1] if len(sys.argv) > 1 else str(ROOT / 'index.html')
OUT = ROOT / 'tests' / 'browser' / 'out' / 'vfx'; OUT.mkdir(parents=True, exist_ok=True)
EXTRA = """()=>{const P=G.P;for(let i=0;i<10;i++)G.ebul.push({x:P.x+70+i*7,y:P.y-40+i*4,vx:0,vy:0,r:2,dmg:0,life:99,col:'#ff5a8a'});warn({x:P.x-80,y:P.y+40,r:22,t:3,dmg:0});
 $('#stageName').textContent=curStg().sub+' '+curStg().name;for(let i=0;i<3;i++){G.P.hp=1e9;frame(window.__t+=16);}document.querySelectorAll('#toast,#task').forEach(e=>e.style.visibility='hidden');
 for(const e of document.querySelectorAll('.taskpop,.tpop,#taskPops'))e.style.display='none';}"""
errs = []
with sync_playwright() as p:
    br = p.chromium.launch()
    for vname, vopt in [('pc', dict(viewport={'width': 1280, 'height': 720})), ('phone', dict(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, device_scale_factor=2))]:
        ctx = br.new_context(**vopt); ctx.add_init_script(INIT); ctx.route('**/fonts.g*/**', lambda r: r.abort())
        pg = ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + str(pathlib.Path(game).resolve())); pg.wait_for_timeout(400)
        for st in range(10):
            for v in ('off', 'soft', 'on'):
                pg.evaluate(SCENE, {'st': st, 'v': v, 'n': 40, 'warm': 60}); pg.evaluate(EXTRA)
                pg.screenshot(path=str(OUT / f'{vname}_{st+1:02d}_{v}.png'))
        ctx.close()
    br.close()
for st in range(10):
    a = Image.open(OUT / f'pc_{st+1:02d}_off.png').convert('RGB'); b = Image.open(OUT / f'pc_{st+1:02d}_on.png').convert('RGB')
    w, h = a.size; c = Image.new('RGB', (w * 2 + 16, h), (10, 8, 14)); c.paste(a, (0, 0)); c.paste(b, (w + 16, 0)); c.save(OUT / f'vfx_compare_{st+1:02d}.png')
print('errors', errs, '·', len(list(OUT.glob('*_on.png'))) * 3, '장')
