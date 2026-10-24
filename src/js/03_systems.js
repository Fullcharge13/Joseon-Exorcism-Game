/* ---- 오의 각성 · 한계 돌파 · 궁극 오의 ---- */
const AWK_LV=[54,58,62,66,70],ULT_LV=74;
const START_TIER_B=0.12,LB_STEP=0.05;
const AWK={echo:{n:'연환',d:'시전하고 0.4초 뒤 한 번 더 시전한다 (두 번째는 위력 60%).'},geuk:{n:'극의',d:'피해 +50% · 범위 +25%.'},sin:{n:'신속',d:'재사용 대기 −35%.'}};
const AWK_STATIC=new Set(['gaekju','tongmun','pansori','ssanggeom','geomseon','mukhyang','gyeongguk','yeokjol','godok','gut','jakduchum','jinogwi','gil','ilwol','sugun']);
const AWK_NONE=new Set(['hoesaeng']);
function awkTypes(id){return AWK_NONE.has(id)?[]:AWK_STATIC.has(id)?['geuk']:['echo','geuk','sin'];}
function runW(w,dt,P){const d=WD[w.id],ak=w.awk,lb=w.lb||0,se=w.seals,gz=G.grazeT>0,sb=w.id===CHARS[G.cid].start&&G.P.tier?1+START_TIER_B*G.P.tier:1;
 if(!ak&&!lb&&!(se&&se.length)&&!gz&&sb===1){d.upd(w,dt,P);return;}
 const m=P.might,a=P.area,c=P.cd,am=P.amount,du=P.dur,ps=P.pspd;P.might*=sb*(1+LB_STEP*lb)*(ak==='geuk'?1.5:1);P.area*=(1+0.1*Math.floor(lb/5))*(ak==='geuk'?1.25:1);if(ak==='sin')P.cd*=0.65;if(gz)P.cd*=0.85;
 if(se)for(const k of se)SEALS[k].f(P);
 const t0=w.t;try{d.upd(w,dt,P);}finally{P.might=m;P.area=a;P.cd=c;P.amount=am;P.dur=du;P.pspd=ps;}
 if(ak==='echo'&&typeof w.t==='number'&&w.t>t0+0.05){qpush({t:0.4,f:()=>{if(!G.weapons.includes(w))return;const pm=P.might,keep=w.t;P.might*=0.6*(1+0.1*lb);w.t=0;try{d.upd(w,1e-4,P);}finally{P.might=pm;w.t=keep;}particle(P.x,P.y-6,d.col||'#e0b048',6,40,0.4);}});}}
const ULT={
 seonbi:{n:'천지개벽 필법',g:'開',d:'24초마다 하늘에서 글자 아홉이 요괴 위로 떨어진다.'},
 uiwon:{n:'만병회춘',g:'春',d:'24초마다 체력 35%를 회복하고, 화면 안 요괴 모두에게 독을 퍼뜨려 느리게 한다.'},
 mudang:{n:'천신강림',g:'降',d:'24초마다 하늘 신이 내려와 벼락 열넷을 내리꽂는다.'},
 jangsu:{n:'만군돌격',g:'軍',d:'24초마다 거북선 세 척이 화면을 가로지르며 들이받는다.'},
 gisaeng:{n:'경국지색',g:'色',d:'24초마다 화면 안 요괴를 3초 동안 홀려 멈추고, 꽃바람이 휩쓴다.'},
 sangin:{n:'천하 거상',g:'財',d:'24초마다 하늘에서 금덩이 비가 쏟아져 화면의 요괴를 크게 치고, 엽전이 흩어진다.'}};
function castUlt(){const P=G.P,s=G.stage,D=(60+45*s)*P.might,u=ULT[G.cid];const pv=CUR_SRC;CUR_SRC='ult';
 toastUlt(className(),u.n);flash('255,230,160',0.25);snd(220,0.5,'sawtooth',0.05);
 if(G.cid==='seonbi'){for(let i=0;i<9;i++){const tg=randomEnemy();warn({x:tg?tg.x:P.x+rnd(-W/2,W/2),y:tg?tg.y:P.y+rnd(-H/2,H/2),r:26*P.area,t:0.5+i*0.08,dmg:D*2,friendly:1,col:'#e0b048'});}}
 else if(G.cid==='uiwon'){heal(P.maxHp*0.35/P.healM);for(const e of G.enemies)if(!e.dead&&!e.prop&&inView(e)){hurt(e,D*1.2,0,0,0,true);e.dotSrc=HSRC||CUR_SRC||e.dotSrc,e.dot=Math.max(e.dot||0,D*0.15);e.dotT=4;e.slow=3;}particle(P.x,P.y-6,'#9af0b0',30,90,0.8);}
 else if(G.cid==='mudang'){for(let i=0;i<14;i++)qpush({t:i*0.12,f:()=>{const e=randomEnemy();if(e)bolt(e.x,e.y,20*P.area,D*1.6);}});}
 else if(G.cid==='jangsu'){for(let i=0;i<3;i++){const dir=i%2?-1:1,y=P.y+(i-1)*40;G.movers.push({x:P.x-dir*(W/2+40),y,vx:dir*190,r:20,dmg:D*2.5,hit:new Set(),life:(W+80)/190+0.3,dir,kind:'ship'});}snd(60,0.6,'sawtooth',0.06);}
 else if(G.cid==='sangin'){for(let i=0;i<16;i++){const tg=randomEnemy();warn({x:tg?tg.x:P.x+rnd(-W/2,W/2),y:tg?tg.y:P.y+rnd(-H/2,H/2),r:28*P.area,t:0.4+i*0.07,dmg:D*2.2,friendly:1,col:'#e0b048',fx:'gold'});}G.coins+=10+5*G.stage;}
 else if(G.cid==='gisaeng'){for(const e of G.enemies)if(!e.dead&&!e.prop&&inView(e)){if(e.boss)e.slow=3;else e.frz=Math.max(e.frz,3);}G.fx.push({t:'wave',x:P.x,y:P.y,r:4,maxR:160*P.area,dmg:D*1.5,hit:new Set(),life:9,col:'#ffb0d0',kb:80});}
 CUR_SRC=pv;}
function awkOptions(){const c=[];for(const w of G.weapons){const d=WD[w.id];if(d.type!=='c'||w.awk)continue;for(const t of awkTypes(w.id))c.push({id:w.id,t});}
 c.sort(()=>Math.random()-0.5);const out=[],used=new Set();for(const o of c){if(out.length>=3)break;if(!used.has(o.id)){used.add(o.id);out.push(o);}}
 for(const o of c){if(out.length>=3)break;if(!out.includes(o))out.push(o);}return out;}
function openAwk(){const P=G.P,opts=awkOptions();if(!opts.length){openLevel();return;}
 openPick('AWAKENING · LV '+P.lvl,_t("오의를 깨치다"),_t("직업 기술 하나를 골라 각성합니다. 한 기술은 한 번만 각성할 수 있습니다. ({awkN}/5)",{awkN:G.awkN}),opts.map(o=>{const d=WD[o.id],a=AWK[o.t];
  return {ic:iconHTML(o.id),badge:_t("각성 · ")+a.n,bc:'awk',name:_t("{n}의 {name}",{n:a.n,name:d.name}),desc:a.d,f:()=>{const w=G.weapons.find(w=>w.id===o.id);w.awk=o.t;G.awkN++;G.rs.awkTot=(G.rs.awkTot||0)+1;refreshSlots();toast(_t("오의 각성 · {n}의 {name}",{n:a.n,name:d.name}),'big');flash('255,230,160',0.3);particle(P.x,P.y-6,'#e0b048',24,70,0.7);show(null);}};}));
 snd(520,0.4,'triangle',0.05);setTimeout(()=>snd(1040,0.4,'triangle',0.05),150);}
function openUlt(){const u=ULT[G.cid];openPick('ULTIMATE',_t("궁극 오의"),_t("다섯 기술을 깨친 끝에 {p}의 마지막 비기가 열립니다.",{p:className()}),[{ic:`<span class="seal" style="background:#7a2018">${u.g}</span>`,badge:_t("궁극 오의"),bc:'awk',name:u.n,desc:u.d,f:()=>{G.ult={t:3};G.rs.ult=1;refreshSlots();show(null);toast(_t("궁극 오의 · {n}",{n:u.n}),'big');}}]);}

/* ---- 신내림 ---- */
const CALL={
 none:{n:'퇴마 일갈',g:'退',d:'둘레 요괴를 크게 밀어내며 벤다.'},
 sansin:{n:'산군 포효',g:'山',d:'체력 30% 회복, 큰 포효로 요괴를 날려 보낸다.'},
 seonghwang:{n:'성황 결계',g:'城',d:'6초 동안 몸 둘레에 강한 결계가 따라다닌다.'},
 eopsin:{n:'업신 재물비',g:'業',d:'떨어진 구슬을 모두 끌어오고 엽전 15닢을 뿌린다.'},
 samsin:{n:'삼신 점지',g:'産',d:'체력 50% 회복, 레벨업까지 필요한 경험치의 절반을 얻는다.'},
 yong:{n:'용왕 한파',g:'龍',d:'화면 안 요괴를 3.5초 동안 얼리고 피해를 준다.'},
 baekho:{n:'백호 질주',g:'虎',d:'백호가 화면을 휩쓸어 모든 요괴에게 큰 피해.'},
 cheongryong:{n:'청룡 승천',g:'靑',d:'8초 동안 재사용 대기 −50%, 벼락 여섯.'},
 jujak:{n:'주작 화우',g:'朱',d:'불비 열둘이 떨어져 요괴를 태운다.'},
 hyeonmu:{n:'현무 철갑',g:'玄',d:'5초 동안 어떤 피해도 받지 않는다.'},
 jowang:{n:'조왕 잔칫상',g:'竈',d:'떡 다섯을 차리고 체력 20%를 회복한다.'},
 chilseong:{n:'칠성 낙성',g:'七',d:'가장 튼튼한 요괴 일곱에게 별이 떨어진다.'},
 seongju:{n:'성주 수호',g:'主',d:'8초 동안 받는 피해 −70%, 둘레를 밀어낸다.'}};
function callGod(){let best='none',bl=0,bi=99;for(const id in G.bless){const l=G.bless[id],i=G.blessOrder.indexOf(id);if(l>bl||(l===bl&&i<bi)){best=id;bl=l;bi=i;}}return best;}
function addCall(v){if(!G||G.over)return;const was=G.call>=100;G.call=Math.min(100,G.call+v*(G.callRate||1));if(!was&&G.call>=100){toast(_t("신내림 준비 · {n} (Space)",{n:CALL[callGod()].n}));snd(880,0.2,'triangle',0.04);}}
function castCall(){if(!G||G.over||modal||G.call<100||G.clearT!==undefined)return;G.call=0;G.rs.calls=(G.rs.calls||0)+1;
 const P=G.P,s=G.stage,D=(50+40*s)*P.might,k=callGod(),c=CALL[k],pv=CUR_SRC;CUR_SRC='call';
 toastBig(_t("신내림"),c.n);flash('255,240,200',0.35);snd(330,0.5,'triangle',0.06);setTimeout(()=>snd(660,0.5,'triangle',0.05),140);
 const wave=(m,kb,col)=>G.fx.push({t:'wave',x:P.x,y:P.y,r:4,maxR:150*P.area,dmg:D*m,hit:new Set(),life:9,col,kb});
 const vis=()=>G.enemies.filter(e=>!e.dead&&!e.prop&&inView(e));
 switch(k){
  case 'none':wave(2,260,'#efe6d2');break;
  case 'sansin':heal(P.maxHp*0.3/P.healM);wave(1.5,320,'#7fd07f');break;
  case 'seonghwang':zone({x:P.x,y:P.y,r:80*P.area,dmg:D*0.5,tick:0.3,life:6,col:'#c8402c',follow:1});break;
  case 'eopsin':for(const g of G.gems)g.mag=true;for(let i=0;i<15;i++)dropItem('coin',P.x+rnd(-50,50),P.y+rnd(-40,40));wave(1,120,'#e0b048');break;
  case 'samsin':heal(P.maxHp*0.5/P.healM);gainXp((P.next-P.xp)*0.5/P.xpGain);break;
  case 'yong':for(const e of vis()){if(!e.boss)e.frz=Math.max(e.frz,3.5);else e.slow=3;hurt(e,D*1.2,0,0,0,true);}flash('180,220,255',0.3);break;
  case 'baekho':for(const e of vis()){hurt(e,D*2.5,60,P.x,P.y);if(Math.random()<0.3)G.fx.push({t:'slash',x:e.x,y:e.y,a:Math.random()*TAU,r:16,life:0.2,max:0.2,delay:0,half:0.8,col:'#efe6d2'});}break;
  case 'cheongryong':G.callBuff=8;recompute();for(let i=0;i<6;i++)qpush({t:i*0.1,f:()=>{const e=randomEnemy();if(e)bolt(e.x,e.y,18,D*1.5);}});break;
  case 'jujak':for(let i=0;i<12;i++){const tg=randomEnemy();warn({x:tg?tg.x:P.x+rnd(-W/2,W/2),y:tg?tg.y:P.y+rnd(-H/2,H/2),r:22*P.area,t:0.4+i*0.06,dmg:D*1.8,friendly:1,col:'#ff7a3a'});}for(const e of vis()){e.dotSrc=HSRC||CUR_SRC||e.dotSrc,e.dot=Math.max(e.dot||0,D*0.12);e.dotT=3;}break;
  case 'hyeonmu':G.guardT=5;break;
  case 'jowang':for(let i=0;i<5;i++){const a=i/5*TAU;dropItem('tteok',P.x+Math.cos(a)*30,P.y+Math.sin(a)*22);}heal(P.maxHp*0.2/P.healM);break;
  case 'chilseong':{const l=vis().sort((a,b)=>b.hp-a.hp).slice(0,7);l.forEach((e,i)=>qpush({t:i*0.12,f:()=>{if(!e.dead)bolt(e.x,e.y,22,D*4);}}));break;}
  case 'seongju':G.seongT=8;wave(1,300,'#b0a080');break;}
 CUR_SRC=pv;}
