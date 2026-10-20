"""설화 출정 화면 시험 (실제 브라우저, Playwright)
사용: python3 tests/browser/tale_flow.py [게임.html] [캡처 폴더]
휴대폰(390×844, 터치)과 PC(1280×720, 마우스)에서:
 1) 본편 설화 흔적: 금빛 흔적 위에 서면 장면 창이 뜨고, 세 번째 조각이면 「열렸다」가 장면 끝과 과업 알림 자리 두 곳에 나온다.
 2) 출정 준비 → 「설화 출정」: 설화 목록 세 모양(잠김·열림·완주)
 3) 설화 한 판을 끝까지(보스는 시험이 바로 쓰러뜨림): 막 사이 장면 → 결말 → 결과 화면
 4) 본편 결말 다섯 쪽: 「다음」 한 번에 한 쪽씩만 넘어간다(터치·클릭·키)
 5) 휴대폰: 이동 손가락을 누른 채 다른 손가락으로 「다음」을 탭해도 한 쪽 넘어간다
 6) 퇴마록 「설화록」 탭
모든 화면에서 가로 넘침·페이지 오류가 없어야 한다.
"""
import sys, pathlib
from playwright.sync_api import sync_playwright
game = sys.argv[1] if len(sys.argv) > 1 else 'index.html'
out = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else '/tmp/tale_flow'); out.mkdir(parents=True, exist_ok=True)
fails = []
def ok(c, m):
    if not c: fails.append(m)
def tp(x, y, i): return {'x': x, 'y': y, 'id': i, 'radiusX': 5, 'radiusY': 5, 'force': 1}
PICK = "()=>{armUntil=0;if(modal==='levelup')pickOpt(0);else if(modal==='adv'&&advPick.length)advPick[0]();else if(modal==='petpick'&&petPick.length)petPick[0]();else if(modal==='bless'&&blessPick.length)blessPick[0]();else if(modal==='pick'&&pickFns.length)pickFns[0]();}"
OVER = """()=>{const sc=[...document.querySelectorAll('.screen')].find(s=>!s.hidden);const bad=[];
 if(document.documentElement.scrollWidth>innerWidth+1)bad.push('page '+document.documentElement.scrollWidth);
 if(sc){for(const el of sc.querySelectorAll('*')){if(el.offsetParent===null)continue;const r=el.getBoundingClientRect();
  if(r.width>0&&(r.right>innerWidth+1||r.left<-1))bad.push((el.id||el.className||el.tagName)+' '+Math.round(r.left)+'~'+Math.round(r.right));}}
 return {screen:sc&&sc.id,bad:bad.slice(0,5)};}"""
