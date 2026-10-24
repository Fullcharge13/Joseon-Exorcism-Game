"""멈춤 기록 화면 시험 (v17.3, 실제 브라우저)
사용: python3 tests/browser/diag_ui.py [게임.html] [캡처 폴더]
 - 처음엔 「기록 없음」, 복사·지우기 꺼짐
 - 그리기 오류가 이어져도 1건만 기록 → 설정에 「기록 1건」, 글상자에 오류 문구·버전·기기 정보
 - 「복사」를 누르면 클립보드에 같은 글 · 「지우기」로 0건 · 다시 켜도 지운 상태
 - 휴대폰·PC에서 가로 넘침 0, 페이지 오류 0(일부러 낸 오류 말고)
"""
import sys, pathlib
from playwright.sync_api import sync_playwright
game = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'index.html').resolve()
out = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else '/tmp/diag_ui'); out.mkdir(parents=True, exist_ok=True)
fails = []
def ok(c, m):
    if not c: fails.append(m)
with sync_playwright() as p:
    br = p.chromium.launch()
    for mob in (True, False):
        tag = 'phone' if mob else 'pc'
        ctx = br.new_context(viewport={'width': 390, 'height': 844} if mob else {'width': 1280, 'height': 800}, is_mobile=mob, has_touch=mob)
        ctx.grant_permissions(['clipboard-read', 'clipboard-write'])
        ctx.route('**/fonts.g*/**', lambda r: r.abort()); pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + str(game)); pg.wait_for_timeout(500)
        pg.evaluate("()=>{openSettings('title');}"); pg.wait_for_timeout(200)
        st = pg.evaluate("()=>({n:$('#diagN').textContent,cp:$('#diagCopy').disabled,cl:$('#diagClear').disabled,tx:$('#diagText').value})")
        ok(st['n'] == '기록 없음' and st['cp'] and st['cl'] and st['tx'] == '', f"{tag}: 처음 상태 {st}")
        pg.evaluate("()=>{show('title');newGame('seonbi','gilil',0,'normal');G.queue.length=0;show(null);window.__r=render;render=function(){throw new Error('화면 시험 오류');};}")
        pg.wait_for_timeout(800)
        pg.evaluate("()=>{render=window.__r;endGame(false);}"); pg.wait_for_timeout(900)
        pg.evaluate("()=>{openSettings('title');}"); pg.wait_for_timeout(200)
        st = pg.evaluate("()=>({n:$('#diagN').textContent,tx:$('#diagText').value,cp:$('#diagCopy').disabled,ver:GAME_VER})")
        ok(st['n'] == '기록 1건' and '화면 시험 오류' in st['tx'] and st['ver'] in st['tx'] and '기기:' in st['tx'] and not st['cp'], f"{tag}: 오류 1건 기록 {st['n']} / {st['tx'][:120]}")
        pg.locator('#diagText').scroll_into_view_if_needed(); pg.screenshot(path=str(out / f'settings_{tag}.png'))
        pg.locator('#diagCopy').click(); pg.wait_for_timeout(300)
        clip = pg.evaluate("()=>navigator.clipboard.readText()")
        ok(clip == st['tx'], f"{tag}: 복사한 글이 기록과 같아야 함 ({len(clip)} / {len(st['tx'])})")
        ok(pg.evaluate("()=>$('#diagN').textContent") == '복사했습니다', f"{tag}: 복사 안내")
        over = pg.evaluate("()=>{const sc=document.querySelector('#settings');const o=[];for(const el of sc.querySelectorAll('*')){const r=el.getBoundingClientRect();if(el.offsetParent&&r.width>0&&(r.right>innerWidth+1||r.left<-1))o.push(el.tagName+'#'+el.id);}return o;}")
        ok(not over, f"{tag}: 가로 넘침 {over}")
        pg.locator('#diagClear').click(); pg.wait_for_timeout(200)
        ok(pg.evaluate("()=>DIAG.log.length") == 0 and pg.evaluate("()=>$('#diagCopy').disabled"), f"{tag}: 지우기")
        pg.reload(); pg.wait_for_timeout(500)
        ok(pg.evaluate("()=>DIAG.log.length") == 0, f"{tag}: 다시 켜도 지운 상태 ({pg.evaluate('()=>JSON.stringify(DIAG.log)')[:200]})")
        real = [e for e in errs if '화면 시험 오류' not in e]
        ok(not real, f"{tag}: 페이지 오류 {real}"); ctx.close()
    br.close()
print('\n'.join('FAIL ' + f for f in fails) if fails else 'PASS diag_ui')
sys.exit(1 if fails else 0)
