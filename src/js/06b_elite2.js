/* ======================= v19.4 막별 새 엘리트(설계 docs/specs/2026-11-03-막별-엘리트.md) =======================
   중간 보스를 쓰러뜨리기 전에는 기존 엘리트(STAGES[i].elite), 뒤에는 새 엘리트(STAGES[i].elite2, 없으면 기존).
   새 엘리트는 12×16 격자 세 장(걷기 2장 + 행동 1장), 행동은 ELITE_AI[eai](e,dt,P,vx,vy) → [vx,vy] 또는 없음.
   보조물(helper: 대통 여인·새끼 곰)은 도감·만남·엘리트 상자에 넣지 않는다(퇴치 수는 셈). */
const ESPR2={};
const ELITE_AI={};
function addElite2(id,def){EN[id]=def;const pal={...PAL,A:def.A,B:def.B||def.A,...(def.pal||{})};
 const fr=def.frames.map(g=>variants(mk(g,pal)));ESPR[id]=fr[0];if(fr.length>1)ESPR2[id]=fr;
 if(!def.helper&&!def.tale&&!DOGAM_IDS.includes(id))DOGAM_IDS.push(id);}
function pickEliteId(){const s=curStg();return (G.mode!=='tale'&&s.elite2&&EN[s.elite2]&&G.midDone&&!G.mid)?s.elite2:s.elite;}   // 설화 출정은 막의 짜임을 바꾸지 않게 기존 엘리트(검토 지적)
function eliteFrame(e){if(!ESPR2[e.kind])return 0;if(e.eact)return 2;return Math.floor(((G&&G.time)||0)/0.25)%2;}

/* 「들러붙음」(객귀): 퇴마사 이동 배율. 느려짐(slowT)과 곱으로만 겹친다 */
function playerMoveMul(){const P=G.P;return (P.slowT>0?0.6:1)*(P.clingT>0?0.65:1);}
/* 행동 전 경고(0.6~1초) — 퇴마사 쪽 피해는 없다(표시만) */
function eWarn(x,y,r,t){warn({x,y,r,t,dmg:0,col:'#ff8a3a'});}

/* ---- 1막 객귀(客鬼): 집 밖에서 죽은 혼. 다가와 0.6초 웅크린 뒤 들러붙어 3초 동안 이동 −35%, 떨어지면 2초 물러나고 6초 뒤 다시 ----
   출처: 한국민족문화대백과사전 「객귀」. 들러붙어 느리게 하는 것은 「사람에게 들러붙어 오한·입맛 잃음」을 게임 속에 옮긴 각색 */
addElite2('gaekgwi',{n:'객귀',c:'e',st:1,t:'ghost',A:'#c9cbbb',B:'#8c8f80',fly:1,eai:'cling',sc:1.3,
 d:'집 밖이나 객지에서 죽은 사람의 혼령. 다가와 들러붙어 걸음을 무겁게 한다. 출처: 한국민족문화대백과사전 「객귀」 · 들러붙는 행동은 게임 속 각색',
 frames:[
 ['....kkkk....','...kwwwwk...','..kwwwwwwk..','..kwkwwkwk..','..kwwwwwwk..','..kwwRRwwk..','...kwwwwk...','...kAAAAk...','..kAAAAAAk..','.kAAAAAAAAk.','.kwkAAAAkwk.','..kAAAAAAk..','..kABAABAk..','..kAAAAAAk..','..kA.kA.Ak..','...k..k..k..'],
 ['....kkkk....','...kwwwwk...','..kwwwwwwk..','..kwkwwkwk..','..kwwwwwwk..','..kwwRRwwk..','...kwwwwk...','...kAAAAk...','..kAAAAAAk..','.kAAAAAAAAk.','.kwkAAAAkwk.','..kAAAAAAk..','..kABAABAk..','..kAAAAAAk..','...kA.Ak.A..','....k..k.k..'],
 ['....kkkk....','...kwwwwk...','..kwwwwwwk..','..kwRwwRwk..','..kwwwwwwk..','..kwkkkkwk..','...kwwwwk...','...kAAAAk...','kwkAAAAAAkwk','kwAAAAAAAAwk','.kAAAAAAAAk.','..kAAAAAAk..','..kABAABAk..','..kAAAAAAk..','..kA.kA.Ak..','...k..k..k..']]});
