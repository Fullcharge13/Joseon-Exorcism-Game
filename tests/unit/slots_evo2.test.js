// v20.6 칸 줄이기 · 2단계 성장(설계 docs/specs/2026-11-06-칸-줄이기-2단계-성장-v20.6.md)
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
const eq9=(a,b)=>Math.abs(a-b)<1e-9;
{
// ---- 작업 1: 진화 Lv · 숙련의 힘은 실행 순간에만 붙음(한계 돌파와 같은 자리) ----
newGame('seonbi',[],0,'normal');G.queue.length=0;show(null);
const wid=Object.keys(WD).find(k=>WD[k].type==='w'&&!WD[k].fuse&&k!==CHARS.seonbi.start&&!WD[k].job),cid=Object.keys(WD).find(k=>WD[k].type==='c');
const peek=(w)=>{const P=G.P,d=WD[w.id],u=d.upd;let seen=null;d.upd=()=>{seen={m:P.might,c:P.cd};};try{runW(w,1/60,P);}finally{d.upd=u;}return seen;};
const base={m:G.P.might,c:G.P.cd};
const w0=peek({id:wid,lv:5,evo:true,ev2:0,t:0}),w3=peek({id:wid,lv:5,evo:true,ev2:3,t:0}),w5=peek({id:wid,lv:5,evo:true,ev2:5,t:0});
ok(eq9(w0.m,base.m)&&eq9(w0.c,base.c),'진화 Lv 0은 그대로');
ok(eq9(w3.m,base.m*(1+3*EV2_STEP))&&eq9(w3.c,base.c*0.95),'진화 Lv 3: 피해 ×(1+3·EV2_STEP)·재사용 ×0.95 (보정이 진화 Lv뿐이어도) — 힘 '+(w3.m/base.m).toFixed(3)+' 재사용 '+(w3.c/base.c).toFixed(4));
ok(eq9(w5.m,base.m*(1+5*EV2_STEP))&&eq9(w5.c,base.c*0.9025),'진화 Lv 5: 피해 ×(1+5·EV2_STEP)·재사용 ×0.9025 — '+(w5.m/base.m).toFixed(3)+' / '+(w5.c/base.c).toFixed(4));
const c3=peek({id:cid,lv:5,mas:3,t:0}),c1=peek({id:cid,lv:5,mas:1,t:0});
ok(eq9(c1.m,base.m*1.1)&&eq9(c1.c,base.c),'숙련 1: 피해 ×1.1');
ok(eq9(c3.m,base.m*1.3)&&eq9(c3.c,base.c*0.9),'숙련 3: 피해 ×1.3·재사용 ×0.9 — '+(c3.m/base.m).toFixed(3)+' / '+(c3.c/base.c).toFixed(3));
ok(eq9(G.P.might,base.m)&&eq9(G.P.cd,base.c),'실행 뒤 능력치는 원래대로');
ok(typeof EV2_MAX!=='undefined'&&EV2_MAX===5&&typeof MAS_MAX!=='undefined'&&MAS_MAX===3,'EV2_MAX 5 · MAS_MAX 3');
}
{
// ---- 작업 2: 칸 · 선택지 · 상자 ----
const W=Object.keys(WD).filter(k=>WD[k].type==='w'&&!WD[k].fuse&&!WD[k].job&&WD[k].evo),Pk=Object.keys(PD).filter(k=>!PD[k].job);
const fresh=(lvl)=>{newGame('seonbi',[],0,'normal','normal',7);G.queue.length=0;show(null);G.weapons.length=0;for(const k in G.passives)delete G.passives[k];G.P.lvl=lvl||10;};
const hands=(n)=>{const all=[];for(let i=0;i<(n||200);i++)all.push(...genOptions());return all;};
const has=(H,k,id)=>H.some(o=>o.k===k&&(id===undefined||o.id===id));
const mkW=(id,lv,o)=>({id,lv,evo:false,t:0.2,on:false,pos:[],...(o||{})});
// 무기 칸 4
fresh();for(const id of W.slice(0,3))G.weapons.push(mkW(id,1));ok(has(hands(),'wnew'),'무기 3개면 새 무기 카드가 나옴');
fresh();for(const id of W.slice(0,4))G.weapons.push(mkW(id,1));ok(!has(hands(),'wnew'),'무기 4개면 새 무기 카드 없음 (W_SLOTS '+(typeof W_SLOTS!=='undefined'?W_SLOTS:'-')+')');
// 보패 칸 4
fresh();for(const id of Pk.slice(0,3))G.passives[id]=1;ok(has(hands(),'pnew'),'보패 3개면 새 보패 카드가 나옴');
fresh();for(const id of Pk.slice(0,4))G.passives[id]=1;ok(!has(hands(),'pnew'),'보패 4개면 새 보패 카드 없음');
// 진화 순간 진화 Lv 1
fresh();{const id=W[0];G.weapons.push(mkW(id,5));G.passives[WD[id].evo]=1;recompute();openChest(1);const w=G.weapons.find(x=>x.id===id);ok(w.evo&&w.ev2===1,'진화하면 진화 Lv 1 (ev2 '+w.ev2+')');if(modal)show(null);}
// 진화 Lv 카드
fresh();{const id=W[0];G.weapons.push(mkW(id,5,{evo:true,ev2:2}));const H=hands();ok(has(H,'evup',id),'진화 Lv 2 무기에 「진화 Lv」 카드');
 const o=decorate({k:'evup',id});ok(/2/.test(o.badge)&&/3/.test(o.badge)&&/5/.test(o.badge),'카드에 지금 → 바뀐 뒤: '+o.badge);ok(o.desc.includes('+'+TRAIN_HP)&&o.desc.includes('+'+TRAIN_REGEN),'카드에 몸 단련 숫자 ('+o.desc+')');ok(o.desc.includes('+'+Math.round(EV2_STEP*100)+'%'),'카드의 피해 숫자 = EV2_STEP ('+o.desc+')');applyOpt(o);ok(G.weapons[0].ev2===3,'고르면 진화 Lv 3');
 G.weapons[0].ev2=5;ok(!has(hands(),'evup',id),'진화 Lv 5면 더 없음');}
// 숙련 카드
const C=Object.keys(WD).find(k=>WD[k].type==='c');
fresh();{G.weapons.push(mkW(C,5,{mas:0}));ok(has(hands(),'mas',C),'Lv 5 직업 기술에 「숙련」 카드');const o=decorate({k:'mas',id:C});applyOpt(o);ok(G.weapons[0].mas===1,'고르면 숙련 1 · '+o.badge);
 G.weapons[0].lv=4;G.weapons[0].mas=0;ok(!has(hands(),'mas',C),'Lv 4 기술에는 숙련 없음');G.weapons[0].lv=5;G.weapons[0].mas=3;ok(!has(hands(),'mas',C),'숙련 3이면 더 없음');}
// 합공: 높은 쪽 진화 Lv · 칸이 비면 새 무기
{const f=FUSE.find(f=>!WD[f.a].job&&!WD[f.b].job&&W.includes(f.a)&&W.includes(f.b))||FUSE[0];
 fresh();G.weapons.push(mkW(f.a,5,{evo:true,ev2:3}),mkW(f.b,5,{evo:true,ev2:1}));for(const id of W.filter(k=>k!==f.a&&k!==f.b).slice(0,2))G.weapons.push(mkW(id,1));
 ok(!has(hands(),'wnew'),'합공 전 무기 4개: 새 무기 없음');doFusion(f);const fw=G.weapons.find(x=>x.id===f.id);ok(fw&&fw.ev2===3,'합공 무기 진화 Lv = 높은 쪽 3 ('+(fw&&fw.ev2)+')');ok(has(hands(),'wnew'),'합공으로 칸이 비면 새 무기 카드');}
// 한계 돌파: 다 키운 것만
fresh(60);{const [a,b]=W;const Cs=Object.keys(WD).filter(k=>WD[k].type==='c').slice(0,2);
 G.weapons.push(mkW(a,5,{evo:true,ev2:3}),mkW(b,5,{evo:true,ev2:5}),mkW(Cs[0],5,{mas:2}),mkW(Cs[1],5,{mas:3}));
 const L=new Set(hands(400).filter(o=>o.k==='lb').map(o=>o.id));
 ok(L.has(b)&&L.has(Cs[1])&&!L.has(a)&&!L.has(Cs[0]),'한계 돌파는 진화 Lv 5·숙련 3만: '+[...L].join(','));}
// 진화가 막혀도 빈 창은 없음(Lv 5 무기 4개, 짝 없는 보패 4개 Lv 5)
fresh(10);{for(const id of W.slice(0,4))G.weapons.push(mkW(id,5));const pairs=new Set(W.slice(0,4).map(k=>WD[k].evo));for(const id of Pk.filter(k=>!pairs.has(k)).slice(0,4))G.passives[id]=PD[id].max;
 const H=genOptions();ok(H.length>0,'진화가 막혀도 선택지가 있음 ('+H.map(o=>o.k).join(',')+')');}
// 상자도 진화 Lv를 올림
fresh();{const id=W[0];G.weapons.push(mkW(id,5,{evo:true,ev2:1}));const r0=Math.random;openChest(1);if(modal)show(null);ok(G.weapons[0].ev2===2&&!(G.weapons[0].lb>0),'상자가 진화 Lv를 올림(한계 돌파가 아니라) ev2 '+G.weapons[0].ev2+' lb '+(G.weapons[0].lb||0));}
// 도움말의 칸 수가 상수와 같음(v20.6 마무리에서 「6개」가 남아 있던 것을 찾음)
ok(html.includes('무기는 '+W_SLOTS+'개, 보패는 '+P_SLOTS+'개'),'도움말 칸 수 = W_SLOTS·P_SLOTS');
// 막 끝 상자 상수
ok(typeof STAGE_CHEST!=='undefined'&&STAGE_CHEST===2,'막 끝 상자 강화 2');
// 설화 출정 시작 무기 ≤ 4
{let mx=0;for(const id of TALE_IDS){const S=TALES[id].start;if(S&&S.w)mx=Math.max(mx,S.w.filter(([w])=>WD[w]&&WD[w].type==='w').length);}ok(mx<=4,'설화 출정 시작 무기 ≤ 4 ('+mx+')');}
}
{
// ---- 작업 5 생존 보강: 진화 Lv·숙련이 1 오를 때마다 최대 체력 +6·초당 회복 +0.075(합공으로 줄지 않음 · 5-3 맞춤 1.5배) ----
const W=Object.keys(WD).filter(k=>WD[k].type==='w'&&!WD[k].fuse&&!WD[k].job&&WD[k].evo),C=Object.keys(WD).find(k=>WD[k].type==='c');
newGame('seonbi',[],0,'normal','normal',7);G.queue.length=0;show(null);G.weapons.length=0;for(const k in G.passives)delete G.passives[k];recompute();
const h0=G.P.maxHp,r0=G.P.regen;
ok(typeof TRAIN_HP!=='undefined'&&TRAIN_HP===6&&typeof TRAIN_REGEN!=='undefined'&&eq9(TRAIN_REGEN,0.075),'TRAIN_HP 6 · TRAIN_REGEN 0.075');
const id=W[0];G.weapons.push({id,lv:5,evo:false,t:0.2,on:false,pos:[]});G.passives[WD[id].evo]=1;recompute();const h1=G.P.maxHp,r1=G.P.regen;
openChest(1);if(modal)show(null);
ok(eq9(G.P.maxHp-h1,6)&&eq9(G.P.regen-r1,0.075),'진화 순간(진화 Lv 1): 체력 +6 · 회복 +0.075 — '+(G.P.maxHp-h1)+' / '+(G.P.regen-r1).toFixed(3));
applyOpt(decorate({k:'evup',id}));applyOpt(decorate({k:'evup',id}));
ok(eq9(G.P.maxHp-h1,18)&&eq9(G.P.regen-r1,0.225),'진화 Lv 3: 체력 +18 · 회복 +0.225 — '+(G.P.maxHp-h1));
G.weapons.push({id:C,lv:5,mas:0,t:0.2,on:false,pos:[]});applyOpt(decorate({k:'mas',id:C}));
ok(eq9(G.P.maxHp-h1,24),'숙련 1 더: 체력 +24 — '+(G.P.maxHp-h1));
const keep=G.P.maxHp;G.weapons[0].ev2=5;applyOpt(decorate({k:'evup',id}));ok(eq9(G.P.maxHp,keep),'진화 Lv 5에서 더 오르지 않으면 체력도 그대로');
const f=FUSE.find(f=>W.includes(f.a)&&W.includes(f.b));if(f){G.weapons.length=0;G.weapons.push({id:f.a,lv:5,evo:true,ev2:3,t:0,pos:[]},{id:f.b,lv:5,evo:true,ev2:2,t:0,pos:[]});recompute();const hb=G.P.maxHp;doFusion(f);recompute();ok(eq9(G.P.maxHp,hb),'합공해도 쌓인 체력은 줄지 않음 '+hb+' → '+G.P.maxHp);}
}
if(fails.length){console.log('FAIL slots_evo2\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS slots_evo2');
