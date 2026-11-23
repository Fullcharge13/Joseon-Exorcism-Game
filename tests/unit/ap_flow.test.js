// v22.1 견습 등장: 북으로 → (처음) 장면 2쪽 → 고르기(복돌 근접 / 연이 원거리) → 주막 → 11막. 북으로 안 간 판·원정엔 없음.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
{
ok(typeof AWD==='object'&&typeof APD==='object'&&typeof apTick==='function','견습 표·동작 있음');
if(typeof AWD==='object'){
let lastCards=[];const _op=openPick;openPick=(e,t,l,c)=>{lastCards=c;return _op(e,t,l,c);};
meta.ending={seen:true,epi:Object.keys(CHARS)};meta.north={seen:true,clear:0,ending:true};meta.ap={seen:false};
newGame('seonbi','gilil',0,'normal','normal');show(null);G.stage=ACT1_END;G.bossDone=true;openTavern();
ok(modal==='pick','전갈 창');pickFns[0]();
let n=0;while(modal==='scene'&&n<6){armUntil=0;sceneNext();n++;}
ok(n===2,'처음엔 견습 장면 2쪽 (지금 '+n+')');
ok(modal==='pick'&&lastCards.length===2&&/복돌/.test(lastCards[0].name)&&/연이/.test(lastCards[1].name),'고르기 창: 복돌 / 연이 ('+lastCards.map(c=>c.name).join('/')+')');
pickFns[0]();
ok(G.ap&&G.ap.kid==='boy'&&G.ap.w.id==='mokgeom'&&G.ap.w.lv===1&&!G.ap.p,'복돌: 목검 Lv1, 보패 없음');
ok(G.ap&&G.ap.hp===G.ap.maxHp&&G.ap.maxHp===160,'체력 160 가득(내구 조정 2)');
ok(modal==='tavern','고른 뒤 주막 (지금 '+modal+')');
ok(meta.ap.seen===true,'장면 본 것 기록');
show(null);nextStage();ok(G.stage===10&&G.ap&&!G.ap.hidden,'11막에 견습과 함께');
// 두 번째: 장면 없이 고르기, 연이
newGame('seonbi','gilil',0,'normal','normal');show(null);G.stage=ACT1_END;G.bossDone=true;openTavern();pickFns[0]();
ok(modal==='pick'&&lastCards.length===2,'두 번째는 장면 없이 고르기 (지금 '+modal+')');pickFns[1]();
ok(G.ap&&G.ap.kid==='girl'&&G.ap.w.id==='saechong','연이: 새총 Lv1');
// 없음
newGame('seonbi','gilil',0,'normal','normal');ok(!G.ap,'새 판엔 견습 없음');
newGame('jangsu','gilil',0,'normal','rush');ok(!G.ap,'원정엔 견습 없음');
// 옛 저장 기본값
ok(meta.ap&&typeof meta.ap.seen==='boolean','meta.ap 기본값');
}
}
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS ap_flow');
if(fails.length)process.exitCode=1;
