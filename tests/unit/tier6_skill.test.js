// v19.0 6차 인물·기술: 이름·소개·출처 · 기술 Lv1~5가 피해를 주고 오류 없음 · 기술마다 특별 규칙(보스는 묶이지 않음 등)
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tier6_helpers.js
const SIX={seonbi:['다산 정약용','어사 박문수'],uiwon:['구암 허준','신의 백광현'],jangsu:['충무공 이순신','홍의장군 곽재우'],mudang:['토정 이지함','격암 남사고'],gisaeng:['명월 황진이','의기 논개'],sangin:['거상 임상옥','도반수 백달원']};   // v19.1 무당·기생·상인
for(const cid in SIX)SIX[cid].forEach((nm,b)=>{const t=CHARS[cid].branches[b].tiers[5];
 ok(t&&t.name===nm,`${cid} 갈래${b} 6차 이름 ${nm}: ${t&&t.name}`);
 ok(t&&t.who&&t.who.length>8&&/^https:\/\/encykorea\.aks\.ac\.kr\//.test(t.src||''),`${nm} 소개·고증 출처`);
 ok(t&&WD[t.skill]&&WD[t.skill].type==='c'&&WD[t.skill].max===5&&WD[t.skill].desc.length===5,`${nm} 기술 ${t&&t.skill} 직업 기술·5단계`);
 ok(t&&typeof t.apply==='function'&&t.bonus&&t.look,`${nm} 보너스·차림`);});
// 6차 기술 아이디가 기존 무기·기술을 덮어쓰지 않음(v19.1 지게 사고: 상인 무기 「등짐 지게」 jige를 덮어 합공 설명이 깨졌음)
ok(WD.jige&&WD.jige.type==='w'&&WD.jige.name==='등짐 지게','기존 무기 jige(등짐 지게) 그대로');
for(const c in CHARS)for(const b of CHARS[c].branches){const t=b.tiers[5];if(t)ok(!PD[t.skill]&&!BLESS[t.skill]&&!EN[t.skill],'6차 기술 아이디 '+t.skill+'가 보패·축복·요괴 아이디와 겹치지 않음(봉인·카드가 아이디를 함께 씀)');}
for(const f of Object.values(FUSE))ok(WD[f.a]&&WD[f.b]&&WD[f.a].evoName&&WD[f.b].evoName,'합공 '+f.id+' 재료 무기 그대로 '+f.a+'+'+f.b);
// 기술 기본: Lv1~5 모두 피해 > 0 · 오류 없음 · Lv5가 Lv1보다 셈
const IDS=Object.values(SIX).flat().map((nm,i)=>{for(const c in SIX){const b=SIX[c].indexOf(nm);if(b>=0)return CHARS[c].branches[b].tiers[5]&&CHARS[c].branches[b].tiers[5].skill;}}).filter(Boolean);
for(const id of IDS){const r=[];for(let lv=1;lv<=5;lv++)r.push(skillRun(id,lv,10));
 ok(r.every(x=>!x.err),`${id} 오류 없음 ${r.map(x=>x.err).filter(Boolean)[0]||''}`);
 ok(r.every(x=>x.dmg>0),`${id} Lv1~5 피해 > 0: ${r.map(x=>Math.round(x.dmg)).join('/')}`);
 ok(r[4].dmg>r[0].dmg,`${id} Lv5 > Lv1: ${Math.round(r[0].dmg)} → ${Math.round(r[4].dmg)}`);}
const has=id=>IDS.includes(id);
// 보스 한 마리만 둔 장면
const bossOnly=()=>{const P=G.P;spawnBoss(curStg().boss,false);const e=G.boss;e.x=P.x+40;e.y=P.y;};
// 어사 박문수 「봉고파직」: 보스는 묶지 않음(움직임이 끈 때와 같음) · 받는 피해 표식
if(has('bonggo')){const track=[];const a=skillRun('bonggo',5,6,{setup:bossOnly,each:i=>{if(i%30===0)track.push([G.boss.x|0,G.boss.y|0,G.boss.frz||0]);}});
 ok(!a.err&&track.every(t=>t[2]<=0),'봉고파직: 보스는 묶이지 않음(frz 0) '+JSON.stringify(track.slice(0,4)));
 ok(G.boss&&(G.boss.mark||0)>0,'봉고파직: 보스에 받는 피해 표식');}
// 정약용 「거중기」: 옹기만 있어도 오류 없이 깨짐
if(has('geojung')){const r=skillRun('geojung',3,8,{setup:()=>{for(let i=0;i<5;i++)spawnPot();}});ok(!r.err,'거중기: 옹기만 있을 때 오류 없음 '+(r.err||''));}
// 허준 「백 첩 탕약」: 본편 회복 · 설화 「회복 없음」 규칙에서는 회복 0
if(has('tangyak')){const h={};for(const [k,tale,sk,curse] of [['본편',false,true],['본편 기술 없음',false,false],['설화',true,true],['설화 기술 없음',true,false],['흉년',false,true,1],['흉년 기술 없음',false,false,1]]){skillRun('tangyak',5,0.01,{setup:()=>{}});const P=G.P;P.maxHp=500;P.hp=250;
  if(!sk)G.weapons=[];if(tale)TALE_RULE_FN.noHeal.start();if(curse)G.mods.noTteok=true;   // 흉년 저주·곡식 규칙도 noTteok를 켬(떡만 막음)   // 설화 「돌아갈 길 없음」 규칙이 켜는 값 그대로
  for(let i=0;i<600;i++){G.queue.length=0;P.xp=0;P.iframe=9;update(1/60);}h[k]=P.hp;}   // 맞는 피해는 막아 회복만 비교
 ok(h['본편']>h['본편 기술 없음']+5,'탕약: 본편 10초 회복 '+JSON.stringify(h));ok(Math.abs(h['설화']-h['설화 기술 없음'])<1e-6,'탕약: 설화 「회복 없음」에서는 탕약 회복 없음 '+JSON.stringify(h));ok(h['흉년']>h['흉년 기술 없음']+5,'탕약: 흉년(떡만 막힘)에서는 회복함 '+JSON.stringify(h));}
// 백광현 「대침 발근」: 체력이 가장 많은 요괴가 가장 많이 깎임 · 둘레 요괴도 피해
if(has('daechim')){const S=[];skillRun('daechim',1,5,{setup:()=>{const P=G.P,id=curStg().early[0];for(const [dx,hp] of [[20,200],[34,2000],[48,600]]){const e=spawnEnemy(id,P.x+dx,P.y);e.hp=e.maxHp=hp;e.spd=0;S.push(e);}}});
 const lost=S.map(e=>e.maxHp-Math.max(0,e.hp));ok(lost[1]>=Math.max(lost[0],lost[2])&&lost[0]>0,'대침: 가장 센 요괴에 꽂고 둘레도 피해 '+lost.map(Math.round).join('/'));}
// 이순신 「울돌목 회오리」: 보스는 끌려오지 않음 · 일반 요괴는 가운데로
if(has('uldolmok')){const bA=bossAI;bossAI=()=>{};   // 보스의 제 움직임(돌진 등)은 빼고 끌려오는지만 본다
 const pos=sk=>{skillRun('uldolmok',5,4,{setup:()=>{bossOnly();G.boss.hp=G.boss.maxHp=1e9;G.boss.spd=0;for(let i=0;i<6;i++){const e=spawnEnemy(curStg().early[0],G.boss.x+18+(i%2)*4,G.boss.y-6+i*2);e.spd=0;e.hp=e.maxHp=1e6;}},seed:9,none:!sk});return [G.boss.x,G.boss.y];};
 const p1=pos(true),p0=pos(false);bossAI=bA;ok(Math.hypot(p1[0]-p0[0],p1[1]-p0[1])<0.5,'회오리: 보스 곁 요괴 무리에 회오리가 생겨도 보스 자리는 기술 없을 때와 같음 '+JSON.stringify([p1,p0].map(p=>p.map(Math.round))));
 const S=[];skillRun('uldolmok',5,0.01,{setup:()=>{const P=G.P;for(let i=0;i<12;i++){const e=spawnEnemy(curStg().early[0],P.x+50+(i%4)*10,P.y+((i/4)|0)*10-10);e.spd=0;e.hp=e.maxHp=1e6;S.push([e,e.x,e.y]);}}});
 for(let i=0;i<180;i++){G.queue.length=0;G.P.xp=0;update(1/60);}const moved=S.filter(([e,x,y])=>Math.hypot(e.x-x,e.y-y)>2).length;ok(moved>=6,'회오리: 멈춘 요괴 12마리 중 끌려간 수 '+moved);}
// 곽재우 「홍의 의병」: 60초 돌려도 의병 ≤ 4 · 오류 없음
if(has('uibyeong')){const r=skillRun('uibyeong',5,60);const n=G.spirits.filter(s=>s.own==='uibyeong').length;ok(!r.err&&n>=2&&n<=8,'의병 상한 8: '+n+' '+(r.err||''));
 // 검토 지적: 투사체 보너스가 있어도 「의병 +1」 카드가 헛되지 않음(레벨마다 의병 수나 피해가 늘어남)
 for(const am of [0,1,2,3,4]){let prev=null;for(let lv=1;lv<=5;lv++){skillRun('uibyeong',lv,0.05,{setup:()=>{}});G.P.amount=am;G.spirits.length=0;const w=G.weapons[0];WD.uibyeong.upd(w,0.016,G.P);
  const c=G.spirits.filter(s=>s.own==='uibyeong'),cur=[c.length,c[0]?c[0].dmg:0];if(prev)ok(cur[0]>prev[0]||cur[1]>prev[1]||lv===3||lv===5,`의병 Lv${lv-1}→${lv} 투사체+${am}: ${prev}→${cur}`);prev=cur;}}}
// 검토 지적: 울돌목 회오리 끄는 힘이 레벨에 따라 커짐(Lv1 장판과 Lv5 장판에 요괴 하나를 같은 자리에 두고 0.5초 끌린 거리)
{const mk=lv=>{let z=null;skillRun('uldolmok',lv,0.01,{setup:()=>{}});const P=G.P;G.zones.length=0;G.weapons[0].t=0;G.enemies.length=0;const e0=spawnEnemy(curStg().early[0],P.x+60,P.y);e0.spd=0;e0.hp=e0.maxHp=1e7;
  WD.uldolmok.upd(G.weapons[0],0.016,P);z=G.zones[0];G.zones.length=1;z.x=P.x+40;z.y=P.y;z.life=z.max=9;G.weapons=[];const e=e0;e.x=z.x+z.r*0.7;e.y=z.y;const x0=e.x;for(let i=0;i<30;i++){G.queue.length=0;P.xp=0;update(1/60);}return x0-e.x;};
 const d1=mk(1),d5=mk(5);ok(d5>d1*1.2&&d1>0,'회오리 끄는 힘 Lv1 '+d1.toFixed(1)+' < Lv5 '+d5.toFixed(1));}

// ---- v19.1 ----
const bossFixed=(id,sk)=>{const bA=bossAI;bossAI=()=>{};let p;try{skillRun(id,5,4,{setup:()=>{bossOnly();G.boss.hp=G.boss.maxHp=1e9;G.boss.spd=0;for(let i=0;i<6;i++){const e=spawnEnemy(curStg().early[0],G.boss.x+18+(i%2)*4,G.boss.y-6+i*2);e.spd=0;e.hp=e.maxHp=1e6;}},seed:9,none:!sk});p=[G.boss.x,G.boss.y];}finally{bossAI=bA;}return p;};
// 토정비결: 씨앗 30개에서 길·흉·대길 셋 다 나옴
if(has('tojeong')){const seen=new Set();for(let sd=1;sd<=30;sd++){skillRun('tojeong',3,0.2,{seed:sd});const w=G.weapons[0];w.t=0;skillRun('tojeong',3,5.5,{seed:sd});seen.add(G.weapons[0].last);}ok(['gil','hyung','daegil'].every(k=>seen.has(k)),'토정비결 괘 셋 다 나옴: '+[...seen].join(','));}
// 천기누설: 요괴 탄이 있으면 줄어듦 · 탄·경고가 없으면 오류 없이 요괴에 피해
if(has('cheongi')){let before=0,after=0;skillRun('cheongi',5,0.02,{setup:()=>{const P=G.P;for(let i=0;i<30;i++){const e=spawnEnemy(curStg().early[0],P.x+60,P.y+(i%5)*6);e.spd=0;e.hp=e.maxHp=1e6;}},each:i=>{if(i===0){const P=G.P;for(let k=0;k<20;k++)G.ebul.push({x:P.x+50+(k%5)*3,y:P.y-30+((k/5)|0)*3,vx:0,vy:0,r:2,dmg:0,life:99});before=G.ebul.length;}}});
 const r=skillRun('cheongi',5,5,{each:i=>{if(i===1){const P=G.P;for(let k=0;k<20;k++)G.ebul.push({x:P.x+50+(k%5)*3,y:P.y-30+((k/5)|0)*3,vx:0,vy:0,r:2,dmg:0,life:99});before=G.ebul.filter(q=>q.life>0).length;}}});after=G.ebul.filter(q=>q.life>0).length;
 ok(!r.err&&before>=20&&after<before,'천기누설: 요괴 탄 '+before+' → '+after);const r2=skillRun('cheongi',1,6);ok(!r2.err&&r2.dmg>0,'천기누설: 탄·경고 없을 때도 요괴에 피해 '+Math.round(r2.dmg));}
// 벽계수: 보스는 밀리지 않음 · 일반 요괴는 밀려남
if(has('byeokgye')){const p1=bossFixed('byeokgye',true),p0=bossFixed('byeokgye',false);ok(Math.hypot(p1[0]-p0[0],p1[1]-p0[1])<0.5,'벽계수: 보스 자리 그대로 '+JSON.stringify([p1,p0].map(p=>p.map(Math.round))));
 const S=[];skillRun('byeokgye',5,3,{setup:()=>{const P=G.P;for(let i=0;i<8;i++){const a=i/8*TAU,e=spawnEnemy(curStg().early[0],P.x+Math.cos(a)*30,P.y+Math.sin(a)*30);e.spd=0;e.hp=e.maxHp=1e6;S.push(e);}}});const d=S.reduce((a,e)=>a+Math.hypot(e.x-G.P.x,e.y-G.P.y),0)/S.length;ok(d>34,'벽계수: 둘레 요괴가 밀려남(평균 거리 30 → '+d.toFixed(1)+')');}
// 남강의 물결: 같은 체력이면 엘리트가 더 많이 깎임
if(has('namgang')){let A,B;skillRun('namgang',3,6,{setup:()=>{const P=G.P;P.dirx=1;P.diry=0;P.face=1;A=spawnEnemy(curStg().early[0],P.x+40,P.y-4);B=spawnEnemy(curStg().early[0],P.x+40,P.y+4);for(const e of [A,B]){e.spd=0;e.hp=e.maxHp=1e6;}B.elite=true;}});
 const la=1e6-A.hp,lb=1e6-B.hp;ok(la>0&&lb>la*1.3,'남강: 일반 '+Math.round(la)+' < 엘리트 '+Math.round(lb));}
// 인삼 교역: 엽전 없이도 30초 안에 터짐 · 엽전을 주우면 더 빨리
if(has('insamgyo')){const first=coinEach=>{let t=null;skillRun('insamgyo',3,30,{setup:()=>{},each:i=>{if(coinEach&&i%30===0)G.coins+=5;if(t===null&&G.weapons[0].pops>0)t=i/60;}});return t;};
 const t0=first(false),t1=first(true);ok(t0!==null&&t0<=30,'인삼 교역: 엽전 없이 '+t0+'초에 터짐');ok(t1!==null&&t1<t0,'인삼 교역: 엽전을 주우면 더 빨리 '+t1+'초');}
// 지게 행렬: 동료 ≤ 8 · 투사체 0~4에서 레벨마다 늘어남 · 체력 25%에서 피하기 한 번(자리 바뀜·무적) · 쿨타임 안에는 다시 안 함
if(has('jigehaeng')){skillRun('jigehaeng',5,30);const n=G.spirits.filter(s=>s.own==='jigehaeng').length;ok(n>=2&&n<=8,'지게 동료 상한 8: '+n);
 for(const am of [0,2,4]){let prev=null;for(let lv=1;lv<=5;lv++){skillRun('jigehaeng',lv,0.05,{setup:()=>{}});G.P.amount=am;G.spirits.length=0;WD.jigehaeng.upd(G.weapons[0],0.016,G.P);const c=G.spirits.filter(s=>s.own==='jigehaeng'),cur=[c.length,c[0]?c[0].dmg:0];
  if(prev)ok(cur[0]>prev[0]||cur[1]>prev[1],`지게 Lv${lv-1}→${lv} 투사체+${am}: ${prev}→${cur}`);prev=cur;}}
 skillRun('jigehaeng',3,0.05,{setup:()=>{const P=G.P;const e=spawnEnemy(curStg().early[0],P.x+10,P.y);e.spd=0;e.hp=e.maxHp=1e7;}});const P=G.P;P.maxHp=100;P.hp=24;const x0=P.x,y0=P.y;let n1=0,moved=0,ifr=0;
 for(let i=0;i<120;i++){G.queue.length=0;P.xp=0;P.hp=Math.min(P.hp,24);const px=P.x,py=P.y;update(1/60);if(Math.hypot(P.x-px,P.y-py)>8){n1++;moved=Math.hypot(P.x-x0,P.y-y0);ifr=P.iframe||0;}}
 ok(n1===1&&moved>20&&ifr>0.5,'지게 피하기: 2초 안에 한 번만, 옮긴 거리 '+moved.toFixed(1)+' (번 '+n1+', 무적 '+ifr.toFixed(2)+')');}
// v19.1 검토 지적: 천기누설은 움직이는 탄이 별이 떨어질 때 있을 자리를 노림
if(has('cheongi')){skillRun('cheongi',1,0.01,{setup:()=>{}});const P=G.P,w=G.weapons[0];G.ebul.length=0;G.warns.length=0;G.ebul.push({x:P.x+60,y:P.y,vx:50,vy:0,r:2,dmg:0,life:99});w.t=0;WD.cheongi.upd(w,0.016,P);
 const z=G.warns.find(z=>z.friendly);ok(z&&Math.abs(z.x-(P.x+60+50*z.t))<1.5,'천기누설: 움직이는 탄의 앞날 자리를 노림 '+(z&&[z.x-P.x,z.t].map(v=>v.toFixed(2))));}
// v19.1 검토 지적: 지게 피하기는 가까운 요괴가 있을 때만 · 보스가 끌어당기는 동안에는 안 함
if(has('jigehaeng')){const esc=(setup)=>{skillRun('jigehaeng',3,0.05,{setup:()=>{}});const P=G.P;P.maxHp=100;setup(P);const x0=P.x,y0=P.y;for(let i=0;i<30;i++){G.queue.length=0;P.xp=0;P.hp=20;update(1/60);}return Math.hypot(P.x-x0,P.y-y0)>20;};
 ok(!esc(P=>{}),'지게 피하기: 둘레에 요괴가 없으면 안 함');ok(esc(P=>{const e=spawnEnemy(curStg().early[0],P.x+12,P.y);e.spd=0;e.hp=e.maxHp=1e7;}),'지게 피하기: 요괴가 붙으면 함');
 ok(!esc(P=>{const e=spawnEnemy(curStg().early[0],P.x+12,P.y);e.spd=0;e.hp=e.maxHp=1e7;G.pull={x:P.x+80,y:P.y,t:2,str:1};}),'지게 피하기: 보스가 끌어당기는 동안에는 안 함');}
if(fails.length){console.log('FAIL tier6_skill ('+fails.length+')\n  '+fails.slice(0,30).join('\n  '));process.exitCode=1;}else console.log('PASS tier6_skill');
