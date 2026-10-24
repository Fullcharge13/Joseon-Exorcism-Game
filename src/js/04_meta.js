/* ======================= meta (per-browser save) ======================= */
const UPG=[
 {id:'hp',name:'단단한 몸',desc:'시작 최대 체력 +10',b:{name:'맑은 기혈',desc:'초당 체력 회복 +0.1'},max:5,cost:l=>30+l*30},
 {id:'might',name:'기합',desc:'공격력 +5%',b:{name:'급소 찌르기',desc:'치명타 확률 +3%'},max:5,cost:l=>40+l*40},
 {id:'spd',name:'경공',desc:'이동 속도 +4%',b:{name:'끌어당김',desc:'줍는 범위 +12%'},max:4,cost:l=>35+l*35},
 {id:'xp',name:'총명',desc:'경험치 획득 +10%',b:{name:'재물운',desc:'출정 뒤 받는 엽전 +8%'},max:5,cost:l=>40+l*35},
 {id:'rr',name:'산통 손질',desc:'출정마다 산통 흔들기 +1',b:{name:'물리기 손질',desc:'출정마다 물리기 +1'},max:2,cost:l=>80+l*80},
 {id:'revive',name:'혼백 부적',desc:'쓰러지면 한 번 되살아난다',b:{name:'금강 부적',desc:'받는 피해 −10%'},max:1,cost:()=>220},
];
const JOBTASK={seonbi:['문방사우의 힘','성현의 반열','도체찰사의 마패','먹이 마르기 전에','선비의 새벽'],
 uiwon:['백 사람을 살린 손','의성의 경지','독왕의 경지','약과 독은 한 뿌리','의원의 새벽'],
 mudang:['넋을 달래는 방울','무조의 경지','하늘 만신의 경지','굿판의 첫 신명','무당의 새벽'],
 jangsu:['변방을 지킨 칼','대원수의 군령','궁성의 시위','첫 칼을 벼리다','장수의 새벽'],
 gisaeng:['가락으로 벤 요괴','국창의 소리','검선의 칼춤','흥에 겨운 가락','기생의 새벽'],
 sangin:['셈이 맞는 장사','대방의 장부','도반수의 통문','천금의 셈','상인의 새벽']};
const jong=w=>{const c=w.charCodeAt(w.length-1)-0xAC00;return c>=0&&c<11172?c%28:0;},euro=w=>w+(jong(w)===0||jong(w)===8?'로':'으로'),eul=w=>w+(jong(w)?'을':'를');   //i18n-skip 조사 고르기(번역하지 않음)
for(const cid in JOBTASK){const C=CHARS[cid],N=JOBTASK[cid],sw=WD[C.start];
 TASKS.push(T('j_k_'+cid,N[0],`${euro(C.name)} 요괴 3,000마리 퇴치`,'kills_'+cid,3000,{coins:120},'엽전 120'),
  T('j_b0_'+cid,N[1],`${C.branches[0].name}에서 5차 전직(${C.branches[0].tiers[4].name})`,'br0_'+cid,5,{coins:200},'엽전 200'),
  T('j_b1_'+cid,N[2],`${C.branches[1].name}에서 5차 전직(${C.branches[1].tiers[4].name})`,'br1_'+cid,5,{coins:200},'엽전 200'),
  T('j_e_'+cid,N[3],`${eul(sw.name)} ${euro(sw.evoName)} 진화`,'evo:'+C.start,1,{coins:100},'엽전 100'),
  T('j_c_'+cid,N[4],`${euro(C.name)} 제10막 평정`,'clear_'+cid,1,{coins:300},'엽전 300'));}
