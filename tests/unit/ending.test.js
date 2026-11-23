// 본편 결말: 제10막을 처음 평정하면 공통 4장 → 그 퇴마사 맺음말 → 끝없는 밤 창. 같은 퇴마사는 다시 안 나오고, 다른 퇴마사는 맺음말만.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
meta.ending={seen:false,epi:[]};meta.north={seen:true,clear:0,ending:false}; // v22.0: 결말 뒤 판의금부사 전갈(이미 본 것으로 두어 장면 수를 그대로 셈)
function clear10(cid,mode='normal'){newGame(cid,'gilil',0,'normal',mode);show(null);G.stage=ACT1_END;G.bossDone=true;G.clearT=undefined;openTavern();}
const pages=()=>{const l=[];for(let i=0;i<8&&modal==='scene';i++){l.push($('#sceneTitle').textContent+'|'+$('#sceneText').textContent);armUntil=0;sceneNext();}return l;};
clear10('seonbi');ok(modal==='scene','처음 평정하면 결말 장면');
let L=pages();ok(L.length===5,'공통 4장 + 맺음말 1쪽 (지금 '+L.length+')');
ok(L[0].includes(ENDING.common[0].t)&&L[3].includes(ENDING.common[3].t),'공통 장면 순서');
ok(L[4].includes(ENDING.epi.seonbi),'선비 맺음말');
ok(modal==='pick'&&/판의금부사/.test($('#pickTitle').textContent),'결말 뒤 판의금부사 전갈 창(v22.0) (지금 '+modal+')');
ok(meta.ending.seen===true&&meta.ending.epi.includes('seonbi'),'결말 기록 저장');
show(null);clear10('seonbi');ok(modal==='pick','같은 퇴마사로 다시 평정 → 바로 전갈 창');
show(null);clear10('mudang');L=pages();ok(L.length===1&&L[0].includes(ENDING.epi.mudang),'다른 퇴마사 → 맺음말 한 쪽만');
ok(modal==='pick','맺음말 뒤 전갈 창');
// 퇴마 원정·설화 출정에서는 나오지 않음
meta.ending={seen:false,epi:[]};
newGame('jangsu','gilil',0,'normal','rush');ok(typeof rushReward==='function','원정 모드 있음');
meta.tale.frag.jiha=3;taleStart('jiha');step(3);god();G.tale.force=true;for(let a=0;a<3;a++){step(TALE_T+2);killBoss();for(let i=0;i<300&&modal!=='scene';i++)step(1/60,{pick:false});armUntil=0;sceneNext();step(1);}
ok(G.over&&meta.ending.seen===false,'설화 출정 완주로는 결말이 열리지 않음');
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS ending');
if(fails.length)process.exitCode=1;
