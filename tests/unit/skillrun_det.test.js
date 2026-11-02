// v19.2 검토 지적: skillRun은 같은 씨앗이면 기기 빠르기와 상관없이 같은 피해(맞는 소리의 Math.random이 실제 시간에 따라 섞이지 않게)
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tier6_helpers.js
const pn=performance.now.bind(performance);const runAt=step=>{let t=0;performance.now=()=>(t+=step);try{return skillRun('bonggo',5,20).dmg;}finally{performance.now=pn;}};
const fast=runAt(1),slow=runAt(100);ok(fast===slow,`빠른 기기 ${fast} = 느린 기기 ${slow}`);
if(fails.length){console.log('FAIL skillrun_det\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS skillrun_det');
