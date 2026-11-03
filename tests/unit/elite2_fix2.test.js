// v19.5 새 검토자 지적(중요 3 · 사소) — 고치기 전에 실패해야 함
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
const set=(st)=>{newGame('seonbi',null,0,'normal');G.queue.length=0;show(null);G.stage=st;G.midDone=true;G.mid=null;G.enemies.length=0;G.weapons.length=0;G.P.hp=G.P.maxHp=1e9;};
const run=(sec,each)=>{for(let i=0;i<Math.round(sec*60);i++){G.P.hp=G.P.maxHp;G.P.xp=0;G.queue.length=0;if(modal)show(null);G.eliteT=999;G.spawnT=999;G.potT=999;if(each)each(i);update(1/60);}};
{
// ① 중요: 다시 일어난 삼두구미가 얼어 있어도 0.8초 뒤 무적이 풀림
set(8);spawnElite();const s=G.enemies.find(x=>x.elite);kill(s);ok(s.inv,'다시 일어나면 무적');run(1.2,()=>{s.frz=5;});ok(!s.inv,'얼어 있어도 0.8초 뒤 무적 풀림 '+s.inv);
// ② 중요: 화마 둘이 겹쳐도 드므는 각자 둘, 하나가 쓰러져도 남은 화마의 드므는 그대로
set(9);spawnElite();const h1=G.enemies.find(x=>x.elite);h1.x=G.P.x+300;run(0.1);spawnElite();const h2=G.enemies.filter(x=>x.elite).find(x=>x!==h1);h2.x=G.P.x-300;run(0.1);
ok(G.deumeu.filter(d=>d.owner===h1).length===2&&G.deumeu.filter(d=>d.owner===h2).length===2,'화마마다 드므 둘 '+G.deumeu.map(d=>d.owner===h1?1:2).join(''));
kill(h2);run(0.1);ok(G.deumeu.filter(d=>d.owner===h1).length===2&&!G.deumeu.some(d=>d.owner===h2),'h2가 쓰러져도 h1 드므 남음');
// 사소: 얼어 있는 화마가 드므에서 멀어지면(얼린 채 밀려남) 받는 피해 배율이 남지 않음
const d=(G.deumeu||[]).find(q=>q.owner===h1)||{x:G.P.x,y:G.P.y};h1.x=d.x+5;h1.y=d.y;run(0.2,()=>{h1.x=d.x+5;h1.y=d.y;});ok(h1.wetT>0,'드므 곁 젖음');h1.frz=9;h1.x=d.x+400;run(0.5,()=>{h1.frz=9;h1.x=d.x+400;});ok(!(h1.wetT>0),'얼어도 젖음은 마름');
// 사소: 흑룡 둘 — 하나가 쓰러져도 다른 흑룡의 어둠은 이어짐
set(6);spawnElite();const k1=G.enemies.find(x=>x.elite);k1.inv=true;spawnElite();const k2=G.enemies.filter(x=>x.elite).find(x=>x!==k1);k2.inv=true;
k1.xT=0;run(1);ok(G.eclipse>0,'k1 어둠');run(4.2);k2.xT=0;run(1);ok(G.eclipse>0,'k2 어둠');k1.inv=false;kill(k1);ok(G.eclipse>0,'k1이 쓰러져도 k2 어둠 이어짐');
// 사소: 행동을 준비하다 쓰러지면 경고도 거둠(흑룡)
set(6);spawnElite();const k3=G.enemies.find(x=>x.elite);k3.xT=0;run(0.2);const nW=G.warns.length;kill(k3);ok(nW>0&&G.warns.length<nW,'흑룡이 준비 중 쓰러지면 경고 거둠');
// ③ 중요(시험이 가리던 것): 실제처럼 움직이는 큰 메기에 밀려도 장애물 안에 들어가지 않음, 방향이 바뀌기 전 경고
set(7);spawnElite();const m=G.enemies.find(x=>x.elite);m.x=G.P.x+90;m.y=G.P.y;let inObs=0,flips=0,warnedFlip=0,last=null;
run(20,()=>{const q={x:G.P.x,y:G.P.y};pushOut(q,G.P.r);if(Math.hypot(q.x-G.P.x,q.y-G.P.y)>0.5)inObs++;const dir=G.tide?G.tide.dir:0;if(last!==null&&dir!==last&&dir!==0){flips++;if(G.warns.length||m.__w)warnedFlip++;}m.__w=G.warns.length>0;last=dir;});
ok(inObs===0,'밀려도 장애물 안에 안 들어감 ('+inObs+'프레임)');ok(flips>=4&&warnedFlip===flips,'방향 바뀔 때마다 경고 ('+warnedFlip+'/'+flips+')');
// 사소: 보조물(대통 여인)에게 받은 피해도 그 엘리트 몫으로 셈(균형 재기)
set(1);spawnElite();const j=G.enemies.find(x=>x.elite);j.inv=true;j.x=G.P.x+80;run(4);const w=G.enemies.find(x=>x.kind==='juknyeo');if(w){w.x=G.P.x;w.y=G.P.y;G.P.iframe=0;const t0=(G.rs.eTake||{}).juktong||0;run(0.1,()=>{w.x=G.P.x;w.y=G.P.y;});ok(((G.rs.eTake||{}).juktong||0)>t0,'대통 여인 피해는 죽통 나그네 몫');}else ok(false,'대통 여인 없음');
}
if(fails.length){console.log('FAIL elite2_fix2\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS elite2_fix2');
