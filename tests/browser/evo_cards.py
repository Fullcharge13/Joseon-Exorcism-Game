"""진화 짝 카드 · 조합 시험장 브라우저 시험 (v17.4, Playwright)
사용: python3 tests/browser/evo_cards.py [게임.html] [모음그림폴더]
 1) 진화 무기 32종마다 레벨업 창에 카드 4장을 띄운다(상태: 짝 있음 보패 / 짝 없음 무기 / 진화 준비 / 진화 완료 보패).
    휴대폰(390×844)·PC(1280×800)에서 글자 넘침, 깨진 아이콘, 강조 테두리가 맞는지 검사한다.
 2) 휴대폰 화면을 8개씩 모아 모음 그림(contact sheet)을 만든다(눈으로 훑어보기용).
 3) ?combo 주소: 조합 시험장이 열리고, 「상자 진화」·「카드 보기」가 동작하고, 저장이 바뀌지 않는다. 일반 주소에는 시험장 단추가 없다.
"""
import sys, pathlib, io
from playwright.sync_api import sync_playwright
from PIL import Image
game = sys.argv[1] if len(sys.argv) > 1 else 'index.html'
out = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else 'tests/browser/out/evo_cards'); out.mkdir(parents=True, exist_ok=True)
url = 'file://' + str(pathlib.Path(game).resolve())
fails = []
def ok(c, m):
    if not c: fails.append(m)
SETUP = """(wid)=>{const it=labList().find(x=>x.wid===wid),d=WD[wid];newGame(it.cid,null,0,'normal');G.queue.length=0;
 const W=()=>G.weapons.find(w=>w.id===wid);const reset=()=>{G.weapons=[];G.passives={};addWeapon(wid);};
 reset();W().lv=3;const a=decorate({k:'pnew',id:it.pid});          // 짝 있음: 무기 LV3 보유, 보패 새 카드
 reset();W().lv=2;const b=decorate({k:'wup',id:wid});               // 짝 없음: 무기 강화, 보패 아직 없음
 reset();W().lv=d.max-1;G.passives[it.pid]=1;const c=decorate({k:'wup',id:wid});   // 진화 준비
 reset();W().lv=d.max;W().evo=true;G.passives[it.pid]=1;const e=decorate({k:'pup',id:it.pid});   // 진화 완료
 curOpts=[a,b,c,e];banMode=false;renderLevel();show('levelup');armUntil=0;
 return {want:[a.pair,b.pair,c.pair,e.pair],n:d.name,p:PD[it.pid].name};}"""
CHECK = """()=>{const r=[];const vw=innerWidth;for(const bt of document.querySelectorAll('#luCards .card')){const b=bt.getBoundingClientRect();
 const over=[...bt.querySelectorAll('*')].some(x=>{const q=x.getBoundingClientRect();return q.width>0&&(q.right>b.right+1||q.left<b.left-1);});
 const bad=[...bt.querySelectorAll('img')].some(i=>!i.complete||i.naturalWidth===0);
 r.push({pair:bt.classList.contains('pair'),over,bad,off:b.right>vw+1||b.left<-1,sw:bt.scrollWidth>bt.clientWidth+1});}return r;}"""
