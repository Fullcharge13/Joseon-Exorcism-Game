// v19.3 점괘 패 세 장(사용자 결정 A): 출정 전 0~3장, 같은 패 두 번 안 됨, 효과 모두 적용, 다시 하기도 같은 패, 옛 기록(패 한 장 글자) 그대로
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
const all=Object.keys(CARDS);for(const id of all)if(!meta.unl.includes('card:'+id))meta.unl.push('card:'+id);
ok(typeof CARD_MAX==='number'&&CARD_MAX===3,'CARD_MAX = 3');
// ① 세 장의 효과가 모두 능력치에 들어감 (길일 경험치 +0.2 · 역마살 이동 +0.25 · 홍수 범위 +0.25)
newGame('seonbi',null,0,'normal');const b0={xp:G.base.xpGain,spd:G.base.spd,area:G.base.area,eCnt:G.mods.eCnt};
newGame('seonbi',['gilil','yeokma','hongsu'],0,'normal');
ok(Math.abs(G.base.xpGain-b0.xp-0.2)<1e-9&&Math.abs(G.base.spd-b0.spd-0.25)<1e-9&&Math.abs(G.base.area-b0.area-0.25)<1e-9&&Math.abs(G.mods.eCnt-b0.eCnt*1.15)<1e-9,
 '세 장 효과 모두: '+JSON.stringify({xp:G.base.xpGain-b0.xp,spd:G.base.spd-b0.spd,area:G.base.area-b0.area}));
ok(Array.isArray(G.cards)&&(G.cards||[]).join()==='gilil,yeokma,hongsu','G.cards '+JSON.stringify(G.cards));
// ② 네 장·같은 패 두 번·없는 패는 걸러짐
newGame('seonbi',['gilil','gilil','yeokma','hongsu','baekhosal','없는패'],0,'normal');ok((G.cards||[]).join()==='gilil,yeokma,hongsu','넷째·중복·없는 패 거름: '+JSON.stringify(G.cards));
newGame('seonbi','yeokma',0,'normal');ok((G.cards||[]).join()==='yeokma','한 장 글자로 넘겨도 됨');
// ③ 준비 화면: 세 장까지 켜짐, 다시 누르면 꺼짐, 넷째는 눌리지 않음, 패 없음은 모두 풂, 뽑기는 한 장 더함
// (화면 단추는 tests/browser/cards_three.py에서 — 이 가짜 화면은 단추를 만들지 않음. 여기서는 단추가 부르는 함수를 본다)
selChar='seonbi';prep.mode='normal';prep.cards=[];openPrep();
const tg=id=>prepCardToggle(id);tg('gilil');tg('yeokma');tg('hongsu');
ok(prep.cards.join()==='gilil,yeokma,hongsu','세 장 고름 '+JSON.stringify(prep.cards));
ok(!prepCardOk('baekhosal')&&prepCardOk('gilil'),'세 장이면 다른 패는 꺼짐, 고른 패는 눌림');
tg('baekhosal');ok(prep.cards.length===3&&!prep.cards.includes('baekhosal'),'넷째 안 들어감');
ok(/3\s*\/\s*3/.test(prepCardHead()),'제목에 3/3: '+prepCardHead());
ok(!prepRandOk(),'세 장이면 뽑기 꺼짐');
tg('yeokma');ok(prep.cards.join()==='gilil,hongsu','다시 누르면 꺼짐 '+JSON.stringify(prep.cards));
prepCardRand();ok(prep.cards.length===3&&new Set(prep.cards).size===3&&prep.cards[0]==='gilil','뽑기는 안 고른 패 한 장을 더함 '+JSON.stringify(prep.cards));
prepCardClear();ok(prep.cards.length===0,'패 없음 → 모두 풂');
meta.unl=meta.unl.filter(k=>k!=='card:cheonsal');prep.cards=['cheonsal','gilil'];openPrep();ok(prep.cards.join()==='gilil','잠긴 패는 준비 화면을 열 때 빠짐 '+JSON.stringify(prep.cards));meta.unl.push('card:cheonsal');
// ④ 출정·다시 하기가 같은 세 장
prep.cards=['dohwa','samjae','cheonsal'];begin();ok((G.cards||[]).join()==='dohwa,samjae,cheonsal','출정 시작에 세 장');
$('#againBtn').onclick();ok((G.cards||[]).join()==='dohwa,samjae,cheonsal','다시 하기도 같은 세 장 '+JSON.stringify(G.cards));
// ⑤ 기록: 새 기록은 세 장, 옛 기록(card:'gilil' 글자)도 기록 화면·상태창 오류 없음
const r=snapRun(false);ok(JSON.stringify(r.card)==='["dohwa","samjae","cheonsal"]','기록에 세 장 '+JSON.stringify(r.card));
ok(typeof cardNames==='function'&&cardNames('gilil')==='길일'&&cardNames(['gilil','yeokma'])==='길일·역마살'&&cardNames(null)==='','cardNames 옛 글자·새 배열');
let err='';try{show(null);G.queue.length=0;stTab='p';renderStatus();stTab='w';const h=$('#stBody')?$('#stBody').innerHTML:document.body.innerHTML;ok(h.includes('도화살')&&h.includes('삼재')&&h.includes('천살'),'상태창에 세 장');}catch(e){err+=e.message;}
try{const old=Object.assign(snapRun(true),{card:'gilil'});meta.arch.runs.unshift(old);const R=meta.arch.rec;R.kills={v:1e9,r:old};meta.arch.cls=meta.arch.cls||{};meta.arch.cls.seonbi={n:1,wins:1,kills:1,best:old,src:{}};openArch('title');for(const t of ['rec','log','cls']){archTab=t;renderArch();}const ah=$('#archBody').innerHTML;ok(/패 길일/.test(ah),'옛 기록(글자 한 장)이 기록관 「가장 좋았던 조합」에 「패 길일」로 보임');show(null);}catch(e){err+=' 옛 기록 '+e.message;}
ok(!err,'오류 없음 '+err);
if(fails.length){console.log('FAIL cards_three\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS cards_three');
