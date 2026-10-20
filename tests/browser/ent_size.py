"""캐릭터·요괴 크기 화면 시험 (v17.1, 실제 브라우저)
사용: python3 tests/browser/ent_size.py [게임.html] [비교할 옛 판.html] [캡처 폴더]
 1) 기본 크기는 옛 판(v17.0)과 픽셀까지 같다(같은 씨앗·같은 장면)
 2) PC 1920×1080·1366×768·휴대폰에서 기본·2배 캡처(전투+보스+펫, 어둠, 제목) — 직접 확인용
 3) 플레이어 그림의 도트 한 칸 크기(화면 픽셀): 2배는 모두 2S
    (1.5배는 화면 배율이 홀수면 칸이 섞여 2026-10-20 결정으로 뺌)
 5) 설정의 「캐릭터·요괴 크기」는 기본·2배 둘
 4) 페이지 오류 0
"""
import sys, pathlib, json, base64, io
from playwright.sync_api import sync_playwright
from PIL import Image
game = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'index.html').resolve()
old = pathlib.Path(sys.argv[2]).resolve() if len(sys.argv) > 2 and sys.argv[2] != '-' else None
out = pathlib.Path(sys.argv[3] if len(sys.argv) > 3 else '/tmp/ent_size'); out.mkdir(parents=True, exist_ok=True)
fails = []; report = {}
def ok(c, m):
    if not c: fails.append(m)
SEED = "(()=>{let s=777;Math.random=()=>{s=(s*1103515245+12345)%2147483648;return s/2147483648;};})();"
SCENE = """(k)=>{meta.set.ent=k;entOff=false;meta.set.nums=false;meta.set.perf='high';applyPerf();resize();
 newGame('mudang','gilil',0,'normal');G.queue.length=0;show(null);for(let i=0;i<2;i++)nextStage();
 G.P.hp=G.P.maxHp=1e7;G.P.iframe=0;grantTier&&G.P.tier===0&&0;
 const ids=Object.keys(EN).filter(id=>EN[id].st===G.stage+1&&EN[id].c==='n');
 for(let i=0;i<10;i++){const a=i/10*6.283;spawnEnemy(ids[i%ids.length],G.P.x+Math.cos(a)*(50+i*6),G.P.y+Math.sin(a)*(34+i*4));}
 G.st=STAGE_T+1;G.midDone=true;spawnBoss(STAGES[G.stage].boss,false);G.boss.x=G.P.x+70;G.boss.y=G.P.y-20;
 G.pet={type:'tiger',x:G.P.x-24,y:G.P.y+6,vx:0,ph:0,lv:1,white:0,cd:0,t:0};
 for(const e of G.enemies){e.spd=0;}G.time=12.34;modal='freeze';G.shake=0;G.flash=null;
 document.querySelector('#toast').innerHTML='';document.querySelector('#ach').innerHTML='';return true;}"""
