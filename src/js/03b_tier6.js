/* ======================= v19.0 6차 전직 (설계 docs/specs/2026-11-02-6차-전직.md) =======================
   5차를 마친 퇴마사가 Lv 60에 조선의 실존 인물로 전직한다. 인물·기술·차림은 이 파일의 표에만 둔다.
   갈래의 6번째 칸: {name, skill, bonus, apply, look, who(소개 한 줄), src(고증 출처 주소)} */
const TIER6_LV=60;
function tierMax(cid,b){const C=CHARS[cid],br=C&&C.branches&&C.branches[b];return br?br.tiers.length:5;}
/* 5차를 마쳤고 Lv 60 이상이며 그 갈래에 6차 칸이 있으면 전직 대기열에 한 번 */
function queueTier6(){const P=G.P;if(P.tier===5&&P.lvl>=TIER6_LV&&tierMax(G.cid,P.branch)>5&&!G.queue.includes('adv'))G.queue.push('adv');}
/* 6차 발밑 고리: 옅은 금빛 타원 + 1초에 한 바퀴 도는 점 셋(영웅보다 먼저 그림) */
function drawTier6Ring(x,y){const t=G.time*TAU;b.globalAlpha=0.35;b.strokeStyle='#e0b048';b.lineWidth=1;b.beginPath();b.ellipse(R(x),R(y)+0.5,9,3,0,0,TAU);b.stroke();
 b.globalAlpha=0.8;b.fillStyle='#ffe3a0';for(let i=0;i<3;i++){const a=t+i*TAU/3;b.fillRect(R(x+Math.cos(a)*9),R(y+Math.sin(a)*3),1,1);}b.globalAlpha=1;}

/* ---- 6차 공용 ---- */
/* 화면 안 요괴 가운데 둘레 r 안에 다른 요괴가 가장 많은 자리 */
function t6Dense(r){let best=null,bn=-1;const vs=G.enemies.filter(e=>!e.dead&&!e.prop&&!e.inv&&inView(e));for(const e of vs){let n=0;for(const o of vs)if((o.x-e.x)**2+(o.y-e.y)**2<r*r)n++;if(n>bn){bn=n;best=e;}}return best;}
/* 화면 안에서 체력이 많은 요괴 n마리(보스 제외 여부 선택) */
function t6Strong(n,noBoss){return G.enemies.filter(e=>!e.dead&&!e.prop&&!e.inv&&inView(e)&&!(noBoss&&e.boss)).sort((a,c)=>c.hp-a.hp).slice(0,n);}
ITEMS.ruler=[...col(11,3,11,'y'),[10,4,'k'],[10,6,'k'],[10,8,'k'],[10,10,'k']];   // 측량 자(정약용)

