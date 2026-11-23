// v22.0 검토 지적 고침: 1부 빌려 쓰는 보스 기술 목록 그대로 · 2부에서 쓰러져도 10막 평정은 인정 · 궁기 돌진은 가로로도 ·
// 1부 끝없는 밤 2바퀴째부터는 전갈 없이 끝없는 밤 창 · 15막 뒤 새벽 문구 · 옛 저장/펫/원정(계획의 Review Focus)
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
{
// 1) 빌려 쓰는 기술 목록에 2부 기술이 없어야 1부 어려움·원정 보스가 그대로
ok(!BORROW.includes('quills')&&!BORROW.includes('dance'),'BORROW에 2부 기술 없음');
// 2) 북으로 간 뒤 12막에서 쓰러져도 평정 인정(엽전·완주 기록)
meta.north={seen:true,clear:0,ending:true};meta.ending={seen:true,epi:Object.keys(CHARS)};
newGame('seonbi','gilil',0,'normal','normal');show(null);G.stage=ACT1_END;G.bossDone=true;openTavern();pickFns[0]();show(null);nextStage();nextStage();
const best0=meta.best;let cl=null;const re=runEarned;runEarned=c=>{cl=c;return re(c);};endGame(false);runEarned=re;
ok(cl===true,'2부에서 쓰러짐 → 평정으로 셈 (지금 '+cl+')');
ok(!/^GAME OVER$/.test($('#overEye').textContent),'결과 머리 GAME OVER 아님 ('+$('#overEye').textContent+')');
// 3) 궁기 고슴도치 털: 돌진이 가로로도 움직임
newGame('jangsu','gilil',0,'normal','normal');show(null);G.north=true;G.stage=13;G.enemies.length=0;
spawnBoss('gunggi',false);const b=G.boss;b.hp=b.maxHp=1e9;b.x=G.P.x-100;b.y=G.P.y;b.act='quills';b.ulting=true;BSK.quills.start(b);
const x0=b.x;for(let i=0;i<60;i++){step(1/60);G.P.hp=G.P.maxHp;}
ok(Math.abs(b.x-x0)>20,'궁기 돌진 가로 이동 (dx '+(b.x-x0).toFixed(1)+')');
// 4) 1부 끝없는 밤 2바퀴째 10막 뒤: 전갈 대신 끝없는 밤 창
newGame('seonbi','gilil',0,'normal','normal');show(null);G.loop=1;G.stage=ACT1_END;G.bossDone=true;openTavern();
ok(modal==='pick'&&!/판의금부사/.test($('#pickTitle').textContent),'1부 끝없는 밤 2바퀴째는 전갈 없음 ('+$('#pickTitle').textContent+')');
// 5) 15막 평정 뒤 새벽 문구는 촉음
newGame('seonbi','gilil',0,'normal','normal');show(null);G.north=true;G.stage=ACT2_END;endGame(true);
ok(/촉음/.test($('#overTitle').textContent),'15막 뒤 새벽 문구 ('+$('#overTitle').textContent+')');
// 6) 전갈 글에 근정전(1592~1867 없음)을 쓰지 않음
ok(!/근정전/.test(ENDING.dispatch.map(p=>p.t).join('')),'전갈 글에 근정전 없음');
// 7) 계획 Review Focus: 펫 막 성장 11막 뒤 줄지 않음 · 원정 10라운드 · 옛 저장 meta.north 기본값
ok(petStageF(14)===petStageF(11)&&petStageF(11)>=petStageF(10),'펫 막 성장 11막에서 묶임');
newGame('jangsu','gilil',0,'normal','rush');G.stage=ACT1_END;let rc=0;const en=endGame;endGame=w=>{rc=w?1:-1;};rushNext();endGame=en;ok(rc===1,'원정은 10라운드에서 끝');
}
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS act2_fixes');
if(fails.length)process.exitCode=1;