ELITE_AI.cling=(e,dt,P,vx,vy)=>{
 e.cd=(e.cd||0)-dt;const dx=P.x-e.x,dy=P.y-e.y,d=Math.hypot(dx,dy)||1;
 if(e.clT>0){e.clT-=dt;e.x=P.x+(e.cside||1)*6;e.y=P.y-2;if(e.clT<=0){e.clT=0;e.eact=null;P.clingT=0;e.backT=2;e.cd=6;}else P.clingT=Math.max(P.clingT,0.05);return [0,0];}
 if(e.backT>0){e.backT-=dt;return [-dx/d*e.spd*1.6,-dy/d*e.spd*1.6];}
 if(e.prepT>0){e.prepT-=dt;if(e.prepT<=0){e.eact=null;if(d<e.r+P.r+14&&P.iframe<=0&&!G.over){e.clT=3;e.eact='cling';e.cside=dx<0?1:-1;P.clingT=3;toast(_t("객귀가 들러붙었다! 걸음이 무겁다"),'red');}else e.cd=1;}return [dx/d*e.spd*0.4,dy/d*e.spd*0.4];}
 if(e.cd<=0&&d<36&&P.iframe<=0){e.prepT=0.6;e.eact='cling';eWarn(e.x,e.y,e.r+6,0.6);}
 return [vx,vy];};

/* ---- 2막 죽통 나그네(竹筒): 대통에 여인 둘을 넣고 다니는 정체 모를 나그네. 8초마다 0.8초 대통을 열어 여인 둘을 꺼낸다(동시 최대 4) ----
   출처: 한국민족문화대백과사전 「죽통미녀 설화」(『수이전』 일문·『대동운부군옥』 권9). 여인이 나와 싸우는 것은 게임 속 각색 */
addElite2('juktong',{n:'죽통 나그네',c:'e',st:2,t:'giant',A:'#8a8a7a',B:'#4a4a40',eai:'summon',sc:1.3,
 d:'대나무 통에 여인 둘을 넣고 다니는 정체 모를 나그네. 통을 열어 여인을 불러낸다. 출처: 한국민족문화대백과사전 「죽통미녀 설화」 · 여인이 싸우는 것은 게임 속 각색',
 frames:[
 ['............','...kkkkkk...','..kkkkkkkk..','kkkkkkkkkkkk','...kssssk...','...kskksk...','...kssssk...','....kssk....','..kAAAAAAkG.','.kAAAAAAAAGg','.kAAkAAkAAGg','.ksAAAAAAsGg','..kAAAAAAkG.','..kABBBBAk..','..kAk..kAk..','..kk....kk..'],
 ['............','...kkkkkk...','..kkkkkkkk..','kkkkkkkkkkkk','...kssssk...','...kskksk...','...kssssk...','....kssk....','..kAAAAAAkG.','.kAAAAAAAAGg','.kAAkAAkAAGg','.ksAAAAAAsGg','..kAAAAAAkG.','..kABBBBAk..','...kAkkAk...','...kk..kk...'],
 ['............','...kkkkkk...','..kkkkkkkk..','kkkkkkkkkkkk','...kssssk...','...kskksk...','...kssssk...','....kssk....','..kAAAAAAk..','.kAAAGGAAAk.','.kAAGyyGAAk.','.ksAGyyGAsk.','..kAAGGAAk..','..kABBBBAk..','..kAk..kAk..','..kk....kk..']]});
addElite2('juknyeo',{n:'대통 여인',c:'n',st:2,t:'child',A:'#d88aa8',helper:1,hp:18,spd:30,dmg:8,r:4,xp:2,
 d:'죽통 나그네가 대통에서 꺼낸 여인.',
 frames:[['..kkkk..','.kkkkkk.','.kwwwwk.','.kwkkwk.','.kwwwwk.','..kwwk..','.krrrrk.','krrwwrrk','.kAAAAk.','kAAAAAAk','kAAAAAAk','.kk..kk.']]});