with sync_playwright() as p:
    br = p.chromium.launch()
    for mob in (True, False):
        tag = 'phone' if mob else 'pc'
        ctx = br.new_context(viewport={'width': 390, 'height': 844} if mob else {'width': 1280, 'height': 720},
                             device_scale_factor=2 if mob else 1, is_mobile=mob, has_touch=mob)
        ctx.route('**/fonts.g*/**', lambda r: r.abort())
        pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + str(pathlib.Path(game).resolve())); pg.wait_for_timeout(500)
        cdp = ctx.new_cdp_session(pg) if mob else None
        def press(sel):
            """화면의 버튼을 사람처럼 한 번 누른다(휴대폰 탭, PC 클릭)"""
            b = pg.locator(sel).bounding_box()
            if not b: return False
            x, y = b['x'] + b['width'] / 2, b['y'] + b['height'] / 2
            if mob: pg.touchscreen.tap(x, y)
            else: pg.mouse.click(x, y)
            return True
        def shot(name):
            pg.screenshot(path=str(out / f'{name}_{tag}.png'))
            o = pg.evaluate(OVER); ok(not o['bad'], f"{tag} {name}: 가로 넘침 {o}")
        def scene_through(maxn=12):
            """장면 창을 「다음」으로 끝까지 넘긴다. 넘긴 쪽 수"""
            n = 0
            for _ in range(maxn):
                if pg.evaluate("()=>modal") != 'scene': break
                pg.wait_for_timeout(650); press('#sceneNext'); n += 1; pg.wait_for_timeout(150)
            return n
        # 1) 본편 설화 흔적 (세 번째 조각)
        pg.evaluate("()=>{meta.tale.frag.woochi=2;meta.tale.done={};saveMeta();newGame('seonbi','gilil',0,'normal');G.queue.length=0;G.traceId='woochi';spawnTrace();G.P.iframe=1e9;G.P.hp=G.P.maxHp=1e7;}")
        pg.wait_for_timeout(300)
        st = pg.evaluate("()=>({tr:!!G.trace,id:G.trace&&G.trace.id})")
        ok(st['tr'] and st['id'] == 'woochi', f"{tag}: 금빛 흔적이 생겨야 함 ({st})")
        pg.evaluate("()=>{G.P.x=G.trace.x;G.P.y=G.trace.y;G.enemies.length=0;}")
        for _ in range(40):
            if pg.evaluate("()=>modal") == 'scene': break
            pg.evaluate("()=>{if(G.trace){G.P.x=G.trace.x;G.P.y=G.trace.y;}G.enemies.length=0;}"); pg.wait_for_timeout(150)
        st = pg.evaluate("()=>({modal,frag:meta.tale.frag.woochi,eye:$('#sceneEye').textContent,foot:$('#sceneFoot').textContent,ach:$('#ach').textContent})")
        ok(st['modal'] == 'scene' and st['frag'] == 3, f"{tag}: 흔적 조사 뒤 장면 창, 조각 3 ({st})")
        ok('3/3' in st['eye'], f"{tag}: 장면 눈썹에 「설화 조각 3/3」 ({st['eye']})")
        ok('열렸다' in st['foot'], f"{tag}: 장면 끝에 「열렸다」 ({st['foot']})")
        ok('설화 출정 열림' in st['ach'], f"{tag}: 과업 알림 자리에 「설화 출정 열림」 ({st['ach']})")
        pg.wait_for_timeout(400); shot('trace_scene')
        ok(scene_through() == 1 and pg.evaluate("()=>modal") is None, f"{tag}: 조각 장면은 「다음」 한 번에 닫혀야 함")
        pg.evaluate("()=>{endGame(false);}")
        for _ in range(40):
            if pg.evaluate("()=>modal") == 'over': break
            pg.wait_for_timeout(100)
        # 2) 설화 목록 세 모양
        pg.evaluate("()=>{meta.tale.frag={woochi:3,jiha:1,bari:3};meta.tale.done={bari:{best:221,n:1}};saveMeta();show('title');selChar='seonbi';openPrep();}")
        pg.wait_for_timeout(300)
        pg.locator('#modeChips button', has_text='설화 출정').click(); pg.wait_for_timeout(300)
        st = pg.evaluate("""()=>({w:!$('#tale-woochi').disabled,j:$('#tale-jiha').disabled,b:$('#tale-bari').textContent,
            j2:$('#tale-jiha').textContent,diff:$('#panDiff').hidden,curse:$('#panCurse').hidden})""")
        ok(st['w'] and st['j'] and '완주' in st['b'] and '1/3' in st['j2'] and st['diff'] and st['curse'],
           f"{tag}: 설화 목록 (열림·잠김 1/3·완주, 난이도·액운 숨김) ({st})")
        shot('tale_list')
        # 3) 전우치전 한 판
        pg.locator('#tale-woochi').click(); pg.wait_for_timeout(200); press('#goBtn'); pg.wait_for_timeout(500)
        st = pg.evaluate("()=>({modal,cid:G.cid,lvl:G.P.lvl,tier:G.P.tier,mode:G.mode})")
        ok(st['modal'] == 'scene' and st['cid'] == 'seonbi' and st['lvl'] == 12 and st['tier'] == 1 and st['mode'] == 'tale', f"{tag}: 설화 시작 ({st})")
        shot('tale_intro'); scene_through()
        pg.evaluate("()=>{G.P.hp=G.P.maxHp=1e7;G.P.iframe=1e9;}")
        seen = []
        for act in range(3):
            pg.evaluate("()=>{G.tale.force=true;G.st=Math.max(G.st,90);}")
            for _ in range(80):
                if pg.evaluate("()=>!!G.boss&&!modal"): break
                pg.evaluate(PICK); pg.wait_for_timeout(100)
            if act == 1: shot('tale_act2')
            pg.evaluate("()=>{if(G.boss)kill(G.boss);}")
            for _ in range(60):
                m = pg.evaluate("()=>modal")
                if m == 'scene': break
                if m: pg.evaluate(PICK)
                pg.wait_for_timeout(100)
            seen.append(pg.evaluate("()=>$('#sceneEye').textContent"))
            if act == 2: shot('tale_end')
            scene_through()
            pg.evaluate("()=>{G.tale.force=false;}")
        for _ in range(40):
            if pg.evaluate("()=>modal") == 'over': break
            pg.wait_for_timeout(100)
        st = pg.evaluate("()=>({modal,done:meta.tale.done.woochi,skin:meta.tale.skin.seonbi,title:$('#overTitle').textContent})")
        ok(st['modal'] == 'over' and st['done'] and st['done']['n'] == 1 and st['skin'] == 'jjok', f"{tag}: 완주 → 결과 화면·기록·빛깔 ({st}, 장면 {seen})")
        ok('2막' in seen[0] and '3막' in seen[1] and '끝맺음' in seen[2], f"{tag}: 막 사이 장면 순서 ({seen})")
        shot('tale_over')
        # 4) 본편 결말: 한 번에 한 쪽
        pg.evaluate("()=>{meta.ending={seen:false,epi:[]};newGame('seonbi','gilil',0,'normal');G.queue.length=0;openEnding(()=>{window.__endDone=(window.__endDone||0)+1;});}")
        pg.wait_for_timeout(650); shot('ending1')
        idx = []
        for k in range(5):
            if k == 2 and not mob:
                pg.keyboard.press('Enter')
            elif k == 2 and mob:
                # 5) 이동 손가락을 누른 채 두 번째 손가락으로 탭
                T = lambda typ, pts: cdp.send('Input.dispatchTouchEvent', {'type': typ, 'touchPoints': pts})
                b = pg.locator('#sceneNext').bounding_box(); x2, y2 = b['x'] + b['width'] / 2, b['y'] + b['height'] / 2
                T('touchStart', [tp(60, 780, 1)]); pg.wait_for_timeout(40)
                T('touchStart', [tp(60, 780, 1), tp(x2, y2, 2)]); pg.wait_for_timeout(60); T('touchEnd', [tp(x2, y2, 2)])
                pg.wait_for_timeout(60); T('touchEnd', [tp(60, 780, 1)])
            else:
                press('#sceneNext')
            pg.wait_for_timeout(300)
            idx.append(pg.evaluate("()=>modal==='scene'?sceneI:-1"))
            if k == 3: shot('ending_epi')
            pg.wait_for_timeout(400)
        st = pg.evaluate("()=>({done:window.__endDone||0,seen:meta.ending.seen,epi:meta.ending.epi})")
        ok(idx == [1, 2, 3, 4, -1] and st['done'] == 1, f"{tag}: 결말 다섯 쪽이 한 번에 한 쪽씩 ({idx}, {st})")
        ok(st['seen'] and st['epi'] == ['seonbi'], f"{tag}: 결말 본 기록 ({st})")
        # 6) 설화록
        pg.evaluate("()=>{endGame(false);}")
        for _ in range(40):
            if pg.evaluate("()=>modal") == 'over': break
            pg.wait_for_timeout(100)
        pg.evaluate("()=>{openCodex('title');}"); pg.wait_for_timeout(300)
        pg.locator('#tabTale').click(); pg.wait_for_timeout(300)
        txt = pg.evaluate("()=>$('#codexBody').textContent")
        ok('전우치전' in txt and '바리공주' in txt and '한국민족문화대백과사전' in txt, f"{tag}: 설화록 내용 ({txt[:120]})")
        shot('codex_tale')
        ok(not errs, f"{tag} 페이지 오류: {errs}")
        ctx.close()
    br.close()
print('\n'.join('FAIL ' + f for f in fails) if fails else 'PASS tale_flow')
sys.exit(1 if fails else 0)
