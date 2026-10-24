// 모든 진화가 실제로 가능한가: 무기를 쓸 수 있는 퇴마사라면 그 무기의 진화 짝 보패도 레벨업 카드로 받을 수 있어야 한다.
// (v17.4에서 발견: 상인 전용 「됫박」의 짝 「명태」가 무당 전용이라 만석 곳간을 아무도 만들 수 없었다)
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
let n=0;
for(const wid in WD){const d=WD[wid];if(!d.evo||d.type!=='w')continue;
 for(const cid in CHARS){newGame(cid,null,0,'normal');if(!jobOk(d))continue;n++;
  ok(jobOk(PD[d.evo]),`${CHARS[cid].name||cid}: ${d.name}의 짝 ${PD[d.evo].name}을(를) 받을 수 없음 → ${d.evoName} 불가`);}}
ok(n>=32,'검사한 무기×퇴마사 수 '+n);
if(fails.length){console.log('FAIL evo_reach\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS evo_reach ('+n+' 조합)');