/* ======================= 설화 출정 (v17) ======================= */
const TALES={
 woochi:{n:'전우치전',cid:'seonbi',st:0,trace:'scroll',traceN:'낡은 족자',
  src:'한국민족문화대백과사전 「전우치전」',url:'https://encykorea.aks.ac.kr/Article/E0049554',
  lede:'여우에게서 천서를 빼앗은 도사 전우치와 함께 송도의 밤을 지킨다.',
  frags:[
   {art:'en:baekyeou',t:'송도에 사는 전우치는 어느 날 여우가 입에 문 구슬을 삼키고, 여우에게서 하늘의 글(천서)을 빼앗았다. 그날부터 그의 붓끝에서 구름이 일었다.'},
   {art:'jw',t:'굶주린 백성을 보다 못한 전우치는 하늘 선관으로 꾸미고 임금 앞에 섰다. 옥황상제의 명이라며 황금 들보를 받아 내, 그것을 팔아 산 곡식을 집집마다 나누었다.'},
   {art:'jw',t:'탐관오리를 골리고 억울한 이를 돕던 전우치는 끝내 역적이라는 누명을 썼다. 쫓기는 몸이 된 그는, 도술을 거두지 않고 더 깊은 밤으로 숨어들었다.'}],
  start:{lvl:12,branch:1,w:[['meok',3],['buchae',2]]},
  acts:[
   {st:0,eq:0,rule:'jwAlly',boss:'gumiho',bossN:'천서를 찾는 여우',name:'송도 장터',art:'en:gumiho',intro:'송도 장터에 흰 여우가 나타났다. 전우치에게 빼앗긴 천서를 되찾으러 온 것이다. 전우치가 웃으며 부채를 펼쳤다. "선비 양반, 같이 가세."'},
   {st:1,eq:1,rule:'grain',boss:'dokchief',bossN:'곡식을 노리는 도깨비',name:'곡식 나누기',art:'prop:grain',intro:'여우의 원한에 도깨비들이 들러붙어 곡식 창고를 노린다. 곡식 섬을 모아 굶는 집에 나누어야 한다.'},
   {st:4,eq:2,dmg:0.75,rule:'clones',boss:'jwclone',bossN:'전우치의 분신',name:'도술의 끝',art:'jw',intro:'도술이 지나치면 도술이 사람을 부린다. 전우치의 그림자들이 저 혼자 걸어 나와 마을을 어지럽힌다.'}],
  end:'분신들이 흩어지자 전우치는 한참 말이 없었다. 이튿날, 그는 화담 선생을 따라 산으로 들어가 도를 닦기로 했다고 한다. 떠나는 길에 그는 선비에게 쪽빛 도포 한 벌을 건넸다. "글로 싸우는 자에게는 이 빛이 어울리네."',
  skin:{id:'jjok',n:'쪽빛 도포',A:'#2f4a7a'}},
 jiha:{n:'지하국대적',cid:'jangsu',st:6,trace:'cave',traceN:'굴 입구',
  src:'한국민족문화대백과사전 「지하국대적퇴치설화」',url:'https://encykorea.aks.ac.kr/Article/E0054449',
  lede:'땅속 나라로 사람을 잡아간 대적을 쫓아 홀로 굴 아래로 내려간다.',
  frags:[
   {art:'en:jiha',t:'어느 마을의 딸이 하룻밤 새 사라졌다. 땅속 괴물이 데려갔다는 소문에, 부모는 딸을 찾아오는 이에게 재산과 사위 자리를 걸었다.'},
   {art:'prop:cave',t:'용사는 산속에서 땅 밑으로 난 좁은 문을 찾았다. 밧줄을 타고 내려가던 부하들은 하나둘 겁을 먹고 올라가 버렸고, 용사만 홀로 어둠 속에 내렸다.'},
   {art:'prop:well',t:'지하국의 우물가에서 잡혀 온 여인이 용사에게 몰래 물 한 바가지를 건넸다. 「힘내는 물」이었다. 그것을 마시자 큰 바위도 가볍게 들렸다.'}],
  start:{lvl:14,branch:0,w:[['hwando',3],['pyeongon',2],['deungpae',1]]},
  acts:[
   {st:6,eq:1,rule:'dark',boss:'baekdusan',bossN:'굴을 지키는 산괴',name:'어두운 굴',art:'prop:cave',intro:'굴은 깊고 어둡다. 등불 하나에 의지해 내려간다.'},
   {st:8,eq:2,dmg:0.65,rule:'well',boss:'bulgae',bossN:'대적의 불개',name:'우물가',art:'prop:well',intro:'대적의 집 앞 우물. 물 곁을 지키면 힘이 솟는다.'},
   {st:9,eq:3,dmg:0.8,rule:'noHeal',boss:'jiha',bossN:'지하국 대적',name:'대적의 집',art:'en:jiha',intro:'머리 위에서 밧줄이 툭 끊어졌다. 이제 돌아갈 길은 대적을 쓰러뜨리는 것뿐이다.',bossHp:1.3}],
  end:'대적이 쓰러지고 사람들을 밧줄로 올려 보냈지만, 위에 남은 부하들은 밧줄을 거두고 달아났다. 용사가 지하에 홀로 남아 있을 때, 산신의 목소리가 들렸다. 땅 위로 돌아온 용사는 부하들을 벌하고, 마을 사람들이 지어 준 청록 철릭을 입었다.',
  skin:{id:'cheongrok',n:'청록 철릭',A:'#2f7a6a'}},
 bari:{n:'바리공주',cid:'mudang',st:8,trace:'flower',traceN:'서천꽃밭의 꽃',
  src:'한국민족문화대백과사전·한국민속신앙사전 「바리공주」(디지털 인문학 위키 「바리데기」 인용)',url:'https://dh.aks.ac.kr/~dh_edu/wiki/index.php/%EB%B0%94%EB%A6%AC%EB%8D%B0%EA%B8%B0',
  lede:'버려진 일곱째 공주가 되어 부모를 살릴 약수를 찾아 저승 너머로 간다.',
  frags:[
   {art:'ch:mudang',t:'딸만 일곱을 둔 임금은 막내를 옥함에 담아 버렸다. 버려진 공주는 짐승들과 신령의 손에 자라, 바리공주라 불렸다.'},
   {art:'en:yeoksin',t:'세월이 흘러 임금 부부가 깊은 병에 들었다. 저승 너머의 약수만이 살릴 수 있다는데, 여섯 언니도 신하들도 모두 고개를 저었다.'},
   {art:'prop:flower',t:'바리공주는 "낳아 주신 은혜만으로도 가겠다"며 홀로 길을 나섰다. 저승 가는 길은 멀고, 꽃밭 너머에는 약수를 지키는 이가 기다리고 있었다.'}],
  start:{lvl:14,branch:0,w:[['bujeok',3],['bara',2],['bangul',1]]},
  acts:[
   {st:5,eq:1,dmg:0.85,rule:'plague',boss:'yeoksin',bossN:'역병의 신',name:'병든 나라',art:'en:yeoksin',intro:'나라에 역병이 돈다. 역병의 신을 물리쳐야 길을 떠날 수 있다.'},
   {st:3,eq:1,dmg:0.7,rule:'wells3',boss:'jigwi',bossN:'약수를 노리는 지귀',name:'약수 긷기',art:'prop:well',intro:'약수를 지키는 이가 말했다. "물을 긷고 불을 때고 나무를 하라. 그래야 약수를 주겠다."'},
   {st:8,eq:2,dmg:0.7,rule:'flowers',boss:'saja',bossN:'저승사자',name:'서천꽃밭',art:'prop:flower',intro:'서천꽃밭. 숨을 살리는 꽃, 뼈를 살리는 꽃, 살을 살리는 꽃을 찾아야 한다.'}],
  end:'약수와 꽃을 들고 돌아왔을 때 부모는 이미 숨을 거둔 뒤였다. 바리공주가 꽃을 놓고 약수를 흘려 넣자 두 사람이 눈을 떴다. 그 뒤 바리공주는 저승 가는 넋을 이끄는 신이 되었다고 한다. 무당은 굿판에서 그 이야기를 노래했고, 흰 무명옷을 지어 입었다.',
  skin:{id:'muyeong',n:'흰 무명옷',A:'#e8e4d6'}},
};
/* 본편 결말: 제10막을 처음 평정하면 공통 4장, 퇴마사마다 처음 한 번 맺음말 */
const ENDING={common:[
 {title:'그림자가 무너지다',art:'en:geuseunde',t:'근정전 앞뜰에서 그슨대가 무너지자, 그 속에서 수많은 그림자가 흩어져 나왔다. 도깨비 웃음소리, 여우 울음, 쇠를 씹는 소리. 모두 어디선가 들어 본 이야기의 소리였다.'},
 {title:'그슨대의 정체',art:'en:dokkaebi',t:'할머니 무릎에서 듣던 이야기, 장터 이야기꾼의 입담, 굿판의 무가. 더는 아무도 들려주지 않게 된 이야기들이 갈 곳을 잃고 밤마다 쌓였다. 그 밤이 그슨대였다.'},
 {title:'퇴마록이 펼쳐지다',art:'prop:scroll',t:'퇴마록이 저절로 펼쳐졌다. 지난밤 물리친 요괴의 이름이 한 줄씩 적혀 있었다. 이름이 적힌 그림자는 더는 사람을 덮치지 않고, 책장 속으로 돌아가 조용히 누웠다.'},
 {title:'새벽',art:'prop:dawn',t:'동이 텄다. 저잣거리에 첫 장이 서고, 주막 굴뚝에서 국밥 김이 올랐다. 누군가 아이를 무릎에 앉히고 입을 열었다. "옛날 옛적, 요괴가 들끓던 조선 팔도에……"'}],
 epi:{
 seonbi:'붓을 꺾으려다 그만두었다. 마지막 장을 덮으며, 이야기를 적는 일이 퇴마의 끝이 아니라 시작이라는 것을 알았다. 그는 서당을 열고, 아이들에게 글보다 옛이야기를 먼저 가르쳤다.',
 uiwon:'역병이 물러간 마을에서 그는 다시 침을 들었다. 사람을 고치는 일과 이야기를 지키는 일은 닮아 있었다. 둘 다 잊히면 금이 간다.',
 mudang:'새벽 굿판에서 그녀는 넋들을 위해 마지막 길닦음을 했다. 흰 무명천 위로 이야기들이 줄지어 건너갔다. 이번에는 아무도 뒤를 돌아보지 않았다.',
 jangsu:'그는 투구를 벗어 성문 위에 걸었다. 지킬 것은 성이 아니라, 저녁마다 문간에 앉아 이야기를 나누는 사람들이었다. 그는 변방 대신 마을 어귀 장승 곁을 지키기로 했다.',
 gisaeng:'그녀는 잊힌 이야기들로 새 노래를 지었다. 노래가 끝날 때마다 객석 어딘가에서 그림자 하나가 고개를 숙였다가, 웃으며 사라졌다.',
 sangin:'장부를 덮으며 외상값 한 줄을 지웠다. 「이야기로 갚음」이라고 적고서. 그날부터 그의 보부상단은 장터마다 물건과 함께 옛이야기를 실어 날랐다.'}};
