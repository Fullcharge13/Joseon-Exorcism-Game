"""i18n 화면 시험이 함께 쓰는 장면 목록(i18n_ko_same.py · i18n_zh_flow.py)
INIT: 시계·난수·애니메이션 고정 + 캔버스 글 모으기 · RICH: 모두 열린 저장 · SNAP: 보이는 글 모으기 · SCEN: (이름, 여는 코드)"""
INIT = """(()=>{const T=1792800000000;const D=Date;class FD extends D{constructor(...a){super(...(a.length?a:[T]));}static now(){return T;}}window.Date=FD;window.requestAnimationFrame=()=>0;   /* 저절로 도는 장면을 멈춰 시계·HUD가 시험마다 같게 */
 let s=1;window.__seed=n=>{s=n;};Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;};
 window.__txt=[];const wrap=p=>{const f=p.fillText;p.fillText=function(x,...r){window.__txt.push(String(x));return f.call(this,x,...r);};};wrap(CanvasRenderingContext2D.prototype);})();"""
RICH = """()=>{meta.coins=5000;meta.unl=[...new Set([...(meta.unl||[]),...Object.keys(CHARS).map(c=>'char:'+c),...Object.keys(WD).filter(i=>WD[i].lock).map(i=>'w:'+i)])];
 meta.done=TASKS.filter((t,i)=>i%2===0).map(t=>t.id);meta.anom={};for(const a of ANOM.slice(0,6))meta.anom[a.id]=1;meta.hub.runs=12;meta.stats.dkIn=2;meta.hub.mak=3;
 for(const id in NPCS)meta.hub.aff[id]=2;meta.tale=meta.tale||{};meta.tale.frag={woochi:3,jiha:3,bari:1};meta.curseMax=3;saveMeta();}"""
SNAP = """(name)=>{const vis=[...document.querySelectorAll('.screen')].filter(s=>!s.hidden).map(s=>s.id);
 const pick=sel=>{const e=document.querySelector(sel);return e&&!e.hidden?e.innerText:'';};
 return {screens:vis,overlay:pick('#overlay'),hud:pick('#hud'),toast:pick('#toast')+pick('#task'),canvas:window.__txt.slice(0,80)};}"""
G0 = "newGame('seonbi','gilil',0,'normal');G.queue.length=0;show(null);G.P.hp=G.P.maxHp=1e7;"
SCEN = [
 ('title', "renderTitle();show('title');"), ('prep', "openPrep();"),
 *[(f'help_{k}', f"openHelp('title');helpTab='{k}';renderHelp();") for k in ['basic','class','pet','weapon','item','rule','foe','tip']],
 ('hub', "openHub();"), *[(f'codex_{k}', f"openCodex('title');codexTab='{k}';renderCodex();") for k in ['task','dogam','anom','tale']],
 ('arch', "openArch('title');"), ('arch_cls', "openArch('title');$('#tabCls').click();"), ('arch_log', "openArch('title');$('#tabLog').click();"),
 ('shop', "renderShop();show('shop');"), ('settings', "openSettings('title');"),
 ('game_hud', G0+"for(let i=0;i<90;i++)frame(100000+i*16);"),
 ('levelup', G0+"openLevel();"), ('chest', G0+"G.weapons[0].lv=5;openChest(2);"), ('tavern', G0+"openTavern();"), ('path', G0+"openPath();"),
 ('bless', G0+"openBless();"), ('adv', G0+"G.P.lvl=10;openAdv();"), ('pet', G0+"openPet();"), ('pause', G0+"openPause();"),
 ('status', G0+"openStatus();"), ('status_p', G0+"openStatus();$('#tabStP').click();"), ('status_s', G0+"openStatus();$('#tabStS').click();"),
 ('dk', G0+"openDk();"), ('temper', G0+"openTemper(()=>{});"), ('seal', G0+"openSeal();"), ('awk', G0+"G.P.lvl=54;G.P.tier=5;G.P.branch=0;openAwk();"),
 ('ult', G0+"G.P.lvl=74;G.P.tier=5;G.P.branch=0;openUlt();"), ('endless', G0+"openEndless();"),
 ('over_lose', G0+"G.time=300;G.kills=420;endGame(false);"), ('over_win', G0+"G.stage=9;G.time=1500;endGame(true);"),
 ('guide', G0+"const P=G.P;G.shrine={x:P.x-40,y:P.y-20,prog:0,need:3.5};guideSay('shrine',G.shrine,'appear');G.anom={id:'flip',x:P.x+40,y:P.y,prog:0,need:2.5,t:0};guideSay('anom',G.anom,'near');for(let i=0;i<3;i++)frame(100000+i*16);"),
 ('tale', "taleStart('woochi');"), ('rush', "newGame('seonbi','gilil',0,'normal','rush');"),
]
