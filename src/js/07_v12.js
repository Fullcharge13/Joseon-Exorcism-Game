/* ======================= v12: 담금질 · 도깨비 샛길 · 막 의뢰 · 연격 · 본부 · 정표 · 기록관 ======================= */
/* ---- 피해 출처 기록 (기록관용) ---- */
function tagNew(f0,m0,src){for(let i=f0;i<G.fx.length;i++)if(!G.fx[i].src)G.fx[i].src=src;for(let i=m0;i<G.movers.length;i++)if(!G.movers[i].src)G.movers[i].src=src;}
function postW(w,dt,P,p0,z0,f0,m0,s0){const id=w.id,k=G.wk[id]||(G.wk[id]={p:0,z:0});if(s0!==undefined)for(let i=s0;i<G.spirits.length;i++)if(!G.spirits[i].src)G.spirits[i].src=id;
 const np=G.projs.length-p0,nz=G.zones.length-z0;if(np>0)k.p+=np;if(nz>0)k.z+=nz;
 const tm=w.tm;if(!tm){tagNew(f0,m0,id);return;}
 if(tm==='split'&&np>0&&G.projs.length<CAP.p){const add=[];for(let i=p0;i<p0+np;i++){const p=G.projs[i];if(p.kid||p.kind==='bomb')continue;
   for(const da of [-0.28,0.28]){const a=Math.atan2(p.vy,p.vx)+da,s=Math.hypot(p.vx,p.vy);const c=Object.assign({},p,{vx:Math.cos(a)*s,vy:Math.sin(a)*s,a:(p.a||0)+da,dmg:p.dmg*0.45,hit:new Set(),kid:1});add.push(c);}}
  for(const c of add)G.projs.push(c);}
 else if(tm==='bounce'||tm==='burst'||tm==='home'){for(let i=p0;i<G.projs.length;i++){const p=G.projs[i];if(p.src!==id)continue;if(tm==='bounce')p.bnc=2;else if(tm==='burst')p.bst=1;else p.hm=1;}}
 else if(tm==='linger'||tm==='vortex'){for(let i=z0;i<G.zones.length;i++){const z=G.zones[i];if(z.tmd)continue;z.tmd=1;if(tm==='linger'){z.life*=1.6;z.max*=1.6;z.slow=1;}else z.vtx=1;}}
 else if(tm==='echo'){w.ech=(w.ech===undefined?4:w.ech)-dt;if(w.ech<=0){w.ech=4*P.cd;pulseRing(P.x,P.y,72*P.area,(26+18*G.stage)*P.might,'#9ad0ff',60);}}
 tagNew(f0,m0,id);}
function retarget(p){let nx=null,bd=100*100;for(const o of G.enemies){if(o.dead||o.prop||o.inv||p.hit.has(o))continue;const d=(o.x-p.x)**2+(o.y-p.y)**2;if(d<bd){bd=d;nx=o;}}
 if(!nx)return false;const a=Math.atan2(nx.y-p.y,nx.x-p.x),s=Math.max(120,Math.hypot(p.vx,p.vy));p.vx=Math.cos(a)*s;p.vy=Math.sin(a)*s;p.a=a;p.life=Math.max(p.life,0.6);return true;}
function steer(p,dt){if(p.ret)return;const t=nearest(p.x,p.y,130);if(!t)return;const ta=Math.atan2(t.y-p.y,t.x-p.x),ca=Math.atan2(p.vy,p.vx);const da=Math.atan2(Math.sin(ta-ca),Math.cos(ta-ca)),na=ca+clamp(da,-4*dt,4*dt),s=Math.hypot(p.vx,p.vy);p.vx=Math.cos(na)*s;p.vy=Math.sin(na)*s;}

/* ---- 명장의 담금질 ---- */
const TEMPER={
 split:{g:'岐',n:'세 갈래',k:'p',d:'투사체가 세 갈래로 갈라져 나간다. 곁가지는 피해 45%.'},
 bounce:{g:'彈',n:'튕김',k:'p',d:'투사체가 요괴를 맞히고 사라질 때 가까운 요괴에게 두 번까지 튕겨 간다.'},
 burst:{g:'爆',n:'터짐',k:'p',d:'투사체가 맞힌 자리에서 작게 터져 둘레에 피해 50%를 준다.'},
 home:{g:'追',n:'쫓음',k:'p',d:'투사체가 가까운 요괴 쪽으로 휘어 날아간다.'},
 linger:{g:'留',n:'잔불',k:'z',d:'이 무기가 까는 장판이 60% 더 오래 남고 안의 요괴를 늦춘다.'},
 vortex:{g:'渦',n:'소용돌이',k:'z',d:'이 무기가 까는 장판이 둘레 요괴를 가운데로 끌어당긴다.'},
 thunder:{g:'雷',n:'뇌전',k:'*',d:'이 무기로 피해를 줄 때 10% 확률로 그 자리에 벼락이 떨어진다.'},
 frost:{g:'霜',n:'서리',k:'*',d:'이 무기로 피해를 줄 때 15% 확률로 요괴를 0.8초 얼린다(보스 제외).'},
 echo:{g:'響',n:'메아리',k:'*',d:'4초마다 몸 둘레로 이 무기의 울림이 퍼져 요괴를 친다.'}};
function tmRebuild(){G.tmOf={};for(const w of G.weapons)if(w.tm)G.tmOf[w.id]=w.tm;}
function temperHit(tm,e,dmg){if(tm==='thunder'&&Math.random()<0.1){G._dg=1;bolt(e.x,e.y,14,Math.max(dmg*0.8,(15+10*G.stage)*G.P.might));G._dg=0;}
 else if(tm==='frost'&&!e.boss&&Math.random()<0.15){e.frz=Math.max(e.frz,0.8);}}
function temperFor(w){const k=G.wk[w.id]||{p:0,z:0},l=Object.keys(TEMPER).filter(t=>{const K=TEMPER[t].k;return K==='*'||(K==='p'&&k.p>0)||(K==='z'&&k.z>0);});return l;}
function openTemper(cb){const done=cb||(()=>show(null));
 const ws=G.weapons.filter(w=>WD[w.id].type==='w'&&!w.tm).sort(()=>Math.random()-0.5);
 if(!ws.length){const c=40+G.stage*10;G.coins+=c;toast(_t("담글 무기가 없어 엽전 {c}닢을 받았다",{c:c}));done();return;}
 const used={},cards=[];
 for(let i=0;i<3;i++){const w=ws[i%ws.length],pool=temperFor(w).filter(t=>!(used[w.id]||[]).includes(t));if(!pool.length)continue;
  const pref=pool.filter(t=>TEMPER[t].k!=='*'),src=pref.length&&Math.random()<0.7?pref:pool,t=src[Math.random()*src.length|0];(used[w.id]=used[w.id]||[]).push(t);
  const d=WD[w.id],nm=w.evo?d.evoName:d.name,T=TEMPER[t];
  cards.push({ic:`<span class="seal" style="background:#9a4a10">${T.g}</span>`,badge:_t("담금질 · {nm}",{nm:nm}),bc:'lb',name:`${T.n} → ${nm}`,desc:T.d+_t(" 무기마다 한 번만 담글 수 있다."),
   f:()=>{w.tm=t;tmRebuild();G.rs.temper=(G.rs.temper||0)+1;refreshSlots();toast(_t("{g} 담금질 · {nm} — {n}",{g:T.g,nm:nm,n:T.n}));snd(180,0.2,'square',0.05);setTimeout(()=>snd(1200,0.15,'triangle',0.04),120);done();}});}
 openPick('FORGE',_t("명장의 담금질"),_t("대장장이 무쇠가 무기 하나를 다시 두드려 움직임을 바꿉니다. 셋 가운데 하나를 고르세요."),cards);}