/* 설화 막 규칙: start(막 시작) · tick(매 프레임) · ready(보스가 나와도 되는가) · hud(위쪽 진행 글). 동작은 아래 TALE_RULE_FN에서 붙인다 */
const TALE_RULES={jwAlly:{n:'전우치와 함께'},grain:{n:'곡식 나누기'},clones:{n:'도술 그림자'},dark:{n:'어두운 굴'},well:{n:'힘내는 물'},noHeal:{n:'돌아갈 길 없음'},plague:{n:'역병'},wells3:{n:'약수 긷기'},flowers:{n:'살리는 꽃'}};
const TALE_IDS=Object.keys(TALES);
/* 설화 기록 바로잡기: 빠진 칸 채우기, 조각 0~3, 완주한 설화의 빛깔만 인정 */
/* 저장 값의 모양이 틀어져도(문자열·숫자·배열) 객체로 바로잡는다. 완주 기록은 숫자 best·n이 있는 것만 남긴다 */
function plainObj(o){return o&&typeof o==='object'&&!Array.isArray(o)?o:{};}
function taleNorm(){const T0=meta.tale=plainObj(meta.tale);T0.frag=plainObj(T0.frag);T0.done=plainObj(T0.done);T0.skin=plainObj(T0.skin);
 for(const id of Object.keys(T0.done)){const d=T0.done[id];if(!TALES[id]||!plainObj(d)||!Number.isFinite(d.best)||!Number.isFinite(d.n))delete T0.done[id];}
 for(const id of TALE_IDS){const v=Math.round(+T0.frag[id]||0);T0.frag[id]=Math.max(0,Math.min(3,v));}
 for(const cid in T0.skin){const k=T0.skin[cid];const t=TALE_IDS.map(i=>TALES[i]).find(t=>t.cid===cid&&t.skin.id===k);if(!t||!T0.done[TALE_IDS.find(i=>TALES[i]===t)])T0.skin[cid]=null;}
 const E=meta.ending=plainObj(meta.ending);E.seen=!!E.seen;E.epi=Array.isArray(E.epi)?E.epi.filter(c=>CHARS[c]):[];}
