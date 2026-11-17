// v21.2.1 기록관 빈 기록: 쓰러진 뒤 「다시 하기」를 누르고 바로 나가면 2초·처치 0 기록이 쌓였다(사용자 저장 2026-11-17, 백정·무당 각 1건)
// → 10초 안에 처치 0으로 끝난 판은 기록관에 넣지 않는다(결과 화면용 요약은 그대로 돌려줌)
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
{
newGame('baekjeong',[],0,'normal','normal',3);G.queue.length=0;show(null);
const n0=meta.arch.runs.length,c0=(meta.arch.cls.baekjeong||{n:0}).n;
G.time=2;G.kills=0;const r=archiveRun(false);
ok(meta.arch.runs.length===n0,'2초·처치 0 판은 기록하지 않음 ('+(meta.arch.runs.length-n0)+')');
ok((meta.arch.cls.baekjeong||{n:0}).n===c0,'퇴마사별 횟수도 그대로');
ok(r&&r.cid==='baekjeong'&&r.where,'결과 화면용 요약은 돌려줌');
newGame('baekjeong',[],0,'normal','normal',3);G.time=40;G.kills=12;archiveRun(false);
ok(meta.arch.runs.length===n0+1,'보통 판은 기록');
newGame('baekjeong',[],0,'normal','normal',3);G.time=5;G.kills=3;archiveRun(false);
ok(meta.arch.runs.length===n0+2,'짧아도 처치가 있으면 기록');
}
if(fails.length){console.log('FAIL arch_empty\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS arch_empty');