/* ---- 도깨비 샛길 ---- */
const DKC={slow:{n:'무거운 발',d:'이동 속도 −15%'},frail:{n:'얇은 살갗',d:'받는 피해 +25%'},heavy:{n:'굳은 손',d:'재사용 대기 +15%'},dim:{n:'흐린 눈',d:'줍는 범위 −50%'},thirst:{n:'마른 목',d:'회복량 −50%'}};
const DKB={
 gamtu:{g:'帽',n:'도깨비 감투',d:'투사체 +1.',f:()=>{G.base.amount+=1;}},
 bangmang:{g:'棒',n:'도깨비 방망이',d:'공격력 +15%.',f:()=>{G.base.might+=0.15;}},
 bul:{g:'火',n:'도깨비불',d:'치명타 +8% · 치명 피해 +25%.',f:()=>{G.base.crit+=0.08;G.base.critDmg+=0.25;}},
 geum:{g:'金',n:'금 나와라 뚝딱',d:'엽전을 크게 얻는다.',f:()=>{G.coins+=80+G.stage*25;}},
 eun:{g:'銀',n:'은 나와라 뚝딱',d:'최대 체력 +30, 체력을 모두 채운다.',f:()=>{G.base.maxHp+=30;recompute();G.P.hp=G.P.maxHp;}},
 ttuk:{g:'槌',n:'뚝딱 수련',d:'곧바로 세 번 레벨업한다.',f:()=>{const P=G.P;for(let i=0;i<3;i++)gainXp((P.next-P.xp+1)/P.xpGain);}},
 dun:{g:'變',n:'둔갑술',d:'재사용 대기 −10%.',f:()=>{G.base.cd*=0.9;}}};
function dkPlan(){G.dk=null;G.dkAt=G.mode==='normal'&&(G.ks==='gamtu'||Math.random()<0.5)?rnd(40,110):undefined;}
function spawnDk(){const P=G.P;for(let t=0;t<20;t++){const a=Math.random()*TAU,d=rnd(140,220),x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d*0.75,o={x,y,r:10};pushOut(o,10);
  if(Math.hypot(o.x-x,o.y-y)<2){G.dk={x,y,prog:0,need:1.2,life:45};toast(_t("도깨비불이 일렁이는 샛길이 열렸다"));guideSay('dk',G.dk,'appear');return;}}}
function updDk(dt){const P=G.P;if(G.bossDone||G.clearT!==undefined){if(G.dk){G.dk=null;}return;}
 if(G.dkAt!==undefined&&G.st>=G.dkAt&&!G.dk&&!G.bossDone){G.dkAt=undefined;spawnDk();}
 const d=G.dk;if(!d)return;d.life-=dt;guideTick('dk',d,dt);if(d.life<=0){G.dk=null;toast(_t("도깨비불이 꺼졌다"));return;}
 if(Math.hypot(P.x-d.x,P.y-d.y)<16){d.prog+=dt;if(d.prog>=d.need){G.dk=null;openDk();}}else d.prog=Math.max(0,d.prog-dt);}
function openDk(){const P=G.P,cost=Math.round(P.maxHp*(G.ks==='gamtu'?0.08:0.15));
 openPick('GOBLIN PATH',_t("도깨비 샛길"),_t("「내 길로 들어올 테냐? 대가는 피 한 사발, 이번 막이 끝날 때까지 짐 하나. 그 대신 막이 끝나면 내 보물을 하나 주지.」"),[
  {ic:'<span class="seal" style="background:#2a6a6a">鬼</span>',badge:_t("체력 −{cost}",{cost:cost}),bc:'hard',name:_t("샛길로 든다"),desc:_t("체력을 내주고 이번 막이 끝날 때까지 도깨비의 짐(무작위 약화)을 진다. 막을 평정하면 도깨비 보물 셋 가운데 하나를 고른다."),
   f:()=>{P.hp=Math.max(1,P.hp-cost);const ks=Object.keys(DKC);G.dkC=ks[Math.random()*ks.length|0];G.dkBoon=true;G.rs.dkIn=(G.rs.dkIn||0)+1;recompute();show(null);toastBig(_t("도깨비의 짐"),`${DKC[G.dkC].n} · ${DKC[G.dkC].d}`);flash('90,240,208',0.3);snd(140,0.4,'sawtooth',0.05);}},
  {ic:'<span class="seal" style="background:#4a3a30">去</span>',badge:_t("그대로"),bc:'door',name:_t("지나친다"),desc:_t("도깨비 장난에 걸려들지 않는다. 샛길은 사라진다."),f:()=>{show(null);toast(_t("「쳇, 겁쟁이 같으니.」"));}}]);}
function claimDk(cb){if(!G.dkBoon){cb();return;}G.dkBoon=false;G.dkC=null;recompute();
 const keys=Object.keys(DKB).sort(()=>Math.random()-0.5).slice(0,3);
 openPick('GOBLIN TREASURE',_t("도깨비 보물"),_t("짐을 끝까지 지고 막을 넘었다. 도깨비가 약속한 보물 하나를 고르세요."),keys.map(k=>{const B=DKB[k];
  return {ic:`<span class="seal" style="background:#2a6a6a">${B.g}</span>`,badge:_t("도깨비 보물"),bc:'duo',name:B.n,desc:B.d+(k==='geum'?_t(" ({p}닢)",{p:80+G.stage*25}):''),f:()=>{B.f();recompute();refreshSlots();toast(_t("도깨비 보물 · {n}",{n:B.n}));cb();}};}));}
function drawDkBase(d){const x=R(d.x),y=R(d.y),t=G.time;
 b.fillStyle='rgba(90,240,208,0.10)';b.beginPath();b.ellipse(x,y,18,12,0,0,TAU);b.fill();
 pxRing(x,y,16,11,'#5af0d0',t*5,4,2);
 b.fillStyle='#2a1a14';b.fillRect(x-8,y-22,2,22);b.fillRect(x+6,y-22,2,22);b.fillRect(x-10,y-24,20,3);
 b.fillStyle='#0a0810';b.fillRect(x-6,y-21,12,21);
 for(let i=0;i<3;i++){const fx=x-6+i*6,fy=y-30-Math.round(Math.abs(Math.sin(t*4+i))*3);b.fillStyle=i===1?'#9affe8':'#5af0d0';b.fillRect(fx,fy,2,3);b.fillRect(fx+(i===1?0:1),fy-1,1,1);}
 if(Math.random()<0.15)particle(d.x+rnd(-8,8),d.y-rnd(6,24),'#5af0d0',1,10,0.6);
 if(d.prog>0){b.strokeStyle='#5af0d0';b.lineWidth=2;b.beginPath();b.arc(x,y-10,16,-Math.PI/2,-Math.PI/2+TAU*d.prog/d.need);b.stroke();}}

/* ---- 막 의뢰 ---- */
const QUESTS={
 pots:{n:'옹기 깨기',key:'pots',need:()=>6},
 elite:{n:'엘리트 사냥',key:'elites',need:()=>2},
 kills:{n:'요괴 퇴치',key:'kills',need:s=>350+s*60},
 shrine:{n:'성황당 기도',key:'shrines',need:()=>2},
 tteok:{n:'떡 먹기',key:'tteok',need:()=>3,ok:()=>!G.mods.noTteok},
 combo:{n:'연격 잇기',key:'_combo',need:s=>80+s*25},
 graze:{n:'탄 스치기',key:'graze',need:()=>8,ok:()=>G.stage>=3},
 variant:{n:'변종 퇴치',key:'variants',need:()=>12,ok:()=>variantChance()>0.05},
 anom:{n:'괴이 조사',key:'anoms',need:()=>1}};
