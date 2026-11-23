// v21.2.3 백정 기술 효과 그림(사용자 검수 「가」): 쌍칼 큰 칼 · 황소 흙먼지 · 몽둥이질 땅 금 · 저울질 작은 저울 · 저울은 고르다 큰 저울+물결
// 그림만 바꾸고 피해 수치는 그대로 — 같은 장면의 피해가 바꾸기 전과 같아야 함(아래 기준값은 v21.2.2에서 잰 값)
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
{
const scene=id=>{newGame('baekjeong',[],0,'normal','normal',5);G.queue.length=0;show(null);const P=G.P;P.hp=P.maxHp=1e9;
 P.branch=CHARS.baekjeong.branches.findIndex(b=>b.tiers.some(t=>t.skill===id));P.tier=6;
 G.weapons.length=0;addWeapon(id);const w=G.weapons.find(x=>x.id===id);w.lv=5;w.t=0.05;recompute();
 const en=(curStg().en&&curStg().en[0])||Object.keys(EN)[0];
 for(let i=0;i<24;i++){const a=i/24*Math.PI*2,r=50+(i%3)*45;const e=spawnEnemy(en,P.x+Math.cos(a)*r,P.y+Math.sin(a)*r);e.hp=e.maxHp=1e6;e.spd=0;}
 const big=spawnEnemy(en,P.x+110,P.y-30);big.hp=big.maxHp=5e6;big.spd=0;return w;};
const fire=id=>{const w=scene(id);const seen={fx:new Set(),fxs:[],projs:[]};
 for(let i=0;i<20;i++){G.queue.length=0;if(modal)show(null);update(1/60);for(const f of G.fx){seen.fx.add(f.t);seen.fxs.push(f);}for(const p of G.projs)seen.projs.push(p);}return seen;};
// 쌍칼: 그림만 크게(draw 배율), 맞는 범위(r)는 그대로 4
{const s=fire('ssangkal');const c=s.projs.filter(p=>p.cleaver);ok(c.length>0&&c.every(p=>p.big>=1.5&&p.r===4*G.P.area),'쌍칼 칼 그림 1.5배 이상·맞는 범위 그대로 ('+c.slice(0,1).map(p=>[p.big,p.r])+')');}
// 황소 들이받기: 흙먼지(갈색 입자)가 줄지어
{const s=fire('hwangso');const dust=s.fxs.filter(f=>f.t==='p'&&f.dust);ok(dust.length>=12,'황소 흙먼지 '+dust.length);
 ok(s.fxs.some(f=>f.t==='ring'&&f.maxR>=30),'황소 충격 원이 커짐(30 이상)');}
// 몽둥이질: 땅 금
{const s=fire('mongdung');ok(s.fx.has('crack'),'몽둥이질 땅 금 ('+[...s.fx]+')');const c=s.fxs.find(f=>f.t==='crack');ok(c&&c.n>=6,'금 6줄 이상');}
// 저울질: 맞은 요괴마다 작은 저울
{const s=fire('jeouljil');const sc=s.fxs.filter(f=>f.t==='scale'&&!f.big);ok(sc.length>=1,'저울질 작은 저울 '+sc.length);}
// 저울은 고르다: 큰 저울 + 금빛 물결
{const s=fire('jijipil');ok(s.fxs.some(f=>f.t==='scale'&&f.big),'저울은 고르다 큰 저울');ok(s.fxs.some(f=>f.t==='ring'&&f.maxR>=150&&f.gold),'저울은 고르다 금빛 물결(피해 없는 원)');}
// 그림만 바꿈: 같은 장면 10초 피해가 바꾸기 전(v21.2.2)과 ±1% 안
const BASE={ssangkal:1427,hwangso:380,mongdung:524,jeouljil:1670}; // 이 장면에서 v21.2.2로 잰 값
for(const id in BASE){scene(id);for(let i=0;i<600;i++){G.queue.length=0;if(modal)show(null);G.P.hp=G.P.maxHp;update(1/60);}
 const d=Math.round((G.rs.dmg||{})[id]||0);console.log('  '+id+' 10초 피해',d,'(전',BASE[id]+')');ok(Math.abs(d-BASE[id])<=BASE[id]*0.01,id+' 피해가 그대로(±1%) '+d+' vs '+BASE[id]);}
}
if(fails.length){console.log('FAIL bj_vfx\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS bj_vfx');
