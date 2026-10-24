/* ======================= run state ======================= */
let G=null,modal='title',selChar=null,prevScreen='title',prep={card:null,curse:0,diff:meta.diff||'normal',mode:meta.mode||'normal'};
const TMP=[],TMP2=[];
const keys={};let joy=null;

function newGame(cid,card,curse,diff='normal',mode='normal'){diagSeen.clear();diagStuck=0;diagNoScr=0;diagLastT=null;   // 멈춤 기록: 같은 종류는 한 판에 한 번

 const C=CHARS[cid],m=meta.up;
 G={cid,card,curse,diff,stage:0,st:0,time:0,dtNow:0,kills:0,coins:0,over:false,
   base:{maxHp:100,spd:1,might:1,area:1,cd:1,amount:0,magnet:1,armor:0,regen:0,xpGain:1,dur:1,luck:0,crit:0.05,critDmg:1.5,healM:1,pspd:1},
   P:{x:0,y:0,r:5,hp:1,maxHp:0,face:1,dirx:1,diry:0,lvl:1,xp:0,next:xpNeed(1),iframe:0,moving:false,revive:meta.upB.revive?0:(m.revive||0),branch:null,tier:0,healAcc:0,slowT:0,shieldT:0},
   weapons:[],passives:{},bless:{},gfx:[],guideLog:[],enemies:[],projs:[],ebul:[],gems:[],items:[],fx:[],zones:[],ezones:[],spirits:[],warns:[],movers:[],
   spawnT:0,eliteT:40,swarmDone:false,boss:null,mid:null,midDone:false,bossDone:false,queue:[],flash:null,shake:0,pull:null,wind:null,dark:0,helper:null,jwBuff:0,pet:null,petQ:[],petGuard:0,jw:{cd50:0,cd20:0},gateMsg:false,sky:null,skyGod:null,skyAt:rnd(32,95),loop:0,clearRec:false,grazeT:0,mode,rushG:null,anom:null,anomAt:rnd(20,90),awkN:0,ult:null,call:0,wk:{},tmOf:{},cb:{n:0,t:0},cbStage:0,q:null,dk:null,dkAt:undefined,dkC:null,dkBoon:false,ks:(mode!=='tale'&&meta.hub.ks&&ksOwned().includes(meta.hub.ks))?meta.hub.ks:null,ksGot:{},tmAt:undefined,callBuff:0,guardT:0,seongT:0,blessOrder:[],duo:{},path:null,
   shrine:null,shrineN:0,potT:3,banned:new Set(),stageMight:0,jinogwi:null,
   rr:1+(meta.extra.rr||0)+(meta.upB.rr?0:(m.rr||0)),sk:1+(meta.extra.sk||0)+(meta.upB.rr?(m.rr||0):0),bn:1+(meta.extra.bn||0),
   rs:{kills:0,elites:0,mids:0,pots:0,tteok:0,shrines:0,tavern:0,maxStage:1,maxLevel:1,seen:{},evo:new Set()},
   mods:{eHp:1,eSpd:1,eCnt:1,coin:1,noTteok:false,dmgIn:1,elite:1,choice:0,cls:1,eBul:1,bossHp:1,midUlt:false,extraUlt:false,tteokHeal:1,bossOrder:false,bossCd:1,borrow:0,eliteWithMid:false,jw50:45,jw20:90}};
 C.base(G.base);if(cid==='sangin')G.mods.coin*=1.3;
 const B=G.base,M=G.mods;
 {const u=meta.upB;if(u.hp)B.regen+=(m.hp||0)*0.1;else B.maxHp+=(m.hp||0)*10;if(u.might)B.crit+=(m.might||0)*0.03;else B.might+=(m.might||0)*0.05;if(u.spd)B.magnet+=(m.spd||0)*0.12;else B.spd+=(m.spd||0)*0.04;if(u.xp)M.coinShop=1+(m.xp||0)*0.08;else B.xpGain+=(m.xp||0)*0.1;if(u.revive&&m.revive)M.dmgIn*=0.9;}
 switch(card){
  case 'gilil':B.xpGain+=0.2;M.eCnt*=1.15;break; case 'hyungnyeon':M.noTteok=true;M.coin*=2;break;
  case 'yeokma':B.spd+=0.25;B.maxHp*=0.8;break; case 'dohwa':B.magnet*=2;M.eSpd*=1.1;break;
  case 'hongsu':B.area+=0.25;B.pspd-=0.2;break; case 'baekhosal':B.crit+=0.15;M.dmgIn*=1.2;break;
  case 'samjae':M.elite*=2;M.chestPlus=1;break; case 'cheoneul':G.P.revive++;B.might-=0.1;break;
  case 'jangwon':M.choice+=1;M.eHp*=1.15;break; case 'munchang':M.cls*=1.25;B.maxHp*=0.9;break;
  case 'cheonsal':M.eHp*=1.3;B.xpGain+=0.4;break;}
 if(curse>=1)M.eHp*=1.25; if(curse>=2)M.eSpd*=1.1; if(curse>=3)M.elite*=2; if(curse>=4)M.bossHp*=1.35; if(curse>=5)M.tteokHeal*=0.5;
 if(curse>=6)M.eCnt*=1.25; if(curse>=7)M.eBul*=1.2; if(curse>=8)M.midUlt=true; if(curse>=9)B.maxHp*=0.8; if(curse>=10)M.extraUlt=true;
 if(diff==='easy'){M.eHp*=0.7;M.dmgIn*=0.7;M.bossOrder=true;M.bossCd=1.3;M.elite*=0.7;M.jw50=30;M.jw20=60;}
 if(diff==='hard'){M.eHp*=1.35;M.dmgIn*=1.25;M.bossCd=0.75;M.borrow=2;M.midUlt=true;M.eliteWithMid=true;M.elite*=1.2;M.jw50=60;M.jw20=120;}
 goalSnap();tracePlan();
 recompute();G.P.hp=G.P.maxHp;
 addWeapon(C.start);
 $('#hud').hidden=false;$('#hudbtns').hidden=false;$('#bossbar').hidden=true;
 refreshSlots();show(null);stageToast();ksOnce();questPlan();dkPlan();
 if(mode==='rush')rushStart();
}
function xpNeed(l){const b=5+(l-1)*9+Math.pow(l-1,2.2);return Math.floor(l<=20?b:b*(1+XP_MID_A*Math.pow(l-20,XP_MID_B)));}
const XP_MID_A=0.055,XP_MID_B=0.8;
function recompute(){const P=G.P,B=G.base,l=id=>G.passives[id]||0,g=id=>G.bless[id]||0;const old=P.maxHp;
 P.maxHp=B.maxHp+l('insam')*20+l('nogyong')*12+l('tugu')*5+g('sansin')*25;
 P.spd=B.spd+l('jipsin')*0.08+l('jeonma')*0.07+l('norigae')*0.04;
 P.area=B.area+l('gat')*0.1+l('osaek')*0.06+g('seonghwang')*0.1+l('hwagwan')*0.08;
 P.magnet=28*(B.magnet+l('yundo')*0.3+l('jeonma')*0.1+l('jeondae')*0.2);
 P.cd=B.cd*(1-l('seochaek')*0.08)*(1-l('gunryeong')*0.03)*(1-g('cheongryong')*0.07)*(1-l('binyeo')*0.04);
 P.armor=B.armor+l('gapot')+l('tugu')+g('seongju');
 P.might=B.might+l('hwayak')*0.1+l('gunryeong')*0.06+g('baekho')*0.12+l('jeoul')*0.04+G.stageMight;
 P.dur=B.dur+l('horibyeong')*0.12+l('yeonjeok')*0.06+l('osaek')*0.06+g('seonghwang')*0.1;
 P.regen=B.regen+l('horibyeong')*0.1+l('gamcho')*0.15+l('jeonghwasu')*0.25+g('sansin')*0.3;
 P.xpGain=B.xpGain+l('hongpae')*0.08+l('jeonghwasu')*0.04+g('samsin')*0.12+l('hwagwan')*0.05+l('jangbu')*0.06;
 P.crit=B.crit+l('nakgwan')*0.05+g('chilseong')*0.06+l('norigae')*0.04+l('jangbu')*0.03;P.critDmg=B.critDmg+l('sahyang')*0.15+g('chilseong')*0.15+l('jeoul')*0.12;
 P.healM=B.healM+l('gamcho')*0.2;P.iframeB=l('nogyong')*0.06;P.pspd=Math.max(0.5,B.pspd+l('yeonjeok')*0.1+l('binyeo')*0.08);
 P.drop=1+l('myeongtae')*0.25+g('jowang')*0.3;P.amount=B.amount;P.luck=B.luck;
 P.frzCh=g('yong')*0.06;P.burnCh=g('jujak')*0.08;P.coinPlus=g('eopsin')+l('jeondae')*0.2;P.tteokM=(1+g('samsin')*0.5)*G.mods.tteokHeal;
 P.dmgRed=g('seongju')*0.08;if(G.ks==='gukja')P.tteokM*=1.5;
 if(G.dkC){const c=G.dkC;if(c==='slow')P.spd*=0.85;if(c==='heavy')P.cd*=1.15;if(c==='dim')P.magnet*=0.5;if(c==='thirst')P.healM*=0.5;}P.shieldCd=g('hyeonmu')?15-3*g('hyeonmu'):0;
 if(G.callBuff>0)P.cd*=0.5;if(duoOn('suhwa')&&P.shieldCd)P.shieldCd=Math.max(4,P.shieldCd-3);
 if(G.sky&&G.sky.t>0){const f=G.sky.fx;
  if(f==='gale')P.spd*=1.35;if(f==='swift'){P.pspd*=1.4;P.area*=1.15;}if(f==='rain')P.regen+=3;
  if(f==='veil')P.dmgRed=1-(1-P.dmgRed)*0.75;if(f==='mist')P.cd*=0.8;if(f==='bounty'){P.magnet*=3;P.xpGain*=1.25;}}
 if(old)P.hp=Math.min(P.maxHp,P.hp+Math.max(0,P.maxHp-old));}
