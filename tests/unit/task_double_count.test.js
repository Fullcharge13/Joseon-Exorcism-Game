// 버그 재현: 출정이 끝날 때 이번 출정의 수치가 두 번 더해져 과업이 일찍 달성되면 안 된다.
// 요괴 600마리만 잡았는데 「손에 익은 퇴마」(1,000마리)가 이뤄지면 실패.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
meta.stats={};meta.done=[];
newGame('seonbi','gilil',0,'normal');
G.rs.kills=600;G.kills=600;
endGame(false);
ok(meta.stats.kills===600,'저장된 처치 수는 600이어야 함 (지금: '+meta.stats.kills+')');
ok(!meta.done.includes('k1000'),'600마리로 「손에 익은 퇴마」(1,000)가 이뤄지면 안 됨');
ok(meta.done.includes('k100'),'「첫 퇴마」(100)는 이뤄져야 함');
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS task_double_count');
if(fails.length)process.exitCode=1;
