// 「돌아갈 길 없음」(회복 아이템 없음)·「곡식 나누기」(떡 대신 곡식) 막에서는 어떤 길로도 떡이 떨어지지 않는다.
// (요괴 처치 말고도 신내림 「조왕」, 쌍신 「복록」의 엽전 줍기에서 떡이 나오던 문제)
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
meta.tale.frag={woochi:3,jiha:3,bari:3};
const tteok=()=>G.items.filter(i=>i.k==='tteok').length;
taleStart('jiha');step(1);god();G.tale.force=true;
for(let a=0;a<2;a++){step(TALE_T+1);killBoss();for(let i=0;i<300&&G.tale.act===a;i++){if(modal==='scene'){armUntil=0;sceneNext();}else step(1/60);}}
ok(G.tale.act===2&&TALES.jiha.acts[2].rule==='noHeal','지하국대적 3막(돌아갈 길 없음)');
G.items.length=0;
callGod=()=>'jowang';G.call=100;castCall();
ok(tteok()===0,'신내림 조왕이 떡을 떨어뜨리지 않음 (떡 '+tteok()+')');
dropItem('tteok',G.P.x+40,G.P.y);ok(tteok()===0,'어떤 길로든 떡 없음');
// 곡식 막
taleStart('woochi');step(1);god();G.tale.force=true;step(TALE_T+1);killBoss();
for(let i=0;i<300&&G.tale.act===0;i++){if(modal==='scene'){armUntil=0;sceneNext();}else step(1/60);}
ok(G.tale.act===1&&TALES.woochi.acts[1].rule==='grain','전우치전 2막(곡식 나누기)');
G.items.length=0;G.call=100;castCall();ok(tteok()===0,'곡식 막에서도 조왕 떡 없음 (떡 '+tteok()+')');
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS tale_noheal_leak');
if(fails.length)process.exitCode=1;
