// 안내인을 더해도 동작은 그대로(v17.5): 머무는 시간·판정 거리·보상 흐름
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
const hold=(o,dx,sec)=>{for(let i=0;i<Math.round(sec*60);i++){G.P.x=o.x+dx;G.P.y=o.y;if(modal)return;__t+=1000/60;frame(__t);}};   // 장애물이 퇴마사를 밀어도 그 거리를 지킨다(시험 흔들림 수정)
const free=(x,y)=>{const o={x,y,r:G.P.r};pushOut(o,G.P.r);return Math.hypot(o.x-x,o.y-y)<0.01;};
const clear=o=>{for(let i=0;i<200;i++){if([0,-15,-17,-21,-23,-25].every(dx=>free(o.x+dx,o.y)))return true;o.x+=37;o.y+=11;}return false;};   // 장소와 퇴마사 자리에 장애물이 없게 옮김
const setup=()=>{newGame('seonbi','gilil',0,'normal');G.queue.length=0;show(null);god();G.mods.eCnt=0;G.enemies=[];G.shrineN=2;G.anomAt=undefined;G.dkAt=undefined;};
// 성황당: 22 밖이면 진행 없음, 안에서 3.5초 → 축복 대기
setup();spawnShrine();let s=G.shrine;ok(clear(s),'빈 자리');ok(s.need===3.5,'성황당 필요 시간 3.5 ('+s.need+')');hold(s,-23,1);ok(G.shrine&&G.shrine.prog===0,'성황당 거리 23에서는 진행 없음');
hold(s,-21,3.4);ok(G.shrine,'3.4초엔 아직');hold(s,-21,0.2);ok(!G.shrine&&G.queue.includes('bless')||modal==='bless','3.5초 지나 축복');
// 괴이: 24 안에서 2.5초 → 조사(괴이록 기록)
setup();spawnAnom();const a=G.anom;ok(clear(a),'빈 자리');ok(a.need===2.5,'괴이 필요 시간 2.5');const id=a.id,before=(meta.anom||{})[id]||0;hold(a,-25,1);ok(G.anom&&G.anom.prog===0,'괴이 거리 25에서는 진행 없음');
hold(a,-23,2.6);ok(!G.anom&&((meta.anom||{})[id]||0)===before+1,'괴이 2.5초 지나 조사');
// 샛길: 16 안에서 1.2초 → 도깨비 창, 45초 뒤 꺼짐
setup();spawnDk();const d=G.dk;ok(clear(d),'빈 자리');ok(d.need===1.2&&d.life===45,'샛길 1.2초·45초');hold(d,-17,1.5);ok(G.dk&&G.dk.prog===0,'샛길 거리 17에서는 진행 없음');
hold(d,-15,1.3);ok(!G.dk&&modal==='pick','1.2초 지나 도깨비 창 ('+modal+')');
if(fails.length){console.log('FAIL guide_same ('+fails.length+')\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS guide_same');
