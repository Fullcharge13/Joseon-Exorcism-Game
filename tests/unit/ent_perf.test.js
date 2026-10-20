// 느려짐 감지(v17.1): 캐릭터·요괴 크기가 켜져 있으면 먼저 그것을 기본으로 돌리고(저장값은 그대로), 그래도 느리면 절약 모드.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
const toasts=[];const t0=toast;toast=(m,...a)=>{toasts.push(m);return t0(m,...a);};
function slow(sec){for(let i=0;i<sec*25;i++)perfWatch(40);}
meta.set.perf='auto';autoLow=false;applyPerf();meta.set.ent=2;entOff=false;resize();
newGame('seonbi','gilil',0,'normal');G.queue.length=0;show(null);
ok(hdOn(),'처음엔 2배 정밀 켜짐');
slow(4);
ok(entOff===true&&!hdOn()&&LOW===false,'느려지면 먼저 크기를 끔, 절약 모드는 아직 아님 (entOff '+entOff+', LOW '+LOW+')');
ok(meta.set.ent===2,'저장된 선택은 그대로');ok(buf.width===W,'그리기 판도 기본 크기로');
ok(toasts.some(m=>/캐릭터·요괴 크기를 기본으로/.test(m)),'알림 ('+toasts.join(' / ')+')');
slow(4);ok(LOW===true,'그래도 느리면 절약 모드');
// 꺼진 뒤 설정을 열면: 고르기는 「기본」으로 보이고, 까닭이 적혀 있어 「2배」를 다시 고를 수 있다
{autoLow=false;applyPerf();meta.set.ent=2;entOff=true;resize();openSettings('pause');
 ok($('#setEnt').value==='1','꺼진 상태면 설정에 기본으로 보임 (지금 '+$('#setEnt').value+')');
 ok(/느려져/.test($('#setEntNote').textContent),'까닭 안내 ('+$('#setEntNote').textContent+')');
 const se=$('#setEnt');se.value='2';se.onchange({target:se});ok(!entOff&&hdOn(),'2배를 다시 고르면 다시 켜짐');
 openSettings('pause');ok($('#setEnt').value==='2'&&!/느려져/.test($('#setEntNote').textContent),'켜진 상태면 2배·기본 안내');show(null);}
// 크기가 기본이면 지금처럼 바로 절약 모드
meta.set.ent=1;entOff=false;autoLow=false;applyPerf();resize();toasts.length=0;slow(4);ok(LOW===true&&!toasts.some(m=>/캐릭터/.test(m)),'크기가 기본이면 바로 절약 모드(예전 그대로)');
// 설정을 다시 고르면 풀림
entOff=true;openSettings('title');const se=$('#setEnt');se.value='2';se.onchange({target:se});ok(entOff===false,'설정을 다시 고르면 다시 켬');
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS ent_perf');
if(fails.length)process.exitCode=1;
