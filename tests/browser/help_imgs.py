"""도움말 「처음이라면」 그림 시험 (v17.3, 실제 브라우저)
사용: python3 tests/browser/help_imgs.py [게임.html] [캡처 폴더]
 - 「처음이라면」의 칸마다 그림이 하나 이상 있고, 그림은 모두 제대로 그려짐(가로·세로 1 이상)
 - 그림이 15개 이상 · 휴대폰(390)·PC에서 가로 넘침 0 · 페이지 오류 0
 - 다른 탭으로 갔다 와도 같음
"""
import sys, pathlib
from playwright.sync_api import sync_playwright
game = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'index.html').resolve()
out = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else '/tmp/help_imgs'); out.mkdir(parents=True, exist_ok=True)
fails = []
def ok(c, m):
    if not c: fails.append(m)
CHECK = """async()=>{const body=document.querySelector('#help');const imgs=[...body.querySelectorAll('.hcard img')];
 await Promise.all(imgs.map(i=>i.complete?0:new Promise(r=>{i.onload=i.onerror=r;})));
 const cards=[...body.querySelectorAll('.hcard')];const bad=imgs.filter(i=>!(i.naturalWidth>0&&i.naturalHeight>0)).length;
 const noimg=cards.filter(c=>!c.querySelector('img')).map(c=>c.querySelector('h3').textContent);
 const over=[];for(const el of body.querySelectorAll('*')){const r=el.getBoundingClientRect();if(el.offsetParent&&r.width>0&&(r.right>innerWidth+1||r.left<-1))over.push(el.tagName+'.'+el.className);}
 return {n:imgs.length,bad,noimg,over:over.slice(0,5),page:document.documentElement.scrollWidth>innerWidth+1};}"""
with sync_playwright() as p:
    br = p.chromium.launch()
    for mob in (True, False):
        tag = 'phone' if mob else 'pc'
        ctx = br.new_context(viewport={'width': 390, 'height': 844} if mob else {'width': 1280, 'height': 800}, device_scale_factor=2 if mob else 1, is_mobile=mob, has_touch=mob)
        ctx.route('**/fonts.g*/**', lambda r: r.abort()); pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + str(game)); pg.wait_for_timeout(500)
        pg.evaluate("()=>{openHelp('title');}"); pg.wait_for_timeout(400)
        st = pg.evaluate(CHECK)
        ok(st['n'] >= 15, f"{tag}: 그림 15개 이상 (지금 {st['n']})")
        ok(st['bad'] == 0, f"{tag}: 깨진 그림 {st['bad']}개")
        ok(not st['noimg'], f"{tag}: 그림 없는 칸 {st['noimg']}")
        ok(not st['over'] and not st['page'], f"{tag}: 가로 넘침 {st['over']} page={st['page']}")
        pg.screenshot(path=str(out / f'help_{tag}.png'), full_page=False)
        pg.evaluate("()=>{const s=document.querySelector('#help');s.scrollTop=0;}")
        h = pg.evaluate("()=>document.querySelector('#help').scrollHeight")
        for i, y in enumerate(range(0, h, 700 if mob else 760)):
            pg.evaluate(f"()=>{{document.querySelector('#help').scrollTop={y};}}"); pg.wait_for_timeout(100); pg.screenshot(path=str(out / f'help_{tag}_{i}.png'))
        pg.evaluate("()=>{helpTab='weapon';renderHelp();helpTab='basic';renderHelp();}"); pg.wait_for_timeout(200)
        st2 = pg.evaluate(CHECK); ok(st2['n'] == st['n'] and st2['bad'] == 0, f"{tag}: 탭을 오가도 같음 ({st2})")
        ok(not errs, f"{tag} 페이지 오류 {errs}"); ctx.close()
    br.close()
print('\n'.join('FAIL ' + f for f in fails) if fails else 'PASS help_imgs')
sys.exit(1 if fails else 0)