function updCall(dt){const P=G.P;if(G.grazeT>0)G.grazeT-=dt;
 if(G.guardT>0)G.guardT-=dt;if(G.seongT>0)G.seongT-=dt;
 if(G.callBuff>0){G.callBuff-=dt;if(G.callBuff<=0){G.callBuff=0;recompute();}}
 if(G.ult){G.ult.t-=dt;if(G.ult.t<=0&&G.clearT===undefined&&!G.bossDone){G.ult.t=24;castUlt();}}}

/* ---- 쌍신 축복 ---- */
const DUO={
 yongho:{a:'cheongryong',b:'baekho',n:'용호상박',d:'공격이 8% 확률로 벼락 발톱을 내리친다.'},
 suhwa:{a:'jujak',b:'hyeonmu',n:'수화상제',d:'등껍질이 피해를 막으면 둘레에 불길이 터진다. 등껍질 대기 −3초.'},
 sancheon:{a:'sansin',b:'seonghwang',n:'산천정기',d:'체력이 80% 이상이면 공격력 +25%.'},
 bokrok:{a:'eopsin',b:'jowang',n:'복록',d:'엽전을 주울 때 4% 확률로 떡, 2% 확률로 복주머니가 나온다.'},
 chilyong:{a:'chilseong',b:'yong',n:'칠성용궁',d:'얼어 있는 요괴에게는 반드시 치명타.'},
 gataek:{a:'samsin',b:'seongju',n:'가택평안',d:'레벨이 오를 때마다 체력 15 회복 · 최대 체력 +2.'},
 maenghwa:{a:'baekho',b:'jujak',n:'맹화호',d:'화상 입은 요괴가 쓰러지면 불꽃이 터져 둘레를 태운다.'},
 bukhae:{a:'yong',b:'hyeonmu',n:'북해빙벽',d:'얼어 있는 요괴가 쓰러지면 얼음이 터져 둘레 요괴를 얼린다.'}};
const duoG=id=>BLESS[DUO[id].a].g+BLESS[DUO[id].b].g;
function duoOn(id){return G&&G.duo&&G.duo[id];}

/* ---- 갈림길 ---- */
const PATHS={
 chest:{s:'상자',n:'보물 창고',g:'寶',d:'다음 막을 평정하면 보물 상자를 하나 더 연다.'},
 coins:{s:'엽전',n:'장터 길',g:'錢',d:'다음 막을 평정하면 엽전을 받는다.'},
 bless:{s:'축복',n:'신령의 사당',g:'神',d:'다음 막을 평정하면 신령 축복을 하나 고른다.'},
 spring:{s:'약수',n:'약수터',g:'泉',d:'다음 막을 평정하면 최대 체력 +15, 체력을 모두 채운다.'},
 xp:{s:'수련',n:'수련터',g:'修',d:'다음 막을 평정하면 곧바로 두 번 레벨업한다.'},
 temper:{s:'담금질',n:'대장간',g:'鍛',d:'다음 막을 평정하면 명장의 담금질로 무기 하나의 움직임을 바꾼다.'}};
function openPath(){if(G.stage+1>=STAGES.length-1){nextStage();return;}
 let ids=Object.keys(PATHS).sort(()=>Math.random()-0.5).slice(0,3);if(G.ks==='mangchi'&&!ids.includes('temper'))ids[2]='temper';const hardI=Math.random()<0.7?Math.random()*3|0:-1,n=STAGES[G.stage+1];
 openPick('CROSSROADS',_t("{sub} 가는 갈림길",{sub:n.sub}),_t("길마다 끝에 기다리는 보상이 보입니다. 보상은 다음 막을 평정한 뒤에 받습니다. 험로는 요괴가 더 질기지만 보상이 두 배입니다."),ids.map((id,i)=>{const pth=PATHS[id],hard=i===hardI;
  return {ic:`<span class="seal" style="background:${hard?'#7a2018':'#2f6b5a'}">${pth.g}</span>`,badge:hard?_t("험로 · 보상 ×2"):_t("평탄한 길"),bc:hard?'hard':'door',name:pth.n,desc:pth.d+(id==='coins'?_t(" ({p}닢)",{p:pathCoins()}):'')+(hard?_t(" 요괴 체력 +30% · 수 +15%."):''),f:()=>{G.path={id,hard};nextStage();toast(_t("갈림길 · {n}{p}",{n:pth.n,p:hard?_t(" (험로)"):''}));}};}));}
function pathCoins(){return 50+G.stage*15;}
function claimPath(cb){const p=G.path;G.path=null;if(!p){cb();return;}const n=p.hard?2:1,P=G.P;let k=0;
 const step=()=>{if(k++>=n){cb();return;}
  switch(p.id){
   case 'chest':openChest(3,step);return;
   case 'bless':G.afterBless=step;openBless(_t("갈림길의 신령"));return;
   case 'temper':openTemper(step);return;
   case 'coins':G.coins+=pathCoins();toast(_t("장터 길 · 엽전 {p}닢",{p:pathCoins()}));break;
   case 'spring':G.base.maxHp+=15;recompute();P.hp=P.maxHp;toast(_t("약수터 · 최대 체력 +15"));break;
   case 'xp':for(let i=0;i<2;i++)gainXp((P.next-P.xp+1)/P.xpGain);toast(_t("수련터 · 레벨업"));break;}
  step();};
 step();}

/* ---- 공용 선택 화면 ---- */
let pickFns=[];
function openPick(eye,title,lede,cards){$('#pickEye').textContent=eye;$('#pickTitle').textContent=title;$('#pickLede').textContent=lede;const box=$('#pickCards');box.innerHTML='';pickFns=[];
 cards.forEach((c,i)=>{const bt=document.createElement('button');bt.className='card';bt.id='pick'+i;
  bt.innerHTML=`<span class="ic">${c.ic}</span><div class="cm"><span class="badge ${c.bc||''}">${c.badge}</span><b>${c.name}</b><p>${c.desc}</p></div><kbd>${i+1}</kbd>`;
  bt.onclick=c.f;pickFns.push(c.f);box.appendChild(bt);});
 show('pick');}

function qpush(o){o.src=CUR_SRC;G.petQ.push(o);}
function zone(o){G.zones.push(Object.assign({tt:0,tick:0.35,heal:0,max:o.life,src:CUR_SRC},o));}
function volley(n,dmg,pierce,kind='arrow',spd=250,extra){const P=G.P,o=Math.random();for(let i=0;i<n;i++)shoot(P.x,P.y,(i+o)/n*TAU,spd,kind,dmg,pierce,0.8,2,extra);}
function heal(v){const P=G.P;P.hp=Math.min(P.maxHp,P.hp+v*P.healM);}
function bolt(x,y,r,dmg){aoe(x,y,r,dmg,10);G.fx.push({t:'bolt',x,y,life:0.18,max:0.18,seed:Math.random()*99});}
const L5=(w,a)=>a[w.lv-1];
const HANJA='天地玄黃宇宙洪荒日月盈昃辰宿列張寒來暑往秋收冬藏';
const JAMO='ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ';
const LAW='經國大典吏戶禮兵刑工';

