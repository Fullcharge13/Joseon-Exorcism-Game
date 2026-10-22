// 입력 보호(프로젝트 규칙 0.3~0.6초): 고르기 창이 열린 뒤 0.3초 안의 누름은 무시하고, 0.6초 뒤에는 받는다.
// (4128f65에서 0.18초로 줄어 「골라 놓고 곧바로 다시 누르면 다음 창 카드가 저절로 골라지던」 문제의 재현 시험)
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
let fakeNow=1000;performance.now=()=>fakeNow;
for(const id of ['levelup','adv','petpick','pick','chest','bless','scene']){
 fakeNow=1000;show(id);
 fakeNow=1000+300;ok(!armed(),id+': 0.3초에는 아직 무시해야 함 (보호 '+(armUntil-1000)+'ms)');
 fakeNow=1000+600;ok(armed(),id+': 0.6초 뒤에는 받아야 함');}
show(null);
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS input_guard');
if(fails.length)process.exitCode=1;
