// 『바리공주』 2막 우물 셋은 서로 떨어져 있어야 한다(가까우면 다음 우물에 서도 앞 우물이 차오르고, 순서가 보이지 않음).
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
meta.tale.frag={woochi:3,jiha:3,bari:3};let minD=1e9;
for(let n=0;n<200;n++){G=null;taleStart('bari');const R0={};TALE_RULE_FN.wells3.start(R0);const w=R0.wells;
 for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)minD=Math.min(minD,Math.hypot(w[i].x-w[j].x,w[i].y-w[j].y));}
ok(minD>=70,'우물 사이 거리는 늘 70 이상 (200번 중 가장 가까운 '+minD.toFixed(1)+')');
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS tale_wells_apart');
if(fails.length)process.exitCode=1;