const WD={
 /* ===== 선비 전용 ===== */
 meok:{name:'먹탄',type:'w',job:'seonbi',max:5,evo:'seochaek',evoName:'일필휘지',evoDesc:'붓끝에서 사방으로 먹탄이 쏟아진다. 끝없이 관통한다.',
  desc:['가장 가까운 요괴에게 먹탄을 쏜다.','피해 +20%','먹탄 +1','관통 +1, 연사 빨라짐','먹탄 +1, 피해 +25%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;
   if(w.evo){const n=8+P.amount;for(let i=0;i<n;i++)shoot(P.x,P.y,i/n*TAU+G.time*1.3,170,'ink',22*P.might,99,1.1,3*P.area);w.t=0.75*P.cd;return;}
   const dmg=L5(w,[10,12,12,12,15])*P.might,n=L5(w,[1,1,2,2,3])+P.amount,pr=L5(w,[1,1,1,2,2]);
   const tg=nearest(P.x,P.y,220);const a=tg?Math.atan2(tg.y-P.y,tg.x-P.x):Math.atan2(P.diry,P.dirx);
   for(let i=0;i<n;i++)shoot(P.x,P.y,a+(i-(n-1)/2)*0.16,180,'ink',dmg,pr,1.2,2.5*P.area);
   w.t=L5(w,[1.1,1.0,1.0,0.88,0.85])*P.cd;}},
 byeoru:{name:'벼루',type:'w',job:'seonbi',max:5,evo:'yeonjeok',evoName:'용연',evoDesc:'용이 새겨진 벼루 네 개가 크게 날아갔다가 돌아온다.',
  desc:['무거운 벼루를 던진다. 멀리 갔다가 되돌아오며 두 번 벤다.','피해 +20%','벼루 +1','크기 +, 피해 +','벼루 +1'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const n=(w.evo?4:L5(w,[1,1,2,2,3]))+P.amount,dmg=(w.evo?34:L5(w,[14,17,17,21,22]))*P.might;
   const tg=nearest(P.x,P.y,200);const a0=tg?Math.atan2(tg.y-P.y,tg.x-P.x):Math.atan2(P.diry,P.dirx);
   for(let i=0;i<n;i++){const a=a0+(i-(n-1)/2)*(w.evo?TAU/n:0.5);shoot(P.x,P.y,a,170*P.pspd,'boomer',dmg,99,3,(w.evo?6:L5(w,[4,4,4,5,5]))*P.area,{v0:170*P.pspd,tt:0});}
   w.t=(w.evo?1.4:L5(w,[1.8,1.7,1.7,1.6,1.5]))*P.cd;}},
 buchae:{name:'합죽선',type:'w',job:'seonbi',max:5,evo:'nakgwan',evoName:'태극선',evoDesc:'태극 부채를 휘두르면 사방으로 회오리가 일어 요괴를 날려 버린다.',
  desc:['부채를 부쳐 앞쪽 요괴를 밀쳐 내는 바람을 일으킨다.','바람 +1','피해 +, 밀쳐 내는 힘 +','범위 +','바람 +1, 빨라짐'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const a0=Math.atan2(P.diry,P.dirx);
   const n=(w.evo?6:L5(w,[1,2,2,2,3]))+P.amount,dmg=(w.evo?26:L5(w,[9,9,12,12,14]))*P.might,r=(w.evo?10:L5(w,[6,6,6,8,8]))*P.area;
   for(let i=0;i<n;i++){const a=w.evo?a0+i/n*TAU:a0+(i-(n-1)/2)*0.45;const p=shoot(P.x,P.y,a,120*P.pspd,'wind',dmg,99,0.6*P.dur,r);p.kb=w.evo?110:L5(w,[60,60,80,80,90]);}
   w.t=(w.evo?1.1:L5(w,[1.5,1.5,1.4,1.4,1.2]))*P.cd;}},
 seochal:{name:'서찰',type:'w',job:'seonbi',lock:1,max:5,evo:'hongpae',evoName:'교지',evoDesc:'왕의 교지가 날아가 요괴를 끝까지 쫓아 꿰뚫는다.',
  desc:['봉한 서찰이 요괴를 끝까지 쫓아가 맞힌다.','서찰 +1','피해 +20%','서찰 +1','서찰 +1, 빨라짐'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const n=(w.evo?8:L5(w,[2,3,3,4,5]))+P.amount,dmg=(w.evo?26:L5(w,[9,9,11,11,13]))*P.might;
   for(let i=0;i<n;i++){const tg=randomEnemy();shoot(P.x,P.y,i/n*TAU+rnd(-.3,.3),80*P.pspd,'letter',dmg,w.evo?3:1,2.2,3,{tg});}
   w.t=(w.evo?1.0:L5(w,[1.6,1.5,1.5,1.4,1.2]))*P.cd;}},
 /* ===== 의원 전용 ===== */
 chim:{name:'은침',type:'w',job:'uiwon',max:5,evo:'insam',evoName:'회춘침',evoDesc:'열 개의 침이 넓게 퍼지고, 맞힐 때마다 조금씩 기운이 돌아온다.',
  desc:['가는 방향으로 은침 세 개를 부채꼴로 던진다.','관통 +1','침 +1','침 +1, 연사 빨라짐','침 +1, 피해 +20%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const a=Math.atan2(P.diry,P.dirx);
   if(w.evo){const n=10+P.amount;for(let i=0;i<n;i++)shoot(P.x,P.y,a+(i-(n-1)/2)*0.13,250*P.pspd,'needle',15*P.might,4,0.65,2,{heal:1});w.t=0.55*P.cd;return;}
   const n=L5(w,[3,3,4,5,6])+P.amount,dmg=L5(w,[7,8,8,9,11])*P.might,pr=L5(w,[1,2,2,2,3]);
   for(let i=0;i<n;i++)shoot(P.x,P.y,a+(i-(n-1)/2)*0.17,230*P.pspd,'needle',dmg,pr,0.6,2);
   w.t=L5(w,[0.95,0.9,0.85,0.75,0.68])*P.cd;}},
 buhang:{name:'부항',type:'w',job:'uiwon',max:5,evo:'nogyong',evoName:'사혈 부항',evoDesc:'붙은 부항이 나쁜 피를 크게 뽑아 내고, 그 기운으로 내 몸을 채운다.',
  desc:['부항 단지를 붙여 요괴의 기운을 서서히 빨아들이고 체력을 조금 회복한다.','단지 +1','빨아들이는 양 +','단지 +1','단지 +1, 지속 +'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const n=(w.evo?5:L5(w,[1,2,2,3,4]))+P.amount,dps=(w.evo?18:L5(w,[6,6,9,9,11]))*P.might;
   for(let i=0;i<n;i++){const tg=randomEnemy(120);const a=tg?Math.atan2(tg.y-P.y,tg.x-P.x):Math.random()*TAU;shoot(P.x,P.y,a,160*P.pspd,'cup',4*P.might,1,0.9,3,{dot:dps,dotT:(w.evo?4:L5(w,[3,3,3,3,4]))*P.dur,drain:w.evo?0.6:0.25});}
   w.t=(w.evo?1.3:L5(w,[2,1.9,1.9,1.8,1.7]))*P.cd;}},
 jakdu:{name:'약작두',type:'w',job:'uiwon',max:5,evo:'sahyang',evoName:'천금 작두',evoDesc:'네 자루의 작두날이 화면을 휘저으며 튕겨 다닌다.',
  desc:['약재를 써는 작두날을 던진다. 화면 끝에 부딪히면 튕겨 나온다.','피해 +20%','날 +1','지속 +, 크기 +','날 +1'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const n=(w.evo?4:L5(w,[1,1,2,2,3]))+P.amount,dmg=(w.evo?28:L5(w,[12,14,14,17,17]))*P.might;
   for(let i=0;i<n;i++)shoot(P.x,P.y,Math.random()*TAU,150*P.pspd,'blade',dmg,999,(w.evo?4:L5(w,[2.5,2.5,2.5,3,3]))*P.dur,(w.evo?6:4)*P.area,{bounce:1,clr:0});
   w.t=(w.evo?2.6:L5(w,[3.4,3.3,3.2,3.1,3.0]))*P.cd;}},
 hwanyak:{name:'환약',type:'w',job:'uiwon',lock:1,max:5,evo:'gamcho',evoName:'청심환',evoDesc:'금박 청심환이 요괴 사이를 열두 번 튕기며 맞을 때마다 터진다.',
  desc:['동그란 환약이 요괴 사이를 튕기며 여러 번 맞힌다.','튕김 +1','환약 +1','튕김 +2','환약 +1, 피해 +'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const n=(w.evo?3:L5(w,[1,1,2,2,3]))+P.amount,dmg=(w.evo?20:L5(w,[10,10,10,12,14]))*P.might;
   for(let i=0;i<n;i++){const tg=nearest(P.x,P.y,200);const a=tg?Math.atan2(tg.y-P.y,tg.x-P.x)+rnd(-.4,.4):Math.random()*TAU;shoot(P.x,P.y,a,200*P.pspd,'pill',dmg,1,1.5,3,{bounces:w.evo?12:L5(w,[3,4,4,6,6]),boom:w.evo?14*P.area:0});}
   w.t=(w.evo?1.0:L5(w,[1.4,1.4,1.3,1.3,1.2]))*P.cd;}},
 /* ===== 무당 전용 ===== */
 bujeok:{name:'부적',type:'w',job:'mudang',max:5,evo:'gat',evoName:'천지신명',evoDesc:'여섯 장의 부적이 쉬지 않고 넓게 돈다.',
  desc:['부적 두 장이 몸 주위를 돌며 닿는 요괴를 벤다.','피해 +20%','부적 +1','도는 반경 +, 지속 +','부적 +1, 피해 +15%'],
  upd(w,dt,P){w.t-=dt;
   const n=(w.evo?6:L5(w,[2,2,3,3,4]))+P.amount,dmg=(w.evo?22:L5(w,[9,11,11,14,16]))*P.might,rad=(w.evo?46:L5(w,[30,32,34,38,40]))*P.area;
   if(!w.evo){if(w.t<=0){w.on=!w.on;w.t=w.on?L5(w,[3,3,3.5,4,4])*P.dur:2*P.cd;}}else w.on=true;
   if(!w.on){w.pos=[];return;}orbit(w,n,rad,dmg,w.evo?4:3.2,'bj','talisman');}},
 singal:{name:'신칼',type:'w',job:'mudang',max:5,evo:'osaek',evoName:'칠성검',evoDesc:'일곱 자루 칠성검이 회오리처럼 돌며 꿰뚫고 나간다.',
  desc:['신칼을 돌려 가며 던진다. 던지는 방향이 계속 바뀌어 사방을 훑는다.','칼 +1','관통 +1','칼 +1, 빨라짐','피해 +25%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;w.spin=(w.spin||0)+0.7;const n=(w.evo?7:L5(w,[2,3,3,4,4]))+P.amount,dmg=(w.evo?24:L5(w,[10,10,10,10,13]))*P.might;
   for(let i=0;i<n;i++)shoot(P.x,P.y,w.spin+i/n*TAU,200*P.pspd,'knife',dmg,w.evo?6:L5(w,[1,1,2,2,2]),0.8,3);
   w.t=(w.evo?0.6:L5(w,[1.0,1.0,1.0,0.85,0.85]))*P.cd;}},
 bara:{name:'바라',type:'w',job:'mudang',max:5,evo:'myeongtae',evoName:'천둥바라',evoDesc:'바라를 칠 때마다 천둥 같은 울림이 화면 절반까지 퍼진다.',
  desc:['바라를 쳐서 둥글게 퍼지는 울림으로 요괴를 밀어낸다.','울림 범위 +','피해 +','두 번 연달아 친다','범위 +, 피해 +'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const R0=(w.evo?110:L5(w,[46,54,54,54,64]))*P.area,dmg=(w.evo?34:L5(w,[12,12,16,16,20]))*P.might,k=w.evo?2:(w.lv>=4?2:1);
   for(let i=0;i<k;i++)G.fx.push({t:'wave',x:P.x,y:P.y,r:4-i*30,maxR:R0,dmg,hit:new Set(),life:9,col:'#e0b048',kb:60});snd(700,0.15,'triangle',0.03);
   w.t=(w.evo?2.0:L5(w,[2.6,2.5,2.4,2.4,2.2]))*P.cd;}},
 myeongdu:{name:'명두',type:'w',job:'mudang',lock:1,max:5,evo:'jeonghwasu',evoName:'일월명두',evoDesc:'해와 달을 새긴 거울이 두 줄기 빛을 쉬지 않고 돌린다.',
  desc:['청동 거울이 빛줄기를 비추며 천천히 주위를 훑는다.','빛 길이 +','피해 +','빛줄기 +1','빨리 돈다, 피해 +'],
  upd(w,dt,P){sweep(w,w.evo?2:(w.lv>=4?2:1),(w.evo?110:L5(w,[60,74,74,80,86]))*P.area,(w.evo?14:L5(w,[6,6,8,8,10]))*P.might,w.evo?2.2:L5(w,[1.3,1.3,1.3,1.4,1.8]),'md',w.evo?'sun':'light');}},
 /* ===== 장수 전용 ===== */
 hwando:{name:'환도',type:'w',job:'jangsu',max:5,evo:'gapot',evoName:'사인검',evoDesc:'인년 인월 인일 인시에 벼린 칼. 사방을 한꺼번에 벤다.',
  desc:['바라보는 쪽을 환도로 크게 벤다.','피해 +20%','뒤쪽도 함께 벤다','베는 거리 +10%','피해 +20%, 빨라짐'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;
   const dmg=(w.evo?52:L5(w,[18,22,24,26,32]))*P.might,rng=(w.evo?58:L5(w,[34,36,36,40,42]))*P.area;
   const dirs=w.evo?[0,Math.PI/2,Math.PI,-Math.PI/2]:(w.lv>=3?[P.face>0?0:Math.PI,P.face>0?Math.PI:0]:[P.face>0?0:Math.PI]);
   dirs.forEach((a,i)=>slash(P.x,P.y,a,rng,dmg,0.85,i*0.08));
   w.t=(w.evo?0.9:L5(w,[1.4,1.3,1.25,1.15,1.0]))*P.cd;}},
 pyeongon:{name:'편곤',type:'w',job:'jangsu',max:5,evo:'jeonma',evoName:'철편 기병',evoDesc:'말 위에서 휘두르듯 편곤이 두 바퀴를 크게 돈다.',
  desc:['쇠도리깨를 한 바퀴 크게 휘둘러 둘레의 요괴를 모두 친다.','피해 +20%','범위 +10%','빨라짐','피해 +20%, 범위 +'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const dmg=(w.evo?44:L5(w,[20,24,24,24,30]))*P.might,rng=(w.evo?66:L5(w,[38,38,42,42,48]))*P.area;
   slash(P.x,P.y,0,rng,dmg,Math.PI,0,'#c9a06a');if(w.evo)slash(P.x,P.y,Math.PI,rng*0.8,dmg,Math.PI,0.15,'#c9a06a');
   w.t=(w.evo?1.6:L5(w,[2.4,2.3,2.3,2.0,1.9]))*P.cd;}},
 deungpae:{name:'등패',type:'w',job:'jangsu',max:5,evo:'tugu',evoName:'철갑 등패',evoDesc:'앞뒤로 철갑 방패가 서서 요괴 탄을 되받아치고 몸으로 밀어붙인다.',
  desc:['가는 방향 앞에 방패를 세운다. 요괴 탄을 막고 닿는 요괴를 밀쳐 낸다.','피해 +','방패 크기 +','밀쳐 내는 힘 +','피해 +, 크기 +'],
  upd(w,dt,P){const n=w.evo?2:1,r=(w.evo?13:L5(w,[8,8,10,10,12]))*P.area,dmg=(w.evo?20:L5(w,[8,10,10,12,15]))*P.might,kb=w.evo?120:L5(w,[60,60,60,90,90]);
   const a0=Math.atan2(P.diry,P.dirx);w.shields=[];
   const dd=Math.max(14,r*0.55+9);for(let i=0;i<n;i++){const a=a0+i*Math.PI,x=P.x+Math.cos(a)*dd,y=P.y-3+Math.sin(a)*dd;w.shields.push([x,y,a,r]);
    for(const e of near(x,y,r,TMP).slice()){if((e.hc.dp||0)<G.time){e.hc.dp=G.time+0.35;hurt(e,dmg,kb,P.x,P.y);}}
    for(const q of G.ebul){if(q.life>0&&(q.x-x)**2+(q.y-y)**2<(r+3)**2){q.life=0;if(w.evo)shoot(x,y,Math.atan2(q.y-P.y,q.x-P.x),220,'ink',30*P.might,3,1,3);}}}}},
 jincheon:{name:'비격진천뢰',type:'w',job:'jangsu',lock:1,max:5,evo:'gunryeong',evoName:'진천뢰 일제',evoDesc:'군령에 맞춰 네 발의 진천뢰가 한꺼번에 떨어져 크게 터진다.',
  desc:['쇠 폭탄을 던진다. 떨어진 뒤 잠시 후 크게 터진다.','폭발 범위 +','폭탄 +1','피해 +25%','폭탄 +1, 빨라짐'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const n=(w.evo?4:L5(w,[1,1,2,2,3]))+P.amount,dmg=(w.evo?70:L5(w,[34,34,34,44,44]))*P.might,br=(w.evo?44:L5(w,[28,32,32,34,36]))*P.area;
   for(let i=0;i<n;i++){const tg=randomEnemy(140);const tx=tg?tg.x+rnd(-8,8):P.x+rnd(-80,80),ty=tg?tg.y+rnd(-8,8):P.y+rnd(-60,60);const a=Math.atan2(ty-P.y,tx-P.x);shoot(P.x,P.y,a,140,'bomb',dmg,1,9,3,{tx,ty,br,fuse:-1});}
   w.t=(w.evo?2.4:L5(w,[3.2,3.1,3.0,2.9,2.6]))*P.cd;}},
 /* ===== 기생 전용 ===== */
 gayageum:{name:'가야금',type:'w',job:'gisaeng',max:5,evo:'horibyeong',evoName:'취흥 산조',evoDesc:'흥에 겨운 산조 가락이 사방으로 물결치며 끝없이 꿰뚫는다.',
  desc:['가야금을 뜯어 물결치는 가락을 가까운 요괴에게 보낸다. 가락은 요괴를 꿰뚫는다.','피해 +20%','가락 +1','관통 +1, 빨라짐','가락 +1, 피해 +15%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;
   if(w.evo){w.spin=(w.spin||0)+0.5;const n=10+P.amount;for(let i=0;i<n;i++)shoot(P.x,P.y-4,w.spin+i/n*TAU,150*P.pspd,'note',18*P.might,4,1.2,3,{ph:i});w.t=0.8*P.cd;return;}
   const n=L5(w,[3,3,4,4,5])+P.amount,dmg=L5(w,[9,11,11,12,14])*P.might,pr=L5(w,[2,2,2,3,3]);const tg=nearest(P.x,P.y,220);const a=tg?Math.atan2(tg.y-P.y,tg.x-P.x):Math.atan2(P.diry,P.dirx);
   for(let i=0;i<n;i++)shoot(P.x,P.y-4,a+(i-(n-1)/2)*0.2,150*P.pspd,'note',dmg,pr,1.2,3,{ph:i*1.3});w.t=L5(w,[1.2,1.1,1.1,1.0,0.95])*P.cd;}},
 geommu:{name:'검무',type:'w',job:'gisaeng',max:5,evo:'norigae',evoName:'진주 검무',evoDesc:'여섯 자루 칼이 몸 가까이 돌고, 쉬지 않고 한 바퀴씩 크게 벤다.',
  desc:['두 자루 칼이 몸 가까이 빠르게 돌고, 이따금 한 바퀴 크게 벤다.','피해 +20%','칼 +1','큰 베기가 잦아진다','칼 +1, 피해 +20%'],
  upd(w,dt,P){const n=(w.evo?6:L5(w,[2,2,3,3,4]))+P.amount,dmg=(w.evo?24:L5(w,[10,12,12,13,16]))*P.might;orbit(w,n,(w.evo?28:22)*P.area,dmg,5,'gm','blade');
   w.t-=dt;if(w.t>0)return;slash(P.x,P.y,0,(w.evo?40:32)*P.area,dmg*1.5,Math.PI,0,'#ffb0d0');w.t=(w.evo?1.5:L5(w,[3,3,3,2.4,2.4]))*P.cd;}},
 buchaechum:{name:'부채춤',type:'w',job:'gisaeng',max:5,evo:'hwagwan',evoName:'화관무',evoDesc:'화관을 쓴 춤사위에 꽃잎 물결이 두 겹으로 퍼지고, 꽃비가 내린 자리는 요괴를 묶어 둔다.',
  desc:['부채를 펼쳐 꽃잎 물결을 둥글게 퍼뜨린다. 물결에 맞은 요괴는 느려진다.','물결 범위 +','피해 +','빨라짐','범위 +, 피해 +'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const R0=(w.evo?80:L5(w,[50,58,58,58,68]))*P.area,dmg=(w.evo?26:L5(w,[12,12,16,16,20]))*P.might;
   for(let i=0;i<(w.evo?2:1);i++)G.fx.push({t:'wave',x:P.x,y:P.y,r:4-i*30,maxR:R0,dmg,hit:new Set(),life:9,col:'#ff9ac0',kb:30,slow:1});
   if(w.evo)for(let i=0;i<3;i++){const tg=randomEnemy(120);if(tg)zone({x:tg.x,y:tg.y,r:18*P.area,dmg:8*P.might,life:2.5,col:'#ff9ac0',slow:1,hold:1,kind:'petal'});}
   w.t=(w.evo?1.8:L5(w,[2.4,2.3,2.3,2.0,1.9]))*P.cd;}},
 janggu:{name:'장구',type:'w',job:'gisaeng',lock:1,max:5,evo:'binyeo',evoName:'신명 장단',evoDesc:'신명 난 장단이 쉼 없이 울려 둘레의 요괴를 붙잡아 둔다.',
  desc:['장구를 쳐서 둘레의 요괴를 치고 잠깐 멈춰 세운다.','범위 +','피해 +','두 번 연달아 친다','빨라짐, 피해 +'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const R0=(w.evo?70:L5(w,[40,46,46,50,56]))*P.area,dmg=(w.evo?20:L5(w,[8,8,11,11,14]))*P.might,k=w.evo?1:(w.lv>=4?2:1);
   for(let i=0;i<k;i++)qpush({t:i*0.25,f:()=>{pulseRing(P.x,P.y,R0,dmg,'#e0b048',20);for(const e of near(P.x,P.y,R0,TMP2))if(!e.boss)e.frz=Math.max(e.frz,w.evo?0.6:0.4);snd(180,0.08,'square',0.04);}});
   w.t=(w.evo?1.0:L5(w,[2.0,1.9,1.8,1.6,1.4]))*P.cd;}},
 sori:{name:'소리 한 자락',type:'c',g:'唱',col:'#9a3a6a',max:5,desc:['한 자락 소리가 둥글게 퍼져 둘레를 치고, 가락이 사방으로 흩어진다.','피해 +','범위 +','가락 +4','피해 +30%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;pulseRing(P.x,P.y,L5(w,[60,60,70,70,80])*P.area,L5(w,[22,28,28,34,44])*P.might,'#ff9ac0');const n=w.lv>=4?12:8;for(let i=0;i<n;i++)shoot(P.x,P.y-4,i/n*TAU,140,'note',L5(w,[10,12,12,14,18])*P.might,2,0.9,3,{ph:i});w.t=2.5*P.cd;}},
 saranga:{name:'사랑가',type:'c',g:'愛',col:'#d86a8a',max:5,desc:['사랑가 한 대목에 화면 안 요괴가 넋을 잃고 멈춰 서서 서서히 깎인다. 보스는 멈추지 않는다.','멈추는 시간 +','피해 +','빨라짐','멈추는 시간 +, 피해 +30%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;toast(_t("사랑가"),'big');const fr=L5(w,[1.5,1.8,1.8,1.8,2.5]),dps=L5(w,[10,10,14,14,20])*P.might;
   for(const e of G.enemies)if(!e.dead&&!e.prop&&inView(e)){if(!e.boss)e.frz=Math.max(e.frz,fr);e.dotSrc=HSRC||CUR_SRC||e.dotSrc,e.dot=Math.max(e.dot||0,dps);e.dotT=3;if(Math.random()<0.3)particle(e.x,e.y-8,'#ff7ab0',2,15,0.6);}
   w.t=L5(w,[12,12,12,10,9])*P.cd;}},
 jinyang:{name:'진양조 장단',type:'c',g:'緩',col:'#7a2a5a',max:5,desc:['가장 느린 장단이 흐르는 동안 화면의 요괴가 모두 느려지고 계속 피해를 입는다.','지속 +','피해 +','빨라짐','지속 +, 피해 +30%'],
  upd(w,dt,P){if(w.on>0){w.on-=dt;w.tk=(w.tk||0)-dt;if(w.tk<=0){w.tk=0.5;for(const e of G.enemies.slice())if(!e.dead&&!e.prop&&inView(e)){e.slow=0.6;hurt(e,L5(w,[6,8,8,9,12])*P.might,0,0,0,true);}}return;}
   w.t-=dt;if(w.t>0)return;toast(_t("진양조"),'big');w.on=L5(w,[4,5,5,5,6])*P.dur;w.t=L5(w,[14,14,12,12,11])*P.cd;}},
 pansori:{name:'판소리 완창',type:'c',g:'板',col:'#3a5f9e',max:5,desc:['소리꾼의 소리가 두 줄기 물결이 되어 주위를 길게 훑는다.','길이 +','피해 +','줄기 +1','빨리 돈다, 피해 +30%'],
  upd(w,dt,P){sweep(w,w.lv>=4?3:2,L5(w,[100,114,114,124,140])*P.area,L5(w,[16,16,22,22,30])*P.might,L5(w,[1.2,1.2,1.2,1.2,1.6]),'ps','note',5);}},
 deugeum:{name:'득음',type:'c',g:'得',col:'#e0b048',max:5,desc:['소리가 경지에 이르러 화면 안 모든 요괴를 크게 치고, 내 체력을 20% 되찾는다.','피해 +','빨라짐','피해 +','회복 30%, 피해 +30%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;toast(_t("득음"),'big');flash('255,200,220',0.35);nuke(L5(w,[100,120,140,140,180])*P.might,0);heal(P.maxHp*(w.lv>=5?0.3:0.2));w.t=L5(w,[16,14,14,13,12])*P.cd;}},
 ssanggeom:{name:'쌍검무',type:'c',g:'舞',col:'#3a5f9e',max:5,desc:['칼을 든 춤사위에 칼날 넷이 몸 둘레를 넓게 돈다.','피해 +','칼날 +2','반경 +','칼날 +2, 피해 +25%'],
  upd(w,dt,P){orbit(w,L5(w,[4,4,6,6,8]),L5(w,[48,48,48,56,56])*P.area,L5(w,[18,22,22,26,32])*P.might,2.6,'sg','blade',6);}},
 kkotbi:{name:'꽃비',type:'c',g:'花',col:'#d86a8a',max:5,desc:['요괴 무리 위로 꽃잎 비를 뿌린다. 꽃비 속 요괴는 느려지고 붙잡힌다.','꽃비 +1','피해 +','범위 +','꽃비 +2, 피해 +'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const n=L5(w,[2,3,3,3,5]);for(let i=0;i<n;i++){const tg=randomEnemy();zone({x:tg?tg.x:P.x+rnd(-60,60),y:tg?tg.y:P.y+rnd(-40,40),r:L5(w,[26,26,26,32,32])*P.area,dmg:L5(w,[10,10,14,14,18])*P.might,tick:0.3,life:3*P.dur,col:'#ff9ac0',slow:1,hold:1,kind:'petal'});}w.t=3*P.cd;}},
 kalbaram:{name:'칼바람',type:'c',g:'風',col:'#c23b2a',max:5,desc:['몸을 세 번 돌려 둘레를 칼바람으로 벤다.','피해 +','범위 +','빨라짐','네 번 돈다, 피해 +'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const k=w.lv>=5?4:3,R0=L5(w,[50,50,58,58,62])*P.area,dmg=L5(w,[30,36,36,42,54])*P.might;for(let i=0;i<k;i++)qpush({t:i*0.18,f:()=>slash(P.x,P.y,i*1.3,R0,dmg,Math.PI,0,'#ffb0d0')});w.t=L5(w,[4,4,4,3.2,3])*P.cd;}},
 geomgi:{name:'검기',type:'c',g:'氣',col:'#1a2b4a',max:5,desc:['칼끝에서 뻗은 검기가 사방으로 날아가 길게 꿰뚫는다.','검기 +2','피해 +','빨라짐','검기 +4, 피해 +25%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;volley(L5(w,[8,10,10,10,14])+P.amount*2,L5(w,[24,24,30,30,40])*P.might,5,'knife',260);w.t=L5(w,[2.5,2.5,2.5,2,1.8])*P.cd;}},
 geomseon:{name:'검선 강림',type:'c',g:'仙',col:'#d86a8a',max:5,desc:['떠도는 신검들이 내려와 요괴를 쫓아다니며 벤다.','신검 +1','피해 +','신검 +1','신검 +2, 피해 +25%'],
  upd(w,dt,P){summon(w,L5(w,[3,4,4,5,7])+P.amount,L5(w,[30,30,38,38,48])*P.might,'sword',165);}},
 /* ===== 상인 ===== */
 jupan:{name:'주판',type:'w',job:'sangin',max:5,evo:'jangbu',evoName:'천금 주판',evoDesc:'천금을 셈하는 주판이 쉼 없이 튕겨 주판알 열둘을 사방으로 꿰뚫어 보낸다.',
  desc:['주판알을 튕겨 가까운 요괴에게 부채꼴로 날린다.','알 +1','피해 +20%','관통 +1, 빨라짐','알 +1, 피해 +15%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;
   if(w.evo){w.spin=(w.spin||0)+0.4;const n=12+P.amount;for(let i=0;i<n;i++)shoot(P.x,P.y-4,w.spin+i/n*TAU,230*P.pspd,'bead',16*P.might,3,0.8,2);w.t=0.85*P.cd;return;}
   const n=L5(w,[3,4,4,4,5])+P.amount,dmg=L5(w,[9,9,11,11,13])*P.might,pr=L5(w,[1,1,1,2,2]);const tg=nearest(P.x,P.y,220);const a=tg?Math.atan2(tg.y-P.y,tg.x-P.x):Math.atan2(P.diry,P.dirx);
   for(let i=0;i<n;i++)shoot(P.x,P.y-4,a+(i-(n-1)/2)*0.16,230*P.pspd,'bead',dmg,pr,0.8,2);w.t=L5(w,[1.1,1.1,1.05,0.95,0.9])*P.cd;}},
 yeopjeon:{name:'엽전 꾸러미',type:'w',job:'sangin',max:5,evo:'jeondae',evoName:'상평통보 비',evoDesc:'상평통보 여섯 닢이 요괴와 요괴 사이를 여섯 번씩 튕겨 다닌다.',
  desc:['엽전을 던진다. 엽전은 맞힌 요괴에게서 가까운 요괴로 튕겨 간다.','튕김 +1','엽전 +1','피해 +','튕김 +1, 엽전 +1'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const n=(w.evo?6:L5(w,[1,1,2,2,3]))+P.amount,dmg=(w.evo?20:L5(w,[12,12,12,15,17]))*P.might,bn=w.evo?6:L5(w,[2,3,3,3,4]);
   for(let i=0;i<n;i++){const tg=randomEnemy(160);const a=tg?Math.atan2(tg.y-P.y,tg.x-P.x)+(i-(n-1)/2)*0.25:Math.random()*TAU;shoot(P.x,P.y-4,a,210*P.pspd,'coin',dmg,1,1.4,2.5,{bounces:bn});}
   w.t=(w.evo?1.1:L5(w,[1.5,1.4,1.4,1.3,1.2]))*P.cd;}},
 doe:{name:'됫박',type:'w',job:'sangin',max:5,evo:'myeongtae',evoName:'만석 곳간',evoDesc:'곳간을 열어 쌀을 쏟듯, 요괴 무리 셋 위로 쌀알 장판을 크게 펼쳐 붙잡아 둔다.',
  desc:['됫박으로 쌀을 퍼서 요괴 무리 위에 뿌린다. 쌀알 장판 위의 요괴는 느려지고 깎인다.','장판 +1','범위 +','피해 +','장판 +1, 오래 남는다'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const n=w.evo?3:L5(w,[1,2,2,2,3]),R0=(w.evo?34:L5(w,[22,22,26,26,28]))*P.area,dmg=(w.evo?12:L5(w,[6,6,7,9,9]))*P.might;
   for(let i=0;i<n;i++){const tg=randomEnemy(150);zone({x:tg?tg.x:P.x+rnd(-60,60),y:tg?tg.y:P.y+rnd(-40,40),r:R0,dmg,tick:0.35,life:(w.evo?4:L5(w,[2.5,2.5,2.5,2.5,3.5]))*P.dur,col:'#efe6d2',slow:1,hold:w.evo?1:0,kind:'rice'});}
   w.t=(w.evo?2.2:L5(w,[2.8,2.6,2.6,2.4,2.4]))*P.cd;}},
 jige:{name:'등짐 지게',type:'w',job:'sangin',lock:1,max:5,evo:'jeoul',evoName:'천근 지게',evoDesc:'천 근 등짐을 두 번 내리찍어 둘레를 크게 부수고 요괴를 멀리 날린다.',
  desc:['등에 진 지게를 쿵 내려놓아 둘레의 요괴를 치고 밀어낸다.','범위 +','피해 +','빨라짐','범위 +, 피해 +25%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const R0=(w.evo?72:L5(w,[44,50,50,54,60]))*P.area,dmg=(w.evo?40:L5(w,[22,22,28,28,35]))*P.might,k=w.evo?2:1;
   for(let i=0;i<k;i++)qpush({t:i*0.3,f:()=>{pulseRing(P.x,P.y,R0,dmg,'#c9a06a',150);G.shake=Math.max(G.shake,meta.set.shake?2:0);particle(P.x,P.y,'#c9a06a',10,60,0.35);snd(90,0.12,'square',0.05);}});
   w.t=(w.evo?2.2:L5(w,[3,3,3,2.6,2.5]))*P.cd;}},
 heungjeong:{name:'흥정',type:'c',g:'價',col:'#9a6a10',max:5,desc:['요괴에게 값을 매긴다. 화면 안 요괴 몇에 엽전 표식을 붙이고 친다. 표식이 붙은 요괴는 받는 피해 +50%.','표식 +2','피해 +','빨라짐','표식 +3, 피해 +30%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const n=L5(w,[4,6,6,6,9])+P.amount,dmg=L5(w,[24,24,30,30,40])*P.might;const l=G.enemies.filter(e=>!e.dead&&!e.prop&&!e.inv&&inView(e)).sort((a,b)=>b.hp-a.hp).slice(0,n);
   for(const e of l){e.mark=G.time+4;hurt(e,dmg,0);G.fx.push({t:'bolt',x:e.x,y:e.y,life:0.15,max:0.15,seed:Math.random()*99});particle(e.x,e.y-6,'#e0b048',4,30,0.4);}
   w.t=L5(w,[4,4,4,3.4,3.2])*P.cd;}},
 geumnan:{name:'금난전권',type:'c',g:'禁',col:'#7a2018',max:5,desc:['난전을 금한다. 둘레에 허가 없이 들어온 요괴를 크게 쳐서 멀리 몰아내고 늦춘다.','범위 +','피해 +','빨라짐','범위 +, 피해 +30%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const R0=L5(w,[64,72,72,80,88])*P.area,dmg=L5(w,[26,26,34,34,44])*P.might;pulseRing(P.x,P.y,R0,dmg,'#c23b2a',220);for(const e of near(P.x,P.y,R0,TMP2))e.slow=Math.max(e.slow,1.2);
   w.t=L5(w,[3.6,3.6,3.6,3,2.8])*P.cd;}},
 gaekju:{name:'객주 짐꾼',type:'c',g:'客',col:'#2f6b5a',max:5,desc:['객주에 묵던 짐꾼들이 달려 나와 지겟작대기로 요괴를 친다.','짐꾼 +1','피해 +','짐꾼 +1','짐꾼 +2, 피해 +25%'],
  upd(w,dt,P){summon(w,L5(w,[2,3,3,4,6])+P.amount,L5(w,[20,20,26,26,34])*P.might,'porter',125);}},
 eoeum:{name:'어음',type:'c',g:'票',col:'#e0b048',max:5,desc:['도장 찍힌 어음이 날아가 요괴를 끝까지 쫓아 꿰뚫고, 닿은 자리에서 터진다.','어음 +1','피해 +','어음 +2','빨라짐, 피해 +30%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const n=L5(w,[3,4,4,6,6])+P.amount,dmg=L5(w,[26,26,32,32,42])*P.might;for(let i=0;i<n;i++){const tg=randomEnemy();shoot(P.x,P.y-4,i/n*TAU,170*P.pspd,'letter',dmg,2,2.2,3,{tg,bill:1,boom:12});}
   w.t=L5(w,[2.6,2.6,2.6,2.6,2.1])*P.cd;}},
 mangeum:{name:'만금 거래',type:'c',g:'金',col:'#e0b048',max:5,desc:['만금이 오가는 큰 거래. 요괴 무리 위로 금덩이가 쏟아져 크게 터지고 엽전이 흩어진다.','금덩이 +2','피해 +','빨라짐','금덩이 +4, 피해 +30%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;toast(_t("만금 거래"),'big');const n=L5(w,[6,8,8,8,12]),dmg=L5(w,[70,70,90,90,120])*P.might;
   for(let i=0;i<n;i++){const tg=randomEnemy();warn({x:tg?tg.x:P.x+rnd(-W/2,W/2),y:tg?tg.y:P.y+rnd(-H/2,H/2),r:24*P.area,t:0.5+i*0.06,dmg,friendly:1,col:'#e0b048',fx:'gold'});}
   w.t=L5(w,[10,10,10,8.5,8])*P.cd;}},
 bottari:{name:'봇짐 던지기',type:'c',g:'褓',col:'#8a5a2b',max:5,desc:['봇짐을 휘둘러 던진다. 봇짐은 멀리 갔다가 되돌아오며 길 위의 요괴를 친다.','봇짐 +1','피해 +','크기 +','봇짐 +2, 피해 +25%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const n=L5(w,[2,3,3,3,5])+P.amount,dmg=L5(w,[18,18,24,24,30])*P.might,a0=Math.random()*TAU;
   for(let i=0;i<n;i++)shoot(P.x,P.y,a0+i/n*TAU,180*P.pspd,'boomer',dmg,99,3,L5(w,[5,5,5,6,6])*P.area,{v0:180*P.pspd,tt:0,bundle:1});w.t=L5(w,[2.4,2.4,2.4,2.4,2])*P.cd;}},
 mulmi:{name:'물미장',type:'c',g:'杖',col:'#4a3a30',max:5,desc:['쇠고리 달린 물미작대기를 휘둘러 몸 둘레를 두 번 크게 후려친다.','피해 +','범위 +','빨라짐','세 번 후려친다, 피해 +'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const k=w.lv>=5?3:2,R0=L5(w,[46,46,54,54,58])*P.area,dmg=L5(w,[26,32,32,38,48])*P.might;for(let i=0;i<k;i++)qpush({t:i*0.2,f:()=>slash(P.x,P.y,i*Math.PI,R0,dmg,Math.PI,0,'#c9a06a')});w.t=L5(w,[3,3,3,2.5,2.4])*P.cd;}},
 tongmun:{name:'통문',type:'c',g:'通',col:'#3a5f9e',max:5,desc:['통문을 돌려 팔도의 보부상 동무를 부른다. 동무들이 요괴를 쫓아다니며 친다.','동무 +1','피해 +','동무 +1','동무 +2, 피해 +25%'],
  upd(w,dt,P){summon(w,L5(w,[2,3,3,4,6])+P.amount,L5(w,[24,24,30,30,40])*P.might,'peddler',140);}},
 jangdol:{name:'장돌림',type:'c',g:'市',col:'#9a6a10',max:5,desc:['닷새장을 도는 장돌뱅이 수레가 화면을 가로질러 달리며 앞을 막는 요괴를 들이받는다.','수레 +1','피해 +','빨라짐','수레 +2, 피해 +30%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const n=L5(w,[2,3,3,3,5]),dmg=L5(w,[40,40,52,52,68])*P.might;
   for(let i=0;i<n;i++){const dir=i%2?-1:1,y=P.y+(i-(n-1)/2)*34;G.movers.push({x:P.x-dir*(W/2+30),y,vx:dir*200,r:16,dmg,hit:new Set(),life:(W+60)/200+0.3,dir,kind:'cart'});}
   w.t=L5(w,[7,7,7,6,5.5])*P.cd;}},
 paldo:{name:'팔도 행상',type:'c',g:'八',col:'#e0b048',max:5,desc:['팔도의 장터가 한꺼번에 열린다. 여덟 방위에서 짐이 터지고 주판알이 사방으로 흩어진다.','피해 +','범위 +','빨라짐','알 +8, 피해 +30%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const R1=L5(w,[60,60,70,70,76])*P.area,dmg=L5(w,[50,60,60,72,90])*P.might;
   for(let i=0;i<8;i++){const a=i/8*TAU;warn({x:P.x+Math.cos(a)*R1,y:P.y+Math.sin(a)*R1*0.8,r:22*P.area,t:0.45,dmg,friendly:1,col:'#e0b048'});}
   volley(w.lv>=5?24:16,dmg*0.3,2,'bead',240);w.t=L5(w,[6,6,6,5,4.5])*P.cd;}},
 /* ===== 공용 ===== */
 tuho:{name:'투호',type:'w',max:5,evo:'gat',evoName:'백발백중 투호',evoDesc:'항아리를 겨눈 화살 여덟 대가 요괴 무리 위로 떨어져 크게 터진다.',
  desc:['투호 화살을 높이 던져 요괴 위로 떨어뜨린다. 떨어진 자리가 터진다.','화살 +1','범위 +','피해 +','화살 +2, 빨라짐'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const n=(w.evo?8:L5(w,[2,3,3,3,5]))+P.amount,dmg=(w.evo?30:L5(w,[16,16,16,21,24]))*P.might,r=(w.evo?20:L5(w,[13,13,16,16,17]))*P.area;
   for(let i=0;i<n;i++){const tg=randomEnemy();warn({x:tg?tg.x:P.x+rnd(-80,80),y:tg?tg.y:P.y+rnd(-60,60),r,t:0.5+i*0.05,dmg,friendly:1,col:'#c9a06a'});}
   w.t=(w.evo?1.8:L5(w,[2.4,2.3,2.3,2.2,2]))*P.cd;}},
 yut:{name:'윷',type:'w',max:5,evo:'seochaek',evoName:'윷판 모',evoDesc:'던질 때마다 걸 이상이 나오고, 모가 나오면 둘레가 크게 터진다.',
  desc:['윷가락을 던져 나온 끗수(도·개·걸·윷·모)만큼 윷가락이 요괴에게 날아간다. 모가 나오면 둘레가 터진다.','윷가락 +1','피해 +','관통 +1','윷가락 +1, 빨라짐'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const r=Math.random(),k=w.evo?(r<0.45?3:r<0.8?4:5):(r<0.15?1:r<0.5?2:r<0.8?3:r<0.93?4:5),NM=[_t("도"),_t("개"),_t("걸"),_t("윷"),_t("모")];
   const n=k+(w.evo?2:w.lv>=5?2:w.lv>=2?1:0)+P.amount,dmg=(w.evo?22:L5(w,[13,13,16,16,18]))*P.might,pr=w.evo?3:L5(w,[1,1,1,2,2]);
   for(let i=0;i<n;i++){const tg=randomEnemy(180);const a=tg?Math.atan2(tg.y-P.y,tg.x-P.x)+rnd(-0.15,0.15):Math.random()*TAU;shoot(P.x,P.y-4,a,220*P.pspd,'yut',dmg,pr,0.9,3);}
   if(k===5)pulseRing(P.x,P.y,(w.evo?80:60)*P.area,dmg*2.5,'#e0b048',80);
   if(G.fx.length<CAP.n)G.fx.push({t:'num',x:P.x,y:P.y-22,v:NM[k-1],life:0.6,max:0.6,big:k===5});w.t=(w.evo?1.3:L5(w,[1.8,1.8,1.7,1.7,1.5]))*P.cd;}},
 yeon:{name:'방패연',type:'w',max:5,evo:'jipsin',evoName:'가오리연 떼',evoDesc:'연 여섯이 하늘을 누비며 요괴에게 내리꽂힌다.',
  desc:['방패연이 하늘을 날다 요괴에게 내리꽂힌다.','연 +1','피해 +','빨라짐','연 +1, 피해 +'],
  upd(w,dt,P){summon(w,(w.evo?6:L5(w,[1,2,2,2,3]))+P.amount,(w.evo?18:L5(w,[10,10,13,15,16]))*P.might,'kite',w.evo?190:L5(w,[150,150,150,170,170]));}},
 jegi:{name:'제기',type:'w',max:5,evo:'gapot',evoName:'천 번 제기차기',evoDesc:'제기 셋이 요괴 머리 위를 여덟 번씩 튀어 다닌다.',
  desc:['제기를 차 올리면 요괴 머리 위에서 튀어 가까운 요괴로 옮겨 간다.','튕김 +2','제기 +1','피해 +','튕김 +2, 빨라짐'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const n=(w.evo?3:L5(w,[1,1,2,2,2]))+P.amount,dmg=(w.evo?20:L5(w,[12,12,12,15,15]))*P.might,bn=w.evo?8:L5(w,[3,5,5,5,7]);
   for(let i=0;i<n;i++){const tg=nearest(P.x,P.y,200);const a=tg?Math.atan2(tg.y-P.y,tg.x-P.x)+(i-(n-1)/2)*0.3:Math.random()*TAU;shoot(P.x,P.y-4,a,180*P.pspd,'jegi',dmg,1,1.5,3,{bounces:bn});}
   w.t=(w.evo?1.2:L5(w,[1.7,1.6,1.6,1.5,1.3]))*P.cd;}},
 bangul:{name:'방울',type:'w',max:5,evo:'jipsin',evoName:'대신방울',evoDesc:'방울 소리가 넓게 퍼지고, 소리 안의 요괴는 걸음이 느려진다.',
  desc:['방울 소리가 주위 요괴에게 계속 피해를 준다.','범위 +15%','피해 +1, 빨라짐','범위 +15%','피해 +2'],
  upd(w,dt,P){w.R=(w.evo?58:L5(w,[26,30,30,35,35]))*P.area;w.t-=dt;if(w.t>0)return;
   const dmg=(w.evo?11:L5(w,[4,4,5,5,7]))*P.might;
   for(const e of near(P.x,P.y,w.R,TMP).slice()){hurt(e,dmg,4,P.x,P.y);if(w.evo)e.slow=0.5;}
   w.t=(w.evo?0.4:L5(w,[0.6,0.6,0.5,0.5,0.5]))*P.cd;w.pulse=0.2;}},
 hwasal:{name:'각궁',type:'w',max:5,evo:'yundo',evoName:'편전',evoDesc:'짧고 매서운 애기살이 쉴 새 없이 날아간다.',
  desc:['화면 안 요괴를 골라 관통하는 화살을 쏜다.','화살 +1','관통 +1, 피해 +','화살 +1','빨라짐, 관통 +1'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;
   const n=(w.evo?3:L5(w,[1,2,2,3,3]))+P.amount,dmg=(w.evo?22:L5(w,[12,13,16,17,19]))*P.might,pr=w.evo?5:L5(w,[2,2,3,3,4]);
   for(let i=0;i<n;i++){const tg=randomEnemy();const a=tg?Math.atan2(tg.y-P.y,tg.x-P.x):Math.random()*TAU;shoot(P.x,P.y,a,(w.evo?330:270)*P.pspd,'arrow',dmg,pr,0.9,2);}
   w.t=(w.evo?0.28:L5(w,[1.2,1.1,1.05,0.95,0.8]))*P.cd;}},
 singijeon:{name:'신기전',type:'w',lock:1,max:5,evo:'hwayak',evoName:'화차',evoDesc:'수레에 꽂힌 신기전이 한꺼번에 불을 뿜는다.',
  desc:['요괴를 쫓아가 터지는 불화살을 쏜다.','폭발 범위 +10%','불화살 +1','피해 +15%','불화살 +1, 빨라짐'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;
   const n=(w.evo?7:L5(w,[1,1,2,2,3]))+P.amount,dmg=(w.evo?42:L5(w,[22,24,24,28,32]))*P.might,br=(w.evo?34:L5(w,[20,22,22,24,26]))*P.area;
   for(let i=0;i<n;i++){const tg=randomEnemy();const a=tg?Math.atan2(tg.y-P.y,tg.x-P.x)+rnd(-0.6,0.6):Math.random()*TAU;shoot(P.x,P.y,a,90,'rocket',dmg,1,1.6,3,{tg,br});}
   w.t=(w.evo?1.2:L5(w,[2.2,2.1,2.0,1.9,1.6]))*P.cd;}},
 yaktang:{name:'약탕',type:'w',lock:1,max:5,evo:'horibyeong',evoName:'십전대보탕',evoDesc:'끓는 약탕이 요괴를 녹이고, 그 위에 선 나는 기운을 되찾는다.',
  desc:['쓴 약탕을 뿌려 그 자리의 요괴를 녹인다.','범위 +10%','웅덩이 +1','피해 +, 지속 +','웅덩이 +1, 빨라짐'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;
   const n=(w.evo?4:L5(w,[1,1,2,2,3]))+P.amount,dmg=(w.evo?12:L5(w,[5,6,6,7,8]))*P.might,R0=(w.evo?30:L5(w,[16,18,18,21,22]))*P.area,life=(w.evo?4:L5(w,[2.5,2.6,2.8,3.2,3.4]))*P.dur;
   for(let i=0;i<n;i++){const tg=randomEnemy(110);zone({x:tg?tg.x:P.x+rnd(-70,70),y:tg?tg.y:P.y+rnd(-50,50),r:R0,dmg,life,col:w.evo?'#e0b048':'#5fbf6a',heal:w.evo?1.5:0});}
   w.t=(w.evo?2.4:L5(w,[3.2,3.0,2.9,2.7,2.4]))*P.cd;}},

 /* ===== 전직 기술 (40) ===== */
 // 선비 · 학문
 cheonja:{name:'천자문',type:'c',g:'天',col:'#2c4a7a',max:5,desc:['하늘에서 천자문의 글자가 떨어져 요괴를 내리친다.','글자 +1, 피해 +','글자 +1','글자 +1, 빨라짐','글자 +2, 피해 +25%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;rainGlyph(L5(w,[3,4,5,6,8])+P.amount,L5(w,[26,32,36,42,52])*P.might,14*P.area,HANJA);w.t=L5(w,[1.6,1.5,1.4,1.25,1.1])*P.cd;}},
 mukhyang:{name:'묵향 결계',type:'c',g:'墨',col:'#2a2228',max:5,desc:['먹 향이 몸 주위에 결계를 쳐서 안에 든 요괴를 느리게 하고 계속 깎는다.','범위 +','피해 +','범위 +','피해 +30%'],
  upd(w,dt,P){if(!w.z||!G.zones.includes(w.z)){w.z={x:P.x,y:P.y,r:30,dmg:5,life:1e9,max:1e9,tt:0,tick:0.4,heal:0,col:'#6a5a8a',follow:1,slow:1,src:w.id};G.zones.push(w.z);}
   w.z.r=L5(w,[34,40,40,48,48])*P.area;w.z.dmg=L5(w,[6,6,9,9,12])*P.might;}},
 hunmin:{name:'훈민정음',type:'c',g:'訓',col:'#c8402c',max:5,desc:['스물여덟 글자가 화면 가득 쏟아져 모든 요괴를 내리친다.','피해 +','빨라짐','피해 +','빨라짐, 피해 +25%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;toast(_t("훈민정음"),'big');rainGlyph(28,L5(w,[60,75,75,90,110])*P.might,18*P.area,JAMO,true);w.t=L5(w,[13,13,11,11,9])*P.cd;}},
 gyeongguk:{name:'경국대전',type:'c',g:'典',col:'#7a2018',max:5,desc:['법전의 조문이 몸 둘레를 넓게 돌며 닿는 요괴를 다스린다.','조문 +1','피해 +','조문 +1, 빨라짐','조문 +2, 피해 +25%'],
  upd(w,dt,P){orbit(w,L5(w,[6,7,7,8,10]),72*P.area,L5(w,[30,34,40,44,56])*P.might,L5(w,[0.9,0.9,0.9,1.1,1.1]),'gg','law',7);}},
 ilpil:{name:'대일필',type:'c',g:'筆',col:'#1a1418',max:5,desc:['커다란 붓이 화면을 가로질러 한 획을 긋는다. 먹이 지나간 자리는 요괴를 늦춘다.','피해 +','획이 굵어진다','빨라짐','두 획을 긋는다'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const tg=nearest(P.x,P.y,260),len=Math.hypot(W,H),wd=L5(w,[24,24,32,32,32])*P.area,dmg=L5(w,[160,200,200,240,280])*P.might;
   const strokes=w.lv>=5?2:1;for(let s=0;s<strokes;s++){const a=(tg?Math.atan2(tg.y-P.y,tg.x-P.x):Math.random()*TAU)+s*Math.PI/2;const sx=P.x-Math.cos(a)*len/2,sy=P.y-Math.sin(a)*len/2;
    beam(sx,sy,a,len,wd,dmg,'#1a1418');for(let i=1;i<6;i++)zone({x:sx+Math.cos(a)*len*i/6,y:sy+Math.sin(a)*len*i/6,r:wd*0.7,dmg:10*P.might,life:3,col:'#2a2228',slow:1});}
   G.shake=Math.max(G.shake,2);snd(90,0.3,'sawtooth',0.05);w.t=L5(w,[7,7,7,6,6])*P.cd;}},
 // 선비 · 감찰
 mapae:{name:'마패 출두',type:'c',g:'牌',col:'#9a6a10',max:5,desc:['마패를 들어 화면 안 모든 요괴를 내리치고 얼어붙게 한다.','피해 +','얼리는 시간 +','빨라짐','피해 +30%, 빨라짐'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;toast(_t("암행어사 출두야!"),'big');flash('255,230,160',0.35);snd(140,0.4,'sawtooth',0.06);
   nuke(L5(w,[45,60,70,85,110])*P.might,L5(w,[1.2,1.4,1.8,1.8,2.0]));w.t=L5(w,[14,13,12,10.5,9])*P.cd;}},
 yeokjol:{name:'역졸 소환',type:'c',g:'卒',col:'#7a2018',max:5,desc:['어사를 따르는 역졸들이 달려 나와 요괴를 몽둥이로 친다.','역졸 +1','피해 +','역졸 +1','역졸 +1, 피해 +25%'],
  upd(w,dt,P){summon(w,L5(w,[2,3,3,4,5])+P.amount,L5(w,[18,18,24,24,30])*P.might,'yeokjol',120);}},
 orat:{name:'오랏줄',type:'c',g:'縛',col:'#4a3a30',max:5,desc:['붉은 오랏줄이 요괴에서 요괴로 옮겨 가며 묶고 친다.','줄이 옮겨 가는 수 +2','피해 +','줄 +1','묶는 시간 +, 피해 +25%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const n=w.lv>=4?2:1;for(let i=0;i<n;i++){const s=randomEnemy(90);if(s)chainHit(s,L5(w,[5,7,7,7,9]),L5(w,[22,22,28,28,36])*P.might,'#c23b2a',L5(w,[0.6,0.6,0.6,0.6,1.0]));}w.t=L5(w,[2.2,2.1,2.0,1.9,1.7])*P.cd;}},
 tanhaek:{name:'탄핵 상소',type:'c',g:'劾',col:'#3a1a2a',max:5,desc:['화면에서 가장 강한 요괴를 탄핵한다. 큰 피해를 주고, 5초 동안 그 요괴가 받는 피해가 50% 늘어난다.','피해 +','빨라짐','피해 +','두 마리를 탄핵한다'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const list=G.enemies.filter(e=>!e.dead&&!e.prop&&!e.inv&&inView(e)).sort((a,c)=>c.hp-a.hp).slice(0,w.lv>=5?2:1);
   for(const e of list){e.mark=G.time+5;hurt(e,L5(w,[60,75,75,95,110])*P.might,0);G.fx.push({t:'bolt',x:e.x,y:e.y,life:0.2,max:0.2,seed:Math.random()*99,col:'#ff5a3a'});}
   w.t=L5(w,[3,3,2.6,2.6,2.4])*P.cd;}},
 eomyeong:{name:'어명',type:'c',g:'命',col:'#c23b2a',max:5,desc:['어명이 떨어지면 화면 안 요괴가 최대 체력의 40%를 잃는다. 보스는 3%.','비율 +5%','빨라짐','비율 +5%','빨라짐, 비율 +5%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;toast(_t("어명이오!"),'big');flash('255,210,120',0.4);snd(110,0.5,'sawtooth',0.06);const pc=L5(w,[0.4,0.45,0.45,0.5,0.55]),pb=L5(w,[0.03,0.035,0.035,0.04,0.045]);
   for(const e of G.enemies.slice()){if(!e.dead&&inView(e)&&!e.prop)hurt(e,e.maxHp*(e.boss?pb:pc)*(e.elite?0.5:1),0,0,0,true);}w.t=L5(w,[16,16,14,14,12])*P.cd;}},
 // 의원 · 내의원
 gugeup:{name:'구급방',type:'c',g:'救',col:'#2f7d6b',max:5,desc:['꾸준히 체력을 회복하고, 주기적으로 약기운이 퍼져 주위를 정화한다.','회복 +, 피해 +','범위 +','회복 +, 피해 +','회복 +, 범위 +'],
  upd(w,dt,P){heal(L5(w,[0.6,0.9,1.1,1.5,2.0])*dt);w.t-=dt;if(w.t>0)return;pulseRing(P.x,P.y,L5(w,[42,44,50,52,60])*P.area,L5(w,[18,24,28,34,42])*P.might,'#7fe0a0');w.t=3*P.cd;}},
 tteum:{name:'쑥뜸',type:'c',g:'灸',col:'#b0702e',max:5,desc:['몸 둘레에 쑥뜸 불씨를 놓는다. 불씨 위의 요괴는 타들어 간다.','불씨 +1','피해 +','불씨 +1, 크기 +','불씨 +2'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const n=L5(w,[3,4,4,5,7]),o=Math.random()*TAU;
   for(let i=0;i<n;i++){const a=o+i/n*TAU;zone({x:P.x+Math.cos(a)*36,y:P.y+Math.sin(a)*28,r:L5(w,[12,12,12,15,15])*P.area,dmg:L5(w,[7,7,10,10,12])*P.might,life:3*P.dur,col:'#ff9a4a',kind:'fire'});}
   w.t=3.2*P.cd;}},
 bogam:{name:'동의보감',type:'c',g:'寶',col:'#3f9a7a',max:5,desc:['의서의 지혜로 체력의 25%를 되찾고 잠시 무적이 되며, 큰 약기운이 퍼진다.','피해 +','회복 +','빨라짐','피해 +30%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;heal(P.maxHp*L5(w,[0.25,0.25,0.32,0.32,0.35]));P.iframe=Math.max(P.iframe,1.2);toast(_t("동의보감"),'big');
   G.fx.push({t:'wave',x:P.x,y:P.y,r:4,maxR:140*P.area,dmg:L5(w,[50,64,64,64,84])*P.might,hit:new Set(),life:9,col:'#7fe0a0',kb:140});w.t=L5(w,[15,15,15,12,12])*P.cd;}},
 yakcho:{name:'약초밭',type:'c',g:'草',col:'#3f9a5a',max:5,desc:['둘레에 약초밭 세 곳을 일군다. 밭 위에 서면 체력이 차오르고, 밭에 든 요괴는 시든다.','회복 +','피해 +','밭 +1','회복 +, 피해 +'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const n=w.lv>=4?4:3,o=Math.random()*TAU;
   for(let i=0;i<n;i++){const a=o+i/n*TAU;zone({x:P.x+Math.cos(a)*48,y:P.y+Math.sin(a)*38,r:22*P.area,dmg:L5(w,[8,8,12,12,16])*P.might,heal:L5(w,[1,1.5,1.5,1.5,2.2]),life:5*P.dur,col:'#7fd07f',kind:'herb'});}
   w.t=6*P.cd;}},
 hoesaeng:{name:'회생',type:'c',g:'生',col:'#9af0b0',max:5,desc:['쓰러질 때 한 번 체력의 60%로 되살아난다. 다시 쓰려면 120초를 기다려야 한다. 평소에도 초당 1.5씩 회복한다.','대기 105초','대기 90초','대기 80초','대기 70초, 되살아날 때 큰 약기운'],
  upd(w,dt,P){heal(1.5*dt);w.t-=dt;w.ready=w.t<=0;}},
 // 의원 · 독술
 bisang:{name:'비상 연기',type:'c',g:'毒',col:'#5a3a7a',max:5,desc:['발밑에 비상을 태워 넓은 독연기를 피운다.','피해 +','범위 +','빨라짐, 피해 +','범위 +, 피해 +20%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;zone({x:P.x,y:P.y,r:L5(w,[38,40,46,46,54])*P.area,dmg:L5(w,[7,9,10,12,15])*P.might,tick:0.3,life:3.5*P.dur,col:'#a070d0'});w.t=L5(w,[4.5,4.3,4.1,3.6,3.3])*P.cd;}},
 dokchim:{name:'칠독침',type:'c',g:'針',col:'#5a3a7a',max:5,desc:['사방으로 독침을 흩뿌린다. 맞은 요괴는 독이 퍼져 계속 피해를 입는다.','침 +4','독 피해 +','침 +4, 빨라짐','독 지속 +, 피해 +'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;volley(L5(w,[10,14,14,18,18])+P.amount*2,6*P.might,2,'needle',230,{dot:L5(w,[6,6,9,9,12])*P.might,dotT:L5(w,[3,3,3,3,4.5])*P.dur,purple:1});w.t=L5(w,[2.6,2.6,2.6,2.2,2.2])*P.cd;}},
 mandok:{name:'만독불침',type:'c',g:'萬',col:'#3a1a4a',max:5,desc:['온갖 독을 한꺼번에 퍼뜨려 화면 안 모든 요괴를 중독시킨다.','독 피해 +','빨라짐','독 피해 +','독 피해 +30%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;toast(_t("만독불침"),'big');flash('150,80,200',0.35);const dps=L5(w,[20,28,28,36,48])*P.might;
   for(const e of G.enemies)if(!e.dead&&inView(e)){e.dotSrc=HSRC||CUR_SRC||e.dotSrc,e.dot=Math.max(e.dot||0,dps);e.dotT=5*P.dur;}w.t=L5(w,[11,11,9,9,8])*P.cd;}},
 godok:{name:'고독',type:'c',g:'蠱',col:'#2a1a2a',max:5,desc:['독벌레 떼를 풀어 요괴를 물게 한다. 물린 요괴는 중독된다.','벌레 +1','독 +','벌레 +1','벌레 +2, 피해 +'],
  upd(w,dt,P){summon(w,L5(w,[4,5,5,6,8])+P.amount,L5(w,[10,10,13,13,16])*P.might,'bug',150,{dot:L5(w,[8,8,12,12,15])*P.might});}},
 cheondok:{name:'천독지',type:'c',g:'池',col:'#3a1a4a',max:5,desc:['발밑에 독의 못을 연다. 못 안의 요괴는 보스까지 느려지고 녹아내린다.','범위 +','피해 +','빨라짐','범위 +, 피해 +30%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;zone({x:P.x,y:P.y,r:L5(w,[70,78,78,78,90])*P.area,dmg:L5(w,[12,12,16,16,21])*P.might,tick:0.3,life:5*P.dur,col:'#7a3aa0',slow:1,kind:'pool'});flash('120,40,160',0.25);w.t=L5(w,[9,9,9,7.5,7.5])*P.cd;}},
 // 무당 · 굿
 gut:{name:'굿판',type:'c',g:'神',col:'#3a5f9e',max:5,desc:['굿으로 장군신을 불러 요괴를 물어뜯게 한다.','장군신 +1','피해 +','장군신 +1','장군신 +1, 피해 +20%'],
  upd(w,dt,P){summon(w,L5(w,[1,2,2,3,4])+P.amount,L5(w,[16,20,26,30,38])*P.might,'spirit',110);}},
 jakduchum:{name:'작두춤',type:'c',g:'刃',col:'#8a8494',max:5,desc:['작두에 오른 신이 큰 작두날을 넓게 돌린다.','날 +1','피해 +','날 +1, 반경 +','날 +1, 피해 +25%'],
  upd(w,dt,P){orbit(w,L5(w,[2,3,3,4,5]),L5(w,[54,54,54,62,62])*P.area,L5(w,[20,20,26,26,32])*P.might,1.8,'jd','blade');}},
 daedong:{name:'대동굿',type:'c',g:'洞',col:'#c8402c',max:5,desc:['마을 전체의 굿판이 열린다. 수많은 신이 잠시 내려와 날뛰고 화면이 정화된다.','피해 +','신 +2','빨라짐','피해 +30%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;toast(_t("대동굿"),'big');flash('255,200,150',0.3);nuke(L5(w,[40,52,52,52,68])*P.might,0);
   const n=L5(w,[6,6,8,8,8]);for(let i=0;i<n;i++){const a=i/n*TAU;G.spirits.push({own:'temp',look:'spirit',x:P.x+Math.cos(a)*20,y:P.y+Math.sin(a)*20,ph:a,id:Math.random(),dmg:24*P.might,sp:140,life:6*P.dur});}
   w.t=L5(w,[16,16,16,13,13])*P.cd;}},
 jinogwi:{name:'진오귀굿',type:'c',g:'魂',col:'#efe6d2',max:5,desc:['넋을 달래는 굿. 요괴가 쓰러질 때 일정 확률로 그 넋이 내 편이 되어 잠시 싸운다.','확률 +','넋의 힘 +','확률 +','확률 +, 넋 지속 +'],
  upd(w,dt,P){G.jinogwi={ch:L5(w,[0.08,0.1,0.12,0.12,0.16]),dmg:L5(w,[18,18,24,24,30])*P.might,life:L5(w,[5,5,5,5,8])*P.dur};}},
 gil:{name:'길닦음',type:'c',g:'道',col:'#efe6d2',max:5,desc:['저승 가는 길을 닦는 흰 무명천이 길게 펼쳐져 돌며 요괴를 쓸어 낸다.','천 길이 +','피해 +','천 +1','빨리 돈다, 피해 +30%'],
  upd(w,dt,P){sweep(w,w.lv>=4?3:2,L5(w,[110,124,124,134,150])*P.area,L5(w,[18,18,24,24,32])*P.might,L5(w,[1.5,1.5,1.5,1.5,2]),'gil','cloth',5);}},
 // 무당 · 신내림
 byeorak:{name:'벼락',type:'c',g:'雷',col:'#9a6a10',max:5,desc:['신이 내린 벼락이 요괴 머리 위로 떨어진다.','벼락 +1','피해 +','벼락 +1, 빨라짐','벼락 +1, 피해 +20%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const n=L5(w,[2,3,3,4,5])+P.amount,dmg=L5(w,[32,38,46,52,64])*P.might;
   for(let i=0;i<n;i++){const tg=randomEnemy();if(!tg)break;bolt(tg.x,tg.y,12*P.area,dmg);}snd(90,0.12,'square',0.03);w.t=L5(w,[2.0,1.8,1.7,1.45,1.25])*P.cd;}},
 obang:{name:'오방신장기',type:'c',g:'旗',col:'#2f7d6b',max:5,desc:['동서남북과 가운데에 신장 깃발 다섯 개를 꽂는다. 깃발 둘레의 요괴는 계속 피해를 입는다.','피해 +','범위 +','지속 +','피해 +30%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const cols=['#3a6fd0','#d04030','#e0b048','#efe6d2','#4a4552'],life=L5(w,[6,6,6,8,8])*P.dur;
   [[0,-46],[46,0],[0,46],[-46,0],[0,0]].forEach((p,i)=>zone({x:P.x+p[0],y:P.y+p[1]*0.8,r:L5(w,[18,18,22,22,22])*P.area,dmg:L5(w,[8,11,11,11,15])*P.might,life,col:cols[i],kind:'flag'}));
   w.t=7*P.cd;}},
 chilseong:{name:'칠성 낙성',type:'c',g:'星',col:'#1a2b4a',max:5,desc:['북두칠성의 일곱 별이 떨어져 크게 터진다.','피해 +','범위 +','빨라짐','피해 +30%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;toast(_t("칠성 낙성"),'big');const dmg=L5(w,[80,100,100,100,130])*P.might,r=L5(w,[26,26,32,32,32])*P.area;
   for(let i=0;i<7;i++){const tg=randomEnemy();warn({x:tg?tg.x:P.x+rnd(-W/2,W/2),y:tg?tg.y:P.y+rnd(-H/2,H/2),r,t:0.7+i*0.12,dmg,friendly:1,col:'#e0b048'});}
   w.t=L5(w,[9,9,9,7.5,7.5])*P.cd;}},
 ilwol:{name:'일월성신',type:'c',g:'日',col:'#c23b2a',max:5,desc:['해와 달이 몸 둘레를 크게 돌며 닿는 요괴를 태우고 얼린다.','피해 +','해와 달이 커진다','해와 달 한 쌍 더','피해 +30%'],
  upd(w,dt,P){orbit(w,w.lv>=4?4:2,64*P.area,L5(w,[40,48,48,56,72])*P.might,1.4,'iw','sun',L5(w,[7,7,10,10,10]));}},
 noegong:{name:'뇌공강림',type:'c',g:'霆',col:'#3a6fd0',max:5,desc:['우레의 신이 내려와 몇 초 동안 쉬지 않고 벼락을 내리꽂는다.','피해 +','강림 시간 +','빨라짐','피해 +30%'],
  upd(w,dt,P){if(w.storm>0){w.storm-=dt;w.bt=(w.bt||0)-dt;if(w.bt<=0){w.bt=0.12;const tg=randomEnemy();if(tg)bolt(tg.x,tg.y,14*P.area,L5(w,[40,46,46,52,66])*P.might);if(Math.random()<0.3)snd(80,0.1,'square',0.02);}return;}
   w.t-=dt;if(w.t>0)return;toast(_t("뇌공강림"),'big');flash('200,230,255',0.3);w.storm=L5(w,[4,4,5,5,5])*P.dur;w.t=L5(w,[12,12,12,10,10])*P.cd;}},
 // 장수 · 지휘
 hakik:{name:'학익진',type:'c',g:'鶴',col:'#c8402c',max:5,desc:['학이 날개를 펴듯 진이 퍼져 나가며 요괴를 밀쳐 낸다.','피해 +','범위 +','빨라짐, 피해 +','범위 +, 피해 +20%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;G.fx.push({t:'wave',x:P.x,y:P.y,r:6,maxR:L5(w,[90,92,104,108,122])*P.area,dmg:L5(w,[26,32,36,42,52])*P.might,hit:new Set(),life:9,kb:120});w.t=L5(w,[3.6,3.4,3.2,2.8,2.6])*P.cd;}},
 chongtong:{name:'천자총통',type:'c',g:'砲',col:'#4a4552',max:5,desc:['총통이 무거운 쇠포탄을 쏘아 떨어진 자리를 크게 부순다.','포탄 +1','피해 +','폭발 범위 +','포탄 +1, 피해 +'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const n=L5(w,[2,3,3,3,4]);for(let i=0;i<n;i++){const tg=randomEnemy();const a=tg?Math.atan2(tg.y-P.y,tg.x-P.x):Math.random()*TAU;shoot(P.x,P.y,a,150,'ball',L5(w,[50,50,64,64,80])*P.might,1,1.4,4,{br:L5(w,[30,30,30,38,38])*P.area});}
   snd(70,0.3,'sawtooth',0.05);w.t=2.8*P.cd;}},
 geobuk:{name:'거북선 돌격',type:'c',g:'龜',col:'#7a2018',max:5,desc:['거북선이 화면을 가로질러 돌격하며 앞을 막는 요괴를 모두 들이받는다.','피해 +','배 +1','빨라짐','피해 +30%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;toast(_t("거북선 돌격"),'big');const n=w.lv>=3?2:1,dmg=L5(w,[120,150,150,150,200])*P.might;
   for(let i=0;i<n;i++){const dir=i%2?-1:1,y=P.y+(n>1?(i?24:-24):0);G.movers.push({x:P.x-dir*(W/2+40),y,vx:dir*170,r:18,dmg,hit:new Set(),life:(W+80)/170+0.3,dir,kind:'ship'});}
   snd(60,0.6,'sawtooth',0.06);w.t=L5(w,[14,14,14,11,11])*P.cd;}},
 sugun:{name:'수군 소환',type:'c',g:'水',col:'#1a2b4a',max:5,desc:['창을 든 수군을 불러 함께 싸운다.','수군 +1','피해 +','수군 +1','수군 +1, 피해 +25%'],
  upd(w,dt,P){summon(w,L5(w,[3,4,4,5,6])+P.amount,L5(w,[24,24,30,30,38])*P.might,'navy',125);}},
 jindong:{name:'천지진동',type:'c',g:'震',col:'#e0b048',max:5,desc:['땅을 세 번 내리쳐 큰 진동을 일으킨다. 진동에 맞은 요괴는 잠시 굳는다.','피해 +','범위 +','빨라짐','피해 +30%'],
  upd(w,dt,P){if(w.wq>0){w.wt-=dt;if(w.wt<=0){w.wq--;w.wt=0.35;G.fx.push({t:'wave',x:P.x,y:P.y,r:6,maxR:L5(w,[130,130,150,150,150])*P.area,dmg:L5(w,[60,72,72,72,96])*P.might,hit:new Set(),life:9,kb:150,frz:1,col:'#e0b048'});G.shake=Math.max(G.shake,3);snd(60,0.25,'sawtooth',0.05);}}
   w.t-=dt;if(w.t>0)return;w.wq=3;w.wt=0;w.t=L5(w,[10,10,10,8,8])*P.cd;}},
 // 장수 · 궁술
 mangung:{name:'만궁',type:'c',g:'弓',col:'#b0702e',max:5,desc:['사방으로 화살비를 쏟아 낸다.','화살 +2','피해 +','화살 +4, 빨라짐','화살 +4, 피해 +20%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;volley(L5(w,[12,14,14,18,22])+P.amount*2,L5(w,[14,15,18,20,24])*P.might,3);w.t=L5(w,[3,2.9,2.8,2.4,2.1])*P.cd;}},
 hwasalbi:{name:'화살비',type:'c',g:'雨',col:'#4a3a30',max:5,desc:['하늘을 향해 쏜 화살이 요괴 무리 위로 비처럼 쏟아진다.','범위 +','비 +1','피해 +','비 +1, 피해 +'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const n=L5(w,[1,1,2,2,3]);for(let i=0;i<n;i++){const tg=randomEnemy();zone({x:tg?tg.x:P.x+rnd(-60,60),y:tg?tg.y:P.y+rnd(-40,40),r:L5(w,[26,32,32,32,36])*P.area,dmg:L5(w,[10,10,10,14,16])*P.might,tick:0.25,life:2.5*P.dur,col:'#c9a06a',kind:'arrows'});}
   w.t=3.0*P.cd;}},
 ilsi:{name:'천궁 일시',type:'c',g:'矢',col:'#c8402c',max:5,desc:['온 힘을 실은 한 발이 화면 끝까지 일직선으로 꿰뚫는다.','피해 +','굵기 +','빨라짐','한 번에 두 발'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const tg=nearest(P.x,P.y,300);const a=tg?Math.atan2(tg.y-P.y,tg.x-P.x):Math.atan2(P.diry,P.dirx),len=Math.hypot(W,H),dmg=L5(w,[90,120,120,120,150])*P.might,wd=L5(w,[10,10,16,16,16])*P.area;
   beam(P.x,P.y-3,a,len,wd,dmg,'#ffe3a0');if(w.lv>=5)beam(P.x,P.y-3,a+Math.PI,len,wd,dmg,'#ffe3a0');snd(1400,0.2,'square',0.04);w.t=L5(w,[5,5,5,4,4])*P.cd;}},
 pyeonjeon:{name:'편전 일제사격',type:'c',g:'射',col:'#1d4d42',max:5,desc:['통아에 넣은 애기살을 세 번 연달아 부채꼴로 쏟아붓는다.','화살 +2','피해 +','빨라짐','화살 +3, 피해 +'],
  upd(w,dt,P){if(w.vq>0){w.vt-=dt;if(w.vt<=0){w.vq--;w.vt=0.15;const tg=nearest(P.x,P.y,260),a=tg?Math.atan2(tg.y-P.y,tg.x-P.x):Math.atan2(P.diry,P.dirx),n=L5(w,[5,7,7,7,10]);
    for(let i=0;i<n;i++)shoot(P.x,P.y,a+(i-(n-1)/2)*0.09,340,'arrow',L5(w,[16,16,20,20,24])*P.might,4,0.8,2);snd(1100,0.04,'square',0.02);}}
   w.t-=dt;if(w.t>0)return;w.vq=3;w.vt=0;w.t=L5(w,[2.2,2.2,2.2,1.8,1.8])*P.cd;}},
 yuseong:{name:'유성시',type:'c',g:'流',col:'#e0b048',max:5,desc:['하늘 높이 쏘아 올린 화살이 유성처럼 떨어져 요괴 무리를 터뜨린다.','화살 +2','피해 +','빨라짐','화살 +4, 피해 +25%'],
  upd(w,dt,P){w.t-=dt;if(w.t>0)return;const n=L5(w,[10,12,12,12,16]),dmg=L5(w,[90,90,110,110,140])*P.might;
   for(let i=0;i<n;i++){const tg=randomEnemy();warn({x:tg?tg.x:P.x+rnd(-W/2,W/2),y:tg?tg.y:P.y+rnd(-H/2,H/2),r:18*P.area,t:0.6+i*0.05,dmg,friendly:1,col:'#ffe3a0'});}
   w.t=L5(w,[8,8,8,6.5,6.5])*P.cd;}},
};