const SAVE_KEY='joseon-toema-v1';
let meta={coins:0,up:{},best:null};
try{const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(s)meta=Object.assign(meta,s);}catch(e){}
meta.up=meta.up||{};meta.stats=meta.stats||{};meta.seen=meta.seen||{};meta.done=meta.done||[];meta.curseMax=meta.curseMax||0;
meta.set=Object.assign({vol:70,shake:true,nums:true,flash:true,scale:'mid',joy:true,perf:'auto',fps:false,fxA:1},meta.set||{});
/* 설정 값 바로잡기: 고를 수 있는 값이 아니면 기본으로 */
/* v17.1 2배 정밀 그리기: 캐릭터·요괴 크기가 기본이 아니고, 절약 모드가 아니고, 느려짐으로 끄지 않았을 때 */
function hdOn(){return meta.set.ent>1&&!LOW&&!entOff;}
/* v17.1 그림 배율: 플레이어·펫·전우치(인자 없음)·요괴는 설정값, 보스는 1.5배까지, 따로 그리는 큰 보스는 1배. 판정(r)은 건드리지 않는다 */
function entK(e){if(!hdOn())return 1;const k=meta.set.ent;if(!e)return k;
 if(e.boss||e.clone){const pk=e.boss&&EN[e.kind]&&EN[e.kind].proc;if(pk==='imugi'||pk==='eoduk'||pk==='geuseunde')return 1;return Math.min(k,1.5);}return k;}   // 보스의 분신도 보스처럼