ELITE_AI.summon=(e,dt,P,vx,vy)=>{
 if(e.sT===undefined)e.sT=3;e.kids=(e.kids||[]).filter(k=>!k.dead);
 if(e.openT>0){e.openT-=dt;if(e.openT<=0){e.eact=null;const st=curStg(),hs=st.early.map(id=>EN[id].hp||22),avg=hs.reduce((a,b)=>a+b,0)/hs.length;
   for(let i=0;i<2&&e.kids.length<4;i++){const c=spawnEnemy('juknyeo',e.x+(i?8:-8),e.y+4,{novr:1});c.hp=c.maxHp=c.maxHp/EN.juknyeo.hp*avg*2;pushOut(c,c.r);e.kids.push(c);}particle(e.x,e.y-6,'#7fd07f',8,40,0.4);}
  return [vx*0.2,vy*0.2];}
 e.sT-=dt;if(e.sT<=0){e.sT=8;if(e.kids.length<4){e.openT=0.8;e.eact='open';eWarn(e.x,e.y,e.r+8,0.8);}}
 return [vx,vy];};

/* ---- 3막 범이 된 남편: 부적으로 범이 되었다가 사람으로 돌아오지 못한 남자(허리에 옷자락이 남음). 7초마다 1초 웅크려(떨어질 자리 경고) 0.3초 만에 덮친다 ----
   출처: 한국민족문화대백과사전 「호랑이로 변한 남편」. 덮치기는 게임 속 각색 */
addElite2('beomnam',{n:'범이 된 남편',c:'e',st:3,t:'tiger',A:'#d9822b',B:'#3a5f9e',eai:'pounce',sc:1.3,pal:{b:'#3a5f9e'},
 d:'부적으로 범이 되었다가 사람으로 돌아오지 못한 남자. 웅크렸다가 덮친다. 출처: 한국민족문화대백과사전 「호랑이로 변한 남편」 · 덮치는 행동은 게임 속 각색',
 frames:[
 ['..kk....kk..','.kAAk..kAAk.','.kAAAkkAAAk.','kAAkAAAAkAAk','kAyAAkkAAyAk','kAAAwwwwAAAk','.kAwkkkkwAk.','..kAAwwAAk..','.kbbAAAAbbk.','kAAbAkkAbAAk','kAkAAAAAAkAk','.kAAkAAkAAk.','..kAAAAAAk..','..kAk..kAk..','.kAAk..kAAk.','.kkk....kkk.'],
 ['..kk....kk..','.kAAk..kAAk.','.kAAAkkAAAk.','kAAkAAAAkAAk','kAyAAkkAAyAk','kAAAwwwwAAAk','.kAwkkkkwAk.','..kAAwwAAk..','.kbbAAAAbbk.','kAAbAkkAbAAk','kAkAAAAAAkAk','.kAAkAAkAAk.','..kAAAAAAk..','...kAkkAk...','..kAAkkAAk..','..kkk..kkk..'],
 ['............','............','..kk....kk..','.kAAk..kAAk.','kAAkAAAAkAAk','kAyAAkkAAyAk','kAAAwwwwAAAk','.kAwkRRkwAk.','kkbbAAAAbbkk','kAAbAkkAbAAk','kwAAAAAAAAwk','kwkAAAAAAkwk','.kAAkAAkAAk.','kAAAAAAAAAAk','kAAk.kk.kAAk','kkk......kkk']]});
ELITE_AI.pounce=(e,dt,P,vx,vy)=>{
 if(e.pT===undefined)e.pT=3;e.pT-=dt;   // 웅크림·도약 중에도 세어 도약 사이가 7초
 if(e.eact==='crouch'){e.aT-=dt;if(e.aT<=0){e.eact='leap';e.aT=0.3;e.sx=e.x;e.sy=e.y;}return [0,0];}
 if(e.eact==='leap'){e.aT-=dt;const k=Math.min(1,1-e.aT/0.3);e.x=e.sx+(e.tx-e.sx)*k;e.y=e.sy+(e.ty-e.sy)*k;if(e.aT<=0){e.eact=null;particle(e.x,e.y,'#d9822b',8,60,0.4);G.shake=Math.max(G.shake,2);if((P.x-e.tx)**2+(P.y-e.ty)**2<(40+P.r)**2&&P.iframe<=0)damagePlayer(e.dmg*1.5);G.fx.push({t:'ring',x:e.tx,y:e.ty,r:3,maxR:40,col:'#ff8a3a',life:0.25,max:0.25});}return [0,0];}   // 피해는 내려앉을 때(쓰러지거나 얼면 없음)
 if(e.pT<=0){e.pT=7;e.eact='crouch';e.aT=1;e.tx=P.x;e.ty=P.y;warn({x:P.x,y:P.y,r:40,t:1.3,dmg:0,col:'#ff8a3a'});e.w=G.warns[G.warns.length-1];}
 return [vx,vy];};