SNAP = "()=>{render();return cvs.toDataURL('image/png');}"
def img(durl): return Image.open(io.BytesIO(base64.b64decode(durl.split(',')[1]))).convert('RGB')
with sync_playwright() as p:
    br = p.chromium.launch()
    def open_page(path, w, h, mob):
        ctx = br.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, is_mobile=mob, has_touch=mob)
        ctx.route('**/fonts.g*/**', lambda r: r.abort()); pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e))); pg.add_init_script(SEED)
        pg.goto('file://' + str(path)); pg.wait_for_timeout(400); return ctx, pg, errs
    # 1) 기본 = 옛 판
    if old:
        shots = {}
        for name, path in (('old', old), ('new', game)):
            ctx, pg, errs = open_page(path, 1280, 720, False)
            pg.evaluate("()=>{cancelAnimationFrame&&0;}")
            pg.evaluate(SCENE, 1); shots[name] = img(pg.evaluate(SNAP)); ok(not errs, f"{name} 오류 {errs}"); ctx.close()
        a, b2 = shots['old'], shots['new']
        from PIL import ImageChops
        dm = ImageChops.difference(a, b2).convert('L').point(lambda v: 255 if v else 0)
        diff = dm.histogram()[255]
        report['기본=옛 판 다른 픽셀'] = diff
        ok(diff == 0, f"기본 크기 화면이 옛 판과 다름: {diff}픽셀")
        a.save(out / 'base_old.png'); b2.save(out / 'base_new.png')
    # 2)·3)
    for tag, w, h, mob in (('pc1920', 1920, 1080, False), ('pc1366', 1366, 768, False), ('phone', 390, 844, True)):
        for k in (1, 2):
            ctx, pg, errs = open_page(game, w, h, mob)
            pg.evaluate(SCENE, k); im = img(pg.evaluate(SNAP)); im.save(out / f'{tag}_x{k}.png')
            st = pg.evaluate("()=>({S,W,H,hd:hdOn(),bw:buf.width,px:Math.round((G.P.x-RCX)*S),py:Math.round((G.P.y-RCY)*S),pw:charSpr(playerLook()).w,ph:charSpr(playerLook()).hgt})")
            # 플레이어 그림 영역에서 가로로 같은 색이 이어지는 길이(도트 한 칸 크기) 모으기
            kk = k if st['hd'] else 1
            x0 = st['px'] - int(st['pw'] * kk * st['S'] / 2); x1 = st['px'] + int(st['pw'] * kk * st['S'] / 2)
            y0 = st['py'] - int(st['ph'] * kk * st['S']); y1 = st['py'] - int(st['S'] * 2)
            runs = {}
            for y in range(max(0, y0 + 2), min(im.height, y1), max(1, st['S'])):
                row = [im.getpixel((x, y)) for x in range(max(0, x0), min(im.width, x1))]
                i = 0
                while i < len(row):
                    j = i
                    while j < len(row) and row[j] == row[i]: j += 1
                    if 0 < i and j < len(row): runs[j - i] = runs.get(j - i, 0) + 1   # 양 끝은 잘린 칸이라 뺌
                    i = j
            unit = st['S'] * kk
            okset = {int(unit), int(unit) + (0 if unit == int(unit) else 1)}
            bad = {L: n for L, n in runs.items() if all(L % u for u in okset) and not any(L == a + b for a in okset for b in okset)}
            report[f'{tag} ×{k}'] = {'S': st['S'], '보이는 넓이': f"{st['W']}x{st['H']}", '그리기 판': st['bw'], '2배정밀': st['hd'], '도트 칸(화면px)': sorted(okset), '칸 길이 분포': dict(sorted(runs.items())[:8]), '어긋난 길이': bad}
            tot = sum(runs.values()); nb = sum(bad.values())
            if k == 2: ok(tot > 20 and nb <= tot * 0.05, f"{tag} ×2: 도트 칸이 고르지 않음 {bad} / {tot}")   # 무기·펫이 겹친 칸 몇 개는 봐줌
            if k > 1: ok(st['hd'] and st['bw'] == st['W'] * 2, f"{tag} ×{k}: 2배 정밀이 켜져야 함 {st}")
            # 어둠·제목 화면
            if k == 2:
                pg.evaluate("()=>{G.dark=3;}"); img(pg.evaluate(SNAP)).save(out / f'{tag}_x{k}_dark.png')
                pg.evaluate("()=>{endGame(false);}"); pg.wait_for_timeout(200)
                pg.evaluate("()=>{G=null;show('title');}"); pg.wait_for_timeout(300); pg.screenshot(path=str(out / f'{tag}_x{k}_title.png'))
            if k == 1:
                opts = pg.evaluate("()=>[...document.querySelectorAll('#setEnt option')].map(o=>o.value)")
                ok(opts == ['1', '2'], f"{tag}: 크기 고르기는 기본·2배 ({opts})")
            ok(not errs, f"{tag} ×{k} 페이지 오류: {errs}")
            ctx.close()
    br.close()
print(json.dumps(report, ensure_ascii=False, indent=1))
print('\n'.join('FAIL ' + f for f in fails) if fails else 'PASS ent_size_browser')
sys.exit(1 if fails else 0)
