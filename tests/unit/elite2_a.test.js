// v19.4 작업 2: 1막 객귀(들러붙어 느리게) · 2막 죽통 나그네(대통 여인 소환) — 설계 3장 시작값
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
const set=(st)=>{newGame('seonbi',null,0,'normal');G.queue.length=0;show(null);G.stage=st;G.midDone=true;G.mid=null;G.enemies.length=0;G.P.hp=G.P.maxHp=1e9;};
const run=(sec,each)=>{for(let i=0;i<Math.round(sec*60);i++){G.P.hp=G.P.maxHp;G.P.xp=0;G.queue.length=0;if(modal)show(null);G.eliteT=999;G.spawnT=999;if(each)each(i);update(1/60);}};
ok(STAGES[0].elite2==='gaekgwi'&&STAGES[1].elite2==='juktong','1·2막 elite2');ok(EN.gaekgwi.hp===115,'객귀 체력 115(v19.5 균형: 기존 엘리트보다 너무 빨리 잡힘)');
ok(typeof playerMoveMul==='function','playerMoveMul');
for(const id of ['gaekgwi','juktong'])ok(ESPR2[id]&&ESPR2[id].length===3&&ESPR2[id].every(v=>v.w===12&&v.hgt===16),id+' 세 장 12×16');
ok(EN.juknyeo&&EN.juknyeo.helper&&ESPR.juknyeo&&!DOGAM_IDS.includes('juknyeo'),'대통 여인 = 보조물');
if(EN.gaekgwi&&typeof playerMoveMul==='function'){
 // ① 객귀: 경고 뒤 붙음 → 이동 0.65, 3초 뒤 1, 물러남, 6초 안에는 다시 안 붙음
 set(0);spawnElite();const e=G.enemies.find(x=>x.elite);ok(e&&e.kind==='gaekgwi','1막 중간 보스 뒤 객귀');
 e.x=G.P.x+14;e.y=G.P.y;const P=G.P;P.iframe=0;let warned=false,clungAt=-1;
 run(1.5,i=>{P.iframe=0;if(G.warns.length)warned=true;if(clungAt<0&&playerMoveMul()<0.99)clungAt=i/60;});
 ok(warned,'붙기 전 경고');ok(clungAt>0,'붙음 → 느려짐');ok(Math.abs(playerMoveMul()-0.65)<1e-9,'이동 0.65: '+playerMoveMul());
 run(3.2,()=>{P.iframe=0;});ok(Math.abs(playerMoveMul()-1)<1e-9,'3초 뒤 1: '+playerMoveMul());
 const d0=Math.hypot(e.x-P.x,e.y-P.y);run(1.5,()=>{P.iframe=0;});ok(Math.hypot(e.x-P.x,e.y-P.y)>d0+8,'떨어진 뒤 물러남');
 e.x=P.x+10;e.y=P.y;let re=false;run(2.5,()=>{P.iframe=0;if(playerMoveMul()<0.99)re=true;});ok(!re,'6초 안에는 다시 안 붙음');
 // 무적이면 안 붙음
 set(0);spawnElite();const e2=G.enemies.find(x=>x.elite);e2.x=G.P.x+10;e2.y=G.P.y;let any=false;run(2,()=>{G.P.iframe=5;if(playerMoveMul()<0.99)any=true;});ok(!any,'무적이면 안 붙음');
 // 역마살과 겹치면 곱
 set(0);G.P.slowT=5;G.P.clingT=2;ok(Math.abs(playerMoveMul()-0.6*0.65)<1e-9,'느려짐·들러붙음은 곱');
 // 판이 끝나면 원래대로
 G.P.clingT=2;newGame('seonbi',null,0,'normal');ok(Math.abs(playerMoveMul()-1)<1e-9,'새 판에서 1');
}
if(EN.juktong){
 // ② 죽통 나그네: 8초마다 둘, 동시 ≤ 4, 여인 체력 = 그 막 일반 요괴 평균 ×2, 보조물
 set(1);spawnElite();const e=G.enemies.find(x=>x.elite);ok(e&&e.kind==='juktong','2막 중간 보스 뒤 죽통 나그네');
 e.x=G.P.x+80;e.y=G.P.y;e.inv=true;G.weapons.length=0;let mx=0,warned=0,first=-1;
 run(40,i=>{const n=G.enemies.filter(x=>x.kind==='juknyeo'&&!x.dead).length;mx=Math.max(mx,n);if(n&&first<0)first=i/60;if(G.warns.length)warned++;e.x=G.P.x+80;e.y=G.P.y;});
 ok(mx===4,'동시 최대 4 (본 최대 '+mx+')');ok(first>0&&first<9,'첫 소환 9초 안 '+first);ok(warned>0,'소환 전 경고');
 set(1);const st=curStg(),a=st.early.map(id=>spawnEnemy(id).maxHp);const avg=a.reduce((x,y)=>x+y,0)/a.length;G.enemies.length=0;
 spawnElite();const e2=G.enemies.find(x=>x.elite);e2.x=G.P.x+80;e2.y=G.P.y;run(9);const w=G.enemies.find(x=>x.kind==='juknyeo');const avgNow=st.early.map(id=>{const t=spawnEnemy(id,0,0,{novr:1});t.dead=true;return t.maxHp;}).reduce((x,y)=>x+y,0)/st.early.length;
 ok(w&&Math.abs(w.maxHp-avgNow*2)<avgNow*2*0.05,'여인 체력 = 같은 때 일반 평균 ×2: '+(w&&Math.round(w.maxHp))+' / '+Math.round(avgNow*2));
 const k0=G.rs.elites,c0=G.items.filter(i=>i.k==='chest').length;if(w)kill(w);ok(G.rs.elites===k0&&G.items.filter(i=>i.k==='chest').length===c0,'여인은 상자·엘리트 수 없음');
}
if(fails.length){console.log('FAIL elite2_a\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS elite2_a');