function questPlan(){G.q=null;if(G.mode!=='normal')return;const l=Object.keys(QUESTS).filter(k=>!QUESTS[k].ok||QUESTS[k].ok()),k=l[Math.random()*l.length|0],Q=QUESTS[k];
 G.q={id:k,need:Q.need(G.stage),base:k==='combo'?0:(G.rs[Q.key]||0),done:false};G.cbStage=0;}
function questProg(){const q=G.q;if(!q)return 0;return Math.min(q.need,q.id==='combo'?G.cbStage:(G.rs[QUESTS[q.id].key]||0)-q.base);}
function updQuest(){const q=G.q;if(!q||q.done||G.bossDone)return;if(questProg()>=q.need){q.done=true;const c=30+G.stage*10;G.coins+=c;G.rs.quests=(G.rs.quests||0)+1;G.rs.mak=(G.rs.mak||0)+1;
  toastBig(_t("막 의뢰 완료"),_t("{n} · 엽전 {c}닢 · 막걸리 한 병",{n:QUESTS[q.id].n,c:c}));snd(990,0.2,'triangle',0.05);}}

/* ---- 연격 ---- */
const CB_TIERS=[100,300,700,1500];
function cbTier(){const n=G.cb?G.cb.n:0;let t=0;for(const v of CB_TIERS)if(n>=v)t++;return t;}
function cbKill(){const c=G.cb;c.n++;c.t=2.2;G.cbStage=Math.max(G.cbStage||0,c.n);if(c.n>(G.rs.comboMax||0))G.rs.comboMax=c.n;
 const i=CB_TIERS.indexOf(c.n);if(i>=0){toast(_t("연격 {n} · 이동 +{p}% · 깨달음 +{p2}%",{n:c.n,p:(i+1)*5,p2:(i+1)*10}),'');snd(700+i*150,0.12,'triangle',0.04);}}
function updCombo(dt){const c=G.cb;if(c.n>0){c.t-=dt;if(c.t<=0)c.n=0;}}

/* ---- 퇴마사 본부 · 정표 ---- */
meta.hub=Object.assign({mak:2,aff:{},read:{},ks:null,runs:0,last:null,rx:{}},meta.hub||{});
const NPCS={
 jumo:{g:'酒',col:'#9a4a2a',n:'주모 순덕',role:'주막 주인',look:()=>lk('hood','#9a6a4a',{T:'#efe6d2',item:'gourd'}),ks:{id:'gukja',n:'놋 국자',d:'떡 회복량 +50%.'},
  lines:[
   {r:{},t:'어서 와요, 퇴마사 양반. 여기가 이제 댁네 본부예요. 밤에 나가서 쓰러져도 다들 이리로 실려 오니까, 국밥 데워 놓고 기다릴게요.'},
   {r:{runs:1},t:'막걸리요? 밤길에서 의뢰를 끝내면 마을 사람들이 한 병씩 챙겨 줘요. 그걸 여기 식구들한테 건네 보세요. 다들 무뚝뚝해도 정은 깊어요.'},
   {r:{runs:3},t:'우리 주막은 원래 저잣거리 끝에 있었어요. 그슨대가 처음 내려온 밤, 손님들이 하나둘 그림자에 먹혔지요. 그날부터 국자를 칼처럼 쥐고 살았어요.'},
   {r:{aff:2},t:'이 국자 말이에요, 어머니가 쓰시던 거예요. 떡을 저어 주면 이상하게 기운이 두 배로 나요. 미신이라도 믿어 봐요.'},
   {r:{clears:1},t:'새벽을 봤다고요? 그슨대를 걷어 낸 사람이 우리 주막 단골이라니. 오늘 국밥은 공짜예요. 내일 거는 아니고요.'},
   {r:{aff:4},t:'솔직히 말하면, 매번 실려 올 때마다 무서워요. 이번엔 안 일어나면 어쩌나 하고. 그러니까 꼭 돌아와요. 국밥 식어요.'},
   {r:{aff:5},t:'댁은 이제 손님이 아니라 식구예요. 식구한테는 국자도 빌려주는 법이죠. 잃어버리면 혼날 줄 알아요.'}]},
 jeonwoochi:{g:'道',col:'#3a5f9e',n:'도사 전우치',role:'떠돌이 도사',look:()=>JW_LOOK,ks:{id:'buchae',n:'도술 부채',d:'전우치가 25% 더 자주 돕는다.'},
  lines:[
   {r:{},t:'허허, 또 보는구먼. 위태로울 때 내가 구름 타고 내려가는 건 알지? 공짜는 아니네. 나중에 막걸리로 갚게.'},
   {r:{runs:2},t:'요괴가 왜 이리 들끓는지 아나? 저승 문이 비뚤어졌어. 누가 일부러 틀어 놓은 게지. 그 끝에 그슨대가 있고.'},
   {r:{maxStage:5},t:'다섯 번째 고개를 넘었다고? 이제 저승사자도 자네 이름을 알겠군. 명부에 올라가는 건 썩 좋은 일이 아닐세.'},
   {r:{aff:2},t:'이 부채 말인가. 한 번 부치면 구름이 오고 두 번 부치면 비가 오지. 세 번 부치면… 그건 말 못 하네. 아무튼 차고 다니면 내가 자네를 더 빨리 찾을 걸세.'},
   {r:{clears:1},t:'그슨대를 걷어 냈다니, 내 도술보다 자네 팔뚝이 낫구먼. 하지만 밤은 끝나지 않아. 끝없는 밤이라는 게 있다네.'},
   {r:{aff:4},t:'나도 한때는 임금 앞에서 도술을 부리다 쫓겨난 몸이지. 그래서 자네 같은 사람이 좋아. 쫓겨나도 제 할 일은 하는 사람.'},
   {r:{aff:5},t:'자네라면 내 마지막 도술을 맡겨도 되겠어. 금강불괴는 내가 아니라 자네 마음이 버티는 거라네.'}]},
 daejang:{g:'鍛',col:'#6a4a3a',n:'대장장이 무쇠',role:'명장',look:()=>lk('hood','#5a4a3a',{T:'#3a3030',item:'staff'}),ks:{id:'mangchi',n:'작은 망치',d:'갈림길에 대장간이 꼭 나오고, 출정 10초 뒤 담금질 하나를 받는다.'},
  lines:[
   {r:{},t:'…무기 가져와. 두드려 줄게. 갈림길에서 내 대장간 표시(鍛)를 보면 들러.'},
   {r:{runs:2},t:'담금질은 쇠를 바꾸는 게 아니야. 쇠의 버릇을 바꾸는 거지. 화살이 튕기고, 부적이 갈라지고. 쇠도 사람처럼 버릇이 있다.'},
   {r:{temper:3},t:'세 번 담갔군. 손이 익었어. 너 말고 무기 말이야.'},
   {r:{aff:2},t:'이 망치는 내가 처음 쇠를 두드린 망치다. 차고 나가면 길이 대장간 쪽으로 휜다. 이상하지? 나도 몰라.'},
   {r:{aff:4},t:'불가사리 알지? 쇠를 먹는 괴물. 내 대장간 쇠를 다 먹어 치웠지. 그놈 잡으면… 쇠 한 덩이만 가져와 줘.'},
   {r:{aff:5},t:'…고맙다. 그 말 한마디 하려고 막걸리를 다섯 병이나 받았네.'}]},
 halmeom:{g:'鈴',col:'#7a2018',n:'무녀 할멈',role:'산통 점쟁이',look:()=>lk('gokkal','#efe6d2',{T:'#c23b2a',item:'bell'}),ks:{id:'bangul',n:'방울 한 쌍',d:'출정마다 산통 흔들기 +2 · 물리기 +1.'},
  lines:[
   {r:{},t:'산통 한번 흔들어 볼까? 쯧, 괘가 험하구나. 그래도 나가겠지. 다들 그래.'},
   {r:{runs:2},t:'점괘 패는 운명을 바꾸는 게 아니라 운명을 고르는 게야. 오늘 밤 어떤 짐을 질지 미리 아는 거지.'},
   {r:{runs:5},t:'네 뒤에 넋이 하나 따라다녀. 무섭냐? 걱정 마라, 너를 지키는 쪽이야. 네가 처음 놓친 사람이겠지.'},
   {r:{aff:2},t:'이 방울을 가져가라. 흔들면 산통이 두 번 더 돈다. 할미 손때가 묻어서 잘 듣는다.'},
   {r:{anom:4},t:'괴이를 넷이나 봤다고? 괴이는 이승과 저승이 잘못 꿰매진 자리야. 그 실밥을 네가 하나씩 뜯고 있는 게다.'},
   {r:{aff:5},t:'할미가 마지막으로 점을 쳐 주마. … 좋은 괘다. 처음이야, 너한테 좋은 괘가 나온 건.'}]},
 seonghwang:{g:'神',col:'#2f6b5a',n:'성황신',role:'마을 지킴이',look:()=>lk('crown','#2f6b5a',{T:'#e0b048',item:'flag'}),ks:{id:'ocheon',n:'오색 천',d:'성황당 기도 시간 −40% · 신내림 게이지 30으로 시작.'},
  lines:[
   {r:{},t:'(서낭나무 가지가 바람도 없이 흔들린다) …이 마을을 지키는 자가 또 하나 늘었구나.'},
   {r:{shrines:5},t:'성황당에서 다섯 번 빌었구나. 네 목소리를 기억한다. 신령들은 부르는 이를 잊지 않는다.'},
   {r:{aff:2},t:'오색 천을 매어 주마. 이것을 두르면 신령들이 너를 먼저 알아보리라.'},
   {r:{duo:1},t:'두 신령이 한꺼번에 내렸다지. 하늘의 신들도 사이가 좋은 짝이 있느니라.'},
   {r:{aff:5},t:'나는 나무에 깃든 작은 신일 뿐이나, 네가 지나간 길마다 새 가지가 돋는다. 고맙구나, 퇴마사여.'}]},
 dokkaebi:{g:'鬼',col:'#2a6a6a',n:'패랭이 도깨비',role:'샛길 주인',look:()=>null,spr:()=>GNPC.dokkaebi,ks:{id:'gamtu',n:'헌 감투',d:'도깨비 샛길이 막마다 열리고, 샛길에 내는 체력이 절반이 된다.'},appear:()=>(meta.stats.dkIn||0)>0,
  lines:[
   {r:{},t:'킬킬, 내 샛길에 들어왔던 놈이로구나! 여기까지 따라왔다고? 아니, 내가 따라온 거지.'},
   {r:{dkIn:3},t:'세 번이나 내 짐을 졌어? 바보 아니면 장사꾼이로군. 마음에 든다.'},
   {r:{aff:2},t:'이 감투를 써 봐. 내 길이 매번 열리고, 내 몫도 반만 받지. 왜냐고? 단골이니까.'},
   {r:{aff:4},t:'사람들은 우리를 무서워하면서도 방망이는 탐내. 뚝딱, 하면 다 나오는 줄 알지. 사실은 나도 잘 몰라.'},
   {r:{aff:5},t:'씨름 한 판 할까? 농담이야. 너한테 지면 체면이 안 서. 대신 막걸리는 또 가져와.'}]}};