/* ---- 합공(무기 합체) ---- */
const FDMG=()=>(30+20*G.stage)*G.P.might;
const FUSE=[
 {id:'f_pilryeok',a:'meok',b:'seochal',job:'seonbi',n:'필력 교지',cd:6,d:'6초마다 왕명을 담은 교지 여덟 장이 요괴를 끝까지 쫓아 꿰뚫는다.',
  fx(P){const D=FDMG();for(let i=0;i<8;i++){const tg=randomEnemy();shoot(P.x,P.y-4,i/8*TAU,170*P.pspd,'letter',D*1.2,2,2.2,3,{tg});}}},
 {id:'f_yongyeon',a:'byeoru',b:'buchae',job:'seonbi',n:'용연 태극',cd:5,d:'5초마다 용연에서 먹 회오리가 크게 일어 요괴를 밀어내고 벤다.',
  fx(P){G.fx.push({t:'wave',x:P.x,y:P.y,r:4,maxR:120*P.area,dmg:FDMG()*1.5,hit:new Set(),life:9,col:'#3a3540',kb:200});}},
 {id:'f_hoechun',a:'chim',b:'hwanyak',job:'uiwon',n:'회춘 청심침',cd:5,d:'5초마다 사방으로 침 열여섯 개를 흩뿌리고 체력 2%를 되찾는다.',
  fx(P){const D=FDMG();for(let i=0;i<16;i++)shoot(P.x,P.y-4,i/16*TAU,200*P.pspd,'needle',D,2,1,2);heal(P.maxHp*0.02);}},
 {id:'f_sahyeol',a:'buhang',b:'jakdu',job:'uiwon',n:'사혈 작두',cd:6,d:'6초마다 작두날이 몸 둘레를 크게 한 바퀴 베고, 벤 기운으로 체력 3%를 채운다.',
  fx(P){slash(P.x,P.y,0,70*P.area,FDMG()*1.6,Math.PI,0,'#c23b2a');heal(P.maxHp*0.03);}},
 {id:'f_obanggeom',a:'bujeok',b:'singal',job:'mudang',n:'오방부적검',cd:5,d:'5초마다 부적을 감은 신칼 열 자루가 사방으로 날아가 꿰뚫는다.',
  fx(P){const D=FDMG();for(let i=0;i<10;i++)shoot(P.x,P.y-4,i/10*TAU+G.time,210*P.pspd,'knife',D*1.1,3,1.2,2);}},
 {id:'f_ilwolbara',a:'bara',b:'myeongdu',job:'mudang',n:'일월바라',cd:6,d:'6초마다 해와 달의 울림이 퍼져 둘레 요괴를 치고 1초 동안 얼린다.',
  fx(P){const R0=90*P.area;pulseRing(P.x,P.y,R0,FDMG()*1.4,'#e0b048',80);for(const e of near(P.x,P.y,R0,TMP2))if(!e.boss)e.frz=Math.max(e.frz,1);}},
 {id:'f_ssangryong',a:'hwando',b:'pyeongon',job:'jangsu',n:'쌍룡 편곤도',cd:4,d:'4초마다 칼과 편곤으로 몸 둘레를 두 번 크게 휘두른다.',
  fx(P){const D=FDMG()*2,R0=64*P.area;slash(P.x,P.y,0,R0,D,Math.PI,0,'#efe6d2');qpush({t:0.15,f:()=>slash(P.x,P.y,Math.PI,R0,D,Math.PI,0,'#e0b048')});}},
 {id:'f_cheolbyeok',a:'deungpae',b:'jincheon',job:'jangsu',n:'진천 철벽',cd:6,d:'6초마다 방패 둘레 네 곳에서 비격진천뢰가 터진다.',
  fx(P){const D=FDMG()*1.8;for(let i=0;i<4;i++){const a=i/4*TAU+G.time;bolt(P.x+Math.cos(a)*50*P.area,P.y+Math.sin(a)*40*P.area,22,D);}}},
 {id:'f_sanjo',a:'gayageum',b:'janggu',job:'gisaeng',n:'산조 장단',cd:5,d:'5초마다 장단이 둘레를 울리고 가락 열두 줄기가 사방으로 퍼진다.',
  fx(P){const D=FDMG();pulseRing(P.x,P.y,70*P.area,D*1.2,'#ffb0d0');for(let i=0;i<12;i++)shoot(P.x,P.y-4,i/12*TAU,150*P.pspd,'note',D,3,1.2,3,{ph:i});}},
 {id:'f_hwagwanmu',a:'geommu',b:'buchaechum',job:'gisaeng',n:'검무 화관',cd:5,d:'5초마다 꽃비 세 곳을 뿌리고 칼춤으로 한 바퀴 크게 벤다.',
  fx(P){const D=FDMG();for(let i=0;i<3;i++){const tg=randomEnemy(140);if(tg)zone({x:tg.x,y:tg.y,r:24*P.area,dmg:D*0.4,tick:0.3,life:2.5,col:'#ff9ac0',slow:1,hold:1,kind:'petal'});}slash(P.x,P.y,0,56*P.area,D*1.4,Math.PI,0,'#ffb0d0');}},
 {id:'f_singihwa',a:'hwasal',b:'singijeon',n:'신기 화살비',cd:5,d:'5초마다 불화살 여섯 발이 하늘에서 요괴 위로 떨어진다.',
  fx(P){const D=FDMG()*2;for(let i=0;i<6;i++){const tg=randomEnemy();warn({x:tg?tg.x:P.x+rnd(-W/2,W/2),y:tg?tg.y:P.y+rnd(-H/2,H/2),r:22*P.area,t:0.5+i*0.07,dmg:D,friendly:1,col:'#ff9a4a'});}}},
 {id:'f_yakbang',a:'bangul',b:'yaktang',n:'약방울',cd:6,d:'6초마다 약 기운 실린 방울 소리가 퍼져 요괴를 늦추고 체력 3%를 되찾는다.',
  fx(P){G.fx.push({t:'wave',x:P.x,y:P.y,r:4,maxR:110*P.area,dmg:FDMG(),hit:new Set(),life:9,col:'#7fd07f',kb:40,slow:1});heal(P.maxHp*0.03);}},
 {id:'f_cheonnyang',a:'jupan',b:'yeopjeon',job:'sangin',n:'천냥 셈판',cd:5,d:'5초마다 주판알 열여섯 알과 튕기는 엽전 여섯 닢이 한꺼번에 사방으로 쏟아진다.',
  fx(P){const D=FDMG();for(let i=0;i<16;i++)shoot(P.x,P.y-4,i/16*TAU,240*P.pspd,'bead',D,3,0.9,2);for(let i=0;i<6;i++)shoot(P.x,P.y-4,i/6*TAU+0.3,210*P.pspd,'coin',D*1.2,1,1.6,2.5,{bounces:5});}},
 {id:'f_hanjim',a:'doe',b:'jige',job:'sangin',n:'한 짐 장사',cd:6,d:'6초마다 쌀 한 짐을 쿵 내려놓아 둘레를 크게 부수고, 쌀알 장판 넷을 펼친다.',
  fx(P){const D=FDMG();pulseRing(P.x,P.y,80*P.area,D*1.8,'#c9a06a',160);for(let i=0;i<4;i++){const a=i/4*TAU+0.4;zone({x:P.x+Math.cos(a)*50,y:P.y+Math.sin(a)*40,r:26*P.area,dmg:D*0.35,tick:0.35,life:3,col:'#efe6d2',slow:1,hold:1,kind:'rice'});}}}];
