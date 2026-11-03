// v19.5 작업 3: 10막 화마(불 장판) · 드므(물독 표시물, 곁에 오면 불이 꺼지고 받는 피해 ×1.5) — 설계 3장, 계획의 결정(드므는 표시물)
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
const set=(st)=>{newGame('seonbi',null,0,'normal');G.queue.length=0;show(null);G.stage=st;G.midDone=true;G.mid=null;G.enemies.length=0;G.weapons.length=0;G.P.hp=G.P.maxHp=1e9;};
const run=(sec,each)=>{for(let i=0;i<Math.round(sec*60);i++){G.P.hp=G.P.maxHp;G.P.xp=0;G.queue.length=0;if(modal)show(null);G.eliteT=999;G.spawnT=999;G.potT=999;if(each)each(i);update(1/60);}};
{
ok(STAGES[9].elite2==='hwama','10막 elite2 hwama');ok(ESPR2.hwama&&ESPR2.hwama.length===3&&ESPR2.hwama.every(v=>v.w===12&&v.hgt===16),'화마 세 장 12×16');
if(EN.hwama){
 set(9);spawnElite();const e=G.enemies.find(x=>x.elite);e.x=G.P.x+200;e.y=G.P.y;e.inv=true;run(0.1);
 const D=G.deumeu||[];ok(D.length===2&&D.every(d=>{const r=Math.hypot(d.x-G.P.x,d.y-G.P.y),q={x:d.x,y:d.y};pushOut(q,6);return r>=59&&r<=111&&Math.abs(q.x-d.x)<0.01&&Math.abs(q.y-d.y)<0.01;}),'드므 둘, 60~110 떨어진 곳·장애물 밖 '+JSON.stringify(D.map(d=>Math.round(Math.hypot(d.x-G.P.x,d.y-G.P.y)))));
 let mx=0,born=[];run(16,i=>{e.x=G.P.x+200;e.y=G.P.y;const z=G.ezones.filter(z=>z.kind==='fire');mx=Math.max(mx,z.length);for(const q of z)if(!q.__s){q.__s=i/60;born.push(q);}});
 ok(mx>=4&&mx<=6,'불 장판 동시 ≤ 6 (최대 '+mx+')');const bt=[...new Set(born.map(q=>q.__s))];const gaps=bt.slice(1,5).map((t,i)=>t-bt[i]);ok(born.length>=bt.length*3-1,'한 번에 셋 퍼짐');ok(gaps.length>=3&&gaps.every(g=>Math.abs(g-2)<0.2),'2초마다 '+gaps.map(x=>x.toFixed(2)));ok(born.every(q=>Math.abs(q.max-4)<1e-9),'장판 4초');
 // 드므 곁: 장판이 꺼지고 받는 피해 ×1.5, 벗어나면 ×1
 const d=D[0];e.x=d.x+10;e.y=d.y;run(0.2,()=>{e.x=d.x+10;e.y=d.y;});ok(!G.ezones.some(z=>z.kind==='fire'&&z.life>0&&z.owner===e),'드므 곁이면 불 장판 꺼짐');
 const rr=Math.random;Math.random=()=>0.5;   /* 피해 흔들림(×0.9~1.1)을 고정 */
 e.inv=false;const h0=e.hp;hurt(e,100,0,0,0,true);const wet=h0-e.hp;e.x=G.P.x+600;e.y=G.P.y;run(0.5,()=>{e.x=G.P.x+600;e.y=G.P.y;});   /* 두 드므 모두에서 멀리 */e.inv=false;const h1=e.hp;hurt(e,100,0,0,0,true);const dry=h1-e.hp;Math.random=rr;
 ok(wet>0&&dry>0&&wet/dry>1.3&&wet/dry<1.7,'드므 곁 받는 피해 ×1.5 ('+(wet/dry).toFixed(2)+')');
 // 다른 요괴는 드므 곁이어도 ×1
 const o=spawnEnemy(curStg().early[0],d.x+5,d.y);o.hp=o.maxHp=1e6;o.wetT=0.2;const r2=Math.random;Math.random=()=>0.5;const ho=o.hp;hurt(o,100,0,0,0,true);Math.random=r2;   /* 젖음 표시를 일부러 붙여도 화마가 아니면 ×1 */const od=ho-o.hp;ok(Math.abs(od-100)<1.5,'다른 요괴는 드므 영향 없음 '+od);
 // 쓰러지면 드므·장판 사라짐, 막이 바뀌면 드므 없음
 for(const z of G.ezones)z.__old=1;kill(e);run(2.5);ok(!(G.deumeu&&G.deumeu.length),'화마가 쓰러지면 드므 사라짐');ok(!G.ezones.some(z=>z.kind==='fire'&&z.owner===e&&!z.__old),'쓰러진 뒤 새 장판 없음');   /* 검토 지적: 예전 검사는 늘 참이었음 */
 set(8);G.deumeu=[{x:0,y:0}];nextStage();ok(!(G.deumeu&&G.deumeu.length),'막이 바뀌면 드므 없음');
 // 얼면 장판 없음 · 그리기 오류 없음
 set(9);spawnElite();const f=G.enemies.find(x=>x.elite);f.frz=99;run(6,()=>{f.frz=99;});ok(!G.ezones.some(z=>z.kind==='fire'),'얼면 불 장판 없음');
 let rerr='';try{render();}catch(x){rerr=x.message;}ok(!rerr,'드므 그리기 오류 없음 '+rerr);
 // 드므는 줍기와 무관(보물 상자를 같은 자리에 두어도 주워짐)
 set(9);spawnElite();const g=G.enemies.find(x=>x.elite);g.x=G.P.x+300;run(0.1);const dd=G.deumeu[0];G.items.push({k:'chest',x:dd.x,y:dd.y});G.P.x=dd.x;G.P.y=dd.y;run(0.3,()=>{G.P.x=dd.x;G.P.y=dd.y;});ok(!G.items.some(i=>i.k==='chest'&&i.x===dd.x&&i.y===dd.y),'드므 자리 보물 상자도 주워짐');
}
}
if(fails.length){console.log('FAIL elite2_e\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS elite2_e');
