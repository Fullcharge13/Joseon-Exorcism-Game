// 안내인 말과 끝난 뒤 남는 그림이 막 넘김·샛길 꺼짐에서 남지 않는다(v17.5)
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
newGame('seonbi','gilil',0,'normal');G.queue.length=0;show(null);god();G.mods.eCnt=0;G.enemies=[];G.shrineN=2;G.anomAt=undefined;G.dkAt=undefined;
spawnShrine();const s=G.shrine;G.P.x=s.x;G.P.y=s.y;step(3.7,{pick:false});ok(G.gfx.length>0,'성황당 끝난 뒤 남는 그림 있음');
G.queue.length=0;show(null);   // 축복 창이 떠 있으면 게임 시간이 멈추므로 닫고 기다린다
step(2,{pick:false});ok(G.gfx.length===0,'1.5초 뒤 사라짐 ('+G.gfx.length+')');
spawnAnom();const a=G.anom;G.P.x=a.x;G.P.y=a.y;step(2.7,{pick:false});G.queue.length=0;show(null);ok(G.gfx.length>0,'괴이 끝난 뒤 남는 그림');
nextStage();ok(G.gfx.length===0,'막 넘기면 비움');
spawnDk();G.dk.life=0.05;step(0.2,{pick:false});ok(!G.dk&&G.gfx.length===0,'샛길 꺼지면 남는 것 없음');
ok(typeof BUBQ!=='undefined'&&Array.isArray(BUBQ),'말풍선 대기열');
if(fails.length){console.log('FAIL guide_clear ('+fails.length+')\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS guide_clear');