for(const f of FUSE){
 WD[f.id]={name:f.n,type:'w',job:f.job,max:5,fuse:f,evoName:f.n,evoDesc:f.d,desc:[`${WD[f.a].evoName}과(와) ${WD[f.b].evoName}이(가) 하나로 합쳐졌다. 두 무기 피해 +20%. ${f.d}`,'','','',''],
  upd(w,dt,P){const m=P.might;P.might*=1.2;try{for(const k of (w.kids||[]))WD[k.id].upd(k,dt,P);}finally{P.might=m;}
   w.t-=dt;if(w.t<=0){w.t=f.cd*P.cd;f.fx(P);}}};
 const c=document.createElement('canvas');c.width=c.height=8;const x=c.getContext('2d');x.drawImage(ICS[f.a],0,0);x.save();x.beginPath();x.moveTo(8,0);x.lineTo(8,8);x.lineTo(0,8);x.closePath();x.clip();x.drawImage(ICS[f.b],0,0);x.restore();
 ICS[f.id]=c;ICON[f.id]=big(c,4);}
function findFusion(){for(const f of FUSE){const a=G.weapons.find(w=>w.id===f.a&&w.evo),b=G.weapons.find(w=>w.id===f.b&&w.evo);if(a&&b)return f;}return null;}
function doFusion(f){const a=G.weapons.find(w=>w.id===f.a),b=G.weapons.find(w=>w.id===f.b);
 G.weapons=G.weapons.filter(w=>w!==a&&w!==b);
 G.weapons.push({id:f.id,lv:5,evo:true,t:1.5,on:false,pos:[],kids:[a,b],tm:a.tm||b.tm||null,lb:Math.max(a.lb||0,b.lb||0),seals:[...(a.seals||[]),...(b.seals||[])].slice(0,4)});
 tmRebuild();G.rs.fuse=(G.rs.fuse||0)+1;toast(_t("합공 · {n}",{n:f.n}),'big');flash('255,220,160',0.35);particle(G.P.x,G.P.y-6,'#e0b048',30,80,0.8);}
function wAll(){const o=[];for(const w of G.weapons){o.push(w);if(w.kids)for(const k of w.kids)o.push(k);}return o;}

/* ---- 인장 각인 ---- */
const SEALS={
 li:{g:'力',n:'힘',d:'이 무기 피해 +20%',f:P=>{P.might*=1.2;}},
 gwang:{g:'廣',n:'넓힘',d:'이 무기 범위 +20%',f:P=>{P.area*=1.2;}},
 sok:{g:'速',n:'재촉',d:'이 무기 재사용 대기 −15%',f:P=>{P.cd*=0.85;}},
 yeon:{g:'連',n:'이음',d:'이 무기 투사체 +1',f:P=>{P.amount+=1;}},
 nal:{g:'銳',n:'날카로움',d:'이 무기 피해 +12%, 범위 +8%',f:P=>{P.might*=1.12;P.area*=1.08;}},
 jil:{g:'疾',n:'빠름',d:'이 무기 투사체 속도 +25%',f:P=>{P.pspd*=1.25;}}};
function sealSlots(w){const d=WD[w.id];if(d.type!=='w')return 0;return d.fuse?4:(w.evo?2:1);}
const SEAL_OFF={"meok":"jil","meok*":"jil","seochal":"gwang","seochal*":"gwang","chim":"gwang","chim*":"gwang","buhang":"gwang","buhang*":"gwang","hwanyak":"gwang","bujeok":"jil","bujeok*":"sok jil","singal":"gwang","singal*":"gwang","bara":"yeon jil","bara*":"yeon jil","myeongdu":"sok yeon jil","myeongdu*":"sok yeon jil","hwando":"yeon jil","hwando*":"yeon jil","pyeongon":"yeon jil","pyeongon*":"yeon jil","deungpae":"sok yeon jil","deungpae*":"sok yeon jil","jincheon":"jil","jincheon*":"jil","gayageum":"gwang","gayageum*":"gwang","geommu":"jil","geommu*":"jil","buchaechum":"yeon jil","buchaechum*":"yeon jil","janggu":"yeon jil","janggu*":"yeon jil","jupan":"gwang","jupan*":"gwang","yeopjeon":"gwang","yeopjeon*":"gwang","doe":"yeon jil","doe*":"yeon jil","jige":"yeon jil","jige*":"yeon jil","tuho":"jil","tuho*":"jil","yut":"gwang","yeon":"gwang sok jil","yeon*":"gwang sok jil","jegi":"gwang","jegi*":"gwang","bangul":"yeon jil","bangul*":"yeon jil","hwasal":"gwang","hwasal*":"gwang","singijeon":"jil","singijeon*":"jil","yaktang":"jil","yaktang*":"jil","f_ilwolbara":"yeon jil","f_ssangryong":"yeon jil","f_cheolbyeok":"jil","f_hwagwanmu":"jil","f_yakbang":"jil","f_cheonnyang":"gwang","f_hanjim":"yeon jil"};
function sealOk(w,k){const o=SEAL_OFF[WD[w.id].fuse?w.id:w.id+(w.evo?'*':'')];return !o||!o.split(' ').includes(k);}
function openSeal(){const done=()=>{if(G.afterSeal){const a=G.afterSeal;G.afterSeal=null;a();}else show(null);};
 const ws=G.weapons.filter(w=>(w.seals||[]).length<sealSlots(w));
 if(!ws.length){G.coins+=20;toast(_t("새길 칸이 없어 엽전 20닢을 받았다"));done();return;}
 const sh=a=>a.sort(()=>Math.random()-0.5),pool=sh(ws.slice()),cards=[],shown=new Set();
 for(let i=0;i<3;i++){const w=pool[i%pool.length],ks=sh(Object.keys(SEALS).filter(k=>sealOk(w,k)&&!cards.some(c=>c[0]===k&&c[1]===w)));if(!ks.length)continue;const k=ks.find(z=>!shown.has(z))||ks[0];shown.add(k);cards.push([k,w]);}
 openPick('ENGRAVING',_t("인장 새기기"),_t("무기에 인장을 새겨 그 무기만 강하게 합니다. 그 무기에 효과가 있는 인장만 나옵니다. 칸은 무기 1개, 진화 2개, 합공 4개입니다."),cards.map(([k,w])=>{const S=SEALS[k],d=WD[w.id],used=(w.seals||[]).length;
  return {ic:`<span class="seal" style="background:#7a2018">${S.g}</span>`,badge:_t("인장 · {p}",{p:w.evo?d.evoName:d.name}),bc:'awk',name:_t("{n}의 인장 → {p}",{n:S.n,p:w.evo?d.evoName:d.name}),desc:_t("{d}. (인장 {used}/{p} → {p2}/{p3})",{d:S.d,used:used,p:sealSlots(w),p2:used+1,p3:sealSlots(w)}),
   f:()=>{(w.seals=w.seals||[]).push(k);G.rs.seals=(G.rs.seals||0)+1;refreshSlots();toast(_t("{g} 인장 · {p}",{g:S.g,p:w.evo?d.evoName:d.name}));done();}};}));}

/* ---- 스치기 ---- */
function graze(q){const P=G.P;G.rs.graze=(G.rs.graze||0)+1;G.grazeT=2;addCall(1.2);
 particle((q.x+P.x)/2,(q.y+P.y-3)/2,'#ffffff',3,30,0.25);if(G.fx.length<CAP.n)G.fx.push({t:'num',x:P.x+rnd(-4,4),y:P.y-20,v:_t("스침"),life:0.4,max:0.4});snd(1700,0.03,'triangle',0.012);}

/* ---- 끝없는 밤 ---- */
function recordClear(){if(G.clearRec)return;G.clearRec=true;meta.stats['clear_'+G.cid]=(meta.stats['clear_'+G.cid]||0)+1;meta.stats.clears=(meta.stats.clears||0)+1;meta.stats.curseClear=Math.max(meta.stats.curseClear||0,G.curse);if(G.curse>=meta.curseMax&&meta.curseMax<10)meta.curseMax=G.curse+1;}
function openEndless(){recordClear();const n=G.loop+1;
 openPick('ENDLESS NIGHT',G.loop?_t("{p}바퀴째 밤이 끝났다",{p:G.loop+1}):_t("그슨대를 걷어 냈다"),_t("여기서 출정을 마치거나, 끝없는 밤으로 이어 갈 수 있습니다. 이어 가면 제1막부터 다시 돌며 요괴가 한층 강해지고 보상도 커집니다. 쓰러져도 이미 거둔 평정은 인정됩니다."),[
  {ic:'<span class="seal" style="background:#1a1418">夜</span>',badge:_t("{p}바퀴",{p:n+1}),bc:'hard',name:_t("끝없는 밤으로"),desc:_t("요괴 체력 ×{p} · 받는 피해 ×{p2} · 엽전 +{p3}%. 체력을 모두 채우고 제1막부터.",{p:(1.9**n).toFixed(1),p2:(1.3**n).toFixed(1),p3:n*25}),
   f:()=>{G.loop=n;G.rs.bestLoop=Math.max(G.rs.bestLoop||0,n);const M=G.mods;M.eHp*=1.9;M.dmgIn*=1.3;M.eSpd*=1.04;M.coin*=1.25;G.stage=-1;nextStage();G.P.hp=G.P.maxHp;toastBig(_t("끝없는 밤"),_t("{p}바퀴째 · 제1막",{p:n+1}));}},
  {ic:'<span class="seal" style="background:#e0b048;color:#1a1418">曉</span>',badge:_t("출정 마침"),bc:'door',name:_t("새벽을 맞는다"),desc:_t("여기서 출정을 마치고 엽전을 거둔다."),f:()=>{show(null);endGame(true);}}]);}
