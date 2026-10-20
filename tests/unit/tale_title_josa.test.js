// 설화 완주 결과 제목의 조사: 받침이 있으면 「을」, 없으면 「를」 (『바리공주』를 끝맺었다)
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
meta.tale.frag={woochi:3,jiha:3,bari:3};
for(const [id,want] of [['bari','『바리공주』를 끝맺었다'],['woochi','『전우치전』을 끝맺었다']]){
 taleStart(id);step(1);god();G.tale.force=true;
 for(let a=0;a<3;a++){step(TALE_T+1);killBoss();for(let i=0;i<300&&!G.over;i++){if(modal==='scene'){armUntil=0;sceneNext();}else step(1/60);}}
 step(2,{pick:false});ok($('#overTitle').textContent.startsWith(want),id+': '+$('#overTitle').textContent);}
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS tale_title_josa');
if(fails.length)process.exitCode=1;