/* ---- 선비 ---- */
Object.assign(WD,{
 geojung:{name:'거중기',type:'c',g:'擧',col:'#6a5a4a',max:5,desc:['도르래로 큰 돌을 들어 올려 요괴가 가장 많이 몰린 곳에 떨어뜨린다. 맞은 요괴는 잠깐 굳는다.','돌 +1','피해 +, 범위 +','피해 +','돌 셋이 이어 떨어진다'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const n=L5(w,[1,2,2,2,3]),r=L5(w,[34,38,42,42,46])*P.area,dmg=L5(w,[70,80,100,120,140])*P.might;
   const tg0=t6Dense(40)||nearest(P.x,P.y,200);for(let i=0;i<n;i++){const tg=tg0;const x=tg?tg.x+rnd(-8,8):P.x+rnd(-60,60),y=tg?tg.y+rnd(-6,6):P.y+rnd(-40,40);
    warn({x,y,r,t:0.6+i*0.25,dmg,friendly:1,col:'#a89c8a',on:z=>{for(const e of near(z.x,z.y,z.r,TMP2))if(!e.boss&&!e.dead)e.frz=Math.max(e.frz,0.6);particle(z.x,z.y,'#8a8494',10,70,0.5);}});}
   w.t=L5(w,[6,6,5.5,5,5])*P.cd;}},
 bonggo:{name:'봉고파직',type:'c',g:'封',col:'#7a2018',max:5,desc:['화면에서 가장 센 요괴 셋에 「封」 도장을 찍어 잠시 묶은 뒤 크게 친다. 보스는 묶이지 않고, 받는 피해가 늘어난다.','도장 +1','묶는 시간 +','피해 +','도장 +1, 피해 +25%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const n=L5(w,[3,4,4,4,5]),hold=L5(w,[2,2,2.5,2.5,2.5]),dmg=L5(w,[144,162,180,225,288])*P.might;   /* v19.2 ×1.8(자동 플레이 피해 비중 1%) */
   for(const e of t6Strong(n,false)){G.fx.push({t:'bolt',x:e.x,y:e.y,life:0.2,max:0.2,seed:Math.random()*99,col:'#e0b048'});
    if(e.boss){e.mark=G.time+4;hurt(e,dmg*0.5,0);continue;}e.frz=Math.max(e.frz,hold);qpush({t:hold,f:()=>{if(!e.dead){hurt(e,dmg,0);particle(e.x,e.y,'#c23b2a',6,50,0.4);}}});}
   w.t=L5(w,[5,5,4.5,4.5,4])*P.cd;}}});
{const S=CHARS.seonbi.branches;
 S[0].tiers.push({name:'다산 정약용',skill:'geojung',bonus:'공격력 +25% · 재사용 −10%',apply:B=>{B.might+=0.25;B.cd*=0.9;},look:lk('gat','#3a5f9e',{T:'#efe6d2',item:'ruler'}),
  who:'수원 화성을 설계하고 거중기를 고안한 실학자.',src:'https://encykorea.aks.ac.kr/Article/E0050549'});
 S[1].tiers.push({name:'어사 박문수',skill:'bonggo',bonus:'이동 속도 +15% · 최대 체력 +40',apply:B=>{B.spd+=0.15;B.maxHp+=40;},look:lk('paraengi','#8a8494',{T:'#a89c8a',item:'mapae'}),
  who:'영조 때 어사로 이름을 떨쳐 「암행어사 박문수」 이야기의 주인공이 되었다.',src:'https://encykorea.aks.ac.kr/Article/E0020693'});}

/* ---- 의원 ---- */
/* 설화 「돌아갈 길 없음」(회복 없음) 규칙이면 6차 기술의 회복도 없다(규칙 시작에서 G.mods.noHeal) */
function t6CanHeal(){return !G.mods.noHeal;}   // 검토 지적: noTteok(떡 막기)는 흉년 저주·곡식 규칙도 켜므로 「돌아갈 길 없음」 규칙만의 표시를 씀
ITEMS.bigchim=[[11,1,'y'],...col(11,2,10,'x'),[10,10,'n']];   // 큰 침(백광현)
Object.assign(WD,{
 tangyak:{name:'백 첩 탕약',type:'c',g:'湯',col:'#3f9a5a',max:5,desc:['약 달이는 김이 몸 둘레에 퍼진다. 김 속의 요괴는 느려지고 피해를 입으며, 퇴마사는 조금씩 회복한다.','범위 +','회복 +','느려짐 +, 피해 +','피해 +30%, 회복 +'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const r=L5(w,[40,48,48,52,56])*P.area,dmg=L5(w,[18,22,22,29,36])*P.might,hv=L5(w,[1.5,1.5,2.2,2.2,3]);
   for(const e of near(P.x,P.y,r,TMP2).slice()){if(e.dead)continue;if(!e.boss)e.slow=Math.max(e.slow||0,L5(w,[0.8,0.8,0.8,1.2,1.2]));hurt(e,dmg,0);}
   if(t6CanHeal())heal(hv);G.fx.push({t:'ring',x:P.x,y:P.y,r:4,maxR:r,col:'#9af0b0',life:0.5,max:0.5});w.t=1*P.cd;}},
 daechim:{name:'대침 발근',type:'c',g:'針',col:'#8a8494',max:5,desc:['체력이 가장 많은 요괴에 큰 침을 꽂아 3초 동안 독을 뽑는다. 다 뽑으면 그 독이 둘레로 터진다.','피해 +','침 +1','터지는 범위 +','침 +1, 피해 +30%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const n=L5(w,[1,1,2,2,3]),tk=L5(w,[14,18,18,20,26])*P.might,bd=L5(w,[50,60,60,72,90])*P.might,r=L5(w,[26,26,26,34,36])*P.area;
   for(const e of t6Strong(n,false)){for(let i=1;i<=6;i++)qpush({t:i*0.5,f:()=>{if(!e.dead){hurt(e,tk,0);particle(e.x,e.y-4,'#b07fd0',2,30,0.3);}}});
    qpush({t:3.05,f:()=>{const x=e.x,y=e.y;aoe(x,y,r,bd,30);G.fx.push({t:'ring',x,y,r:3,maxR:r,col:'#b07fd0',life:0.3,max:0.3});particle(x,y,'#b07fd0',10,70,0.4);}});}
   w.t=L5(w,[4,4,4,3.6,3.4])*P.cd;}}});
{const S=CHARS.uiwon.branches;
 S[0].tiers.push({name:'구암 허준',skill:'tangyak',bonus:'최대 체력 +50 · 회복 +20%',apply:B=>{B.maxHp+=50;B.healM+=0.2;},look:lk('samo','#3f9a5a',{T:'#e0b048',item:'gourd'}),
  who:'『동의보감』을 지은 선조·광해군 때의 어의.',src:'https://encykorea.aks.ac.kr/Article/E0063152'});
 S[1].tiers.push({name:'신의 백광현',skill:'daechim',bonus:'공격력 +20% · 범위 +10%',apply:B=>{B.might+=0.2;B.area+=0.1;},look:lk('gat','#efe6d2',{T:'#efe6d2',item:'bigchim'}),
  who:'말을 고치던 마의에서 어의가 되어, 큰 침으로 종기를 터뜨려 뿌리를 뽑던 명의.',src:'https://encykorea.aks.ac.kr/Article/E0021998'});}

