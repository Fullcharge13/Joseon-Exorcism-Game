"""장소 안내인 화면 시험 (v17.5, Playwright)
사용: python3 tests/browser/guide_ui.py [게임.html] [캡처폴더] [비교용 옛 게임.html]
 1) 휴대폰 390×844 · PC 1280×800 · 1920×1080: 세 장소를 곁에 두고 말풍선 셋 → 화면 안, 퇴마사 머리와 안 겹침, 서로 안 겹침
 2) 화면 밖: 가장자리 표지 셋(아이콘이 서로 다름), 화면 안, 말 한 줄
 3) 페이지 오류 0, 캡처 저장(직접 확인용)
 4) (옛 판을 주면) 세 장소가 떠 있는 장면의 그리기 시간 비교
"""
import sys, pathlib
from playwright.sync_api import sync_playwright
game = sys.argv[1] if len(sys.argv) > 1 else 'index.html'
out = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else 'tests/browser/out/guide'); out.mkdir(parents=True, exist_ok=True)
old = sys.argv[3] if len(sys.argv) > 3 else None
fails = []
def ok(c, m):
    if not c: fails.append(m)
NEAR = """()=>{newGame('seonbi','gilil',0,'normal');G.queue.length=0;show(null);G.P.hp=G.P.maxHp=1e7;G.P.iframe=1e9;G.mods.eCnt=0;G.enemies=[];G.shrineN=2;G.anomAt=undefined;G.dkAt=undefined;
 const P=G.P;G.shrine={x:P.x-55,y:P.y-30,prog:0,need:3.5};G.anom={id:'flip',x:P.x+50,y:P.y-5,prog:0,need:2.5,t:0};G.dk={x:P.x-10,y:P.y+50,prog:0,need:1.2,life:45};
 guideSay('shrine',G.shrine,'appear');guideSay('anom',G.anom,'appear');guideSay('dk',G.dk,'appear');for(const o of [G.shrine,G.anom,G.dk])o.say.t=99;}"""
FAR = """()=>{const P=G.P;for(const o of [G.shrine,G.anom,G.dk]){o.say=null;}G.shrine.x=P.x-900;G.anom.x=P.x+900;G.anom.y=P.y-300;G.dk.y=P.y+700;
 G.shrine.edgeSay={txt:'서낭님께 빌어 보시게',t:99};G.anom.edgeSay={txt:'퇴마사 나리, 여기요!',t:99};G.dk.edgeSay={txt:'이쪽이야, 이쪽!',t:99};}"""
HEAD = "()=>{const k=S*DPR,P=G.P,px=(P.x-RCX)*k,py=(P.y-RCY)*k,hh=20*entK()*k,hw=8*entK()*k;return {x:px-hw,y:py-hh,w:2*hw,h:hh,vw:W*k,vh:H*k,dpr:DPR}}"
def inter(a, b): return a['x'] < b['x'] + b['w'] and a['x'] + a['w'] > b['x'] and a['y'] < b['y'] + b['h'] and a['y'] + a['h'] > b['y']
PERF = """()=>{const t0=performance.now();for(let i=0;i<120;i++){render();blit();drawEmblems();if(typeof drawGuideUI==='function')drawGuideUI();}return (performance.now()-t0)/120;}"""
SETUP_PERF = """()=>{newGame('seonbi','gilil',0,'normal');G.queue.length=0;show(null);G.P.hp=G.P.maxHp=1e7;G.shrineN=2;G.anomAt=undefined;G.dkAt=undefined;const P=G.P;
 for(let i=0;i<120;i++)spawnEnemy(curStg().early[i%curStg().early.length],P.x+Math.cos(i)*120,P.y+Math.sin(i)*90);
 G.shrine={x:P.x-55,y:P.y-30,prog:1,need:3.5};G.anom={id:'flip',x:P.x+50,y:P.y-5,prog:0,need:2.5,t:0};G.dk={x:P.x-10,y:P.y+50,prog:0,need:1.2,life:45};
 if(typeof guideSay==='function'){guideSay('shrine',G.shrine,'appear');guideSay('anom',G.anom,'appear');guideSay('dk',G.dk,'appear');for(const o of [G.shrine,G.anom,G.dk])if(o.say)o.say.t=99;}}"""