/* ---- 퇴마 원정 (보스 연전) ---- */
const GRADES=[{k:'ha',n:'하',hp:0.8,borrow:0,gifts:1,col:'#2f6b5a'},{k:'jung',n:'중',hp:1.25,borrow:1,gifts:1,col:'#9a6a10'},{k:'sang',n:'상',hp:1.8,borrow:2,gifts:2,ult:1,col:'#7a2018'}];
const GIFTS={
 bless:{n:'신령의 축복',g:'神',d:'신령 셋 가운데 하나의 축복을 받는다.'},
 chest:{n:'보물 상자',g:'寶',d:'보물 상자 하나를 연다.'},
 lvl:{n:'깨달음',g:'悟',d:'곧바로 두 번 레벨업한다.'},
 seal:{n:'인장',g:'印',d:'무기 하나에 인장을 새긴다.'},
 hp:{n:'기혈',g:'血',d:'최대 체력 +20, 체력을 모두 채운다.'},
 call:{n:'신기',g:'氣',d:'신내림 게이지를 가득 채운다.'},
 coin:{n:'노잣돈',g:'錢',d:'엽전을 받는다.'}};
function rushStart(){for(let i=0;i<3;i++)G.queue.push('lvl');rushRound();}
function rushRound(){const r=G.stage,S=STAGES,pick=new Set([S[r].boss,S[r].mid]);
 const extra=[S[Math.min(9,r+1)].mid,S[Math.max(0,r-1)].boss,S[Math.min(9,r+1)].boss].filter(x=>!pick.has(x));pick.add(extra[Math.random()*extra.length|0]);
 const ids=[...pick].sort(()=>Math.random()-0.5),gr=GRADES.slice().sort(()=>Math.random()-0.5);
 openPick(`EXPEDITION · ${r+1} / ${STAGES.length}`,_t("{p}번째 원정",{p:r+1}),_t("싸울 보스 하나를 고릅니다. 등급이 높을수록 다른 보스의 기술을 빌려 쓰고 체력이 많지만, 넋의 선물을 더 받습니다."),ids.map((id,i)=>{const g=gr[i],D=BOSS[id];
  return {ic:`<img src="${big(ESPR[id].n,2)}" alt="" style="image-rendering:pixelated;background:#2a2228;width:48px;height:48px;object-fit:contain">`,badge:_t("{n}급 · 선물 {gifts}",{n:g.n,gifts:g.gifts}),bc:g.k==='sang'?'hard':g.k==='jung'?'lb':'door',name:EN[id].n,
   desc:_t("{d} 기술: {p}{p2}. 체력 ×{hp}{p3}.",{d:EN[id].d,p:D.skills.map(k=>BSK[k].label).join(', '),p2:g.borrow?_t(" + 빌린 기술 {borrow}",{borrow:g.borrow}):'',hp:g.hp,p3:g.ult?_t(" · 필살기 한 번 더"):''}),
   f:()=>{show(null);G.rushG=g;const ob=G.mods.borrow;G.mods.borrow=(ob||0)+g.borrow;spawnBoss(id,false);G.mods.borrow=ob;const e=G.boss;e.hp=e.maxHp=e.maxHp*g.hp;if(g.ult)e.ults.unshift(0.85);toastBig(_t("{p}번째 원정 · {n}급",{p:r+1,n:g.n}),EN[id].n);}};}));}
function rushReward(left){const g=G.rushG||GRADES[0];if(left===undefined)left=g.gifts;
 if(left<=0){rushNext();return;}
 const keys=Object.keys(GIFTS).sort(()=>Math.random()-0.5).slice(0,3),next=()=>rushReward(left-1),P=G.P;
 openPick('SPIRIT GIFT',_t("넋의 선물{p}",{p:g.gifts>1?` (${g.gifts-left+1}/${g.gifts})`:''}),_t("쓰러진 보스의 넋이 선물 하나를 남깁니다."),keys.map(k=>{const t=GIFTS[k];
  return {ic:`<span class="seal" style="background:#3a1a4a">${t.g}</span>`,badge:_t("넋의 선물"),bc:'duo',name:t.n,desc:t.d+(k==='coin'?_t(" ({p}닢)",{p:40+G.stage*10}):''),
   f:()=>{switch(k){case 'bless':G.afterBless=next;openBless(_t("넋의 선물"));return;case 'chest':openChest(3,next);return;case 'seal':G.afterSeal=next;openSeal();return;
    case 'lvl':for(let i=0;i<2;i++)gainXp((P.next-P.xp+1)/P.xpGain);break;case 'hp':G.base.maxHp+=20;recompute();P.hp=P.maxHp;break;case 'call':G.call=100;break;case 'coin':G.coins+=40+G.stage*10;break;}
    show(null);next();}};}));}
function rushNext(){G.rs.rushRounds=(G.rs.rushRounds||0)+1;if(G.stage>=STAGES.length-1){G.rs.rushClear=1;endGame(true);return;}nextStage();rushRound();}

/* ---- 액운 변종 ---- */
const VARIANTS={
 split:{n:'분열',col:'#e0b048',d:'쓰러지면 작은 둘로 갈라진다.'},
 venom:{n:'독',col:'#7fe07f',d:'쓰러진 자리에 독 웅덩이를 남긴다.'},
 swift:{n:'질주',col:'#8fd3ff',d:'60% 더 빠르다.'},
 iron:{n:'철갑',col:'#a8a4b0',d:'체력 2.2배, 밀려나지 않는다.'},
 hex:{n:'저주',col:'#c080ff',d:'닿으면 1.5초 동안 느려진다.'}};
function variantChance(){return Math.min(0.45,G.curse*0.03+(G.diff==='hard'?0.05:0)+G.loop*0.05);}
function maybeVariant(e){const ch=variantChance();if(ch<=0||Math.random()>=ch)return;const ks=Object.keys(VARIANTS),k=ks[Math.random()*ks.length|0];e.vr=k;
 if(k==='swift')e.spd*=1.6;if(k==='iron'){e.hp*=2.2;e.maxHp*=2.2;e.heavy=true;}}

/* ---- 괴이 조사 ---- */
/* ======================= v17.5 장소 안내인 =======================
   성황당 = 당 지기 할머니, 괴이 = 포도청 포졸, 샛길 = 길잡이 도깨비(패랭이 쓴 키 큰 사내, 뿔 없음).
   순간(appear 나타날 때·near 거리 60 안·stay 진행 40%·done 끝·hurry 샛길 남은 12초)마다 한 번씩 표의 문구 하나를 말한다.
   고증: docs/specs/2026-10-24-장소안내인.md 5장 */
const GUIDE={
 shrine:{npc:'halmi',col:'#e0b048',at:[-14,6],face:1,lines:{
  appear:['길손, 이리 오시게','방울 소리 들리는가?','서낭님이 기다리시네'],
  near:['돌 세 개 얹고 가시게','서낭님께 빌어 보시게','어서 오시게, 젊은이'],
  stay:['조금만 더 머무르게','정성이 닿고 있네','마음을 모으시게'],
  done:['서낭님이 굽어보시네','복 받아 가시게','살펴 가시게']}},
 anom:{npc:'pojol',col:'#c080ff',at:[30,8],face:-1,lines:{
  appear:['퇴마사 나리, 여기요!','괴이한 일이오!','여보시오, 이리 좀 와 보시오!'],
  near:['저기 {n}이 있소!','해괴하오, 살펴 주시오','아이고, 또 움직였소'],
  stay:['곁에서 살펴 주시오','조금만 더 보시오','금줄 밖으로 새지 않게 하오'],
  done:['이제 마음이 놓이오','포도청에 아뢰겠소','고맙소, 나리']}},
 dk:{npc:'dokkaebi',col:'#5af0d0',at:[-22,4],face:1,sc:1.4,lines:{
  appear:['어이, 퇴마사!','이쪽이야, 이쪽!','심심한데 놀다 가'],
  near:['씨름 한 판 하고 갈래?','내 길로 들어올 테냐?','겁나면 지나가든가'],
  stay:['옳지, 들어와','한 발만 더!'],
  hurry:['불 꺼진다, 서둘러!','곧 문 닫는다!']}}};
