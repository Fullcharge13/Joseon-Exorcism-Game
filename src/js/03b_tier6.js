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
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const n=L5(w,[3,4,4,4,5]),hold=L5(w,[2,2,2.5,2.5,2.5]),dmg=L5(w,[80,90,100,125,160])*P.might;
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
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const r=L5(w,[40,48,48,52,56])*P.area,dmg=L5(w,[10,12,12,16,20])*P.might,hv=L5(w,[1.5,1.5,2.2,2.2,3]);
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
