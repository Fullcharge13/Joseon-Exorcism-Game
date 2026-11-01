"""방패 단계 캡처(v18.5, Playwright): 장수의 방패 Lv1~5·진화를 1막에서 그려 PC·휴대폰으로 찍고, 레벨업 카드·도감 줄을 찍는다 → tests/browser/out/shield/
사용: python3 tests/browser/shield_shots.py [게임.html]  · 화면 오류가 있으면 실패"""
import sys, pathlib
from playwright.sync_api import sync_playwright
from PIL import Image
ROOT = pathlib.Path(__file__).resolve().parents[2]
game = sys.argv[1] if len(sys.argv) > 1 else str(ROOT / 'index.html')
OUT = ROOT / 'tests' / 'browser' / 'out' / 'shield'; OUT.mkdir(parents=True, exist_ok=True)
SET = """(o)=>{show(null);meta.set.vfx=o.v;newGame('jangsu',0,0,'normal');G.queue.length=0;show(null);G.P.hp=G.P.maxHp=1e9;G.enemies.length=0;
 let w=G.weapons.find(w=>w.id==='deungpae');if(!w){G.weapons.push({id:'deungpae',lv:1});w=G.weapons.find(w=>w.id==='deungpae');}
 w.lv=o.lv;w.evo=!!o.evo;refreshSlots();G.P.dirx=1;G.P.diry=0;let t=100000;for(let i=0;i<8;i++){G.P.hp=1e9;G.queue.length=0;if(modal)show(null);frame(t+=16);}
 document.querySelectorAll('#toast,#task,.taskpop,#taskPops').forEach(e=>e.style.visibility='hidden');return {k:S*DPR,cx:RCX,cy:RCY,x:G.P.x,y:G.P.y};}"""
CARD = """()=>{const w=G.weapons.find(w=>w.id==='deungpae');w.evo=false;const names=[],icons=new Set();
 for(let l=1;l<=4;l++){w.lv=l;const o=decorate({k:'wup',id:'deungpae'});names.push(o.name);icons.add(o.ic);}w.lv=5;w.evo=true;icons.add(`<img src="${wIcon(w)}" alt="">`);w.evo=false;w.lv=1;
 return {names,icons:icons.size,other:wIcon({id:'hwando',lv:3})===ICON.hwando};}"""
errs = []; tiles = []
with sync_playwright() as p:
    br = p.chromium.launch()
    for vname, vopt in [('pc', dict(viewport={'width': 1280, 'height': 720})), ('phone', dict(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, device_scale_factor=2))]:
        ctx = br.new_context(**vopt); ctx.add_init_script("window.requestAnimationFrame=()=>0;"); ctx.route('**/fonts.g*/**', lambda r: r.abort())
        pg = ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + str(pathlib.Path(game).resolve())); pg.wait_for_timeout(400)
        row = []
        for lv, evo in ((1, 0), (2, 0), (3, 0), (4, 0), (5, 0), (5, 1)):
            for v in ('off', 'on'):
                r = pg.evaluate(SET, {'lv': lv, 'evo': evo, 'v': v}); f = OUT / f'{vname}_lv{lv}{"e" if evo else ""}_{v}.png'; pg.screenshot(path=str(f))
                im = Image.open(f); sx, sy = (r['x'] - r['cx']) * r['k'], (r['y'] - r['cy']) * r['k']   # 화면 점(CSS px × DPR = 캡처 점)
                box = int(70 * r['k']); c = im.crop((int(sx - box), int(sy - box * 0.8), int(sx + box), int(sy + box * 0.8)))
                if v == 'on': row.append(c)
        pg.evaluate(SET, {'lv': 1, 'evo': 0, 'v': 'on'})
        c = pg.evaluate(CARD); print(vname, '카드 이름:', ' / '.join(c['names']))
        if c['icons'] != 5 or not c['other']: errs.append(f'{vname}: 단계 아이콘 {c["icons"]}가지(5여야 함, 1~4단계 + 진화), 다른 무기 아이콘 그대로 {c["other"]}')
        tiles.append(row); ctx.close()
    br.close()
for i, row in enumerate(tiles):
    h = max(c.height for c in row); W = sum(c.width for c in row) + 8 * len(row); s = Image.new('RGB', (W, h), (10, 8, 14)); x = 0
    for c in row: s.paste(c, (x, 0)); x += c.width + 8
    s.save(OUT / f'tiers_{["pc","phone"][i]}.png')
if errs: print('FAIL shield_shots', errs); sys.exit(1)
print('PASS shield_shots (6단계 × 켬·끔 × PC·휴대폰, 화면 오류 0)')
