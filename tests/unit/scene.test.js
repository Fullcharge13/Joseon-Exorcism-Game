// 이야기 장면 창: 쪽을 차례로 넘기고 끝나면 한 번만 이어 간다. 열린 직후 0.5초 누름은 무시. 떠 있는 동안 보상 창은 기다린다.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
newGame('seonbi','gilil',0,'normal');show(null);
let doneN=0;
openScene([{eye:'설화 조각 1/3',title:'가',t:'첫 쪽',art:'jw'},{title:'나',t:'둘째 쪽',art:'en:gumiho'},{title:'다',t:'셋째 쪽',art:'prop:scroll',foot:'설화 출정이 열렸다'}],()=>{doneN++;});
ok(modal==='scene','장면 창이 열려야 함');
ok($('#sceneText').textContent==='첫 쪽'&&$('#sceneEye').textContent==='설화 조각 1/3','첫 쪽 글');
sceneNext();ok($('#sceneText').textContent==='첫 쪽','열린 직후(0.5초 안) 누름은 무시');
armUntil=0;sceneNext();ok($('#sceneText').textContent==='둘째 쪽','둘째 쪽');
// 떠 있는 동안 레벨업 대기열은 열리지 않는다
G.queue.push('lvl');frame(performance.now());frame(performance.now()+16);
ok(modal==='scene','장면 창 위로 레벨업 창이 열리면 안 됨');
armUntil=0;sceneNext();ok($('#sceneText').textContent==='셋째 쪽'&&$('#sceneFoot').textContent==='설화 출정이 열렸다','셋째 쪽과 알림 줄');
ok($('#sceneNext').textContent==='계속','마지막 쪽 버튼은 「계속」');
armUntil=0;sceneNext();ok(doneN===1,'끝나면 이어 가기가 한 번 불림');
armUntil=0;sceneNext();ok(doneN===1,'닫힌 뒤 누름은 다시 부르지 않음');
ok(modal!=='scene','장면 창이 닫혀야 함');
frame(performance.now()+40);ok(modal==='levelup','닫힌 뒤에는 기다리던 레벨업 창이 열림 (지금 '+modal+')');show(null);G.queue.length=0;
// 키로 넘기기
let d2=0;openScene([{title:'a',t:'1'},{title:'b',t:'2'}],()=>d2++);armUntil=0;
for(const code of ['Space','Enter']){armUntil=0;__keydown({code,key:code==='Space'?' ':'Enter'});}
ok(d2===1,'스페이스·엔터로 넘김 (지금 '+d2+')');
openScene([{title:'a',t:'1'}],()=>d2++);armUntil=0;__keydown({code:'Digit1',key:'1'});ok(d2===2,'숫자 1로 넘김');
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS scene');
if(fails.length)process.exitCode=1;
