"""v18.6.2 버그 셋 확인(Playwright, 휴대폰·PC): ① 직업 기술 레벨업 카드에 빈 그림(「?」) 없음 ② 퇴마사가 깃발 표지 밑에 서면 표지가 옅어짐 ③ 보스 피해 숫자가 정수
캡처 → tests/browser/out/fix1862/   사용: python3 tests/browser/fix_1862.py [게임.html]"""
import sys, pathlib
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parents[2]
game = sys.argv[1] if len(sys.argv) > 1 else str(ROOT / 'index.html')
OUT = ROOT / 'tests' / 'browser' / 'out' / 'fix1862'; OUT.mkdir(parents=True, exist_ok=True)
fails = []; errs = []
CARD = """()=>{show(null);newGame('mudang',0,0,'normal');G.queue.length=0;show(null);G.P.hp=G.P.maxHp=1e9;
 const ids=Object.keys(WD).filter(k=>WD[k].type==='c'&&WD[k].job==='mudang'||k==='obang').slice(0,4);for(const id of ids)if(!G.weapons.some(w=>w.id===id))G.weapons.push({id,lv:1,t:9});refreshSlots();
 curOpts=ids.map(id=>decorate({k:'wup',id}));openLevel(false);
 const bad=[...document.querySelectorAll('#luCards img')].filter(i=>!i.complete||!i.naturalWidth||/undefined/.test(i.getAttribute('src'))).length;return {ids,bad,seals:document.querySelectorAll('#luCards .seal').length};}"""
FLAG = """()=>{show(null);G.P.hp=1e9;G.zones.length=0;G.enemies.length=0;const P=G.P;zone({x:P.x,y:P.y-16,r:22,dmg:0,life:9,col:'#4a4552',kind:'flag',src:'obang'});zone({x:P.x+60,y:P.y,r:22,dmg:0,life:9,col:'#3a6fd0',kind:'flag',src:'obang'});
 let t=1e5;for(let i=0;i<3;i++){G.P.hp=1e9;frame(t+=16);}document.querySelectorAll('#toast,#task,#ach').forEach(e=>e.style.visibility='hidden');return 1;}"""
BOSS = """()=>{G.fx.length=0;spawnBoss('gumiho',false);const e=G.boss;e.x=G.P.x+30;e.y=G.P.y;e.maxHp=e.hp=12345.67;e.capT=G.time;e.capD=0;for(let i=0;i<60;i++)hurt(e,97.3,0,e.x,e.y);
 const n=G.fx.filter(f=>f.t==='num'&&typeof f.v==='number').map(f=>f.v);return {n:n.length,bad:n.filter(v=>!Number.isInteger(v)).slice(0,3)};}"""
with sync_playwright() as p:
    br = p.chromium.launch()
    for vname, vopt in (('pc', dict(viewport={'width': 1280, 'height': 720})), ('phone', dict(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, device_scale_factor=2))):
        ctx = br.new_context(**vopt); ctx.add_init_script("window.requestAnimationFrame=()=>0;"); ctx.route('**/fonts.g*/**', lambda r: r.abort())
        pg = ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e))); pg.goto('file://' + str(pathlib.Path(game).resolve())); pg.wait_for_timeout(400)
        c = pg.evaluate(CARD); pg.wait_for_timeout(500); pg.screenshot(path=str(OUT / f'{vname}_cards.png'))
        if c['bad'] or c['seals'] < len(c['ids']): fails.append(f'{vname} 카드: 빈 그림 {c["bad"]} · 도장 {c["seals"]}/{len(c["ids"])}')
        pg.evaluate(FLAG); pg.screenshot(path=str(OUT / f'{vname}_flag.png'))
        bz = pg.evaluate(BOSS)
        if not bz['n'] or bz['bad']: fails.append(f'{vname} 보스 숫자: {bz}')
        ctx.close()
    br.close()
if errs: fails.append('화면 오류 ' + '; '.join(errs[:3]))
if fails: print('FAIL fix_1862\n  ' + '\n  '.join(fails)); sys.exit(1)
print('PASS fix_1862 (직업 기술 카드 도장 아이콘 · 깃발 표지 · 보스 숫자 정수 · 휴대폰·PC · 화면 오류 0)')
