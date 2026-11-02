"""점괘 패 세 장 화면 시험(v19.3, Playwright, PC 1280×720·휴대폰 390×844)
사용: python3 tests/browser/cards_three.py [게임.html]   캡처 → tests/browser/out/cards/
 출정 준비 화면에서 실제로 눌러 본다: 세 장 켜짐 · 제목 「점괘 패 3/3」 · 넷째 패와 「아무 패나 뽑기」 꺼짐 ·
 다시 누르면 꺼짐 · 뽑기로 한 장 더함 · 「패 없음」으로 모두 풂 · 세 장으로 출정하면 판에 세 장 · 가로 넘침 0 · 화면 오류 0"""
import sys, pathlib
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parents[2]
game = sys.argv[1] if len(sys.argv) > 1 else str(ROOT / 'index.html')
OUT = ROOT / 'tests' / 'browser' / 'out' / 'cards'; OUT.mkdir(parents=True, exist_ok=True)
fails = []; errs = []
OVER = "()=>{const o=[];for(const e of document.querySelectorAll('#prep *')){const r=e.getBoundingClientRect();if(r.width&&e.offsetParent!==null&&(r.right>innerWidth+1||r.left<-1))o.push(e.tagName+'.'+e.className);}return o.slice(0,5);}"
STATE = "()=>{const b=[...document.querySelectorAll('#paeList button')];return {on:b.filter(x=>x.getAttribute('aria-pressed')==='true').map(x=>x.querySelector('b').textContent),dis:b.filter(x=>x.disabled).length,n:b.length,head:document.querySelector('#paeHead').textContent,rand:document.querySelector('#paeRand').disabled,cards:prep.cards.slice()};}"
with sync_playwright() as p:
    br = p.chromium.launch()
    for vname, vopt in (('pc', dict(viewport={'width': 1280, 'height': 720})), ('phone', dict(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, device_scale_factor=2))):
        ctx = br.new_context(**vopt); ctx.add_init_script("window.requestAnimationFrame=()=>0;"); ctx.route('**/fonts.g*/**', lambda r: r.abort())
        pg = ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e))); pg.goto('file://' + str(pathlib.Path(game).resolve())); pg.wait_for_timeout(400)
        pg.evaluate("()=>{for(const id in CARDS)if(!meta.unl.includes('card:'+id))meta.unl.push('card:'+id);saveMeta();selChar='seonbi';prep.mode='normal';prep.cards=[];openPrep();}")
        pg.wait_for_timeout(200)
        btn = lambda name: pg.locator('#paeList button', has=pg.locator('b', has_text=name)).first
        for n in ('길일', '역마살', '홍수'):
            btn(n).scroll_into_view_if_needed(); btn(n).click()
        s = pg.evaluate(STATE)
        if s['on'] != ['길일', '역마살', '홍수']: fails.append(f'{vname} 세 장 켜짐 {s["on"]}')
        if '3/3' not in s['head'].replace(' ', ''): fails.append(f'{vname} 제목 {s["head"]}')
        if not s['rand']: fails.append(f'{vname} 세 장인데 뽑기 켜짐')
        if s['dis'] < s['n'] - 4: fails.append(f'{vname} 넷째 패가 꺼지지 않음 (꺼진 {s["dis"]}/{s["n"]})')
        btn('홍수').scroll_into_view_if_needed(); pg.screenshot(path=str(OUT / f'{vname}_three.png'), full_page=True)
        o = pg.evaluate(OVER)
        if o: fails.append(f'{vname} 넘침 {o}')
        btn('역마살').click(); s = pg.evaluate(STATE)
        if s['on'] != ['길일', '홍수'] or s['rand']: fails.append(f'{vname} 다시 누르면 꺼짐 {s["on"]} 뽑기 꺼짐={s["rand"]}')
        pg.locator('#paeRand').click(); s = pg.evaluate(STATE)
        if len(s['cards']) != 3 or len(set(s['cards'])) != 3: fails.append(f'{vname} 뽑기 한 장 더함 {s["cards"]}')
        pg.locator('#paeList button').first.click(); s = pg.evaluate(STATE)
        if s['cards'] or s['on'] != ['패 없음']: fails.append(f'{vname} 패 없음 {s["cards"]} {s["on"]}')
        for n in ('도화살', '삼재', '천살'): btn(n).click()
        r = pg.evaluate("()=>{begin();return G.cards.slice();}")
        if r != ['dohwa', 'samjae', 'cheonsal']: fails.append(f'{vname} 출정한 판의 패 {r}')
        ctx.close()
    br.close()
if errs: fails.append('화면 오류 ' + '; '.join(errs[:3]))
if fails: print(f'FAIL cards_three ({len(fails)})\n  ' + '\n  '.join(fails)); sys.exit(1)
print('PASS cards_three (세 장 · 3/3 · 넷째·뽑기 꺼짐 · 다시 누르면 꺼짐 · 뽑기 · 패 없음 · 출정 · PC·휴대폰 · 넘침 0 · 화면 오류 0)')