const KS={};for(const id in NPCS)KS[NPCS[id].ks.id]={...NPCS[id].ks,npc:id};
const ksOwned=()=>Object.keys(NPCS).filter(id=>(meta.hub.aff[id]||0)>=1).map(id=>NPCS[id].ks.id);
function hubReq(r){const st=meta.stats,h=meta.hub;for(const k in r){const v=r[k];
  if(k==='runs'){if(h.runs<v)return false;}else if(k==='aff'){continue;}else if(k==='anom'){if(anomFound()<v)return false;}
  else if((st[k]||0)<v)return false;}return true;}
function npcNext(id){const N=NPCS[id],rd=meta.hub.read[id]||0,aff=meta.hub.aff[id]||0;const L=N.lines;
 for(let i=0;i<L.length;i++){if(rd&(1<<i))continue;const r=L[i].r;if(r.aff&&aff<r.aff)continue;if(hubReq(r))return i;}return -1;}
function npcReact(id){const h=meta.hub,l=h.last;if(!l||h.rx[id]===h.runs||!(id==='jumo'||id==='jeonwoochi'))return null;
 if(id==='jumo')return l.win?_t("새벽을 맞았다면서요! {p}마리라니, 오늘은 국밥에 고기 두 점 더 얹어 줄게요.",{p:l.kills.toLocaleString()}):_t("지난밤엔 {where}에서 실려 왔어요. 요괴 {p}마리를 잡았다니, 국밥 한 그릇 값은 했네요.",{where:l.where,p:l.kills.toLocaleString()});
 return l.win?_t("그슨대의 그림자가 걷히는 게 여기서도 보였네. {cls}(이)라… 이름값을 했어.",{cls:l.cls}):_t("{where}이라. {lvl}레벨이면 나쁘지 않아. 다음엔 내가 조금 더 일찍 내려가 주지.",{where:l.where,lvl:l.lvl});}
function npcHasNew(id){return npcNext(id)>=0||!!npcReact(id);}
function openHub(){renderHub();show('hub');}
/* 본부 식구 그림: 차림(look)이 있으면 퇴마사 도트, 따로 그린 도트(spr)가 있으면 그것(v17.5 패랭이 도깨비), 없으면 요괴 도깨비 */
function npcPic(N){const L=N.look();return big(L?charSpr(L).n:N.spr?N.spr().n:ESPR.dokkaebi.n,4);}
function renderHub(msg){const h=meta.hub,box=$('#hubNpcs');box.innerHTML='';
 {const gh=hubGoalsHTML(),el=$('#hubGoals');el.hidden=!gh;el.innerHTML=gh?gh+_t(" <button class=\"linkbtn\" id=\"hubGoalsMore\" type=\"button\">퇴마록</button>"):'';const mb=$('#hubGoalsMore');if(mb)mb.onclick=()=>openCodex('hub');}
 $('#hubCoins').textContent=_t("막걸리 {mak}병 · 정표 {length}/{length2}{p}",{mak:h.mak,length:ksOwned().length,length2:Object.keys(NPCS).length,p:h.ks?_t(" · 차고 나갈 정표: {n}",{n:KS[h.ks].n}):''});
 $('#hubLede').textContent=h.runs?_t("쓰러질 때마다 이곳으로 돌아온다. 지금까지 출정 {runs}번. 식구들과 이야기하고, 막걸리를 건네 정을 쌓으면 정표를 준다.",{runs:h.runs}):_t("밤마다 요괴와 싸우는 퇴마사들이 모이는 집. 식구들과 이야기하고, 막 의뢰를 끝내 얻은 막걸리를 건네 정을 쌓으면 정표를 준다.");
 for(const id in NPCS){const N=NPCS[id];if(N.appear&&!N.appear())continue;const aff=h.aff[id]||0,own=aff>=1,eq=h.ks===N.ks.id,nw=npcHasNew(id);
  const pic=`<img src="${npcPic(N)}" alt="">`;
  const d=document.createElement('div');d.className='npc'+(eq?' eq':'');
  d.innerHTML=_t("<div class=\"pic\">{pic}</div><div class=\"cm\"><b>{n}</b> <small>{role}</small><span class=\"aff\" aria-label=\"정 {aff}/5\">{p}{p2}</span>\n   <p class=\"ksl\">{p3}</p>\n   <div class=\"btns\"><button id=\"npc-talk-{id}\">{p4}</button><button id=\"npc-gift-{id2}\" {p5}>{p6}</button>{p7}</div></div>",{pic:pic,n:N.n,role:N.role,aff:aff,p:'♥'.repeat(aff),p2:'♡'.repeat(5-aff),p3:own?_t("정표 「{n}」 — {d}",{n:N.ks.n,d:N.ks.d}):_t("막걸리를 건네면 정표를 준다."),id:id,p4:nw?_t("이야기 !"):_t("이야기"),id2:id,p5:h.mak<1||aff>=5?'disabled':'',p6:aff>=5?_t("정 가득"):_t("막걸리 주기"),p7:own?`<button id="npc-ks-${id}" aria-pressed="${eq}">${eq?_t("차는 중"):_t("정표 차기")}</button>`:''});
  d.querySelector(`#npc-talk-${id}`).onclick=()=>npcTalk(id);
  d.querySelector(`#npc-gift-${id}`).onclick=()=>npcGift(id);
  if(own)d.querySelector(`#npc-ks-${id}`).onclick=()=>{h.ks=eq?null:N.ks.id;saveMeta();renderHub();snd(eq?400:800,0.1,'triangle');};
  box.appendChild(d);}
 const tk=$('#hubTalk');if(msg){tk.hidden=false;$('#talkSeal').textContent=NPCS[msg.id].g;$('#talkSeal').style.background=NPCS[msg.id].col;$('#talkName').textContent=NPCS[msg.id].n;$('#talkText').textContent=msg.t;}else tk.hidden=true;}