function normSet(){const t=meta.set;if(![1,0.7,0.4].includes(t.fxA))t.fxA=1;if(![1,2].includes(t.ent))t.ent=1;}
normSet();
let entOff=false;   // v17.1 느려짐 감지가 이번 실행에서 캐릭터·요괴 크기를 끈 상태(저장값은 그대로)
let LOW=false,autoLow=false;const CAP={p:420,n:240,e:300};
function applyPerf(){LOW=meta.set.perf==='low'||(meta.set.perf==='auto'&&autoLow);CAP.p=LOW?140:420;CAP.n=LOW?60:240;CAP.e=LOW?200:300;}
applyPerf();
if(!meta.unl){meta.unl=['char:seonbi','card:gilil','card:hyungnyeon'];if(meta.best)meta.unl.push('char:uiwon','char:mudang','char:jangsu','char:gisaeng','char:sangin');}
meta.extra=meta.extra||{rr:0,sk:0,bn:0};meta.anom=meta.anom||{};
meta.upB=meta.upB||{};
/* v17.4 조합 시험장: 주소에 ?combo를 붙였을 때만 열린다. 이때는 저장을 하지 않는다(진행·엽전·과업이 남지 않음). */
let LAB=false;try{LAB=/[?&]combo\b/.test(location.search);}catch(e){}
function saveMeta(){if(LAB)return;try{localStorage.setItem(SAVE_KEY,JSON.stringify(meta));}catch(e){}}
/* ======================= 멈춤 기록 (v17.3) =======================
   휴대폰에서 「멈췄다」는 신고를 확인하려고, 멈춤 징후와 오류를 이 기기에만 적어 둔다(바깥으로 보내지 않음).
   게임 저장과 다른 칸에 최근 20건. 같은 종류·문구는 한 판에 한 번. 설정 → 오류 기록에서 복사·지우기. */
