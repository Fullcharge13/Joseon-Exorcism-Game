// 분위기 층 개수 상한(v18.2): 요괴를 많이 쓰러뜨려도 잔해가 끝없이 쌓이지 않고, 빛 개수도 상한을 지킨다. 끔이면 잔해 0
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
const ready=typeof vfxDebris==='function'&&typeof vfxLights==='function'&&typeof VFXS!=='undefined';
ok(ready,'vfxDebris·vfxLights·VFXS가 있음');
if(ready){
 meta.set.vfx='on';newGame('seonbi','gilil',0,'normal');G.queue.length=0;G.P.hp=G.P.maxHp=1e9;
 const killMany=n=>{for(let i=0;i<n;i++){const e=spawnEnemy(curStg().early[0],G.P.x+50,G.P.y);kill(e);}};
 LOW=false;VFXS.debris.length=0;killMany(1000);ok(VFXS.debris.length>0&&VFXS.debris.length<=260,'잔해 상한 260: '+VFXS.debris.length);
 LOW=true;VFXS.debris.length=0;killMany(1000);ok(VFXS.debris.length<=60,'절약 모드 잔해 상한 60: '+VFXS.debris.length);LOW=false;
 meta.set.vfx='off';VFXS.debris.length=0;killMany(50);ok(VFXS.debris.length===0,'끔이면 잔해 0: '+VFXS.debris.length);meta.set.vfx='on';
 for(let i=0;i<500;i++)G.ebul.push({x:G.P.x+(i%40)*3-60,y:G.P.y+Math.floor(i/40)*3-20,vx:0,vy:0,r:2,dmg:1,life:5});
 for(let i=0;i<200;i++)G.gems.push({x:G.P.x+i%20,y:G.P.y,v:1,mag:false});
 const cx=G.P.x-W/2,cy=G.P.y-H/2;const L=vfxLights(cx,cy);ok(L.length>0&&L.length<=45,'빛 상한 45: '+L.length);
 ok(L.some(l=>l.kind==='ebul'),'요괴 탄이 빛 목록에 들어감');ok(L[0].kind==='hero','퇴마사 빛이 맨 앞(잘리지 않음)');
 LOW=true;ok(vfxLights(cx,cy).length<=15,'절약 모드 빛 상한 15');LOW=false;
 G.warns.push({x:G.P.x,y:G.P.y,r:30,t:0.5,max:1});ok(vfxLights(cx,cy).some(l=>l.kind==='warn'),'보스 경고 장판이 빛 목록에 들어감');
}
// 새 판·다음 막에서는 앞 판의 잔해가 남지 않는다
if(ready){meta.set.vfx='on';newGame('seonbi','gilil',0,'normal');G.queue.length=0;for(let i=0;i<20;i++)kill(spawnEnemy(curStg().early[0],G.P.x+40,G.P.y));const a=VFXS.debris.length;
 newGame('seonbi','gilil',0,'normal');G.queue.length=0;ok(a>0&&VFXS.debris.length===0,'새 판에서 잔해 비움 '+a+'→'+VFXS.debris.length);
 for(let i=0;i<20;i++)kill(spawnEnemy(curStg().early[0],G.P.x+40,G.P.y));nextStage();ok(VFXS.debris.length===0,'다음 막에서 잔해 비움 '+VFXS.debris.length);}
// 10막 새벽 동안 어둠 그림을 새로 굽지 않는다(한 장을 옅게)
if(ready){meta.set.vfx='on';newGame('seonbi','gilil',0,'normal');G.queue.length=0;G.stage=9;vfxLight(0,0);const k0=VFXS.dk.key;G.dawnT=G.time;let changed=0;for(let i=0;i<30;i++){G.time+=0.1;vfxLight(0,0);if(VFXS.dk.key!==k0)changed++;}ok(changed===0,'새벽 3초 동안 어둠 다시 굽기 '+changed+'번');}
// 보기만 하는 효과는 게임 난수를 건드리지 않는다: 켬/끔에서 kill 뒤 Math.random 순서가 같음
if(ready){const run=v=>{meta.set.vfx=v;let s=7;const r0=Math.random;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;};newGame('seonbi','gilil',0,'normal');G.queue.length=0;
  for(let i=0;i<30;i++)kill(spawnEnemy(curStg().early[0],G.P.x+40,G.P.y));const x=Math.random();Math.random=r0;return x;};
 ok(run('on')===run('off'),'켬·끔에서 게임 난수 순서가 같음');meta.set.vfx='on';}
if(fails.length){console.log('FAIL vfx_cap\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS vfx_cap');
