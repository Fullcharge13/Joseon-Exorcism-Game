// 안내인을 더해도 동작은 그대로(v17.5): 머무는 시간·판정 거리·보상 흐름
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
const setup=()=>{newGame('seonbi','gilil',0,'normal');G.queue.length=0;show(null);god();G.mods.eCnt=0;G.enemies=[];G.shrineN=2;G.anomAt=undefined;G.dkAt=undefined;};
// 성황당: 22 밖이면 진행 없음, 안에서 3.5초 → 축복 대기
setup();spawnShrine();let s=G.shrine;ok(s.need===3.5,'성황당 필요 시간 3.5 ('+s.need+')');G.P.x=s.x-23;G.P.y=s.y;step(1,{pick:false});ok(G.shrine&&G.shrine.prog===0,'성황당 거리 23에서는 진행 없음');
G.P.x=s.x-21;step(3.4,{pick:false});ok(G.shrine,'3.4초엔 아직');step(0.2,{pick:false});ok(!G.shrine&&G.queue.includes('bless')||modal==='bless','3.5초 지나 축복');
// 괴이: 24 안에서 2.5초 → 조사(괴이록 기록)
setup();spawnAnom();const a=G.anom;ok(a.need===2.5,'괴이 필요 시간 2.5');const id=a.id,before=(meta.anom||{})[id]||0;G.P.x=a.x-25;G.P.y=a.y;step(1,{pick:false});ok(G.anom&&G.anom.prog===0,'괴이 거리 25에서는 진행 없음');
G.P.x=a.x-23;step(2.6,{pick:false});ok(!G.anom&&((meta.anom||{})[id]||0)===before+1,'괴이 2.5초 지나 조사');
// 샛길: 16 안에서 1.2초 → 도깨비 창, 45초 뒤 꺼짐
setup();spawnDk();const d=G.dk;ok(d.need===1.2&&d.life===45,'샛길 1.2초·45초');G.P.x=d.x-17;G.P.y=d.y;step(1.5,{pick:false});ok(G.dk&&G.dk.prog===0,'샛길 거리 17에서는 진행 없음');
G.P.x=d.x-15;step(1.3,{pick:false});ok(!G.dk&&modal==='pick','1.2초 지나 도깨비 창 ('+modal+')');
if(fails.length){console.log('FAIL guide_same ('+fails.length+')\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS guide_same');
