// v19.0 6차 기술 시험 도우미: 기술 하나만 쥔 퇴마사 둘레에 요괴 30·엘리트 1을 두고 sec초 돌린다(같은 씨앗).
// opt: {none:true(기술 없이 같은 장면 — 비교용), cid, seed, w:{awk,lb}(무기 칸에 덧붙일 값), setup:()=>{}(요괴를 직접 놓을 때), tale:true(설화 「회복 없음」)}
function skillCid(id){for(const c in CHARS)for(const b of CHARS[c].branches)if(b.tiers.some(t=>t.skill===id))return c;return 'seonbi';}
function skillRun(id,lv,sec,opt={}){let s=opt.seed||5;const r0=Math.random;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;};
 /* v19.2 검토 지적: 맞는 소리는 실제 시간 45ms마다 Math.random을 써서 기기 빠르기가 씨앗 순서를 흔듦 → 도는 동안 시계를 1초씩 가게 해 늘 같은 순서 */
 const pn0=performance.now;let clk=0;performance.now=()=>(clk+=1000);lastHit=-1e12;
 let err=null,dmg=0;try{
  newGame(opt.cid||skillCid(id),'gilil',0,'normal');G.queue.length=0;show(null);const P=G.P;P.hp=P.maxHp=1e9;
  G.weapons=opt.none?[]:[Object.assign({id,lv,evo:false,t:0.2,on:false,pos:[]},opt.w||{})];G.passives={};recompute();G.enemies.length=0;
  if(opt.setup)opt.setup();else{const st=curStg();for(let i=0;i<30;i++){const a=i*2.399,d=30+(i%7)*14;spawnEnemy(st.early[i%st.early.length],P.x+Math.cos(a)*d,P.y+Math.sin(a)*d*0.8);}
   const e=spawnEnemy(st.early[0],P.x+50,P.y);e.elite=true;
   for(const o of G.enemies)if(!o.prop)o.hp=o.maxHp=1e5;}   // 쓰러지지 않게 해 「준 피해」를 그대로 잰다(요괴 수가 피해 상한이 되지 않게)
  const n=Math.round(sec*60);for(let i=0;i<n;i++){G.queue.length=0;P.xp=0;if(opt.each)opt.each(i);update(1/60);}
  dmg=(G.rs.dmg&&G.rs.dmg[id])||0;}catch(e){err=e.message+' '+(e.stack||'').split('\n')[1];}finally{Math.random=r0;performance.now=pn0;}
 return {dmg,err,G};}
