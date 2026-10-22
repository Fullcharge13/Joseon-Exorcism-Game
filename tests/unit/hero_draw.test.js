// 그림(v17.2): 걸을 때 캐릭터를 돌려 그리지 않는다(도트가 깨짐) · 보스 둘레에 붉은 빛을 늘 그리지 않는다(기술 준비 경고와 헷갈림)
// · 플레이어 둘레의 빛은 매 장면 새로 만들지 않고 한 번 만든 그림을 쓴다.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
let rot=0,grad=0;const r0=b.rotate,g0=b.createRadialGradient;b.rotate=function(...a){rot++;};b.createRadialGradient=function(...a){grad++;return {addColorStop(){}};};
meta.set.perf='high';applyPerf();resize();newGame('seonbi','gilil',0,'normal');G.queue.length=0;show(null);god();G.P.moving=true;G.time=0.1;
render();ok(rot===0,'걸을 때 캐릭터를 돌려 그리지 않음 (rotate '+rot+'번)');
G.enemies.length=0;G.st=STAGE_T+1;G.midDone=true;spawnBoss('gumiho',false);G.boss.x=G.P.x+40;G.boss.y=G.P.y;G.boss.act=null;
grad=0;render();const g1=grad;grad=0;render();const g2=grad;
ok(g2===0,'보스·플레이어 빛을 매 장면 새로 만들지 않음 (두 번째 장면 그라디언트 '+g2+'개, 첫 장면 '+g1+'개)');
// 보스 둘레 붉은 빛: 붉은 반투명 타원을 보스 자리에 그리지 않음(기술 준비 중이 아닐 때)
const fills=[];const fs0=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(b),'fillStyle');let cur='';
Object.defineProperty(b,'fillStyle',{set(v){cur=v;},get(){return cur;},configurable:true});const el0=b.ellipse;b.ellipse=function(x,y,rx,ry){fills.push([cur,x,y,rx]);};
render();delete b.fillStyle;b.ellipse=el0;
const B=G.boss;const red=fills.filter(f=>typeof f[0]==='object'||/rgba\(255,\s*50,\s*40/.test(String(f[0]))).filter(f=>Math.abs(f[1]-B.x)<1&&Math.abs(f[2]-B.y)<B.r*2);
ok(red.length===0,'평소 보스 둘레에 붉은 빛 없음 ('+red.length+'개)');
b.rotate=r0;b.createRadialGradient=g0;
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS hero_draw');
if(fails.length)process.exitCode=1;
