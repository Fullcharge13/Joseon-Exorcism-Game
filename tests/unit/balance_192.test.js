// v19.2 밸런스 검수(사용자 결정 A): 약한 6차 기술 셋 약 1.8배 · 「주판」 진화 0.75배·합공 「약방울」 +20% 없앰(×0.83) · 남강의 물결 피해 한 번 · 시작 무기 보너스는 5차까지
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tier6_helpers.js
// ① 약한 6차 기술: v19.1에서 잰 값(같은 장면·씨앗, Lv5 20초)의 1.7배 이상 — bonggo 4078 · tangyak 12370 · namgang 8161 (시계 고정한 skillRun으로 다시 잼)
for(const [id,v191] of [['bonggo',4078],['tangyak',12370],['namgang',8161]]){const d=skillRun(id,5,20).dmg;ok(d>=v191*1.7&&d<=v191*2.1,`${id} Lv5 20초 피해 ${Math.round(d)} (v19.1 ${v191}의 1.7~2.1배)`);}
// ② 「주판」 진화 주판알 피해 16 → 12, 합공 「약방울」 안의 두 무기 피해 배율 1.2 → 1(+20% 없앰)
{newGame('sangin','gilil',0,'normal');G.queue.length=0;show(null);const P=G.P;P.might=1;const seen=[];const sh=shoot;shoot=function(x,y,a,spd,kind,dmg){seen.push(dmg);};try{WD.jupan.upd({id:'jupan',lv:5,evo:true,t:0},0.016,P);}finally{shoot=sh;}
 ok(seen.length&&seen.every(d=>Math.abs(d-12)<1e-9),'천금 주판 주판알 피해 12: '+seen[0]);}
{const f=FUSE.find(f=>f.id==='f_yakbang');newGame(f.job||'uiwon','gilil',0,'normal');G.queue.length=0;show(null);const P=G.P;P.might=1;let m=null;const k=WD[f.a].upd;WD[f.a].upd=function(w,dt,P2){m=P2.might;};
 try{WD[f.id].upd({id:f.id,kids:[{id:f.a,lv:5,evo:true,t:9}],t:9},0.016,P);}finally{WD[f.a].upd=k;}ok(m!==null&&Math.abs(m-1)<1e-9,'약방울 안의 무기 배율 1(+20% 없앰): '+m);ok(!WD.f_yakbang.desc[0].includes('+20%'),'약방울 설명에 「+20%」 없음');
 const o=FUSE.find(x=>x.id!=='f_yakbang');let m2=null;const k2=WD[o.a].upd;WD[o.a].upd=function(w,dt,P2){m2=P2.might;};try{WD[o.id].upd({id:o.id,kids:[{id:o.a,lv:5,evo:true,t:9}],t:9},0.016,P);}finally{WD[o.a].upd=k2;}ok(Math.abs(m2-1.2)<1e-9,'다른 합공은 1.2 그대로: '+m2);}
// ③ 남강의 물결: 엘리트 한 마리에 한 번 맞히면 피해(숫자)는 한 번
{skillRun('namgang',3,0.01,{setup:()=>{}});const P=G.P;P.dirx=1;P.diry=0;const e=spawnEnemy(curStg().early[0],P.x+40,P.y);e.elite=true;e.spd=0;e.hp=e.maxHp=1e6;
 let n=0,amt=0;const h=hurt;hurt=function(t,...a){if(t===e){n++;amt=a[0];}return h.call(this,t,...a);};const w=G.weapons[0];w.t=0;try{WD.namgang.upd(w,0.016,P);}finally{hurt=h;}ok(n===1,'남강: 엘리트에 한 번만 피해 '+n);ok(Math.abs(amt/(94*P.might)-1.6)<1e-6,'남강 Lv3: 엘리트 피해는 94×공격력×1.6 한 번: '+amt);}
// ④ 시작 무기 보너스: 6차여도 5차와 같은 배율
{newGame('seonbi','gilil',0,'normal');G.queue.length=0;show(null);const P=G.P,id=CHARS.seonbi.start,w=G.weapons.find(w=>w.id===id);let m=[];const u=WD[id].upd;WD[id].upd=function(w,dt,P2){m.push(P2.might);};
 try{for(const t of [5,6]){P.tier=t;P.might=1;runW(w,0.016,P);}}finally{WD[id].upd=u;}ok(Math.abs(m[0]-m[1])<1e-9&&Math.abs(m[0]-(1+START_TIER_B*5))<1e-9,'시작 무기 배율 5차 '+m[0]+' = 6차 '+m[1]);}
// ⑤ 도움말: 합공 +20% 설명에 약방울 예외
{openHelp('title');let all='';for(const t of ['basic','class','sys','weapon','fuse','etc']){try{helpTab=t;renderHelp();all+=$('#helpBody').innerHTML;}catch(e){}}const i=all.indexOf('두 무기의 공격은 피해 +20%');ok(i>=0&&/약방울/.test(all.slice(i,i+50)),'도움말 합공 +20% 옆에 약방울 예외: '+all.slice(i,i+40));show(null);}
if(fails.length){console.log('FAIL balance_192\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS balance_192');
