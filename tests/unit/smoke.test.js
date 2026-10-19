// 게임 스크립트가 Node에서 오류 없이 읽히고 표가 채워지는지
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
ok(typeof TASKS!=='undefined'&&TASKS.length>=100,'과업 표가 있어야 함');
ok(typeof meta==='object'&&meta.set,'설정이 있어야 함');
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS smoke');
if(fails.length)process.exitCode=1;