const GNPC=(()=>{const npc=(hat,L,item,over={})=>{const pal={...PAL,H:L.H,h:L.h,A:L.A,T:L.T||L.A,L:L.L||'#1a1418',C:L.C||L.A,...over};
  const g=[...hat,...FACE,...BODY].map(r=>('.'+r+'.').split(''));for(const [x,y,c] of item)g[y][x]=c;return variants(mk(g.map(r=>r.join('')),pal));};
 const pojol=['......rr....','.....rrrr...','....rrrr....','.....kk.....','..kkkkkkkk..','.kkkkkkkkkk.','....ssss....','....sksk....','....ssss....',
  '...AAwwAA...','..wAAwwAAw..','..wAAwwAAw..','..sbbbbbbs..','...AAbbAA...','...AA..AA...','...BB..BB...','...kk..kk...'].map(r=>r.split(''));   // 사용자 사진 바탕: 전립·상모·쾌자·허리띠
 for(const [x,y,c] of [[10,9,'n'],[10,10,'o'],[10,11,'o'],[10,12,'o'],[10,13,'o']])pojol[y][x]=c;
 return {
  halmi:npc(['..........','...HHHH...','..HHHHHHh.'],{H:'#d8d4cc',h:'#c23b2a',A:'#e6dccb',T:'#7a5a8a',L:'#7a5a8a'},[...col(11,6,12,'n'),[10,6,'n']]),
  pojol:variants(mk(pojol.map(r=>r.join('')),{...PAL,A:'#24284a',w:'#efe6d2',b:'#3a6fd0',B:'#1a1c30',r:'#d0281c'})),
  dokkaebi:npc(HATS.paraengi,{H:'#a08850',h:'#6a5a30',A:'#4a5a48',T:'#8a7a50',L:'#2a1a14'},[[10,4,'o'],[11,4,'o'],[10,5,'o'],[11,5,'n'],[10,6,'o'],[11,6,'o'],...col(11,7,11,'n')],{s:'#a8d0b8',k:'#f0e060'})};})();
const GICON=(()=>{const I={shrine:['...gggg...','.gggggggg.','gggggggggg','.gbryywgg.','..b.nn.r..','....nn....','....nn....','..xxnnxx..','.xxxxxxxxx','..........'],
  anom:['n........n','nyyyyyyyyn','n.r.k.w.rn','n........n','n..pppp..n','n.pp..pp.n','n..pppp..n','n........n','n........n','..........'],
  dk:['...c..c...','..cwccwc..','...c..c...','..........','...oooo...','...onoo...','...ooono..','....oo....','....nn....','....nn....']};
 const o={};for(const k in I)o[k]=mk(I[k],{...PAL,c:'#5af0d0',w:'#d8fff4',p:'#c080ff',b:'#3a6fd0',g:'#2f6b48'});return o;})();
function guideOnScreen(o){return Math.abs(o.x-G.P.x)<W/2-10&&Math.abs(o.y-G.P.y)<H/2-10;}
function guideSay(kind,o,m){if(!o)return;o.said=o.said||{};if(o.said[m])return;const L=GUIDE[kind].lines[m];if(!L)return;o.said[m]=true;
 let txt=L[Math.random()*L.length|0],n='';if(txt.includes('{n}')){const A=ANOM.find(x=>x.id===o.id);n=A?A.n:_t("이상한 것");txt=txt.replace('{n}',n);}
 if(m==='done'||guideOnScreen(o))o.say={txt,t:2.5};else o.edgeSay={txt,t:3};
 const lg=G.guideLog||(G.guideLog=[]);lg.push({kind,m,txt,n});if(lg.length>60)lg.shift();}
function guideTick(kind,o,dt){if(o.say&&(o.say.t-=dt)<=0)o.say=null;if(o.edgeSay&&(o.edgeSay.t-=dt)<=0)o.edgeSay=null;
 if(Math.hypot(G.P.x-o.x,G.P.y-o.y)<60)guideSay(kind,o,'near');if(o.prog>=o.need*0.4)guideSay(kind,o,'stay');if(kind==='dk'&&o.life<12)guideSay(kind,o,'hurry');}
function guideDone(kind,o){guideSay(kind,o,'done');(G.gfx||(G.gfx=[])).push({kind,x:o.x,y:o.y,t:1.5,txt:o.say?o.say.txt:'',id:o.id});}
function guideUpd(dt){if(G.gfx&&G.gfx.length)G.gfx=G.gfx.filter(g=>(g.t-=dt)>0);}
const ANOM=[
 {id:'flip',n:'거꾸로 선 것',g:'倒',d:'땅에 박힌 채 거꾸로 서 있다. 아무도 뒤집은 적이 없다.'},
 {id:'blood',n:'피눈물 흘리는 것',g:'血',d:'돌과 나무가 붉은 물을 흘린다.'},
 {id:'shake',n:'떨고 있는 것',g:'震',d:'바람 한 점 없는데 혼자 떨고 있다.'},
 {id:'ghost',n:'비쳐 보이는 것',g:'影',d:'건너편이 비쳐 보인다. 손을 대면 서늘하다.'},
 {id:'spin',n:'혼자 도는 것',g:'轉',d:'제자리에서 천천히 돌고 있다.'},
 {id:'twin',n:'둘로 보이는 것',g:'雙',d:'분명 하나인데 둘로 보인다.'},
 {id:'grow',n:'숨 쉬는 것',g:'息',d:'부풀었다 줄었다 하며 숨을 쉰다.'},
 {id:'tiny',n:'쪼그라든 것',g:'小',d:'제 크기의 절반으로 오그라들었다.'},
 {id:'float',n:'떠오른 것',g:'浮',d:'땅에서 한 뼘쯤 떠 있다.'},
 {id:'eye',n:'눈 뜬 것',g:'目',d:'붉은 눈 두 개가 지나가는 사람을 따라 움직인다.'},
 {id:'dark',n:'빛을 삼키는 것',g:'暗',d:'둘레의 빛이 빨려 들어간다.'},
 {id:'mirror',n:'좌우가 바뀐 것',g:'鏡',d:'거울에 비친 듯 좌우가 뒤집혀 있다.'}];
const STORY={
 seonbi:['붓을 꺾고 길을 나선 날, 서책 사이에서 떨어진 부적 한 장이 시작이었다.','과거 시험장에서 본 그림자는 사람의 것이 아니었다. 그날부터 글자가 칼이 되었다.','스승은 말했다. 글은 마음을 담는 그릇이고, 요괴는 비어 있는 그릇에 깃든다고.','마지막 괴이를 적어 넣자 퇴마록이 저절로 덮였다. 이제 이 책은 다음 사람을 기다린다.'],
 uiwon:['역병 도는 마을에서 살린 아이가 고맙다며 쥐여 준 것은 이름 모를 독초였다.','약과 독은 한 뿌리라는 스승의 말을, 그는 요괴 앞에서 처음 이해했다.','어떤 병은 사람에게서 오지 않았다. 침 끝이 떨리는 곳마다 괴이가 있었다.','모든 괴이를 적고 나서야 알았다. 그가 고친 것은 병이 아니라 세상의 금이었다.'],
 mudang:['신이 처음 내린 밤, 그녀는 울지도 웃지도 않고 방울만 흔들었다.','굿판의 넋들이 말했다. 저승 문이 비뚤어졌다고, 그래서 우리가 돌아온다고.','거꾸로 선 장승 앞에서 그녀는 할머니 무당의 목소리를 들었다.','마지막 넋을 보내고 나서, 무당은 처음으로 제 이름으로 기도했다.'],
 jangsu:['변방에서 돌아온 장수는 칼보다 무거운 것이 있다는 걸 알았다. 지키지 못한 이름들이었다.','적은 오랑캐가 아니었다. 밤마다 진영을 기웃거린 것은 사람 아닌 그림자였다.','거북선이 바다를 가를 때마다, 바다 밑에서 무언가 함께 움직였다.','괴이를 모두 베고 난 새벽, 그는 처음으로 투구를 벗고 잠들었다.'],
 sangin:['장부 맨 끝 줄에 적힌 외상값 하나. 빚진 이는 사람이 아니었다. 그날부터 주판알이 요괴를 셈했다.','보부상 임방에 돈 통문이 돌았다. 장터마다 사람이 사라진다고. 사라진 자리에는 엽전 한 닢씩이 남아 있었다.','객주 창고 깊은 곳, 아무도 맡긴 적 없는 궤짝이 밤마다 덜컹거렸다. 괴이는 값을 치르지 않은 물건에 깃든다.','마지막 괴이를 장부에 적고 줄을 그었다. 셈이 맞았다. 상인은 처음으로 이문 없는 장사를 마쳤다.'],
 gisaeng:['연회에서 부른 노래 한 가락에 요괴가 눈물을 흘렸다. 그날 그녀는 소리의 힘을 알았다.','칼춤은 원래 칼을 숨기는 춤이었다. 그녀는 그 칼을 처음으로 꺼냈다.','괴이들은 모두 노래를 듣고 싶어 했다. 들어 줄 이가 없어서 비뚤어진 것이었다.','마지막 노래가 끝나자 객석의 그림자들이 하나씩 고개 숙여 인사하고 사라졌다.']};
