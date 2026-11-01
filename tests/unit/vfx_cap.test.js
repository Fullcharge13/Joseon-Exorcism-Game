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
// v18.3 날씨 입자 상한: 켬 120 · 약하게 60 · 절약·끔 0
if(typeof vfxWeatherN!=='function')fails.push('vfxWeatherN 있음');else{meta.set.vfx='on';newGame('seonbi','gilil',0,'normal');G.queue.length=0;
 let mx=0;for(let st=0;st<10;st++){G.stage=st;mx=Math.max(mx,vfxWeatherN());}ok(mx>0&&mx<=120,'날씨 입자 켬 ≤120: '+mx);
 meta.set.vfx='soft';let ms=0;for(let st=0;st<10;st++){G.stage=st;ms=Math.max(ms,vfxWeatherN());}ok(ms<=60,'약하게 ≤60: '+ms);
 meta.set.vfx='on';LOW=true;let ml=0;for(let st=0;st<10;st++){G.stage=st;ml=Math.max(ml,vfxWeatherN());}LOW=false;ok(ml===0,'절약 0: '+ml);
 meta.set.vfx='off';G.stage=6;ok(vfxWeatherN()===0,'끔 0');meta.set.vfx='on';}
// v18.3 「약하게」는 날씨를 절반: 입자 수만 줄이고 하나하나의 진하기는 켬과 같다(검토 지적)
if(typeof vfxWeather==='function'){newGame('seonbi','gilil',0,'normal');G.queue.length=0;G.stage=6;
 const maxA=v=>{meta.set.vfx=v;let m=0;const d=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(b),'globalAlpha');Object.defineProperty(b,'globalAlpha',{configurable:true,get(){return d.get.call(this);},set(x){if(x<1&&x>m)m=x;d.set.call(this,x);}});
  const fr=b.fillRect;let cnt=0;b.fillRect=function(...a){cnt++;return fr.apply(this,a);};vfxWeather(0,0,v==='soft'?0.5:1);b.fillRect=fr;delete b.globalAlpha;return [m,cnt];};
 const [aOn,nOn]=maxA('on'),[aSoft,nSoft]=maxA('soft');ok(aSoft>=aOn*0.9&&nSoft<nOn&&nSoft>=nOn*0.4,'약하게: 진하기 같음('+aOn.toFixed(2)+'/'+aSoft.toFixed(2)+'), 입자 '+nOn+'→'+nSoft);meta.set.vfx='on';}
// 10막 모두 풀·날씨·빛을 한 번씩 그려 봐도 오류 없음
{let err='';for(const v of ['on','soft']){meta.set.vfx=v;for(let st=0;st<10;st++){newGame('seonbi','gilil',0,'normal');G.queue.length=0;G.stage=st;try{vfxGround(G.P.x-W/2,G.P.y-H/2);vfxLight(G.P.x-W/2,G.P.y-H/2);}catch(e){err+=`${v} ${st+1}막 ${e.message}; `;}}}ok(!err,'10막 그리기 오류 없음 '+err);meta.set.vfx='on';}
// v18.4 바닥 조각: 미리 구운 조각은 64장까지, 막이 바뀌면 비움, 같은 자리는 같은 그림(이어짐), 끔·절약이면 조각을 쓰지 않음
if(typeof vfxChunk!=='function'||typeof VFXS.chunks==='undefined')fails.push('vfxChunk·VFXS.chunks 있음');else{
 meta.set.vfx='on';LOW=false;newGame('seonbi','gilil',0,'normal');G.queue.length=0;G.stage=0;VFXS.chunks.clear();
 for(let i=0;i<200;i++){G.P.x=i*97;G.P.y=(i%7)*131;drawGround(G.P.x-W/2,G.P.y-H/2);}ok(VFXS.chunks.size>0&&VFXS.chunks.size<=64,'조각 64장까지: '+VFXS.chunks.size);
 const a1=vfxChunk(0,3,-2),a2=vfxChunk(0,3,-2);ok(a1===a2,'같은 자리는 같은 조각');
 G.stage=1;drawGround(0,0);ok([...VFXS.chunks.keys()].every(k=>k.startsWith('1:')),'막이 바뀌면 앞 막 조각을 비움');
 VFXS.chunks.clear();meta.set.vfx='off';drawGround(0,0);ok(VFXS.chunks.size===0,'끔이면 조각 안 씀');
 meta.set.vfx='on';LOW=true;drawGround(0,0);ok(VFXS.chunks.size===0,'절약 모드는 조각 안 씀');LOW=false;}
// v18.4 검토(심각): 가로로 넓고 낮은 화면(보이는 조각 64장 넘음)에서도 보이는 조각을 버리지 않고 빈 그림을 그리지 않는다
{const W0=W,H0=H;W=1600;H=450;meta.set.vfx='on';LOW=false;newGame('seonbi','gilil',0,'normal');G.queue.length=0;G.stage=0;VFXS.chunks.clear();
 let bad=0,draws=0;const dI=b.drawImage;b.drawImage=function(img,...a){draws++;if(!img)bad++;return dI?dI.call(this,img,...a):undefined;};
 for(let i=0;i<300;i++)drawGround(i*3-800,i*2-225);b.drawImage=dI;W=W0;H=H0;ok(bad===0,'넓은 화면에서 빈 조각 그리기 0: '+bad+'/'+draws);}
// v18.4 검토(중요): 움직이다 조각 경계를 지나도 무늬가 한 프레임씩 사라지지 않는다(그 프레임 전체를 예전 그리기로 돌리지 않음) · 한 프레임에 새로 굽는 조각 ≤ 2
{meta.set.vfx='on';LOW=false;newGame('seonbi','gilil',0,'normal');G.queue.length=0;G.stage=0;VFXS.chunks.clear();for(let i=0;i<40;i++)drawGround(-W/2,-H/2);
 let fb=0,maxMade=0;for(let i=0;i<600;i++){const n0=VFXS.made||0;if(!vfxGroundChunks(i*2-W/2,-H/2))fb++;maxMade=Math.max(maxMade,(VFXS.made||0)-n0);}
 ok(typeof VFXS.made==='number','굽은 조각 수를 셈(VFXS.made)');ok(fb===0,'움직이는 동안 예전 그리기로 통째로 돌아간 프레임 0: '+fb);ok(maxMade<=2,'한 프레임에 새로 굽는 조각 ≤2: '+maxMade);}
// v18.4 검토(사소): 10막 박석 무늬는 음수 좌표에서도 같은 바둑판(사분면마다 칠한 비율이 같음)
{const fr=b.fillRect;const cnt=(ox,oy)=>{let n=0;const g={fillRect(){n++;},set fillStyle(v){},set globalAlpha(v){},beginPath(){},ellipse(){},fill(){}};vfxDeco(g,STAGE_VFX[9],ox,oy);return n;};
 const q=[cnt(1024,1024),cnt(-1152,1024),cnt(1024,-1152),cnt(-1152,-1152)];ok(Math.max(...q)<=Math.min(...q)*1.6+5,'박석 사분면 비율 '+q.join('/'));}
if(fails.length){console.log('FAIL vfx_cap\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS vfx_cap');