/* ---- 장수 ---- */
Object.assign(WD,{
 uldolmok:{name:'울돌목 회오리',type:'c',g:'渦',col:'#1a2b4a',max:5,desc:['요괴가 몰린 곳에 바다 소용돌이를 일으킨다. 소용돌이는 둘레 요괴를 가운데로 끌어당기며 친다. 보스는 끌려오지 않는다.','피해 +','회오리 +1','범위 +, 끄는 힘 +','회오리 +1, 피해 +30%, 끄는 힘 +'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const n=L5(w,[1,1,2,2,3]),r=L5(w,[30,30,30,36,38])*P.area,dmg=L5(w,[9,12,12,14,18])*P.might,life=L5(w,[3,3,3,3.5,3.5])*P.dur;
   for(let i=0;i<n;i++){const tg=i===0?t6Dense(40):randomEnemy();const x=tg?tg.x:P.x+rnd(-70,70),y=tg?tg.y:P.y+rnd(-50,50);zone({x,y,r,dmg,life,col:'#3a6fd0',vtx:1,vtxK:L5(w,[1,1,1,1.4,1.7])});}
   w.t=L5(w,[6,6,5.5,5.5,5])*P.cd;}},
 uibyeong:{name:'홍의 의병',type:'c',g:'義',col:'#c23b2a',max:5,desc:['붉은 옷의 의병들이 따라 싸운다. 때때로 홍의장군이 말을 달려 앞을 꿰뚫는다.','의병 +1','돌진 피해 +','의병 +1','돌진이 두 번, 피해 +30%'],
  upd(w,dt,P){summon(w,Math.min(8,L5(w,[2,3,3,4,4])+P.amount),L5(w,[20,20,24,24,30])*P.might,'uibyeong',140);
   w.t-=dt;if(w.t>0)return;const tg=nearest(P.x,P.y,220),a=tg?Math.atan2(tg.y-P.y,tg.x-P.x):P.face<0?Math.PI:0,k=w.lv>=5?2:1,dmg=L5(w,[60,60,80,80,104])*P.might;
   for(let i=0;i<k;i++)qpush({t:i*0.35,f:()=>{beam(P.x,P.y-3,a+i*0.3,170,14*P.area,dmg,'#c23b2a');particle(P.x,P.y,'#c23b2a',8,60,0.4);}});
   w.t=L5(w,[8,8,7,7,6.5])*P.cd;}}});
{const S=CHARS.jangsu.branches;
 S[0].tiers.push({name:'충무공 이순신',skill:'uldolmok',bonus:'공격력 +20% · 범위 +15%',apply:B=>{B.might+=0.2;B.area+=0.15;},look:lk('helm','#7a2018',{T:'#e0b048',L:'#e0b048',item:'sword'}),
  who:'임진왜란 때 수군을 이끌고 명량의 거센 물살 울돌목에서 크게 이긴 장수.',src:'https://encykorea.aks.ac.kr/Article/E0044900'});
 S[1].tiers.push({name:'홍의장군 곽재우',skill:'uibyeong',bonus:'투사체 +1 · 이동 속도 +10%',apply:B=>{B.amount+=1;B.spd+=0.1;},look:lk('jeonrip','#c23b2a',{T:'#c23b2a',L:'#7a2018',item:'sword'}),
  who:'임진왜란 때 붉은 옷을 입고 의병을 일으켜 「홍의장군」이라 불린 의병장.',src:'https://encykorea.aks.ac.kr/Article/E0004695'});}