with sync_playwright() as p:
    br = p.chromium.launch()
    for (vw, vh, mob, name) in [(390, 844, True, 'phone'), (1280, 800, False, 'pc1280'), (1920, 1080, False, 'pc1920')]:
        ctx = br.new_context(viewport={'width': vw, 'height': vh}, device_scale_factor=2 if mob else 1, is_mobile=mob, has_touch=mob)
        ctx.route('**/fonts.g*/**', lambda r: r.abort()); pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + str(pathlib.Path(game).resolve())); pg.wait_for_timeout(400)
        pg.evaluate(NEAR); pg.wait_for_timeout(600)
        r = pg.evaluate("()=>GUIR"); hd = pg.evaluate(HEAD)
        bubs = [q for q in r if q['t'] == 'b']
        ok(len(bubs) == 3, f'{name}: 말풍선 3개 ({len(bubs)})')
        for q in bubs:
            ok(q['x'] >= 0 and q['y'] >= 0 and q['x'] + q['w'] <= hd['vw'] and q['y'] + q['h'] <= hd['vh'], f'{name}: 말풍선이 화면 밖 {q}')
            ok(not inter(q, hd), f'{name}: 말풍선이 퇴마사 머리와 겹침 {q} {hd}')
            fs = (q['h'] / hd['dpr'])
            ok(18 <= fs <= 34, f'{name}: 말풍선 높이 {fs:.1f}px (글자 12~18px + 여백)')
        for i in range(len(bubs)):
            for j in range(i + 1, len(bubs)):
                ok(not inter(bubs[i], bubs[j]), f'{name}: 말풍선끼리 겹침')
        pg.screenshot(path=str(out / f'near_{name}.png'))
        pg.evaluate(FAR); pg.wait_for_timeout(500)
        r = pg.evaluate("()=>GUIR"); edges = [q for q in r if q['t'] == 'e']
        ok(sorted(q['k'] for q in edges) == ['anom', 'dk', 'shrine'], f'{name}: 가장자리 표지 셋 {[q["k"] for q in edges]}')
        hbr = pg.evaluate("()=>{const r=document.querySelector('#hudbtns').getBoundingClientRect(),c=cvs.getBoundingClientRect();return {x:(r.left-c.left)*DPR,y:(r.top-c.top)*DPR,w:r.width*DPR,h:r.height*DPR}}")
        for q in edges: ok(not inter(q, hbr), f'{name}: 표지가 오른쪽 아래 단추와 겹침 {q} {hbr}')
        for q in edges: ok(q['x'] >= 0 and q['y'] >= 0 and q['x'] + q['w'] <= hd['vw'] and q['y'] + q['h'] <= hd['vh'], f'{name}: 표지가 화면 밖 {q}')
        pg.screenshot(path=str(out / f'far_{name}.png'))
        ok(not errs, f'{name}: 페이지 오류 {errs[:2]}')
        ctx.close()
    if old:
        res = {}
        for tag, f in (('old', old), ('new', game)):
            ctx = br.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True)
            ctx.route('**/fonts.g*/**', lambda r: r.abort()); pg = ctx.new_page(); pg.goto('file://' + str(pathlib.Path(f).resolve())); pg.wait_for_timeout(400)
            pg.evaluate(SETUP_PERF); pg.wait_for_timeout(300)
            v = sorted(pg.evaluate(PERF) for _ in range(5)); res[tag] = v[2]; ctx.close()
        print(f"그리기 시간(휴대폰 화질 3배, 요괴 120, 세 장소) 중앙값: v17.4 {res['old']:.2f}ms → 새 판 {res['new']:.2f}ms")
    br.close()
if fails: print(f'FAIL guide_ui ({len(fails)})\n  ' + '\n  '.join(fails[:20])); sys.exit(1)
print('PASS guide_ui')
