"""저장 파일 · 홈 화면에 추가 시험 (실제 브라우저, v20.7)
사용: python3 tests/browser/save_file.py [게임.html]
 1) 설정 → 「저장 내보내기」를 누르면 조선퇴마록-저장-날짜.txt가 내려받아지고, 내용이 저장 코드와 같다
 2) 엽전을 바꾼 뒤 「저장 가져오기」로 그 파일을 고르면 확인 창 → 다시 시작 → 내보낼 때의 진행(엽전)으로 돌아오고 「불러오기 전으로」가 보인다
 3) 저장 파일이 아닌 파일은 안내만 뜨고 진행은 그대로
 4) 휴대폰(390×844)·PC에서 설정 화면이 옆으로 넘치지 않음 · 아이폰 사파리 흉내에서 「추가 방법」이 세 단계 안내를 펼침 · 화면 오류 0
"""
import sys, pathlib, tempfile, os
from playwright.sync_api import sync_playwright
game = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'index.html').resolve()
IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
fails = []
def ok(c, m):
    if not c: fails.append(m)
tmp = tempfile.mkdtemp()
with sync_playwright() as p:
    br = p.chromium.launch()
    for mob in (True, False):
        tag = '휴대폰' if mob else 'PC'
        ctx = br.new_context(viewport={'width': 390, 'height': 844} if mob else {'width': 1280, 'height': 800}, is_mobile=mob, has_touch=mob,
                             accept_downloads=True, user_agent=IOS if mob else None)
        ctx.route('**/fonts.g*/**', lambda r: r.abort()); pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('dialog', lambda d: d.accept())
        pg.goto('file://' + str(game)); pg.wait_for_timeout(500)
        pg.evaluate("()=>{meta.coins=777;saveMeta();openSettings('title');}"); pg.wait_for_timeout(300)
        with pg.expect_download() as dl:
            pg.click('#saveFileOut')
        d = dl.value; path = os.path.join(tmp, f'{tag}.txt'); d.save_as(path)
        txt = open(path, encoding='utf-8').read()
        ok(d.suggested_filename.startswith('조선퇴마록-저장-') and d.suggested_filename.endswith('.txt'), f'{tag}: 파일 이름 {d.suggested_filename}')
        ok(txt.strip() == pg.evaluate('()=>saveCode()'), f'{tag}: 파일 내용 = 저장 코드')
        ok('내보냈습니다' in pg.inner_text('#saveFileN'), f'{tag}: 내보낸 안내 ({pg.inner_text("#saveFileN")})')
        # 넘침
        ov = pg.evaluate("()=>{const s=document.querySelector('#settings');return [s.scrollWidth,s.clientWidth,document.documentElement.scrollWidth,innerWidth]}")
        ok(ov[0] <= ov[1] + 1 and ov[2] <= ov[3] + 1, f'{tag}: 설정 화면 옆 넘침 {ov}')
        # 홈 화면 안내
        homeN = pg.inner_text('#a2hsN'); off = pg.inner_text('#offlineN')
        ok(off.strip() != '', f'{tag}: 오프라인 표시가 비어 있음')
        if mob:
            ok('사파리' in homeN and pg.is_visible('#a2hsBtn'), f'{tag}: 아이폰 사파리 안내·단추 ({homeN})')
            pg.click('#a2hsBtn'); pg.wait_for_timeout(150)
            ok(pg.is_visible('#a2hsSteps') and pg.locator('#a2hsSteps li').count() == 4, f'{tag}: 「추가 방법」이 안내를 펼침')
            pg.screenshot(path=os.path.join(tmp, 'set_mobile.png'), full_page=True)
        else:
            ok(pg.is_hidden('#a2hsBtn') and '메뉴' in homeN, f'{tag}: 설치 창이 없는 PC는 메뉴 안내 ({homeN})')
        # 엉뚱한 파일
        bad = os.path.join(tmp, 'bad.txt'); open(bad, 'w', encoding='utf-8').write('그냥 메모')
        pg.set_input_files('#saveFilePick', bad); pg.wait_for_timeout(300)
        ok('저장 파일이 아닙니다' in pg.inner_text('#saveFileN') and pg.evaluate('()=>meta.coins') == 777, f'{tag}: 엉뚱한 파일은 안내만 ({pg.inner_text("#saveFileN")})')
        # 엽전을 바꾼 뒤 가져오기 → 777로 돌아옴
        pg.evaluate("()=>{meta.coins=5;saveMeta();}")
        with pg.expect_navigation():
            pg.set_input_files('#saveFilePick', path)
        pg.wait_for_timeout(500)
        ok(pg.evaluate('()=>meta.coins') == 777, f'{tag}: 가져오면 내보낼 때 엽전 777 ({pg.evaluate("()=>meta.coins")})')
        pg.evaluate("()=>openSettings('title')"); pg.wait_for_timeout(200)
        ok(pg.is_visible('#saveCodeUndo'), f'{tag}: 가져온 뒤 「불러오기 전으로」가 보임')
        ok(pg.evaluate("()=>{const b=document.querySelector('#over #homeBtn');return !!b&&!b.hidden&&/본부/.test(b.textContent)}"), f'{tag}: 끝난 화면의 「본부로」 단추가 그대로')
        ok(not errs, f'{tag}: 화면 오류 {errs}')
        ctx.close()
    br.close()
if fails:
    print('FAIL save_file\n  ' + '\n  '.join(fails)); sys.exit(1)
print(f'PASS save_file (내보내기 → 가져오기 왕복 · 엉뚱한 파일 · 아이폰 사파리 안내 · 휴대폰·PC 넘침 0) · 캡처 {tmp}/set_mobile.png')