function npcTalk(id){const h=meta.hub,N=NPCS[id];let t=npcReact(id);
 if(t){h.rx[id]=h.runs;}else{const i=npcNext(id);if(i>=0){t=N.lines[i].t;h.read[id]=(h.read[id]||0)|(1<<i);}else{const rd=h.read[id]||0,ok=N.lines.filter((l,i)=>rd&(1<<i));t=(ok[Math.random()*ok.length|0]||N.lines[0]).t;}}
 saveMeta();renderHub({id,t});snd(440,0.08,'triangle',0.03);}
function npcGift(id){const h=meta.hub,N=NPCS[id],aff=h.aff[id]||0;if(h.mak<1||aff>=5)return;h.mak--;h.aff[id]=aff+1;h.gifts=(h.gifts||0)+1;
 if(aff===0&&!h.ks)h.ks=N.ks.id;saveMeta();checkTasks();
 renderHub({id,t:aff===0?_t("(막걸리를 받아 들고) …고마워요. 이거 받아 둬요. 「{n}」. {d}",{n:N.ks.n,d:N.ks.d}):_t("(막걸리를 받는다) 정이 한 칸 깊어졌다. ({p}/5)",{p:aff+1})});snd(660,0.15,'triangle',0.05);setTimeout(()=>snd(990,0.15,'triangle',0.04),100);}
function ksOnce(){const k=G.ks;if(!k||G.ksGot[k])return;G.ksGot[k]=1;
 if(k==='bangul'){G.rr+=2;G.sk+=1;}if(k==='ocheon')G.call=Math.max(G.call,30);if(k==='mangchi'&&G.mode!=='rush')G.tmAt=G.st+10;}
function openKsSwap(back){const own=ksOwned();
 openPick('KEEPSAKE',_t("정표 바꾸기"),_t("본부 식구에게서 받은 정표 가운데 하나를 찬다. 이미 받은 한 번뿐인 효과는 다시 받지 않는다."),[{id:null},...own.map(id=>({id}))].map(o=>{const K=o.id?KS[o.id]:null;
  return {ic:`<span class="seal" style="background:${K?NPCS[K.npc].col:'#4a3a30'}">${K?NPCS[K.npc].g:'無'}</span>`,badge:G.ks===o.id?_t("차는 중"):_t("정표"),bc:'door',name:K?K.n:_t("차지 않기"),desc:K?`${NPCS[K.npc].n} · ${K.d}`:_t("정표 없이 간다."),
   f:()=>{G.ks=o.id;ksOnce();recompute();toast(K?_t("정표 · {n}",{n:K.n}):_t("정표를 풀었다"));back();}};}));}

/* ---- 기록관 ---- */
meta.arch=Object.assign({runs:[],rec:{},cls:{}},meta.arch||{});
const GAN0='갑을병정무기경신임계',JI0='자축인묘진사오미신유술해',GANZ='甲乙丙丁戊己庚辛壬癸',JIZ='子丑寅卯辰巳午未申酉戌亥',   // v18.0: 간지는 언어별로(한글 한 글자는 신=辛·申처럼 겹쳐 사전으로 못 바꿈)
 JMON=['정월','이월','삼월','사월','오월','유월','칠월','팔월','구월','시월','동짓달','섣달'],
 JDAY=['초하루','초이틀','초사흘','초나흘','초닷새','초엿새','초이레','초여드레','초아흐레','초열흘','열하루','열이틀','열사흘','열나흘','보름','열엿새','열이레','열여드레','열아흐레','스무날','스무하루','스무이틀','스무사흘','스무나흘','스무닷새','스무엿새','스무이레','스무여드레','스무아흐레','그믐','그믐'];
function jdate(ts){const d=new Date(ts),y=d.getFullYear(),h=d.getHours(),GAN=LANG==='zh'?GANZ:GAN0,JI=LANG==='zh'?JIZ:JI0;const g=GAN[((y-4)%10+10)%10]+JI[((y-4)%12+12)%12];
 const si=JI[Math.floor(((h+1)%24)/2)]+_t("시"),pad=n=>String(n).padStart(2,'0');
 return {j:_t("{g}년 {p} {p2} {si}",{g:g,p:JMON[d.getMonth()],p2:JDAY[d.getDate()-1],si:si}),s:`${y}.${pad(d.getMonth()+1)}.${pad(d.getDate())} ${pad(h)}:${pad(d.getMinutes())}`};}
function srcName(s,cid){if(WD[s])return WD[s].name;if(s==='ult')return ULT[cid]?ULT[cid].n:_t("궁극 오의");if(s==='call')return _t("신내림");if(s.startsWith('pet:'))return PETS[s.slice(4)]?PETS[s.slice(4)].n:_t("펫");return s;}
function srcIcon(s){if(WD[s])return iconHTML(s);const g=s==='ult'?'極':s==='call'?'神':s.startsWith('pet:')?'獸':'?';return `<span class="seal" style="background:#7a2018">${g}</span>`;}
function snapRun(win){const P=G.P,dm=G.rs.dmg||{},tot=Object.values(dm).reduce((a,v)=>a+v,0);
 return {t:Date.now(),cid:G.cid,cls:className(),tier:P.tier,mode:G.mode,diff:G.diff,curse:G.curse,card:G.card,ks:G.ks||null,win:!!win,stage:G.stage,loop:G.loop,time:Math.round(totalTime()),kills:G.kills,lvl:P.lvl,combo:G.rs.comboMax||0,
  where:G.mode==='rush'?_t("{p}번째 원정",{p:G.stage+1}):G.mode==='tale'?_t("『{n}』 {p}막",{n:TALES[G.tale.id].n,p:G.tale.act+1}):curStg().name,tale:G.mode==='tale'?G.tale.id:undefined,tot:Math.round(tot),
  dmg:Object.entries(dm).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,v])=>[k,Math.round(v)]),
  w:G.weapons.map(w=>({id:w.id,e:w.evo?1:0,l:w.lv,lb:w.lb||0,tm:w.tm||null})),p:{...G.passives},bl:Object.keys(G.bless),duo:Object.keys(G.duo||{}),pet:G.pet?G.pet.type:null,dk:G.rs.dkIn||0,tmN:G.rs.temper||0,q:G.rs.quests||0};}