const GAME_VER='v18.0',DIAG_KEY='joseon-toema-diag',DIAG_MAX=20;
let DIAG={log:[],hb:null};try{const d=JSON.parse(localStorage.getItem(DIAG_KEY)||'null');if(d&&typeof d==='object'&&!Array.isArray(d)){DIAG.log=Array.isArray(d.log)?d.log.filter(e=>e&&typeof e==='object').slice(-DIAG_MAX):[];DIAG.hb=d.hb&&typeof d.hb==='object'?d.hb:null;}}catch(e){}
const diagSeen=new Set();let diagStuck=0,diagNoScr=0,diagLastT=null,diagHbT=0;
function diagSave(){try{localStorage.setItem(DIAG_KEY,JSON.stringify(DIAG));}catch(e){}}
function diagNow(){const d=new Date(),z=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())}:${z(d.getSeconds())}`;}
function diagState(){try{const vis=[...document.querySelectorAll('.screen')].filter(x=>!x.hidden).map(x=>x.id);
 return G?{mode:G.mode,cid:G.cid,stage:G.stage+1,loop:G.loop,lvl:G.P.lvl,tier:G.P.tier,t:Math.round(G.time),modal,vis,over:!!G.over,en:G.enemies.length,fx:G.fx.length,low:LOW,ent:meta.set.ent,hd:hdOn(),fps:Math.round(fpsV),tale:G.tale?G.tale.id+':'+(G.tale.act+1):undefined}:{modal,vis};}catch(e){return {err:String(e)};}}
function diagNote(kind,msg='',extra){const k=kind+'|'+msg;if(diagSeen.has(k))return;diagSeen.add(k);
 DIAG.log.push(Object.assign({at:diagNow(),ver:GAME_VER,kind,msg:String(msg).slice(0,300),st:diagState()},extra||{}));if(DIAG.log.length>DIAG_MAX)DIAG.log.splice(0,DIAG.log.length-DIAG_MAX);diagSave();}
function diagErr(kind,e){const m=e&&e.message?e.message:String(e);const at=e&&e.stack?String(e.stack).split('\n').slice(0,3).map(x=>x.trim()).join(' < ').slice(0,300):'';diagNote(kind,m,at?{at_code:at}:undefined);}
function diagDevice(){const sc=typeof screen!=='undefined'?screen:{};return _t("{userAgent} · 화면 {innerWidth}×{innerHeight} · 화질 {p}",{userAgent:navigator.userAgent,innerWidth:innerWidth,innerHeight:innerHeight,p:window.devicePixelRatio||1})+(sc.width?_t(" · 기기 {width}×{height}",{width:sc.width,height:sc.height}):'');}
function diagText(){if(!DIAG.log.length)return '';return [_t("조선퇴마록 {GAME_VER} 오류 기록 · {p}",{GAME_VER:GAME_VER,p:diagNow()}),_t("기기: {p}",{p:diagDevice()}),...DIAG.log.map((e,i)=>`${i+1}. [${e.at} ${e.ver}] ${e.kind}${e.msg?': '+e.msg:''}${e.at_code?' @ '+e.at_code:''} | ${JSON.stringify(e.st)}`)].join('\n');}
function diagClear(){DIAG.log=[];diagSeen.clear();diagSave();}
function diagRender(msg){const n=DIAG.log.length,t=$('#diagText');if(t)t.value=diagText();const c=$('#diagN');if(c)c.textContent=msg||(n?_t("기록 {n}건",{n:n}):_t("기록 없음"));
 const cp=$('#diagCopy'),cl=$('#diagClear');if(cp)cp.disabled=!n;if(cl)cl.disabled=!n;}
function diagCopy(){const box=$('#diagText'),t=(box&&box.value)||diagText();if(!t)return;   // 보이는 글 그대로 복사const pick=()=>{const a=$('#diagText');try{a.focus();a.select();a.setSelectionRange(0,t.length);}catch(e){}diagRender('글상자를 길게 눌러 복사하세요');};
 try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(()=>diagRender(_t("복사했습니다")),pick);return;}}catch(e){}pick();}
/* 매 장면: 진행 멈춤(창 없이 3초 넘게 시간 정지)·창 없음(2초)·긴 끊김(보이는 동안 한 장면 3초 넘게)·5초마다 마지막 상태 */
function diagWatch(raw){if(document.hidden)return;
 if(raw>3000&&raw<600000&&G&&!G.over)diagNote('긴 끊김',Math.round(raw)+'ms');
 if(G&&!G.over&&!modal){if(diagLastT===G.time){diagStuck+=raw;if(diagStuck>3000)diagNote('진행 멈춤','창 없이 3초 넘게 게임 시간이 흐르지 않음');}else diagStuck=0;diagLastT=G.time;}else{diagStuck=0;diagLastT=null;}
 if(modal&&modal!=='freeze'){const sc=document.getElementById(modal);if(sc&&sc.hidden){diagNoScr+=raw;if(diagNoScr>2000)diagNote('창 없음',modal);}else diagNoScr=0;}else diagNoScr=0;
 diagHbT+=raw;if(diagHbT>5000){diagHbT=0;DIAG.hb={at:diagNow(),playing:!!(G&&!G.over),hidden:false,clean:false,st:diagState()};diagSave();}}
/* 지난 실행이 게임 중에 갑자기 끝났는지(앱 전환으로 숨긴 뒤 끝난 것은 뺀다) */
{const hb=DIAG.hb;if(hb&&hb.playing&&!hb.hidden&&!hb.clean)diagNote('게임 중 끊김','지난 실행이 게임 중에 끝남(멈춤·강제 종료 가능성)',{st:hb.st,last:hb.at});DIAG.hb=null;diagSave();}
addEventListener('error',e=>diagErr(_t("페이지 오류"),e&&e.error?e.error:(e&&e.message?e.message+(e.filename?' ('+e.filename+':'+e.lineno+')':''):e)));
addEventListener('unhandledrejection',e=>diagErr(_t("처리되지 않은 오류"),e&&e.reason!==undefined?e.reason:e));
addEventListener('pagehide',()=>{if(DIAG.hb){DIAG.hb.clean=true;diagSave();}});

const unlocked=k=>meta.unl.includes(k);
/* v12.1: 예전 저장에서 저절로 열린 퇴마사는 잠그고, 과업으로 연 퇴마사만 남긴다 */
if((meta.saveVer||0)<12){const had=meta.unl.filter(k=>k.startsWith('char:')).length;meta.unl=meta.unl.filter(k=>!k.startsWith('char:')||k==='char:seonbi');if(!meta.unl.includes('char:seonbi'))meta.unl.unshift('char:seonbi');
 for(const t of TASKS)if(meta.done.includes(t.id)&&t.rw.unlock&&t.rw.unlock.startsWith('char:')&&!meta.unl.includes(t.rw.unlock))meta.unl.push(t.rw.unlock);
 if(had>1)meta.migNote=true;meta.saveVer=12;saveMeta();}
/* v17: 설화 출정 기록(meta.tale)과 본편 결말 기록(meta.ending) */
taleNorm();if((meta.saveVer||0)<13){meta.saveVer=13;saveMeta();}

/* ======================= audio ======================= */
let AC=null,muted=false,lastHit=0;
/* 멈춘 오디오 되살리기: resume()은 약속을 돌려주므로 거절도 받아 둔다(콘솔에 처리되지 않은 오류가 남지 않게) */
function resumeAudio(){if(!AC||AC.state!=='suspended')return;try{const r=AC.resume();if(r&&r.catch)r.catch(()=>{});}catch(_){}}
function initAudio(){if(AC){resumeAudio();return;}try{AC=new (window.AudioContext||window.webkitAudioContext)();resumeAudio();}catch(e){}}
function snd(f,d=0.06,type='square',v=0.035){if(!AC||muted||!meta.set.vol)return;try{const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(Math.max(40,f*0.6),t+d);g.gain.setValueAtTime(v*meta.set.vol/70,t);g.gain.exponentialRampToValueAtTime(0.0001,t+d);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+d+0.02);}catch(e){}}