const STORY_AT=[2,5,8,12];
function anomFound(){return Object.keys(meta.anom||{}).length;}
function spawnAnom(){const P=G.P,pool=ANOM.filter(a=>!(meta.anom||{})[a.id]),src=pool.length?pool:ANOM,a=src[Math.random()*src.length|0];
 for(let t=0;t<20;t++){const ang=Math.random()*TAU,d=rnd(150,260),x=P.x+Math.cos(ang)*d,y=P.y+Math.sin(ang)*d*0.75;const o={x,y,r:10};pushOut(o,10);
  if(Math.hypot(o.x-x,o.y-y)<2){G.anom={id:a.id,x,y,prog:0,need:2.5,t:0};toast(_t("어딘가 이상한 것이 있다"),'');guideSay('anom',G.anom,'appear');return;}}}
function updAnom(dt){const P=G.P;
 if(G.anomAt!==undefined&&G.st>=G.anomAt&&!G.anom){G.anomAt=undefined;spawnAnom();}
 const a=G.anom;if(!a)return;a.t+=dt;const d=Math.hypot(P.x-a.x,P.y-a.y);guideTick('anom',a,dt);
 if(d<24){a.prog+=dt;if(Math.random()<0.25)particle(a.x+rnd(-8,8),a.y-rnd(4,16),'#c080ff',1,15,0.5);
  if(a.prog>=a.need){guideDone('anom',a);G.anom=null;investigate(a);}}else a.prog=Math.max(0,a.prog-dt*0.5);}
function investigate(a){const A=ANOM.find(x=>x.id===a.id),P=G.P,before=anomFound();meta.anom=meta.anom||{};const first=!meta.anom[a.id];meta.anom[a.id]=(meta.anom[a.id]||0)+1;G.rs.anoms=(G.rs.anoms||0)+1;saveMeta();
 const r=Math.random();let rw;
 if(r<0.3){const c=25+G.stage*6;G.coins+=c;rw=_t("엽전 {c}닢",{c:c});}else if(r<0.55){addCall(40);rw=_t("신내림 +40");}else if(r<0.8){gainXp(P.next*0.5/P.xpGain);rw=_t("깨달음");}else{G.queue.push('seal');rw=_t("인장 하나");}
 toastBig(_t("괴이 조사{p}",{p:first?_t(" · 새로 기록"):''}),`${A.n} — ${rw}`);flash('192,128,255',0.25);particle(a.x,a.y-8,'#c080ff',20,60,0.7);snd(330,0.3,'triangle',0.05);setTimeout(()=>snd(220,0.4,'triangle',0.04),150);
 const after=anomFound();for(const n of STORY_AT)if(before<n&&after>=n)setTimeout(()=>toast(_t("퇴마록 · 이야기 조각이 열렸다")),1600);}
function drawAnomBase(a){const st=curStg(),k=st.ob,x=R(a.x),y=R(a.y),t=G.time;b.save();
 const A=a.id;let sx=1,sy=1,ox=0,oy=0,rot=0,al=1;
 if(A==='flip')sy=-1;if(A==='mirror')sx=-1;if(A==='shake'){ox=Math.round(Math.sin(t*40))*1;}if(A==='ghost')al=0.35+Math.abs(Math.sin(t*2))*0.4;if(A==='spin')rot=t*1.2;if(A==='grow'){sx=sy=1+Math.sin(t*2)*0.25;}if(A==='tiny'){sx=sy=0.5;}if(A==='float')oy=-6+Math.sin(t*2)*2;
 if(A==='dark'){b.globalAlpha=0.5;b.fillStyle='#000';b.beginPath();b.ellipse(x,y-6,26,20,0,0,TAU);b.fill();}
 b.globalAlpha=0.9;pxRing(x,y,18,13,'#c080ff',t*6,4,2);
 b.globalAlpha=al;b.translate(x+ox,y+oy);b.rotate(rot);b.scale(sx,sy);if(A==='flip')b.translate(0,8);drawOb(k,0,0,8);if(A==='twin'){b.globalAlpha=0.45;drawOb(k,6,-1,8);}
 b.restore();b.globalAlpha=1;
 if(A==='blood'){b.fillStyle='#c23b2a';for(let i=0;i<3;i++){const yy=R(y-12+((t*10+i*5)%12));b.fillRect(x-3+i*3,yy,1,2);}}
 if(A==='eye'){b.fillStyle='#ff3a2a';const ex=Math.sign(G.P.x-a.x);b.fillRect(x-3+ex,y-10,2,1);b.fillRect(x+1+ex,y-10,2,1);}
 if(Math.random()<0.1)particle(a.x+rnd(-10,10),a.y-rnd(0,14),'#c080ff',1,8,0.6);
 if(a.prog>0){b.strokeStyle='#c080ff';b.lineWidth=2;b.beginPath();b.arc(x,y-8,16,-Math.PI/2,-Math.PI/2+TAU*a.prog/a.need);b.stroke();}
 emblem('anom:'+a.id,a.x,a.y-30,0.9);}
/* ---- 설화록 (퇴마록 탭) ---- */
function taleCodexHTML(){const E=meta.ending,lock=_t("<small>??? · 이 퇴마사로 제10막을 평정하면 열린다.</small>");
 let h=_t("<div class=\"help\"><div class=\"hcard\"><h3>본편 결말</h3>{p}\n  <h4>퇴마사의 맺음말</h4>{p2}</div>",{p:E.seen?`<ol>${ENDING.common.map(c=>`<li><b>${c.title}</b> — ${c.t}</li>`).join('')}</ol>`:`<p>${lock}</p>`,p2:Object.keys(CHARS).map(cid=>`<p><b>${CHARS[cid].name}</b> · ${E.epi.includes(cid)?ENDING.epi[cid]:lock}</p>`).join('')});
 for(const id of TALE_IDS){const T=TALES[id],f=meta.tale.frag[id],D=meta.tale.done[id],S=STAGES[T.st];
  h+=_t("<div class=\"hcard\"><h3>{p} <small>조각 {f}/3{p2}</small></h3><ol>{p3}</ol>\n   <h4>끝맺음</h4><p>{p4}</p>\n   <p class=\"credit\">출처: <a href=\"{url}\" target=\"_blank\" rel=\"noopener\">{src}</a>. 게임 속 장면과 싸움은 원전을 바탕으로 새로 지었습니다.</p></div>",{p:f?T.n:'???',f:f,p2:D?_t(" · 완주 {n}번 · 가장 빠른 {p}",{n:D.n,p:fmtT(D.best)}):'',p3:T.frags.map((x,i)=>`<li>${i<f?x.t:_t("<small>{sub} {name}의 금빛 흔적을 조사하면 열린다.</small>",{sub:S.sub,name:S.name})}</li>`).join(''),p4:D?T.end:_t("<small>설화 출정을 끝맺으면 열린다.</small>"),url:T.url,src:T.src});}
 return h+'</div>';}
/* ---- 본편 결말 (제10막 첫 평정) ---- */
function endingPages(cid){const E=meta.ending,l=[];
 if(!E.seen)ENDING.common.forEach((c,i)=>l.push({eye:_t("결말 {p}/4",{p:i+1}),title:c.title,t:c.t,art:c.art}));
 if(!E.epi.includes(cid))l.push({eye:_t("맺음말"),title:_t("{name}의 새벽",{name:CHARS[cid].name}),t:ENDING.epi[cid],art:'ch:'+cid,foot:E.seen&&E.epi.length?'':_t("퇴마록 「설화록」에서 다시 읽을 수 있다.")});
 return l;}
