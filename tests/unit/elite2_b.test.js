// v19.4 작업 3: 3막 범이 된 남편(웅크렸다 덮침) · 4막 곰나루 암곰(새끼 곰, 성남) · 5막 길달(여우로 순간이동) — 설계 3장 시작값
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
const set=(st)=>{newGame('seonbi',null,0,'normal');G.queue.length=0;show(null);G.stage=st;G.midDone=true;G.mid=null;G.enemies.length=0;G.weapons.length=0;G.P.hp=G.P.maxHp=1e9;};
const run=(sec,each)=>{for(let i=0;i<Math.round(sec*60);i++){G.P.hp=G.P.maxHp;G.P.xp=0;G.queue.length=0;if(modal)show(null);G.eliteT=999;G.spawnT=999;G.potT=999;if(each&&each(i)===false)break;update(1/60);}};
const SB=[['beomnam',2],['gomnaru',3],['gildal',4]];
for(const [id,st] of SB){ok(STAGES[st].elite2===id,(st+1)+'막 elite2 '+id);ok(ESPR2[id]&&ESPR2[id].length===3&&ESPR2[id].every(v=>v.w===12&&v.hgt===16),id+' 세 장 12×16');}
ok(EN.gomsaekki&&EN.gomsaekki.helper&&!DOGAM_IDS.includes('gomsaekki'),'새끼 곰 = 보조물');
if(EN.beomnam){
 // ① 범: 웅크림(경고 1초, 떨어질 자리) 뒤에만 도약 · 7초 간격 · 반지름 40 안만 다침
 set(2);spawnElite();const e=G.enemies.find(x=>x.elite);ok(e&&e.kind==='beomnam','3막 범');
 e.x=G.P.x+90;e.y=G.P.y;e.inv=true;const P=G.P;let leaps=[],warnAt=-9,bad=0,last=null;
 run(22,i=>{const t=i/60;if(e.eact==='crouch'&&last!=='crouch'){warnAt=t;if(!G.warns.some(w=>Math.abs(w.r-40)<0.01))bad++;   /* 검토 뒤: 피해는 내려앉을 때 주고 경고는 표시만 */}if(e.eact==='leap'&&last!=='leap'){leaps.push(t);if(t-warnAt<0.95)bad++;}last=e.eact;P.x+=0;});
 ok(leaps.length>=2&&bad===0,'경고 1초 뒤에만 도약 (도약 '+leaps.length+', 어긋남 '+bad+')');
 ok(leaps.length>=2&&leaps.slice(1).every((t,i)=>Math.abs(t-leaps[i]-7)<0.6),'7초 간격 '+leaps.map(x=>x.toFixed(1)));
 // 떨어질 자리 밖이면 안 다침, 안이면 다침
 set(2);spawnElite();const b=G.enemies.find(x=>x.elite);b.x=G.P.x+60;b.y=G.P.y;b.inv=true;b.pT=0;let hpL=null,dmgIn=0,moved=false;G.P.maxHp=G.P.hp=1000;
 for(let i=0;i<180;i++){G.queue.length=0;if(modal)show(null);G.eliteT=999;G.spawnT=999;const h0=G.P.hp;if(b.eact==='crouch'&&!moved){G.P.x+=60;moved=true;}update(1/60);if(G.P.hp<h0)dmgIn+=h0-G.P.hp;}
 ok(moved&&dmgIn===0,'떨어질 자리에서 비켜나면 안 다침 '+dmgIn);
 set(2);spawnElite();const c=G.enemies.find(x=>x.elite);c.x=G.P.x+60;c.y=G.P.y;c.inv=true;c.pT=0;G.P.maxHp=G.P.hp=1000;let hit=0;
 for(let i=0;i<180;i++){G.queue.length=0;if(modal)show(null);G.eliteT=999;G.spawnT=999;G.P.iframe=0;const h0=G.P.hp;update(1/60);if(G.P.hp<h0)hit++;}ok(hit>0,'제자리면 다침');
}
if(EN.gomnaru){
 // ② 암곰: 새끼 둘 · 새끼 하나마다 이동·피해 ×1.25 · 적이 가득해도 오류 없음
 set(3);spawnElite();const e=G.enemies.find(x=>x.elite);e.x=G.P.x+90;e.y=G.P.y;e.inv=true;run(0.1);
 const kids=G.enemies.filter(x=>x.kind==='gomsaekki'&&!x.dead);ok(kids.length===2,'새끼 둘 '+kids.length);
 const s0=e.spd,d0=e.dmg;if(kids[0])kill(kids[0]);run(0.1);ok(Math.abs(e.spd-s0*1.25)<1e-6&&Math.abs(e.dmg-d0*1.25)<1e-6,'하나 쓰러지면 ×1.25 '+(e.spd/s0).toFixed(3));
 if(kids[1])kill(kids[1]);run(0.1);ok(Math.abs(e.spd-s0*1.5625)<1e-6,'둘이면 ×1.5625 '+(e.spd/s0).toFixed(4));
 run(1);ok(Math.abs(e.spd-s0*1.5625)<1e-6,'더 커지지 않음');
 set(3);for(let i=0;i<CAP.e;i++)G.enemies.push({kind:'gwihwa',x:G.P.x+300,y:G.P.y,hp:1,maxHp:1,r:1,spd:0,dmg:0,kx:0,ky:0,hc:{},flash:0,slow:0,frz:0,dot:0,dotT:0,dotTick:0,vx:0,bob:0,sc:1,dead:false,prop:true});
 let err='';try{spawnElite();const f=G.enemies.find(x=>x.elite);f.x=G.P.x+90;f.y=G.P.y;const s1=f.spd;run(1);ok(!G.enemies.some(x=>x.kind==='gomsaekki')&&f.spd===s1,'적이 가득하면 새끼 0, 성남 0');}catch(x){err=x.message;}ok(!err,'적이 가득해도 오류 없음 '+err);
}
if(EN.gildal){
 // ③ 길달: 6초마다 여우로 변해 사라졌다가 퇴마사에서 80~120 떨어진 곳(장애물 밖·화면 안)에 나타나며 탄 8
 let bad=[],n=0,gaps=[];
 for(let seed=1;seed<=30;seed++){let s=seed;const r0=Math.random;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;};
  try{set(4);spawnElite();const e=G.enemies.find(x=>x.elite);e.x=G.P.x+100;e.y=G.P.y;e.inv=true;let last=null,tAt=[];
   run(13,i=>{if(e.eact!=='fox'&&last==='fox'){n++;tAt.push(i/60);const d=Math.hypot(e.x-e.__px,e.y-e.__py);   /* 나타날 자리는 변신을 시작할 때(경고를 띄울 때) 퇴마사 자리에서 잰다 */const q={x:e.x,y:e.y};pushOut(q,e.r);
     const bul=G.ebul.length;if(d<79.9||d>120.1)bad.push('거리 '+d.toFixed(1));if(Math.abs(q.x-e.x)>0.01||Math.abs(q.y-e.y)>0.01)bad.push('장애물 안');if(Math.abs(e.x-G.P.x)>W/2||Math.abs(e.y-G.P.y)>H/2)bad.push('화면 밖');if(bul<8)bad.push('탄 '+bul);}
    if(e.eact==='fox'&&last!=='fox'){G.ebul.length=0;e.__px=G.P.x;e.__py=G.P.y;}last=e.eact;G.P.x+=0.3;});
   if(tAt.length>=2)gaps.push(tAt[1]-tAt[0]);}finally{Math.random=r0;}}
 ok(n>=30&&!bad.length,'씨앗 30개 순간이동 '+n+'번, 어긋남 '+bad.slice(0,4).join(','));
 ok(gaps.length&&gaps.every(g=>Math.abs(g-6)<0.7),'6초 간격 '+gaps.slice(0,5).map(x=>x.toFixed(1)));
 set(4);spawnElite();const e=G.enemies.find(x=>x.elite);let sawFox=false;run(8,()=>{if(e.eact==='fox'&&eliteFrame(e)===2)sawFox=true;});ok(sawFox,'변신 중 행동 그림(여우)');
}
if(fails.length){console.log('FAIL elite2_b\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS elite2_b');
