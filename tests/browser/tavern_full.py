"""주막: 효과 없는 물건 잠금 (v21.1, 실제 브라우저)
사용: python3 tests/browser/tavern_full.py [게임.html] [캡처 폴더]
 - 다 키운 진화 무기(진화 Lv 0)가 있으면 보부상 보따리를 살 수 있고, 사면 진화 Lv 1 · 엽전이 빠짐
 - 모두 끝까지 키우면 보따리는 상자처럼 한계 돌파 +1(알림 「○○ 한계 돌파」) · 인장 칸·축복이 다 차면 인장 장인·정화수 잠김·까닭 · 눌러도 엽전 그대로
 - 무기가 없고 보패만 다 차면 보따리도 잠김·까닭
 - 국밥·막걸리·산통·부적·물리기는 그대로 살 수 있음
 - 휴대폰·PC에서 가로 넘침 0, 페이지 오류 0
"""
import sys, pathlib
from playwright.sync_api import sync_playwright
game = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'index.html').resolve()
out = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else '/tmp/tavern_full'); out.mkdir(parents=True, exist_ok=True)
fails = []
def ok(c, m):
    if not c: fails.append(m)
SETUP = """(mode)=>{const full=mode==='full';newGame('seonbi',[],0,'normal');G.queue.length=0;show(null);G.coins=2000;
 const WW=Object.keys(WD).filter(k=>WD[k].type==='w'&&!WD[k].fuse&&!WD[k].job&&WD[k].evo);
 G.weapons.length=0;for(const k in G.passives)delete G.passives[k];
 let n=0;for(const id in PD){if(PD[id].job||n>=P_SLOTS)continue;G.passives[id]=PD[id].max;n++;}
 for(const id of WW.slice(0,mode==='empty'?0:full?4:1)){const w={id,lv:WD[id].max,evo:true,ev2:full?EV2_MAX:0,t:0.2,on:false,pos:[],seals:[]};
   if(full)w.seals=Array(sealSlots(w)).fill(Object.keys(SEALS).find(k=>sealOk(w,k)));G.weapons.push(w);}
 if(full){for(const id in BLESS)G.bless[id]=3;for(const d in DUO)G.duo[d]=1;}
 refreshSlots();openTavern();}"""
STATE = """()=>{const r={};for(const id of ['gukbap','makgeolli','santong','bujeok','mul','bottari','jeonghwa','injang']){const b=document.getElementById('tav-'+id);
 const it=b.closest('.it');r[id]={dis:b.disabled,no:(it.querySelector('.tav-no')||{}).textContent||''};}return r;}"""
with sync_playwright() as p:
    br = p.chromium.launch()
    for mob in (True, False):
        tag = 'phone' if mob else 'pc'
        ctx = br.new_context(viewport={'width': 390, 'height': 844} if mob else {'width': 1280, 'height': 800}, is_mobile=mob, has_touch=mob)
        ctx.route('**/fonts.g*/**', lambda r: r.abort()); pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + str(game)); pg.wait_for_timeout(500)
        # 1) 진화 Lv를 올릴 수 있는 상태 → 보따리 살 수 있음
        pg.evaluate(SETUP, 'grow'); pg.wait_for_timeout(200)
        s = pg.evaluate(STATE)
        ok(not s['bottari']['dis'] and not s['bottari']['no'], f"{tag}: 진화 Lv 0이면 보따리 열림 {s['bottari']}")
        c0 = pg.evaluate("()=>G.coins"); pg.click('#tav-bottari'); pg.wait_for_timeout(200)
        ev, c1, md = pg.evaluate("()=>[G.weapons[0].ev2||0,G.coins,modal]")
        ok(ev == 1 and c1 < c0 and md == 'tavern', f"{tag}: 보따리로 진화 Lv 1 · 엽전 {c0}→{c1} · 창 {md}")
        # 2) 모두 다 참 → 세 물건 잠김·까닭 문구
        pg.evaluate(SETUP, 'full'); pg.wait_for_timeout(200)
        s = pg.evaluate(STATE)
        ok(not s['bottari']['dis'] and not s['bottari']['no'], f"{tag}: 다 키운 무기가 있으면 보따리 열림 {s['bottari']}")
        lb0, c0 = pg.evaluate("()=>[G.weapons.reduce((a,w)=>a+(w.lb||0),0),G.coins]"); pg.click('#tav-bottari'); pg.wait_for_timeout(200)
        lb1, c1, tt = pg.evaluate("()=>[G.weapons.reduce((a,w)=>a+(w.lb||0),0),G.coins,document.getElementById('toast').textContent]")
        ok(lb1 == lb0 + 1 and c1 < c0, f"{tag}: 보따리로 한계 돌파 {lb0}→{lb1} · 엽전 {c0}→{c1}")
        ok('한계 돌파' in tt and '돌파 강화' not in tt, f"{tag}: 알림 문구 「{tt}」")
        s = pg.evaluate(STATE)
        for id in ('injang', 'jeonghwa'):
            ok(s[id]['dis'] and len(s[id]['no']) > 0, f"{tag}: {id} 잠김·까닭 {s[id]}")
        for id in ('gukbap', 'makgeolli', 'santong', 'bujeok', 'mul'):
            ok(not s[id]['dis'] and not s[id]['no'], f"{tag}: {id} 열림 {s[id]}")
        c0 = pg.evaluate("()=>G.coins")
        pg.evaluate("()=>{for(const id of ['injang','jeonghwa'])document.getElementById('tav-'+id).click();}"); pg.wait_for_timeout(200)
        c1, md = pg.evaluate("()=>[G.coins,modal]")
        ok(c1 == c0 and md == 'tavern', f"{tag}: 잠긴 단추를 눌러도 엽전 {c0}→{c1} · 창 {md}")
        # 3) 무기 없음 + 보패 다 참 → 보따리 잠김
        pg.evaluate(SETUP, 'empty'); pg.wait_for_timeout(200)
        s = pg.evaluate(STATE); c0 = pg.evaluate("()=>G.coins")
        ok(s['bottari']['dis'] and len(s['bottari']['no']) > 0, f"{tag}: 키울 것 없으면 보따리 잠김·까닭 {s['bottari']}")
        pg.evaluate("()=>document.getElementById('tav-bottari').click()"); pg.wait_for_timeout(150)
        ok(pg.evaluate("()=>G.coins") == c0, f"{tag}: 잠긴 보따리를 눌러도 엽전 그대로")
        pg.evaluate(SETUP, 'full'); pg.wait_for_timeout(200)
        ov = pg.evaluate("()=>document.documentElement.scrollWidth-innerWidth")
        ok(ov <= 0, f"{tag}: 가로 넘침 {ov}px")
        pg.evaluate("()=>{const e=document.getElementById('tav-injang');e.scrollIntoView({block:'center'});}"); pg.wait_for_timeout(150)
        pg.screenshot(path=str(out / f'tavern_full_{tag}.png'))
        ok(not errs, f"{tag}: 페이지 오류 {errs[:2]}")
        ctx.close()
    br.close()
if fails:
    print('FAIL tavern_full\n  ' + '\n  '.join(fails)); sys.exit(1)
print('PASS tavern_full (보따리 진화 Lv·한계 돌파 · 효과 없음 잠금·까닭 · 엽전 그대로 · 휴대폰·PC)')