/* ---- 4막 곰나루 암곰: 어부를 잡아가 자식을 낳은 곰(공주 곰나루). 새끼 곰 둘과 함께 나오고, 새끼가 쓰러질 때마다 이동·피해 ×1.25 ----
   출처: 한국민족문화대백과사전 「곰나루」. 새끼와 함께 싸우는 것은 게임 속 각색 */
addElite2('gomnaru',{n:'곰나루 암곰',c:'e',st:4,t:'bear',A:'#6a4a30',B:'#3a2818',eai:'brood',sc:1.3,
 d:'곰나루 전설의 암곰. 새끼 곰을 데리고 다니고, 새끼를 잃으면 성이 나 거세진다. 출처: 한국민족문화대백과사전 「곰나루」 · 새끼와 함께 싸우는 것은 게임 속 각색',
 frames:[
 ['.kk......kk.','kAAk....kAAk','kAAAkkkkAAAk','.kAAAAAAAAk.','kAAkAAAAkAAk','kAAAAwwAAAAk','.kAAwkkwAAk.','..kAAwwAAk..','.kAAAAAAAAk.','kAAAAAAAAAAk','kAkAAAAAAkAk','kAkABBBBAkAk','.kAAAAAAAAk.','..kAAAAAAk..','..kAAk.kAAk.','..kkk..kkk..'],
 ['.kk......kk.','kAAk....kAAk','kAAAkkkkAAAk','.kAAAAAAAAk.','kAAkAAAAkAAk','kAAAAwwAAAAk','.kAAwkkwAAk.','..kAAwwAAk..','.kAAAAAAAAk.','kAAAAAAAAAAk','kAkAAAAAAkAk','kAkABBBBAkAk','.kAAAAAAAAk.','..kAAAAAAk..','.kAAk..kAAk.','.kkk...kkk..'],
 ['kAk......kAk','kAAk.kk.kAAk','.kAAkAAkAAk.','.kAAAAAAAAk.','kAAkAAAAkAAk','kAAAAwwAAAAk','.kAwRRRRwAk.','..kAwwwwAk..','.kAAAAAAAAk.','.kAAAAAAAAk.','..kAAAAAAk..','..kABBBBAk..','.kAAAAAAAAk.','..kAAAAAAk..','..kAAk.kAAk.','..kkk..kkk..']]});
addElite2('gomsaekki',{n:'새끼 곰',c:'n',st:4,t:'bear',A:'#7a5a3a',helper:1,hp:26,spd:30,dmg:8,r:4,xp:2,
 d:'곰나루 암곰의 새끼.',
 frames:[['.k....k.','kAk..kAk','kAAkkAAk','kAkAAkAk','kAAwwAAk','.kAkkAk.','..kAAk..','.kAAAAk.','kAAAAAAk','kAAAAAAk','.kAkkAk.','.kk..kk.']]});
ELITE_AI.brood=(e,dt,P,vx,vy)=>{
 if(!e.kidsInit){e.kidsInit=true;e.bs=e.spd;e.bd=e.dmg;e.kids=[];
  for(let i=0;i<2;i++){if(G.enemies.length>=CAP.e)break;const c=spawnEnemy('gomsaekki',e.x+(i?10:-10),e.y+6,{novr:1});pushOut(c,c.r);e.kids.push(c);}}
 const lost=e.kids.filter(k=>k.dead).length;if(lost!==e.lost){if(lost>(e.lost||0)){toast(_t("새끼를 잃은 암곰이 성이 났다"),'red');particle(e.x,e.y-6,'#ff5a3a',8,50,0.4);e.eact='rage';e.rT=0.8;}e.lost=lost;e.spd=e.bs*Math.pow(1.25,lost);e.dmg=e.bd*Math.pow(1.25,lost);}
 if(e.rT>0){e.rT-=dt;if(e.rT<=0)e.eact=null;}
 return [vx,vy];};

