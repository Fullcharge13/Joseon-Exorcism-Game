// v22.0 회귀: 2부를 넣어도 같은 씨앗·같은 조작의 1부 판은 바뀌지 않는다(제1~3막 자동 진행 지문).
// 기대값은 v21.2.3(2부 넣기 전) 빌드에서 이 파일을 FP=1로 돌려 얻은 값.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
{
newGame('seonbi','gilil',0,'normal','normal');show(null);god();
for(let k=0;k<3*(STAGE_T+40)&&G.stage<3;k++){step(1);if(G.st>=STAGE_T&&!G.boss&&!G.bossDone){}if(G.boss&&G.st>STAGE_T+20)killBoss();if(modal==='tavern'){show(null);nextStage();}}
const fp=[G.stage,G.kills,G.P.lvl,Math.round(G.coins),Math.round(G.time)].join(',');
if(process.env.FP)console.log('FP '+fp);
const WANT='3,8311,39,268,428';
ok(fp===WANT,'1부 지문 같음: 지금 '+fp+' · 기대 '+WANT);
}
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS act2_off_same');
if(fails.length)process.exitCode=1;