/* ======================= v19.1 무당·기생·상인 ======================= */
ITEMS.yundo=[[10,8,'y'],[11,8,'y'],[10,9,'y'],[11,9,'r'],[10,10,'y'],[11,10,'y']];   // 윤도(나침반, 남사고)
ITEMS.geomungo=[[10,5,'n'],...col(11,5,11,'o'),[10,6,'o'],[10,7,'w'],[10,8,'o'],[10,9,'w'],[10,10,'o'],[10,11,'n']];   // 거문고(황진이)
ITEMS.ring=[[10,8,'y'],[11,8,'w'],[10,9,'s']];   // 가락지 빛(논개)
ITEMS.insamPack=[[10,8,'o'],[11,8,'g'],[10,9,'o'],[11,9,'o'],[10,10,'n'],[11,10,'o']];   // 인삼 꾸러미(임상옥)
ITEMS.jigeItem=[...col(11,2,12,'n'),...col(10,4,10,'o'),[10,3,'n'],[10,11,'n']];   // 지게(백달원)
Object.assign(WD,{
 /* ---- 무당 ---- */
 tojeong:{name:'토정비결',type:'c',g:'卦',col:'#7a5a2a',max:5,desc:['괘를 뽑는다. 길하면 금빛 기운이 요괴를 치고, 흉하면 화면의 요괴가 모두 느려지며 조금 다친다. 대길이면 둘 다.','피해 +','대길이 더 자주 나온다','피해 +','대길이 더 자주, 피해 +30%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const pDg=L5(w,[0.2,0.2,0.3,0.3,0.4]),r=Math.random(),k=r<pDg?'daegil':r<pDg+(1-pDg)/2?'gil':'hyung',dmg=L5(w,[40,55,55,70,90])*P.might;w.last=k;
   G.fx.push({t:'num',x:P.x,y:P.y-24,v:k==='daegil'?'大吉':k==='gil'?'吉':'凶',life:0.9,max:0.9,big:true});
   if(k!=='hyung')for(let i=0;i<5;i++){const tg=randomEnemy();warn({x:tg?tg.x:P.x+rnd(-80,80),y:tg?tg.y:P.y+rnd(-60,60),r:24*P.area,t:0.4+i*0.08,dmg,friendly:1,col:'#e0b048',fx:'gold'});}
   if(k!=='gil')for(const e of G.enemies)if(!e.dead&&!e.prop&&inView(e)){if(!e.boss)e.slow=Math.max(e.slow||0,2.5);hurt(e,dmg*0.3,0);}
   w.t=L5(w,[5,5,5,4.5,4.5])*P.cd;}},
 cheongi:{name:'천기누설',type:'c',g:'星',col:'#1a2b4a',max:5,desc:['앞날을 내다봐 보스 경고 장판과 요괴 탄이 몰린 곳에 먼저 별빛을 떨어뜨린다. 별빛은 탄을 지우고 요괴를 친다.','별 +1','탄 지우는 범위 +','별 +1, 피해 +','별 +2, 피해 +30%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const n=L5(w,[3,4,4,5,7]),r=L5(w,[20,20,26,26,28])*P.area,dmg=L5(w,[30,30,30,40,52])*P.might,pts=[];
   const lt=i=>0.3+i*0.06;   /* 별이 떨어지는 때. 움직이는 탄은 그때 있을 자리를 노린다(검토 지적) */
   for(const z of G.warns)if(!z.friendly&&pts.length<n)pts.push([z.x,z.y]);
   const qs=G.ebul.filter(q=>q.life>0&&Math.abs(q.x-P.x)<W/2&&Math.abs(q.y-P.y)<H/2);for(let i=0;i<qs.length&&pts.length<n;i+=Math.max(1,Math.floor(qs.length/n))){const q=qs[i],t=lt(pts.length);pts.push([q.x+(q.vx||0)*t,q.y+(q.vy||0)*t]);}
   while(pts.length<n){const tg=randomEnemy();pts.push(tg?[tg.x,tg.y]:[P.x+rnd(-80,80),P.y+rnd(-60,60)]);}
   pts.forEach(([x,y],i)=>warn({x,y,r,t:lt(i),dmg,friendly:1,col:'#8fd3ff',on:z=>{for(const q of G.ebul)if(q.life>0&&(q.x-z.x)**2+(q.y-z.y)**2<(z.r*1.3)**2)q.life=0;}}));
   w.t=L5(w,[4,4,4,3.6,3.4])*P.cd;}},
 /* ---- 기생 ---- */
 byeokgye:{name:'청산리 벽계수',type:'c',g:'詩',col:'#3f7a8a',max:5,desc:['시조 한 수를 읊으면 물결 고리가 크게 퍼지며 요괴를 밀어내고 친다. 보스는 밀리지 않는다.','피해 +','물결 +1','밀어내는 힘 +, 범위 +','물결 +1, 피해 +30%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const k=L5(w,[1,1,2,2,3]),R0=L5(w,[60,60,60,72,78])*P.area,dmg=L5(w,[20,26,26,32,40])*P.might,kb=L5(w,[50,50,50,80,80]);
   for(let i=0;i<k;i++)qpush({t:i*0.45,f:()=>{pulseRing(P.x,P.y,R0,dmg,'#9ad0e0',kb);}});w.t=L5(w,[4.5,4.5,4.5,4,4])*P.cd;}},
 namgang:{name:'남강의 물결',type:'c',g:'江',col:'#2a5a7a',max:5,desc:['남강의 물결이 앞으로 휩쓸며 지나간다. 엘리트와 보스처럼 강한 요괴일수록 더 크게 친다.','피해 +','물결 폭 +','강한 요괴 추가 피해 +','물결 폭 +, 피해 +30%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const a=Math.atan2(P.diry||0,P.dirx||1),len=190,wd=L5(w,[18,18,24,24,30])*P.area,dmg=L5(w,[72,94,94,108,140])*P.might,xm=L5(w,[1.6,1.6,1.6,2.1,2.1]);
   /* v19.2: 강한 요괴 추가 피해를 두 번째 타격이 아니라 한 번의 배율로(피해 숫자·치명타가 한 번) */
   const x0=P.x,y0=P.y-3,ex=x0+Math.cos(a)*len,ey=y0+Math.sin(a)*len;
   for(const e of G.enemies.slice()){if(e.dead||e.inv)continue;if(segDist(e.x,e.y,x0,y0,ex,ey)<wd/2+e.r)hurt(e,dmg*(e.boss||e.elite?xm:1),30,x0,y0);}
   G.fx.push({t:'beam',x:x0,y:y0,a,len,w:wd,col:'#5a9ac0',life:0.3,max:0.3});
   w.t=L5(w,[5,5,4.6,4.6,4.2])*P.cd;}},
 /* ---- 상인 ---- */
 insamgyo:{name:'인삼 교역',type:'c',g:'蔘',col:'#9a6a10',max:5,desc:['엽전을 얻을수록 인삼 꾸러미가 쌓인다(엽전이 없어도 조금씩). 가득 차면 교역이 터지며 둘레에 금빛 폭발을 일으킨다.','쌓이는 속도 +','폭발 피해 +','폭발 범위 +','쌓이는 속도 +, 피해 +30%'],
  upd(w,dt,P){if(w.c0===undefined)w.c0=G.coins;const got=Math.max(0,G.coins-w.c0);w.c0=G.coins;w.fill=(w.fill||0)+got*L5(w,[1,1.3,1.3,1.3,1.6])+dt*L5(w,[3.2,3.8,3.8,3.8,4.6]);
   if(w.fill<30)return;w.fill=0;w.pops=(w.pops||0)+1;const R0=L5(w,[70,70,70,90,96])*P.area,dmg=L5(w,[120,120,150,150,195])*P.might;
   pulseRing(P.x,P.y,R0,dmg,'#e0b048',30);particle(P.x,P.y-6,'#e0b048',18,90,0.6);}},
 jigehaeng:{name:'지게 행렬',type:'c',g:'負',col:'#6a4a2a',max:5,desc:['보부상 동료들이 지게를 지고 따라다니며 물미장으로 요괴를 친다. 체력이 낮을 때 요괴가 붙으면 동료가 지게로 업고 몸을 피한다(15초마다).','동료 +1','피해 +','동료 +1, 피하는 거리 +','동료 +1, 피해 +30%'],
  upd(w,dt,P){summon(w,Math.min(8,L5(w,[2,3,3,4,5])+P.amount),L5(w,[16,16,20,20,26])*P.might,'peddler',120);
   w.esc=(w.esc||0)-dt;if(w.esc>0||P.hp>P.maxHp*0.25||G.pull)return;const e=nearest(P.x,P.y,60);if(!e)return;   /* 가까운 요괴가 있을 때만, 보스가 끌어당기는 동안은 안 함(검토 지적) */
   const a=Math.atan2(P.y-e.y,P.x-e.x),d=L5(w,[50,50,50,70,70]);
   P.x+=Math.cos(a)*d;P.y+=Math.sin(a)*d*0.8;pushOut(P,5);P.iframe=Math.max(P.iframe||0,0.8);particle(P.x,P.y,'#c9a06a',10,60,0.4);toast(_t("지게에 업혀 몸을 피한다"));w.esc=15;}}});
{const M=CHARS.mudang.branches;
 M[0].tiers.push({name:'토정 이지함',skill:'tojeong',bonus:'치명타 +8% · 재사용 −8%',apply:B=>{B.crit+=0.08;B.cd*=0.92;},look:lk('gat','#c9b48a',{T:'#a89c8a',item:'staff'}),
  who:'마포 강변 흙담 움막에서 청빈하게 살았고, 『토정비결』을 지었다고 알려진 학자.',src:'https://encykorea.aks.ac.kr/Article/E0046084'});
 M[1].tiers.push({name:'격암 남사고',skill:'cheongi',bonus:'범위 +15% · 재사용 −8%',apply:B=>{B.area+=0.15;B.cd*=0.92;},look:lk('gat','#1a2b4a',{T:'#efe6d2',item:'yundo'}),
  who:'역학·풍수·천문에 밝아 앞날을 내다보았다는 이야기가 전하는 명종 때의 학자.',src:'https://encykorea.aks.ac.kr/Article/E0011938'});}
{const K=CHARS.gisaeng.branches;
 K[0].tiers.push({name:'명월 황진이',skill:'byeokgye',bonus:'공격력 +20% · 범위 +15%',apply:B=>{B.might+=0.2;B.area+=0.15;},look:lk('gache','#9ad0c0',{T:'#efe6d2',item:'geomungo'}),
  who:'송도삼절로 꼽히는 시인이자 기생. 시조 「청산리 벽계수야」로 이름났다.',src:'https://encykorea.aks.ac.kr/Article/E0065346'});
 K[1].tiers.push({name:'의기 논개',skill:'namgang',bonus:'공격력 +25% · 치명타 피해 +20%',apply:B=>{B.might+=0.25;B.critDmg+=0.2;},look:lk('gache','#c23b2a',{T:'#efe6d2',item:'ring'}),
  who:'임진왜란 진주성 싸움 뒤 의로운 죽음으로 「의기」라 불리며, 남강의 의암에 이름이 남은 인물.',src:'https://encykorea.aks.ac.kr/Article/E0013009'});}
{const S=CHARS.sangin.branches;
 S[0].tiers.push({name:'거상 임상옥',skill:'insamgyo',bonus:'공격력 +20% · 구슬 끌어오기 +30%',apply:B=>{B.might+=0.2;B.magnet+=0.3;},look:lk('gat','#6a3a8a',{T:'#e0b048',item:'insamPack'}),
  who:'의주의 거상. 국경 인삼 무역으로 큰 부를 쌓고, 굶주린 백성과 수재민을 구했다.',src:'https://encykorea.aks.ac.kr/Contents/Index?contents_id=E0047469'});
 S[1].tiers.push({name:'도반수 백달원',skill:'jigehaeng',bonus:'최대 체력 +60 · 이동 속도 +10%',apply:B=>{B.maxHp+=60;B.spd+=0.1;},look:lk('paraengi','#efe6d2',{T:'#a89c8a',item:'jigeItem'}),
  who:'조선 초 보부상 단체의 첫 우두머리(5도도반수)로 전하는 인물. 이성계를 지게에 싣고 구했다는 이야기가 전한다(전설).',src:'https://encykorea.aks.ac.kr/Article/E0022033'});}
/* 늘 켜져 있는 기술(쌓기·동료)은 오의 각성에서 극의만(연환·신속이 효과가 없어서) */
AWK_STATIC.add('insamgyo');AWK_STATIC.add('jigehaeng');