function runScore(r){return ((r.win?1:0)+r.loop)*1e8+(r.stage+1)*1e6+Math.min(999999,r.kills);}
function archiveRun(win){const A=meta.arch,r=snapRun(win),R=A.rec;
 A.runs.unshift(r);if(A.runs.length>50)A.runs.length=50;
 const better=(k,v,lower)=>{const o=R[k];if(!o||(lower?v<o.v:v>o.v))R[k]={v,r};};
 if(r.win&&r.mode==='normal'&&!r.loop)better('fast',r.time,true);if(r.win&&r.mode==='tale')better('tale',r.time,true);
 if(r.win&&r.mode==='rush')better('rush',r.time,true);
 better('kills',r.kills);if(r.mode!=='tale')better('lvl',r.lvl);better('surv',r.time);better('combo',r.combo);better('dmg',r.tot);
 if(r.win&&r.mode==='normal')better('curse',r.curse);if(r.loop)better('loop',r.loop+1);
 const C=A.cls[r.cid]||(A.cls[r.cid]={n:0,wins:0,kills:0,best:null,src:{}});C.n++;if(r.win&&r.mode!=='tale')C.wins++;C.kills+=r.kills;
 if(r.mode!=='tale'&&(!C.best||runScore(r)>runScore(C.best)))C.best=r;
 const mins=Math.max(0.5,r.time/60);for(const [k,v] of Object.entries(G.rs.dmg||{})){const s=C.src[k]||(C.src[k]={d:0,m:0,n:0});s.d+=v;s.m+=mins;s.n++;}
 return r;}
let archTab='rec';
function openArch(from){archFrom=from||'title';archTab='rec';renderArch();show('arch');}
let archFrom='title';
function buildMini(r){return `<div class="mini">${r.w.map(w=>{const d=WD[w.id];if(!d)return '';return `<span class="m${d.fuse?' f':w.e?' e':''}" title="${(w.e?d.evoName:d.name)}${w.tm?_t(" · 담금질 ")+TEMPER[w.tm].n:''}">${iconHTML(w.id)}${w.tm?`<i>${TEMPER[w.tm].g}</i>`:''}</span>`;}).join('')}${Object.keys(r.p).map(id=>PD[id]?`<span class="m" title="${PD[id].name} ${r.p[id]}">${iconHTML(id)}</span>`:'').join('')}</div>`;}
const clsT=r=>r.cls&&r.cls!==CHARS[r.cid].name?' · '+r.cls:'';
function runLine(r){const J=jdate(r.t),C=CHARS[r.cid];const res=r.mode==='tale'?(r.win?_t("설화 『{p}』 완주",{p:TALES[r.tale]?TALES[r.tale].n:''}):_t("설화 {where}에서 쓰러짐",{where:r.where})):r.mode==='rush'?(r.win?_t("원정 완주"):_t("{p}번째 원정에서 쓰러짐",{p:r.stage+1})):r.win?(r.loop?_t("끝없는 밤 {p}바퀴 끝에 새벽",{p:r.loop+1}):_t("새벽을 맞음")):_t("{p}{where}에서 쓰러짐",{p:r.loop?_t("{p}바퀴 · ",{p:r.loop+1}):'',where:r.where});
 return {J,C,res};}
function recCard(title,k,fmt){const o=meta.arch.rec[k];if(!o)return _t("<div class=\"rec none\"><h4>{title}</h4><p>아직 기록이 없다.</p></div>",{title:title});const {J,C,res}=runLine(o.r);
 return `<div class="rec"><h4>${title}</h4><strong>${fmt(o.v)}</strong><p><b>${C.name}</b>${clsT(o.r)} · ${res}</p>${buildMini(o.r)}<p class="when">${J.j} <small>(${J.s})</small></p></div>`;}
function renderArch(){for(const [k,id] of [['rec','tabRec'],['cls','tabCls'],['log','tabLog']])$('#'+id).setAttribute('aria-selected',archTab===k);
 const A=meta.arch,body=$('#archBody');$('#archSum').textContent=_t("기록된 출정 {length}{p}번 · 오늘은 {j}",{length:A.runs.length,p:A.runs.length>=50?'+':'',j:jdate(Date.now()).j});
 if(archTab==='rec'){body.innerHTML=`<div class="recs">`+[
   recCard(_t("가장 빠른 새벽"),'fast',v=>fmtT(v)),recCard(_t("한 출정 최다 처치"),'kills',v=>v.toLocaleString()+_t("마리")),recCard(_t("가장 높은 레벨"),'lvl',v=>'Lv '+v),
   recCard(_t("가장 오래 버틴 밤"),'surv',v=>fmtT(v)),recCard(_t("가장 긴 연격"),'combo',v=>v.toLocaleString()+_t("연격")),recCard(_t("가장 큰 피해"),'dmg',v=>v.toLocaleString()),
   recCard(_t("가장 높은 액운 평정"),'curse',v=>_t("액운 ")+v),recCard(_t("가장 먼 끝없는 밤"),'loop',v=>v+_t("바퀴")),recCard(_t("가장 빠른 퇴마 원정"),'rush',v=>fmtT(v)),recCard(_t("가장 빠른 설화"),'tale',v=>fmtT(v))].join('')+`</div>`;return;}
 if(archTab==='cls'){body.innerHTML=`<div class="help">`+Object.keys(CHARS).map(cid=>{const Ch=CHARS[cid],C=A.cls[cid],ok=unlocked('char:'+cid);
   if(!C)return hcard(`<span class="seal" style="width:28px;height:28px;font-size:18px">${Ch.seal}</span>${ok?Ch.name:'???'}`,`<p>${ok?_t("아직 이 퇴마사로 출정한 기록이 없다."):charLock(cid)}</p>`);
   const top=Object.entries(C.src).map(([k,s])=>[k,s.d/s.m,s.n]).sort((a,b)=>b[1]-a[1]).slice(0,3),tot=top.reduce((a,x)=>a+x[1],0)||1,B=C.best,{J,res}=runLine(B);
   return hcard(`<span class="seal" style="width:28px;height:28px;font-size:18px">${Ch.seal}</span>${Ch.name}`,
    _t("<p>출정 <b>{n}</b>번 · 새벽 <b>{wins}</b>번 · 모두 <b>{p}</b>마리 퇴치</p>\n     <h4>가장 좋았던 조합</h4><p><b>{cls}</b> · {res} · Lv {lvl} · {p2}마리{p3}{p4}</p>{p5}\n     {p6}\n     <p class=\"when\">{j} <small>({s})</small></p>\n     <h4>가장 효율적인 무기·기술 (분당 피해)</h4>{p7}",{n:C.n,wins:C.wins,p:C.kills.toLocaleString(),cls:B.cls,res:res,lvl:B.lvl,p2:B.kills.toLocaleString(),p3:B.ks?_t(" · 정표 {n}",{n:KS[B.ks].n}):'',p4:B.card?_t(" · 패 {n}",{n:CARDS[B.card].n}):'',p5:buildMini(B),p6:B.dmg.length?_t("<p><small>그 판의 주력: {p}</small></p>",{p:B.dmg.slice(0,3).map(([k,v])=>`${srcName(k,cid)} ${Math.round(v/Math.max(1,B.tot)*100)}%`).join(' · ')}):'',j:J.j,s:J.s,p7:top.length?top.map(([k,v,n])=>_t("<div class=\"hrow\"><span class=\"ic\">{p}</span><div><p><b>{p2}</b> · 분당 {p3} <small>({n}판 · 상위 셋 중 {p4}%)</small></p></div></div>",{p:srcIcon(k),p2:srcName(k,cid),p3:Math.round(v).toLocaleString(),n:n,p4:Math.round(v/tot*100)})).join(''):_t("<p>피해 기록이 아직 없다.</p>")}));}).join('')+`</div>`;return;}
 body.innerHTML=A.runs.length?`<div class="logs">${A.runs.map(r=>{const {J,C,res}=runLine(r);const main=r.dmg[0];
   return _t("<div class=\"log{p}\"><div class=\"lh\"><span class=\"seal\">{seal}</span><div><b>{name}{p2}</b><p>{res}</p></div><span class=\"tm\">{j}<br><small>{s}</small></span></div>\n    <p class=\"ls\">{p3}{p4} · {p5} · Lv {lvl} · {p6}마리 · 연격 {combo}{p7}{p8}</p>{p9}</div>",{p:r.win?' win':'',seal:C.seal,name:C.name,p2:clsT(r),res:res,j:J.j,s:J.s,p3:r.mode==='rush'?_t("퇴마 원정"):r.mode==='tale'?_t("설화 출정"):DIFFS[r.diff].n,p4:r.curse?_t(" · 액운 {curse}",{curse:r.curse}):'',p5:fmtT(r.time),lvl:r.lvl,p6:r.kills.toLocaleString(),combo:r.combo,p7:main?_t(" · 주력 {p}",{p:srcName(main[0],r.cid)}):'',p8:r.ks?_t(" · 정표 {n}",{n:KS[r.ks].n}):'',p9:buildMini(r)});}).join('')}</div>`:_t("<p class=\"lede\">아직 기록된 출정이 없다. 첫 출정을 마치면 이곳에 날짜와 함께 남는다.</p>");}


