// v19.5 작업 2: 8막 바닷속 큰 메기(밀물·썰물) · 9막 삼두구미(한 번 다시 일어남) — 설계 3장
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
const set=(st)=>{newGame('seonbi',null,0,'normal');G.queue.length=0;show(null);G.stage=st;G.midDone=true;G.mid=null;G.enemies.length=0;G.weapons.length=0;G.P.hp=G.P.maxHp=1e9;};
const run=(sec,each)=>{for(let i=0;i<Math.round(sec*60);i++){G.P.hp=G.P.maxHp;G.P.xp=0;G.queue.length=0;if(modal)show(null);G.eliteT=999;G.spawnT=999;G.potT=999;if(each)each(i);update(1/60);}};
{
for(const [id,st] of [['keunmegi',7],['samdugumi',8]]){ok(STAGES[st].elite2===id,(st+1)+'막 elite2 '+id);ok(ESPR2[id]&&ESPR2[id].length===3&&ESPR2[id].every(v=>v.w===12&&v.hgt===16),id+' 세 장 12×16');}
ok(ESPR2.samdugumi2&&ESPR2.samdugumi2.length===3,'삼두구미 다시 일어난 뒤 그림(머리 둘)');
if(EN.keunmegi){
 // 메기 자리에 두고 퇴마사만 움직이는지 본다(퇴마사 입력 없음)
 set(7);spawnElite();const e=G.enemies.find(x=>x.elite);e.inv=true;e.spd=0;const P=G.P;e.x=P.x+100;e.y=P.y;let warned=false,ph=[],maxStep=0,lastX=P.x,lastY=P.y;
 run(16,i=>{e.x=P.x+100;e.y=P.y;});
 set(7);spawnElite();const m=G.enemies.find(x=>x.elite);m.inv=true;m.spd=0;m.x=P.x+100;m.y=P.y;const X0=m.x;lastX=G.P.x;lastY=G.P.y;
 run(16,i=>{m.x=X0;m.y=G.P.y;if(G.warns.length&&!G.tide)warned=true;const dx=G.P.x-lastX;maxStep=Math.max(maxStep,Math.hypot(dx,G.P.y-lastY));ph.push(G.tide?G.tide.dir:0);lastX=G.P.x;lastY=G.P.y;});
 ok(warned,'밀물·썰물 전 경고');ok(ph.includes(1)&&ph.includes(-1),'끌어당김(1)·밀쳐 냄(−1) 둘 다');
 const runs=[];let cur=ph[0],len=0;for(const v of ph){if(v===cur)len++;else{runs.push([cur,len/60]);cur=v;len=1;}}const mid=runs.filter(r=>r[0]!==0).slice(1,-1);ok(mid.length>=2&&mid.every(r=>Math.abs(r[1]-3)<0.2),'3초씩 번갈아 '+JSON.stringify(mid.map(r=>[r[0],+r[1].toFixed(2)])));
 ok(maxStep<=3,'한 프레임 이동 ≤ 3 ('+maxStep.toFixed(2)+')');
 // 끌어당길 때는 메기 쪽으로
 set(7);spawnElite();const q=G.enemies.find(x=>x.elite);q.inv=true;q.spd=0;q.x=G.P.x+100;q.y=G.P.y;let d0=null,d1=null;run(8,()=>{q.y=G.P.y;if(G.tide&&G.tide.dir===1){if(d0===null)d0=q.x-G.P.x;d1=q.x-G.P.x;}});ok(d0!==null&&d1<d0-5,'끌어당기면 가까워짐 '+d0+'→'+d1);
 // 보스가 끌어당기는 동안 메기 힘 0
 set(7);spawnElite();const r=G.enemies.find(x=>x.elite);r.inv=true;r.spd=0;r.x=G.P.x+100;r.y=G.P.y;const fake={x:G.P.x,y:G.P.y,dead:false};let moved=0;
 run(8,()=>{r.y=G.P.y;G.pull={src:fake,spd:0};fake.x=G.P.x;fake.y=G.P.y;const x0=G.P.x;moved=Math.max(moved,0);});ok(Math.abs(G.P.x-(r.x-100))<0.5,'보스 끌기 중에는 메기 힘 0');G.pull=null;
 // 쓰러지면·얼면 힘 0
 set(7);spawnElite();const t=G.enemies.find(x=>x.elite);t.inv=true;t.spd=0;t.x=G.P.x+100;t.y=G.P.y;run(4);kill(t);const xk=G.P.x;run(2);ok(!G.tide&&Math.abs(G.P.x-xk)<0.01,'쓰러지면 힘 0');
 set(7);spawnElite();const u=G.enemies.find(x=>x.elite);u.inv=true;u.spd=0;u.x=G.P.x+100;u.y=G.P.y;run(4);u.frz=99;const xf=G.P.x;run(2,()=>{u.frz=99;});ok(Math.abs(G.P.x-xf)<0.01,'얼면 힘 0');
 set(7);G.tide={src:{dead:false,frz:0,x:0,y:0},dir:1,spd:18};nextStage();ok(!G.tide,'막이 바뀌면 힘 0');
}
if(EN.samdugumi){
 set(8);spawnElite();const e=G.enemies.find(x=>x.elite);const el0=G.rs.elites,k0=G.kills,c0=G.items.filter(i=>i.k==='chest').length,mx=e.maxHp;
 kill(e);ok(!e.dead&&Math.abs(e.hp-mx*0.2)<1e-6&&e.inv&&e.spr2==='samdugumi2','첫 처치: 쓰러지지 않고 체력 20%(v19.5 조정, 처음 50%)·무적·머리 둘');ok(EN.samdugumi.hp===72,'삼두구미 체력 72(엘리트 기본 90의 0.8, v19.5 조정)');
 ok(G.rs.elites===el0&&G.kills===k0&&G.items.filter(i=>i.k==='chest').length===c0,'첫 처치는 상자·퇴치 수 없음');
 hurt(e,1e9);ok(!e.dead,'무적 동안 피해 없음');run(1);ok(!e.inv,'0.8초 뒤 무적 풀림');
 kill(e);ok(e.dead&&G.rs.elites===el0+1&&G.items.filter(i=>i.k==='chest').length===c0+1&&G.kills===k0+1,'두 번째 처치: 상자 1·퇴치 1·엘리트 +1');
 kill(e);ok(G.items.filter(i=>i.k==='chest').length===c0+1,'쓰러진 뒤 또 불러도 상자 하나');
 // 한 프레임에 큰 피해 두 번
 set(8);spawnElite();const f=G.enemies.find(x=>x.elite);const c1=G.items.filter(i=>i.k==='chest').length;hurt(f,1e12);hurt(f,1e12);ok(!f.dead&&G.items.filter(i=>i.k==='chest').length===c1,'큰 피해 두 번이어도 다시 일어남 한 번');
 let rerr='';try{render();}catch(x){rerr=x.message;}ok(!rerr,'머리 둘 그림 그리기 오류 없음 '+rerr);
}
}
if(fails.length){console.log('FAIL elite2_d\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS elite2_d');
