// v22.0 2부 흐름: 10막 평정 → 판의금부사 전갈 → 「북으로」 → 11막 … 15막 평정 → 끝없는 밤 창. 끝없는 밤 2바퀴째는 10막 뒤 창 없이 11막.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
{
ok(typeof ACT1_END!=='undefined'&&ACT1_END===9&&ACT2_END===14,'ACT1_END 9 · ACT2_END 14');
ok(STAGES.length===15,'막 15개 (지금 '+STAGES.length+')');
ok(typeof openNorth==='function'&&typeof stageEnd==='function','openNorth·stageEnd 있음');
if(typeof stageEnd==='function'&&typeof openNorth==='function'){
meta.ending={seen:true,epi:['seonbi','mudang','jangsu','gisaeng','sangin','uiwon','baekjeong','dosa']};
meta.north={seen:false,clear:0};meta.ap={seen:true}; // v22.1 견습 장면은 본 것으로(고르기 창만)
let lastCards=[];const _op=openPick;openPick=(e,t,l,c)=>{lastCards=c;return _op(e,t,l,c);};
const cardNames=()=>lastCards.map(c=>c.name);
const clearAt=s=>{G.stage=s;G.bossDone=true;G.clearT=undefined;openTavern();};
newGame('seonbi','gilil',0,'normal','normal');show(null);
ok(stageEnd()===9,'고르기 전 stageEnd 9');
G.P.hp=G.P.maxHp*0.5;const hp0=G.P.hp;
clearAt(9);
// 처음이면 전갈 장면이 먼저
let n=0;while(modal==='scene'&&n<8){armUntil=0;sceneNext();n++;}
ok(n>=2,'처음 전갈은 이야기 장면 2쪽 이상 (지금 '+n+')');
ok(modal==='pick'&&/판의금부사/.test($('#pickTitle').textContent+$('#pickLede').textContent),'전갈 선택 창 (지금 '+modal+' '+$('#pickTitle').textContent+')');
ok(pickFns.length===3,'선택지 셋 (지금 '+pickFns.length+')');
ok(meta.stats.clears>=1,'10막 평정은 그대로 기록');
const names=cardNames();
ok(/북으로/.test(names[0]),'첫 선택지 북으로 ('+names.join('/')+')');
pickFns[0]();
ok(modal==='pick'&&cardNames().length===2,'v22.1 북으로 뒤 견습 고르기');pickFns[0]();ok(modal==='pick'&&cardNames().length===3,'v22.2 견습 무기 고르기');pickFns[0]();
ok(G.north===true&&G.rs.north===1,'북으로 → G.north');
ok(stageEnd()===14,'고른 뒤 stageEnd 14');
ok(modal==='tavern','북으로 뒤 주막 (지금 '+modal+')');
ok(G.P.hp>=hp0,'체력·무기 그대로(줄지 않음)');
show(null);nextStage();ok(G.stage===10&&curStg().sub==='제11막','11막으로 (지금 '+G.stage+')');
// 두 번째 판: 전갈은 짧게(장면 없이 바로 선택)
newGame('seonbi','gilil',0,'normal','normal');show(null);clearAt(9);
ok(modal==='pick','두 번째부터는 장면 없이 선택 창 (지금 '+modal+')');
// 15막 평정 → 끝없는 밤 창
pickFns[0]();if(modal==='pick')pickFns[0]();if(modal==='pick')pickFns[0]();show(null);
clearAt(14);
let m=0;while(modal==='scene'&&m<8){armUntil=0;sceneNext();m++;}
ok(m===3&&meta.north.ending===true,'15막 처음 평정 → 2부 결말 3쪽 (지금 '+m+')');
ok(modal==='pick'&&/끝없는 밤/.test(cardNames().join('/')),'15막 뒤 끝없는 밤 창 (지금 '+modal+')');
ok(G.rs.northClear===1&&meta.north.clear>=1,'15막 평정 기록');
pickFns[0]();ok(G.loop===1&&G.stage===0&&G.north,'끝없는 밤 2바퀴째 1막, 북으로 유지');
show(null);clearAt(9);
ok(modal==='tavern','2바퀴째 10막 뒤엔 창 없이 주막 (지금 '+modal+')');
// 새벽을 고르면 지금처럼 끝
newGame('seonbi','gilil',0,'normal','normal');show(null);clearAt(9);
const dawnI=cardNames().findIndex(t=>/새벽/.test(t));
ok(dawnI>=0,'새벽 선택지 있음');pickFns[dawnI]();ok(G.over,'새벽 → 출정 마침');
// 원정은 그대로 10라운드
newGame('jangsu','gilil',0,'normal','rush');ok(stageEnd()===9,'원정 stageEnd 9');
}
}
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS act2_flow');
if(fails.length)process.exitCode=1;