with sync_playwright() as p:
    br = p.chromium.launch()
    def page(mob, q=''):
        ctx = br.new_context(viewport={'width': 390, 'height': 844} if mob else {'width': 1280, 'height': 800},
                             device_scale_factor=2 if mob else 1, is_mobile=mob, has_touch=mob)
        ctx.route('**/fonts.g*/**', lambda r: r.abort()); pg = ctx.new_page()
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(url + q); pg.wait_for_timeout(400)
        return ctx, pg, errs
    for mob in (True, False):
        ctx, pg, errs = page(mob); tag = '휴대폰' if mob else 'PC'
        ok(pg.evaluate("()=>document.querySelector('#labBtn').hidden"), tag + ': 일반 주소에 조합 시험장 단추가 보임')
        wids = pg.evaluate("()=>labList().map(x=>x.wid)"); shots = []
        for wid in wids:
            info = pg.evaluate(SETUP, wid); pg.wait_for_timeout(620)   # 입력 보호(0.5초) 흐림이 걷힌 뒤
            res = pg.evaluate(CHECK); name = f"{tag} {info['n']}+{info['p']}"
            ok(len(res) == 4, name + ': 카드 4장')
            for i, c in enumerate(res):
                ok(c['pair'] == info['want'][i], f"{name} 카드{i+1} 강조 {c['pair']} (기대 {info['want'][i]})")
                ok(not c['over'] and not c['sw'] and not c['off'], f"{name} 카드{i+1} 넘침 {c}")
                ok(not c['bad'], f"{name} 카드{i+1} 아이콘 깨짐")
            ok([x['pair'] for x in res] == [True, False, True, False], f"{name} 강조 순서 {[x['pair'] for x in res]}")
            if mob: shots.append(Image.open(io.BytesIO(pg.locator('#levelup').screenshot())).convert('RGB'))
        if mob:
            for k in range(0, len(shots), 8):
                g = shots[k:k+8]; w = max(s.width for s in g) // 2; h = max(s.height for s in g) // 2
                sheet = Image.new('RGB', (w * 4, h * 2), (20, 16, 14))
                for j, s in enumerate(g): sheet.paste(s.resize((s.width // 2, s.height // 2)), ((j % 4) * w, (j // 4) * h))
                sheet.save(out / f'evo_cards_{k//8+1}.png')
        ok(not errs, tag + ' 페이지 오류 ' + str(errs[:3]))
        ctx.close()
    # 3) 조합 시험장
    for mob in (True, False):
        ctx, pg, errs = page(mob, '?combo'); tag = '시험장 ' + ('휴대폰' if mob else 'PC')
        before = pg.evaluate("()=>localStorage.getItem(SAVE_KEY)")
        ok(pg.evaluate("()=>modal") == 'lab', tag + ': ?combo로 열면 시험장 화면')
        rows = pg.locator('#labList .labrow'); ok(rows.count() == 32, tag + f': 목록 {rows.count()}줄')
        if mob: pg.screenshot(path=str(out / 'lab_phone.png'))
        ok(pg.evaluate("()=>{const l=document.querySelector('#labList');return [...l.querySelectorAll('.labrow')].every(r=>r.scrollWidth<=r.clientWidth+1)}"), tag + ': 목록 줄 넘침')
        for idx in (0, 16, 31):
            pg.evaluate("()=>openLab()"); pg.wait_for_timeout(150)
            r = pg.locator('#labList .labrow').nth(idx); r.scroll_into_view_if_needed()
            r.locator('button[data-m=evo]').click(); pg.wait_for_timeout(300)
            st = pg.evaluate("()=>({m:modal,wid:G.weapons[0].id,ev:G.weapons[0].evo,ch:G.items.some(i=>i.k==='chest')})")
            ok(st['m'] is None and st['ch'] and not st['ev'], tag + f' {idx}: 상자 앞에서 시작 {st}')
            pg.evaluate("()=>{const c=G.items.find(i=>i.k==='chest');G.P.x=c.x;G.P.y=c.y;}"); pg.wait_for_timeout(700)
            st = pg.evaluate("()=>({m:modal,ev:G.weapons[0].evo})")
            ok(st['m'] == 'chest' and st['ev'], tag + f' {idx}: 상자를 주우면 진화 {st}')
            if mob and idx == 0: pg.screenshot(path=str(out / 'lab_chest_phone.png'))
            pg.evaluate("()=>{armUntil=0;$('#chestOk').click();}"); pg.wait_for_timeout(100)
            pg.evaluate("()=>{goHome();openLab();}"); pg.wait_for_timeout(150)
            r = pg.locator('#labList .labrow').nth(idx); r.scroll_into_view_if_needed()
            r.locator('button[data-m=card]').click(); pg.wait_for_timeout(700)
            st = pg.evaluate("()=>({m:modal,pair:document.querySelectorAll('#luCards .card.pair').length})")
            ok(st['m'] == 'levelup' and st['pair'] >= 1, tag + f' {idx}: 카드 보기 {st}')
            if mob and idx == 0: pg.screenshot(path=str(out / 'lab_card_phone.png'))
            pg.locator('#opt0').click(); pg.wait_for_timeout(200)
            ok(pg.evaluate("()=>modal") is None, tag + f' {idx}: 카드를 고르면 게임으로')
            pg.evaluate("()=>goHome()")
        pg.evaluate("()=>{meta.coins=(meta.coins||0)+999;saveMeta();}")
        ok(pg.evaluate("()=>localStorage.getItem(SAVE_KEY)") == before, tag + ': 저장이 바뀜')
        ok(not errs, tag + ' 페이지 오류 ' + str(errs[:3]))
        ctx.close()
    br.close()
if fails: print(f'FAIL evo_cards ({len(fails)})\n  ' + '\n  '.join(fails[:20])); sys.exit(1)
print('PASS evo_cards (32 조합 × 4 상태 × 휴대폰·PC, 시험장)')