function openEnding(done){const cid=G.cid,l=endingPages(cid);openScene(l,()=>{const E=meta.ending;E.seen=true;if(!E.epi.includes(cid))E.epi.push(cid);G.rs.ending=1;saveMeta();checkTasks();done&&done();});}
/* ---- 설화 출정 한 판 ---- */
const TALE_T=90,TALE_HEAL=0.5;   // 막 사이 회복(주막이 없으므로 본편 30%보다 많이)
/* 설화 출정이 채우지 않는 본편 진행 기록: 막 도달·레벨·전직(정해진 힘으로 시작하므로) */
const TALE_NOREC=/^(maxStage|maxLevel|tier_|bestLoop)/;
/* 규칙 동작: start(R) 막 시작 · tick(R,dt) 매 프레임 · ready(R) 보스가 나와도 되나 · hud(R) 진행 글 · kill(R,e) 처치 때 · draw(R) 그리기 · goal(R) 화살표 */
function placeNear(d0,d1,avoid=[],gap=0){const P=G.P;const far=(x,y)=>avoid.every(q=>Math.hypot(q.x-x,q.y-y)>=gap);   // avoid: 이미 놓은 것들과 gap 이상 떨어뜨림
 for(let t=0;t<60;t++){const a=Math.random()*TAU,d=rnd(d0,d1),x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d*0.75,o={x,y,r:12};pushOut(o,12);if(Math.hypot(o.x-x,o.y-y)<2&&far(x,y))return {x,y};}
 for(let t=0;t<24;t++){const a=t/24*TAU,x=P.x+Math.cos(a)*d1,y=P.y+Math.sin(a)*d1*0.75,o={x,y,r:12};pushOut(o,12);if(far(o.x,o.y))return {x:o.x,y:o.y};}return {x:P.x+d0,y:P.y};}
function drawProp(k,x,y,glow){const sp=PROP[k];if(glow){b.globalAlpha=0.35+Math.abs(Math.sin(G.time*3))*0.3;b.fillStyle='#ffe08a';b.beginPath();b.ellipse(R(x),R(y),14,6,0,0,TAU);b.fill();b.globalAlpha=1;}b.drawImage(sp,R(x-sp.width/2),R(y-sp.height));}
const FLOWERS=['숨살이꽃','뼈살이꽃','살살이꽃'];
const TALE_RULE_FN={
 jwAlly:{start(){summonJW('ally');},tick(){if(!G.helper)summonJW('ally');G.helper.t=Math.max(G.helper.t,2);}},
 grain:{start(R){R.grain=0;G.mods.noTteok=true;},kill(R,e){if(!e.boss&&Math.random()<(G.st>TALE_T?0.1:0.05))dropItem('grain',e.x,e.y);},
  ready:R=>R.grain>=20,hud:R=>_t("곡식 {p}/20",{p:Math.min(20,R.grain)})},
 clones:{start(R){R.ct=6;},tick(R,dt){R.ct-=dt;if(R.ct<=0&&!G.boss){R.ct=5;for(let i=0;i<2;i++)spawnEnemy('jwshade');}}},
 dark:{tick(){if(!G.bossDone)G.dark=Math.max(G.dark,1.5);}},
 well:{start(R){R.well=placeNear(70,110);G.taleMight=0;},tick(R,dt){const P=G.P,d=Math.hypot(P.x-R.well.x,P.y-R.well.y);
   G.taleMight=d<30?Math.min(0.6,G.taleMight+0.06*dt):Math.max(0,G.taleMight-0.1*dt);if(d<30&&Math.random()<0.2)particle(R.well.x+rnd(-6,6),R.well.y-8,'#8fd3ff',1,20,0.5);},
  hud:()=>_t("물의 힘 +{p}%",{p:Math.round(G.taleMight*100)}),draw(R){drawProp('well',R.well.x,R.well.y+4,G.taleMight<0.6);},goal:R=>R.well},
 noHeal:{start(){G.mods.noTteok=true;}},
 plague:{tick(R,dt){const P=G.P;if(P.hp>1)P.hp=Math.max(1,P.hp-P.maxHp*0.004*dt);}},
 wells3:{start(R){R.wells=[];for(let k=0;k<3;k++)R.wells.push(placeNear(120+k*40,180+k*50,R.wells,70));R.wi=0;R.wp=0;},
  tick(R,dt){if(R.wi>=3)return;const P=G.P,w=R.wells[R.wi],d=Math.hypot(P.x-w.x,P.y-w.y);
   if(d<30){R.wp+=dt;if(Math.random()<0.25)particle(w.x+rnd(-6,6),w.y-8,'#8fd3ff',1,20,0.5);if(R.wp>=6){R.wi++;R.wp=0;toast(R.wi<3?_t("약수 {wi}/3 · 다음 우물로",{wi:R.wi}):_t("약수 항아리가 찼다"),'big');snd(660,0.3,'triangle',0.05);}}else R.wp=Math.max(0,R.wp-dt*0.5);},
  ready:R=>R.wi>=3,hud:R=>_t("우물 {wi}/3",{wi:R.wi}),
  draw(R){R.wells.forEach((w,k)=>{drawProp('well',w.x,w.y+4,k===R.wi);if(k===R.wi&&R.wp>0){b.strokeStyle='#8fd3ff';b.lineWidth=2;b.beginPath();b.arc(Math.round(w.x),Math.round(w.y)-8,16,-Math.PI/2,-Math.PI/2+TAU*R.wp/6);b.stroke();}});},goal:R=>R.wi<3?R.wells[R.wi]:null},
 flowers:{start(R){R.got=0;R.fl=placeNear(180,280);},
  tick(R){if(!R.fl)return;const P=G.P;if(Math.hypot(P.x-R.fl.x,P.y-R.fl.y)<14){toast(_t("{p}을 꺾었다 · {p2}/3",{p:FLOWERS[R.got],p2:R.got+1}),'big');R.got++;particle(R.fl.x,R.fl.y-6,'#ffb0c0',14,40,0.6);snd(784,0.25,'triangle',0.05);R.fl=R.got<3?placeNear(200,320):null;}},
  ready:R=>R.got>=3,hud:R=>_t("꽃 {got}/3",{got:R.got}),draw(R){if(R.fl)drawProp('flower',R.fl.x,R.fl.y,true);},goal:R=>R.fl}};
/* 설화 막의 세기: G.stage=eq로 두어 막 번호에 걸린 성장(체력·피해·수·보스 체력)은 본편 eq막을 따르고,
   배경 막(st) 요괴의 기본 체력·피해 차이만 여기서 맞춘다 */
function poolAvg(st,k){const S=STAGES[st],l=S.early.concat(S.late);return l.reduce((a,id)=>a+(EN[id][k]||0),0)/l.length;}
function taleScale(A){const st=A.st,eq=A.eq;if(eq===st)return {hp:1,dmg:1,boss:1};
 return {hp:poolAvg(eq,'hp')/poolAvg(st,'hp'),dmg:poolAvg(eq,'dmg')/poolAvg(st,'dmg'),boss:1};}
function taleRule(){const A=TALES[G.tale.id].acts[G.tale.act];return A.rule?TALE_RULE_FN[A.rule]:null;}
function taleStart(id){const T=TALES[id],S=T.start;initAudio();
 newGame(T.cid,null,0,'normal','tale');
 G.tale={id,act:0,t0:G.time,time:0,rec:false,m0:{eHp:G.mods.eHp,dmgIn:G.mods.dmgIn,bossHp:G.mods.bossHp},R:{}};
 G.weapons.length=0;for(const [w,lv] of S.w){addWeapon(w);G.weapons[G.weapons.length-1].lv=lv;}
 const P=G.P;P.lvl=S.lvl;P.xp=0;P.next=xpNeed(S.lvl);G.rs.maxLevel=S.lvl;
 grantTier(S.branch);G.queue.length=0;recompute();P.hp=P.maxHp;refreshSlots();
 taleAct(0,false);
 const A=T.acts[0];openScene([{eye:_t("설화 출정 · {n}",{n:T.n}),title:T.n,t:T.lede,art:'ch:'+T.cid},{eye:_t("{n} · 1막",{n:T.n}),title:A.name,t:A.intro,art:A.art}],()=>toast(_t("1막 · {name}",{name:A.name}),'big'));}
function taleAct(i,heal=true){const T=TALES[G.tale.id],A=T.acts[i],M=G.mods,m0=G.tale.m0;G.tale.act=i;G.tale.R={};
 G.stage=A.eq;G.tale.st=A.st;G.st=0;G.bossDone=false;G.boss=null;G.mid=null;G.midDone=true;G.swarmDone=false;G.eliteT=40;G.shrine=null;G.shrineN=0;G.gateMsg=false;
 G.gfx=[];G.skyAt=rnd(32,95);G.skyGod=null;G.anom=null;G.anomAt=undefined;G.trace=null;G.traceAt=undefined;G.dk=null;G.dkAt=undefined;G.q=null;
 G.enemies.length=0;G.ebul.length=0;G.warns=[];G.ezones=[];G.pull=null;G.wind=null;G.dark=0;G.zones=G.zones.filter(z=>z.follow);G.items=[];
 const sc=taleScale(A);G.taleMight=0;M.eHp=m0.eHp*sc.hp*(A.eHp||1);M.dmgIn=m0.dmgIn*sc.dmg*(A.dmg||1);M.bossHp=m0.bossHp*sc.boss*(A.bossHp||1);M.noTteok=false;
 if(heal)G.P.hp=Math.min(G.P.maxHp,G.P.hp+G.P.maxHp*TALE_HEAL);
 const r=taleRule();if(r&&r.start)r.start(G.tale.R);
 $('#bossbar').hidden=true;if(heal)toast(_t("{p}막 · {name}",{p:i+1,name:A.name}),'big');$('#stageName').textContent=_t("{n} · {p}막 {name}",{n:T.n,p:i+1,name:A.name});}
