// 보스를 쓰러뜨린 뒤 다음 창(설화: 막 사이 장면, 본편: 도깨비 보물·갈림길·상자·주막)이 열리는 바로 그 순간에
// 보물 상자를 주우면, 상자 창이 그 창을 덮어써 흐름이 끊기면 안 된다(자동 플레이 400판 중 1판 멈춤의 재현).
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
meta.tale.frag={woochi:3,jiha:3,bari:3};
taleStart('woochi');step(1);god();G.tale.force=true;step(TALE_T+1);killBoss();
ok(G.bossDone&&G.clearT>0,'보스 처치 뒤 잠깐 기다리는 중');
G.clearT=0.001;dropItem('chest',G.P.x,G.P.y);
step(1/60,{pick:false});
ok(modal==='scene','막 사이 장면이 열려 있어야 함 (지금 '+modal+')');
for(let i=0;i<20&&modal;i++){armUntil=0;if(modal==='scene')sceneNext();else if(modal==='chest')$('#chestOk').onclick();else autoPick();}
step(1,{pick:true});
ok(G.tale.act===1&&!G.bossDone,'상자가 있어도 2막으로 넘어감 (act '+G.tale.act+', bossDone '+G.bossDone+')');
// 본편도 같은 자리
newGame('seonbi','gilil',0,'normal');step(1);god();G.queue.length=0;
G.st=STAGE_T+1;G.midDone=true;spawnBoss(curStg().boss,false);killBoss();
G.clearT=0.001;dropItem('chest',G.P.x,G.P.y);step(1/60,{pick:false});
let sawTav=false;for(let i=0;i<40&&!sawTav;i++){if(modal==='tavern'){sawTav=true;break;}if(modal){armUntil=0;if(modal==='chest')$('#chestOk').onclick();else autoPick();}else step(1/60,{pick:false});}
ok(sawTav,'본편: 보스 보상 상자 → 주막까지 이어짐(주운 상자가 보상 흐름을 끊지 않음)');
if(fails.length){console.log('FAIL clear_overlap\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS clear_overlap');