/* ---- 5막 길달(吉達): 사람으로 나타나 집사 벼슬을 하던 도깨비, 여우로 변해 달아났다(『삼국유사』). 6초마다 0.6초 여우로 변해 사라졌다가 퇴마사에서 80~120 떨어진 곳에 나타나며 탄 8 ----
   출처: 한국민족문화대백과사전 「길달」. 순간이동은 「여우로 변해 달아남」을 게임 속에 옮긴 각색 */
addElite2('gildal',{n:'길달',c:'e',st:5,t:'goblin',A:'#2f6b5a',B:'#1d4d42',eai:'blink',sc:1.3,
 d:'사람으로 나타나 벼슬을 하던 도깨비. 여우로 변해 사라졌다가 다른 곳에 나타난다. 출처: 한국민족문화대백과사전 「길달」(『삼국유사』) · 순간이동은 게임 속 각색',
 frames:[
 ['.kk.kkkk.kk.','..kkkkkkkk..','...kkkkkk...','...kssssk...','...kskksk...','...kssssk...','....kssk....','..kAAAAAAk..','.kAAAyyAAAk.','.kAAAyyAAAk.','.ksAAAAAAsk.','..kAAAAAAk..','..kABBBBAk..','..kAAAAAAk..','..kAk..kAk..','..kk....kk..'],
 ['.kk.kkkk.kk.','..kkkkkkkk..','...kkkkkk...','...kssssk...','...kskksk...','...kssssk...','....kssk....','..kAAAAAAk..','.kAAAyyAAAk.','.kAAAyyAAAk.','.ksAAAAAAsk.','..kAAAAAAk..','..kABBBBAk..','..kAAAAAAk..','...kAkkAk...','...kk..kk...'],
 ['............','..k.....k...','.kok...kok..','.koookooook.','.kokooookok.','.kooowwoook.','..koowwook..','...kowwok...','..kooooook..','.kooooooook.','.koowwwwook.','.kooowwoook.','..kooooookk.','..kok..kokw.','..kk...kkow.','.........kk.']]});
ELITE_AI.blink=(e,dt,P,vx,vy)=>{
 if(e.bT===undefined)e.bT=2;
 if(e.eact==='fox'){e.aT-=dt;if(e.aT<=0){e.eact=null;e.x=e.dx2;e.y=e.dy2;e.inv=e.inv0;ringB(e,8,60,Math.random());particle(e.x,e.y,'#e07a2e',10,60,0.4);}return [0,0];}
 e.bT-=dt;if(e.bT<=0){e.bT=6;let q=null;
  for(let t=0;t<16&&!q;t++){const a=Math.random()*TAU,dd=rnd(80,120),c={x:P.x+Math.cos(a)*dd,y:P.y+Math.sin(a)*dd};pushOut(c,e.r);pushOut(c,e.r);const d2=Math.hypot(c.x-P.x,c.y-P.y);
   const c2={x:c.x,y:c.y};pushOut(c2,e.r);if(d2>=80&&d2<=120&&Math.abs(c.x-P.x)<W/2-6&&Math.abs(c.y-P.y)<H/2-6&&Math.abs(c2.x-c.x)<0.01&&Math.abs(c2.y-c.y)<0.01)q=c;}
  if(q){e.eact='fox';e.aT=0.6;e.dx2=q.x;e.dy2=q.y;e.inv0=!!e.inv;e.inv=true;eWarn(q.x,q.y,e.r+6,0.6);particle(e.x,e.y,'#e07a2e',8,40,0.3);}}
 return [vx,vy];};

/* 막 표에 새 엘리트를 붙인다(v19.4: 1~5막) */
STAGES[0].elite2='gaekgwi';STAGES[1].elite2='juktong';STAGES[2].elite2='beomnam';STAGES[3].elite2='gomnaru';STAGES[4].elite2='gildal';