function taleReady(){if(G.tale.force)return true;const r=taleRule();return !r||!r.ready||r.ready(G.tale.R);}
function taleTick(dt){const r=taleRule();if(r&&r.tick)r.tick(G.tale.R,dt);
 if(G.st>=TALE_T&&!G.boss&&taleReady()){const A=TALES[G.tale.id].acts[G.tale.act];spawnBoss(A.boss,false);G.boss.taleN=A.bossN;toast(_t("막 보스 · {bossN}",{bossN:A.bossN}),'big red');}}
function taleClock(){const r=taleRule(),h=r&&r.hud?r.hud(G.tale.R):'';if(G.boss)return 'BOSS';if(G.st<TALE_T)return (h?h+' · ':'')+fmtT(TALE_T-G.st);return h||'BOSS';}
function taleCleared(){const T=TALES[G.tale.id],i=G.tale.act;
 if(i<T.acts.length-1){const A=T.acts[i+1];openScene([{eye:_t("{n} · {p}막",{n:T.n,p:i+2}),title:A.name,t:A.intro,art:A.art}],()=>taleAct(i+1));return;}
 taleFinish();}
function taleFinish(){const T=TALES[G.tale.id],D=meta.tale.done,id=G.tale.id,first=!D[id],tm=G.time-G.tale.t0;
 G.tale.time=tm;const d=D[id]||(D[id]={best:tm,n:0});G.tale.rec=first||tm<d.best;d.best=Math.min(d.best,tm);d.n++;G.rs.tales=(G.rs.tales||0)+1;
 if(first)meta.tale.skin[T.cid]=T.skin.id;saveMeta();
 const foot=first?_t("{name}의 「{n}」{p} 열렸다. 바로 입혀 두었고, 출정 준비의 「차림」에서 바꿀 수 있다.",{name:CHARS[T.cid].name,n:T.skin.n,p:LANG==='ko'?(jong(T.skin.n)?'이':'가'):''}):(G.tale.rec?_t("새 기록 · {p}",{p:fmtT(tm)}):_t("완주 {p} · 가장 빠른 완주 {p2}",{p:fmtT(tm),p2:fmtT(d.best)}));   //i18n-skip 조사(간체 문구는 {p}를 쓰지 않음)
 openScene([{eye:_t("{n} · 끝맺음",{n:T.n}),title:T.n,t:T.end,art:'ch:'+T.cid,foot}],()=>endGame(true));}
/* ---- 설화 흔적 (본편 · 관련 막에서 한 번) ---- */
const ga=w=>w+(jong(w)?'이':'가');   //i18n-skip 조사 고르기
function traceFor(st){if(!G||G.mode!=='normal'||G.loop>0)return null;return TALE_IDS.find(id=>TALES[id].st===st&&meta.tale.frag[id]<3)||null;}
function tracePlan(){G.trace=null;G.traceAt=undefined;G.traceId=traceFor(G.stage);if(!G.traceId)return;
 for(let k=0;k<40;k++){const t=rnd(25,85);if(G.anomAt===undefined||Math.abs(t-G.anomAt)>=15){G.traceAt=t;return;}}
 G.traceAt=G.anomAt<55?85:25;}
function spawnTrace(){const P=G.P,id=G.traceId;
 for(let t=0;t<30;t++){const ang=Math.random()*TAU,d=rnd(150,260),x=P.x+Math.cos(ang)*d,y=P.y+Math.sin(ang)*d*0.75;const o={x,y,r:10};pushOut(o,10);
  if(Math.hypot(o.x-x,o.y-y)<2){G.trace={id,x,y,prog:0,need:2.5,t:0};toast(_t("금빛 흔적 · {traceN}",{traceN:TALES[id].traceN}),'');return;}}
 G.traceAt=G.st+3;}
function updTrace(dt){const P=G.P;
 if(G.traceAt!==undefined&&G.st>=G.traceAt&&!G.trace&&!G.bossDone){G.traceAt=undefined;spawnTrace();}
 const a=G.trace;if(!a)return;a.t+=dt;const d=Math.hypot(P.x-a.x,P.y-a.y);
 if(d<24){a.prog+=dt;if(Math.random()<0.3)particle(a.x+rnd(-8,8),a.y-rnd(4,16),'#ffe08a',1,15,0.5);
  if(a.prog>=a.need){G.trace=null;takeFrag(a.id);}}else a.prog=Math.max(0,a.prog-dt*0.5);}
function achNote(small,title,text){const box=$('#ach');if(!box)return;const d=document.createElement('div');d.className='achv';d.setAttribute('role','status');
 d.innerHTML=`<img src="${big(PROP.scroll,3)}" alt=""><div><small>${small}</small><b>${title}</b><span>${text}</span></div>`;box.appendChild(d);setTimeout(()=>d.remove&&d.remove(),6000);}
function takeFrag(id){const T=TALES[id];const n=meta.tale.frag[id]=Math.min(3,meta.tale.frag[id]+1);G.rs.frags=(G.rs.frags||0)+1;saveMeta();
 const open=n===3,f=T.frags[n-1];
 flash('255,224,138',0.25);particle(G.P.x,G.P.y-8,'#ffe08a',20,60,0.7);snd(392,0.3,'triangle',0.05);
 openScene([{eye:_t("설화 조각 {n}/3 · {n2}",{n:n,n2:T.n}),title:T.traceN,t:f.t,art:f.art,foot:open?_t("설화 출정 『{n}』{p} 열렸다 — 출정 준비의 「설화 출정」에서 고를 수 있다.",{n:T.n,p:LANG==='ko'?(jong(T.n)?'이':'가'):''}):''}],null);   //i18n-skip 조사(간체 문구는 {p}를 쓰지 않음)
 if(open)achNote(_t("설화 출정 열림"),`『${T.n}』`,_t("{name} · 출정 준비 → 설화 출정",{name:CHARS[T.cid].name}));
 checkTasks();}
function drawTrace(a){const sp=PROP[TALES[a.id].trace],x=R(a.x),y=R(a.y),t=G.time;
 b.globalAlpha=0.35+Math.abs(Math.sin(t*2))*0.25;b.fillStyle='#ffe08a';b.beginPath();b.ellipse(x,y,16,7,0,0,TAU);b.fill();
 b.globalAlpha=0.9;pxRing(x,y,18,13,'#ffe08a',t*5,4,2);b.globalAlpha=1;
 b.drawImage(sp,R(x-sp.width/2),R(y-sp.height-2+Math.sin(t*2)));
 if(Math.random()<0.12)particle(a.x+rnd(-10,10),a.y-rnd(0,14),'#ffe08a',1,8,0.6);
 if(a.prog>0){b.strokeStyle='#ffe08a';b.lineWidth=2;b.beginPath();b.arc(x,y-8,16,-Math.PI/2,-Math.PI/2+TAU*a.prog/a.need);b.stroke();}}
function addWeapon(id){G.weapons.push({id,lv:1,evo:false,t:0.2,on:false,pos:[]});}
function stageToast(){const s=curStg(),lp=G.loop?_t(" · {p}바퀴",{p:G.loop+1}):'';toast(`${s.sub} · ${s.name}${lp}`,'big');$('#stageName').textContent=`${s.sub} ${s.name}${lp}`;}
function curTier(){const P=G.P;return P.tier?CHARS[G.cid].branches[P.branch].tiers[P.tier-1]:null;}
function className(){const t=curTier();return t?t.name:CHARS[G.cid].name;}
/* 옷 빛깔: 차림의 옷 색(A)만 바꾸고, 띠·깃(T·C)은 원래 색을 지킨다 */
const skinCache=new Map();
function skinLook(L,A){if(!A)return L;let m=skinCache.get(L);if(!m)skinCache.set(L,m={});return m[A]||(m[A]=Object.assign({},L,{A,T:L.T||L.A}));}
function taleSkin(cid){const k=meta.tale.skin[cid];if(!k)return null;const id=TALE_IDS.find(i=>TALES[i].cid===cid&&TALES[i].skin.id===k);return id&&meta.tale.done[id]?TALES[id].skin:null;}
function playerLook(){const t=curTier(),L=t?t.look:CHARS[G.cid].look,sk=taleSkin(G.cid);return sk?skinLook(L,sk.A):L;}
function flash(c,t){if(!meta.set.flash)t*=0.3;G.flash={c,t};}