/* ---- 캐릭터 상태창 ---- */
let stTab='w',stFrom=null;
function openStatus(){if(!G||G.over)return;if(modal&&modal!=='pause')return;stFrom=modal;renderStatus();show('status');}
function closeStatus(){if(stFrom==='pause'){$('#pauseStats').innerHTML=statHTML();$('#pauseBuild').innerHTML=buildHTML();show('pause');}else show(null);}
const pct=v=>Math.round(v*100)+'%',sgn=v=>(v>=0?'+':'')+v;
function stLook(){const t=curTier();return t?t.look:CHARS[G.cid].look;}
function stDmgBox(id){const D=G.rs.dmg||{},tot=Object.values(D).reduce((a,b)=>a+b,0)||1,v=D[id]||0,min=Math.max(0.25,totalTime()/60);
 return _t("<div class=\"dm\"><strong>{p}</strong>{p2}% · 분당 {p3}<div class=\"bar\"><i style=\"width:{p4}%\"></i></div></div>",{p:v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e4?Math.round(v/1e3)+'k':Math.round(v),p2:Math.round(v/tot*100),p3:Math.round(v/min).toLocaleString(),p4:Math.round(v/tot*100)});}
function stWeaponRow(w){const d=WD[w.id],cls=d.type==='c',max=d.max||5;const tags=[];
 if(cls)tags.push(_t("<span class=\"tg\">직업 기술</span>"));else if(d.job)tags.push(_t("<span class=\"tg\">{name} 전용</span>",{name:CHARS[d.job].name}));
 if(d.fuse)tags.push(_t("<span class=\"tg fu\">합공 · {p}</span>",{p:(w.kids||[]).map(k=>WD[k.id].evoName).join(' + ')}));else if(w.evo)tags.push(_t("<span class=\"tg ev\">진화</span>"));
 if(w.awk)tags.push(_t("<span class=\"tg aw\">각성 · {n}</span>",{n:AWK[w.awk].n}));if(w.tm)tags.push(_t("<span class=\"tg tm\">{g} 담금질 · {n}</span>",{g:TEMPER[w.tm].g,n:TEMPER[w.tm].n}));
 if(w.lb)tags.push(_t("<span class=\"tg ev\">한계 돌파 +{lb}</span>",{lb:w.lb}));for(const k of (w.seals||[]))tags.push(`<span class="tg fu">${SEALS[k].g} ${SEALS[k].n}</span>`);
 const name=d.fuse?d.name:w.evo?d.evoName:d.name,desc=d.fuse?d.fuse.d:w.evo?d.evoDesc:d.desc[0];
 const next=!d.fuse&&!w.evo&&w.lv<max&&d.desc[w.lv]?_t("<p><small>다음 레벨: {p}</small></p>",{p:d.desc[w.lv]}):'';
 const evo=!cls&&!w.evo&&!d.fuse&&d.evo&&PD[d.evo]?_t("<p><small>진화: {name} {p} · 최대 레벨 {p2} · 보물 상자</small></p>",{name:PD[d.evo].name,p:G.passives[d.evo]?'✓':_t("필요"),p2:w.lv>=max?'✓':`${w.lv}/${max}`}):'';
 const ic=cls?`<span class="seal" style="background:${d.col}">${d.g}</span>`:`<img src="${ICON[w.id]}" alt="">`;
 return `<div class="strow"><span class="ic">${ic}</span><div><p><b>${name}</b> <small>Lv ${d.fuse?'合':w.lv}${d.fuse?'':'/'+max}</small></p><p>${tags.join('')}</p><p>${desc}</p>${next}${evo}</div>${stDmgBox(w.id)}</div>`;}
function renderStatus(){const P=G.P,C=CHARS[G.cid],t=curTier();
 for(const [k,id] of [['w','tabStW'],['p','tabStP'],['s','tabStS']])$('#'+id).setAttribute('aria-selected',stTab===k);
 const path=P.tier?C.branches[P.branch].tiers.slice(0,P.tier).map(x=>x.name).join(' → '):_t("전직 전");
 $('#stHead').innerHTML=_t("<div class=\"pic\"><img src=\"{p}\" alt=\"\"></div><div class=\"cm\"><h2>{p2}</h2><p>{name}{p3} · Lv {lvl}</p><p>{path}</p>\n  <div class=\"bars\"><span>체력 {p4}/{p5}</span><div class=\"bar\"><i style=\"width:{p6}%\"></i></div><span>경험 {p7}/{next}</span><div class=\"bar xp\"><i style=\"width:{p8}%\"></i></div></div></div>",{p:big(charSpr(stLook()).n,6),p2:className(),name:C.name,p3:P.tier?_t(" · {name} · {p} 전직",{name:C.branches[P.branch].name,p:TIER_NAME[P.tier]}):'',lvl:P.lvl,path:path,p4:Math.ceil(P.hp),p5:Math.round(P.maxHp),p6:Math.max(0,Math.min(100,P.hp/P.maxHp*100)),p7:Math.floor(P.xp),next:P.next,p8:Math.min(100,P.xp/P.next*100)});
 const body=$('#stBody');let h='';
 if(stTab==='w'){const ws=G.weapons.filter(w=>WD[w.id].type==='w'),cs=G.weapons.filter(w=>WD[w.id].type==='c');
  h+=hcard(_t("무기 <small>{length}/6</small>",{length:ws.length}),ws.length?ws.map(stWeaponRow).join(''):_t("<p>무기가 없다.</p>"));
  h+=hcard(_t("직업 기술 <small>{length}/5</small>",{length:cs.length}),cs.length?cs.map(stWeaponRow).join(''):_t("<p>1차 전직(Lv 10)에서 첫 기술을 얻는다.</p>"));
  const ex=[];if(G.ult){const u=ULT[G.cid];ex.push(_t("<div class=\"strow\"><span class=\"ic\"><span class=\"seal\" style=\"background:#7a2018\">{g}</span></span><div><p><b>{n}</b> <small>궁극 오의</small></p><p>{d}</p><p><small>다음 펼침까지 {p}초</small></p></div>{p2}</div>",{g:u.g,n:u.n,d:u.d,p:Math.max(0,Math.ceil(G.ult.t)),p2:stDmgBox('ult')}));}
  {const k=callGod(),c=CALL[k];ex.push(_t("<div class=\"strow\"><span class=\"ic\"><span class=\"seal\" style=\"background:{p}\">{g}</span></span><div><p><b>신내림 · {n}</b> <small>게이지 {p2}/100</small></p><p>{d}</p></div>{p3}</div>",{p:k==='none'?'#4a3a30':BLESS[k].col,g:c.g,n:c.n,p2:Math.floor(G.call),d:c.d,p3:stDmgBox('call')}));}
  if(G.pet){const pt=G.pet,Pp=PETS[pt.type];ex.push(_t("<div class=\"strow\"><span class=\"ic\"><img src=\"{p}\" alt=\"\"></span><div><p><b>{n}</b> <small>펫 Lv {lv}/10</small></p><p>{p2}</p></div>{p3}</div>",{p:big(PSPR[pt.type].n,2),n:Pp.n,lv:pt.lv,p2:['a','h','u'].map(k=>{const sk=petSkill(pt,k);return sk?`<b style="font:inherit;font-weight:700">${sk.n}</b> ${sk.d}`:'';}).filter(Boolean).join('<br>')||_t("아직 익힌 기술이 없다."),p3:stDmgBox('pet:'+pt.type)}));}
  h+=hcard(_t("그 밖의 힘"),ex.join(''));}
 else if(stTab==='p'){const pk=Object.keys(G.passives);
  h+=hcard(_t("보패 <small>{length}/6</small>",{length:pk.length}),pk.length?pk.map(id=>{const d=PD[id],l=G.passives[id],ev=Object.keys(WD).filter(k=>WD[k].evo===id).map(k=>WD[k].name);return _t("<div class=\"strow\"><span class=\"ic\"><img src=\"{p}\" alt=\"\"></span><div><p><b>{name}</b> <small>Lv {l}/{max}</small></p><p>{p2}{p3}</p><p>{desc} <small>(레벨마다)</small></p></div><div class=\"dm\"><strong>{l2}</strong>단계</div></div>",{p:ICON[id],name:d.name,l:l,max:d.max,p2:d.job?_t("<span class=\"tg\">{name} 전용</span>",{name:CHARS[d.job].name}):'',p3:ev.length?_t("<span class=\"tg ev\">진화 짝 · {p}</span>",{p:ev.join(', ')}):'',desc:d.desc,l2:l});}).join(''):_t("<p>아직 보패가 없다.</p>"));
  const bk=Object.keys(G.bless),dk=Object.keys(G.duo||{});
  h+=hcard(_t("신령 축복"),(bk.length?bk.map(id=>_t("<div class=\"strow\"><span class=\"ic\">{p}</span><div><p><b>{n}</b> <small>{p2}단계</small></p><p>{d} <small>(단계마다)</small></p></div><div class=\"dm\"><strong>{p3}</strong>/3</div></div>",{p:iconHTML(id),n:BLESS[id].n,p2:G.bless[id],d:BLESS[id].d,p3:G.bless[id]})).join(''):_t("<p>성황당에서 빌면 축복을 받는다.</p>"))+dk.map(id=>_t("<div class=\"strow\"><span class=\"ic\"><span class=\"seal\" style=\"background:#3a1a4a;font-size:12px\">{p}</span></span><div><p><b>{n}</b> <small>쌍신 축복</small></p><p>{d}</p></div><div></div></div>",{p:duoG(id),n:DUO[id].n,d:DUO[id].d})).join(''));
  const ot=[];const K=G.ks?KS[G.ks]:null;if(K)ot.push(_t("<div class=\"strow\"><span class=\"ic\"><span class=\"seal\" style=\"background:{col}\">{g}</span></span><div><p><b>{n}</b> <small>정표 · {n2}</small></p><p>{d}</p></div><div></div></div>",{col:NPCS[K.npc].col,g:NPCS[K.npc].g,n:K.n,n2:NPCS[K.npc].n,d:K.d}));
  if(G.card)ot.push(_t("<div class=\"strow\"><span class=\"ic\"><span class=\"seal\" style=\"background:#2a2228\">{p}</span></span><div><p><b>{n}</b> <small>점괘 패</small></p><p>{d}</p></div><div></div></div>",{p:CARDS[G.card].n[0],n:CARDS[G.card].n,d:CARDS[G.card].d}));
  if(G.dkC)ot.push(_t("<div class=\"strow\"><span class=\"ic\"><span class=\"seal\" style=\"background:#2a6a6a\">鬼</span></span><div><p><b>도깨비의 짐 · {n}</b></p><p>{d}. 이 막을 평정하면 풀리고 도깨비 보물을 받는다.</p></div><div></div></div>",{n:DKC[G.dkC].n,d:DKC[G.dkC].d}));
  if(G.sky&&G.sky.t>0)ot.push(_t("<div class=\"strow\"><span class=\"ic\"><span class=\"seal\" style=\"background:#2a2228;color:{col}\">{p}</span></span><div><p><b>{n} · {n2}</b> <small>{p2}초 남음</small></p></div><div></div></div>",{col:SKY[G.sky.k].col,p:SKY[G.sky.k].n[0],n:SKY[G.sky.k].n,n2:G.sky.n,p2:Math.ceil(G.sky.t)}));
  if(G.q)ot.push(_t("<div class=\"strow\"><span class=\"ic\"><span class=\"seal\" style=\"background:#2f6b5a\">依</span></span><div><p><b>막 의뢰 · {n}</b></p><p>{p}</p></div><div></div></div>",{n:QUESTS[G.q.id].n,p:G.q.done?_t("완료"):`${questProg()} / ${G.q.need}`}));
  ot.push(_t("<div class=\"strow\"><span class=\"ic\"><span class=\"seal\" style=\"background:#9a6a10\">連</span></span><div><p><b>연격 {n}</b> <small>최대 {p}</small></p><p>{p2}</p></div><div></div></div>",{n:G.cb.n,p:G.rs.comboMax||0,p2:cbTier()?_t("이동 +{p}% · 경험치 +{p2}%",{p:cbTier()*5,p2:cbTier()*10}):_t("{p}연격부터 이동·경험치가 오른다.",{p:CB_TIERS[0]})}));
  h+=hcard(_t("정표 · 점괘 · 그 밖"),ot.join(''));}
 else{const D=DIFFS[G.diff];const st=[[_t("최대 체력"),Math.round(P.maxHp)],[_t("공격력"),pct(P.might)],[_t("치명타"),pct(P.crit)],[_t("치명 피해"),pct(P.critDmg)],[_t("범위"),pct(P.area)],[_t("재사용 대기"),pct(P.cd)],[_t("투사체 수"),sgn(P.amount)],[_t("지속시간"),pct(P.dur)],[_t("투사체 속도"),pct(P.pspd)],[_t("이동 속도"),pct(P.spd)],[_t("줍는 범위"),Math.round(P.magnet)],[_t("방어"),P.armor],[_t("초당 회복"),(+P.regen.toFixed(2))],[_t("회복량"),pct(P.healM)],[_t("경험치"),pct(P.xpGain)],[_t("받는 피해 감소"),pct(P.dmgRed)],[_t("떡 회복"),pct(P.tteokM)],[_t("드롭"),pct(P.drop)],[_t("부활"),P.revive],[_t("피격 무적 추가"),(+P.iframeB.toFixed(2))+_t("초")]];
  h+=hcard(_t("능력치"),`<div class="stgrid">${st.map(([a,v])=>`<div><span>${a}</span><strong>${v}</strong></div>`).join('')}</div>`);
  h+=hcard(_t("이번 출정"),`<div class="stgrid">${[[_t("막"),stageLabel()],[_t("버틴 시간"),fmtT(totalTime())],[_t("처치"),G.kills.toLocaleString()],[_t("엽전"),G.coins],[_t("난이도"),D.n],[_t("액운"),G.curse],[_t("산통·물리기·봉인"),`${G.rr} · ${G.sk} · ${G.bn}`],[_t("담금질"),G.rs.temper||0],[_t("인장"),G.rs.seals||0],[_t("스침"),G.rs.graze||0]].map(([a,v])=>`<div><span>${a}</span><strong>${v}</strong></div>`).join('')}</div>`);}
 body.innerHTML=h;}

