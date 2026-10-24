/* ======================= monsters (names from 「한국 요괴 도감」) ======================= */
// c: n 일반 · e 엘리트 · m 중간 보스 · b 막 보스
const EN={
 gwihwa:{n:'귀화',c:'n',st:1,t:'wisp',A:'#8fd3ff',B:'#3a5f9e',hp:5,spd:40,dmg:4,r:4,xp:1,ai:'zig',fly:1,d:'떠도는 도깨비불. 흔들리며 다가온다.'},
 kkeomeok:{n:'꺼먹살이',c:'n',st:1,t:'blob',A:'#141018',hp:8,spd:36,dmg:5,r:4,xp:1,ai:'swarm',d:'검은 그림자 덩어리. 무리 지어 몰려온다.'},
 dokkaebi:{n:'도깨비',c:'n',st:1,t:'goblin',A:'#3f9a5a',B:'#b0702e',hp:12,spd:30,dmg:6,r:5,xp:2,d:'방망이를 든 도깨비. 곧장 다가온다.'},
 dungap:{n:'둔갑쥐',c:'n',st:2,t:'rat',A:'#8a7a6a',B:'#5a4a3a',hp:7,spd:58,dmg:5,r:3,xp:1,ai:'swarm',d:'둔갑하는 쥐. 떼로 빠르게 달려든다.'},
 baekyeou:{n:'백여우',c:'n',st:2,t:'fox',A:'#efe6d2',hp:16,spd:50,dmg:7,r:5,xp:3,ai:'charge',d:'흰 여우. 잠시 멈췄다가 덮친다.'},
 sikingyeon:{n:'식인견',c:'n',st:3,t:'dog',A:'#8a5a2b',B:'#5a3a1a',hp:20,spd:50,dmg:8,r:5,xp:3,d:'사람을 무는 들개.'},
 changgwi:{n:'창귀',c:'n',st:3,t:'ghost',A:'#c9d8e0',B:'#6a8a9a',hp:22,spd:26,dmg:8,r:5,xp:3,ai:'shoot',fly:1,d:'범에게 먹힌 넋. 멀리서 홀리는 기운을 던진다.'},
 sammokgu:{n:'삼목구',c:'n',st:3,t:'dog3',A:'#2a2228',B:'#c23b2a',hp:28,spd:44,dmg:9,r:5,xp:3,ai:'charge',d:'눈이 셋 달린 개. 멈칫한 뒤 돌진한다.'},
 ieoin:{n:'이어인',c:'n',st:4,t:'fishman',A:'#4f8f8a',B:'#2f6b6a',hp:30,spd:28,dmg:9,r:5,xp:3,ai:'leap',d:'물고기 얼굴의 사람. 뛰어오르며 다가온다.'},
 geumhyeol:{n:'금혈어',c:'n',st:4,t:'fish',A:'#e0b048',B:'#c23b2a',hp:18,spd:48,dmg:8,r:4,xp:2,ai:'zig',fly:1,d:'허공을 헤엄치는 금빛 물고기.'},
 ineo:{n:'인어',c:'n',st:4,t:'fishman',A:'#e8b98f',B:'#3a6fd0',hp:26,spd:30,dmg:9,r:5,xp:3,ai:'shoot',d:'물빛 꼬리의 인어. 물방울을 쏜다.'},
 songaksi:{n:'손각시',c:'n',st:5,t:'ghost',A:'#efe6d2',B:'#c23b2a',hp:30,spd:26,dmg:10,r:5,xp:3,fly:1,d:'처녀의 넋. 벽을 지나 떠다닌다.'},
 dalgyal:{n:'달걀귀',c:'n',st:5,t:'egg',A:'#f2efe8',B:'#6a6a7a',hp:34,spd:30,dmg:10,r:5,xp:3,ai:'charge',d:'얼굴이 달걀처럼 밋밋한 귀신.'},
 mongdal:{n:'몽달귀',c:'n',st:5,t:'ghostHat',A:'#dfe6f0',B:'#8a9aaa',hp:32,spd:30,dmg:10,r:5,xp:3,fly:1,d:'총각의 넋. 갓을 쓰고 떠돈다.'},
 hwangchung:{n:'황충',c:'n',st:6,t:'worm',A:'#b0a040',B:'#7a7020',hp:10,spd:60,dmg:6,r:3,xp:1,ai:'swarm',d:'메뚜기 떼. 작고 빠르다.'},
 sikinchung:{n:'식인충',c:'n',st:6,t:'worm',A:'#c23b2a',B:'#7a2018',hp:36,spd:24,dmg:10,r:5,xp:3,ai:'split',sc:1.4,d:'쓰러지면 황충 두 마리로 갈라진다.'},
 golsaeng:{n:'골생충',c:'n',st:6,t:'worm',A:'#dfd6c0',B:'#a89c8a',hp:40,spd:26,dmg:10,r:5,xp:3,ai:'shoot',sc:1.4,d:'뼈빛 벌레. 독침을 뱉는다.'},
 jomagu:{n:'조마구',c:'n',st:7,t:'goblin',A:'#4a4552',B:'#2a2228',hp:20,spd:48,dmg:8,r:4,xp:2,ai:'swarm',sc:0.8,d:'작고 날랜 산속 요괴.'},
 baekduyacha:{n:'백두야차',c:'n',st:7,t:'yaksha',A:'#dfe6f0',B:'#5a6a7a',hp:60,spd:30,dmg:12,r:6,xp:4,d:'눈 덮인 산의 야차.'},
 geumgang:{n:'금강야차',c:'n',st:7,t:'yaksha',A:'#e0b048',B:'#7a2018',hp:70,spd:28,dmg:13,r:6,xp:5,ai:'charge',d:'금빛 야차. 힘을 모았다가 들이받는다.'},
 inmyeonjo:{n:'인면조',c:'n',st:8,t:'bird',A:'#8a5a2b',hp:40,spd:40,dmg:11,r:5,xp:4,ai:'zig',fly:1,d:'사람 얼굴을 한 새.'},
 haejungjo:{n:'해중조',c:'n',st:8,t:'bird',A:'#3a6fd0',pal:{s:'#3a6fd0'},hp:36,spd:46,dmg:11,r:5,xp:4,ai:'shoot',fly:1,d:'바다 위를 나는 새. 깃털을 날린다.'},
 mamyeongjo:{n:'마명조',c:'n',st:8,t:'bird',A:'#4a3a30',pal:{s:'#4a3a30'},hp:44,spd:42,dmg:12,r:5,xp:4,ai:'charge',fly:1,d:'말 울음소리를 내는 새. 내리꽂힌다.'},
 honjwi:{n:'혼쥐',c:'n',st:9,t:'rat',A:'#c0d0e0',B:'#8090a0',hp:24,spd:54,dmg:6,r:3,xp:2,ai:'swarm',d:'혼이 깃든 쥐. 떼로 몰려온다.'},
 gwigok:{n:'귀곡성',c:'n',st:9,t:'wisp',A:'#b07fd0',B:'#5a3a7a',hp:30,spd:40,dmg:8,r:4,xp:3,ai:'explode',fly:1,d:'귀신 울음. 사라질 때 원한을 흩뿌린다.'},
 jibak:{n:'지박령',c:'n',st:9,t:'ghost',A:'#8a8494',B:'#4a4552',hp:80,spd:18,dmg:11,r:6,xp:5,fly:1,d:'한 자리에 묶인 넋. 느리지만 질기다.'},
 geuseunsae:{n:'그슨새',c:'n',st:10,t:'bird',A:'#1a1418',pal:{s:'#1a1418',k:'#e0b048'},hp:60,spd:44,dmg:14,r:5,xp:5,ai:'charge',fly:1,d:'검은 새. 어둠 속에서 내리꽂힌다.'},
 dudu:{n:'두두리',c:'n',st:10,t:'goblin',A:'#3a5f9e',B:'#8a8494',hp:80,spd:30,dmg:15,r:5,xp:5,d:'쇠를 다루는 도깨비.'},
 // elites
 geolgwi:{n:'걸귀',c:'e',st:1,t:'ghost',A:'#a8b090',B:'#5a6a4a',d:'늘 굶주린 귀신. 원한 탄을 사방으로 뿌린다.'},
 samjokgu:{n:'삼족구',c:'e',st:2,t:'dog',A:'#e0b048',B:'#b0702e',d:'다리가 셋인 개. 여우를 쫓는다고 한다.'},
 heukho:{n:'흑호',c:'e',st:3,t:'tiger',A:'#2a2228',B:'#4a4552',d:'검은 범.'},
 tanju:{n:'탄주어',c:'e',st:4,t:'fish',A:'#3a8a9a',B:'#1d4d42',d:'배를 삼킬 만큼 큰 물고기.'},
 palcheok:{n:'팔척귀',c:'e',st:5,t:'tall',A:'#efe6d2',B:'#4a4552',d:'키가 여덟 자인 귀신.'},
 sadu:{n:'사두충',c:'e',st:6,t:'worm4',A:'#7a2018',B:'#c23b2a',d:'머리가 넷인 벌레.'},
 daein:{n:'대인',c:'e',st:7,t:'giant',A:'#b0702e',B:'#4a3a30',d:'산만 한 거인.'},
 cheongu:{n:'천구',c:'e',st:8,t:'dog',A:'#1a2b4a',B:'#e0b048',d:'하늘을 달리는 개.'},
 taejagwi:{n:'태자귀',c:'e',st:9,t:'child',A:'#dfe6f0',B:'#c23b2a',d:'어린아이의 넋.'},
 yeongno:{n:'영노',c:'e',st:10,t:'mask',A:'#3f9a5a',B:'#c23b2a',d:'탈판에 나와 양반을 잡아먹겠다는 괴물.'},
 // mid bosses
 yagwang:{n:'야광귀',c:'m',st:1,t:'goblin',A:'#1a2b4a',B:'#8fd3ff',d:'설날 밤 신발을 훔쳐 가는 귀신.'},
 jangsan:{n:'장산범',c:'m',st:2,t:'tiger',A:'#efe6d2',B:'#8a8494',d:'사람 목소리를 흉내 내어 홀리는 흰 짐승.'},
 geumdwaeji:{n:'금돼지',c:'m',st:3,t:'pig',A:'#e0b048',B:'#b0702e',d:'금빛 털의 큰 돼지.'},
 geodaeha:{n:'거대하',c:'m',st:4,t:'fish',A:'#c86a4a',B:'#7a2018',d:'거대한 새우.'},
 yeommae:{n:'염매',c:'m',st:5,t:'child',A:'#4a4552',B:'#1a1418',d:'저주로 만들어진 원귀.'},
 yeoksin:{n:'역신',c:'m',st:6,t:'mask',A:'#c23b2a',B:'#2a2228',d:'돌림병을 퍼뜨리는 귀신.'},
 baekdusan:{n:'백두산괴',c:'m',st:7,t:'beast',A:'#dfe6f0',B:'#8fd3ff',d:'백두산에 산다는 흰 괴물.'},
 bulgae:{n:'불개',c:'m',st:8,t:'dog',A:'#ff7a3a',B:'#c23b2a',d:'해와 달을 물어뜯는다는 불의 개.'},
 jigwi:{n:'지귀',c:'m',st:9,t:'wisp',A:'#ff6a3a',B:'#ffd040',d:'몸이 불이 되어 버린 넋.'},
 jangjamari:{n:'장자마리',c:'m',st:10,t:'mask',A:'#3a5f9e',B:'#e0b048',d:'탈놀이에서 춤추며 판을 여는 자.'},
 // stage bosses
 dokchief:{n:'대장 도깨비',c:'b',st:1,t:'goblin',A:'#b8352a',B:'#6a4a30',pal:{y:'#ffd76a',r:'#1a1418'},d:'도깨비들의 우두머리. 방망이로 금을 쏟아 낸다.'},
 jwclone:{n:'전우치의 분신',c:'b',st:0,t:'goblin',A:'#4a5a7a',tale:1,d:'도술이 저 혼자 걸어 나온 그림자.'},
 jwshade:{n:'도술 그림자',c:'n',st:0,t:'ghost',A:'#4a5a7a',B:'#e0b048',hp:24,spd:30,dmg:8,r:5,xp:3,ai:'shoot',tale:1,d:'전우치의 모습을 흉내 내는 그림자.'},
 gumiho:{n:'구미호',c:'b',st:2,t:'fox9',A:'#f2efe8',pal:{w:'#e0b048',k:'#c23b2a'},d:'천 년 묵은 아홉 꼬리 여우.'},
 gangcheol:{n:'강철이',c:'b',st:3,t:'beast',A:'#2c4a7a',B:'#e0b048',d:'바람과 비, 우박을 몰고 다니는 짐승.'},
 imugi:{n:'이무기',c:'b',st:4,t:'serpent',A:'#2f7d6b',proc:'imugi',d:'용이 되지 못한 큰 뱀.'},
 eoduk:{n:'어둑시니',c:'b',st:5,t:'shadow',A:'#0a0810',proc:'eoduk',d:'쳐다볼수록 커지는 어둠.'},
 bulgasari:{n:'불가사리',c:'b',st:6,t:'beast',A:'#8a8494',B:'#4a4552',d:'쇠를 먹고 커지는 괴물. 불에 타지 않는다.'},
 jiha:{n:'지하국대적',c:'b',st:7,t:'heads3',A:'#4a3a30',B:'#2a2228',d:'땅속 나라의 도적 우두머리.'},
 samdu:{n:'삼두일족응',c:'b',st:8,t:'eagle3',A:'#4a3a30',d:'머리 셋에 다리 하나인 매.'},
 saja:{n:'저승사자',c:'b',st:9,t:'reaper',A:'#1a1418',d:'명부를 들고 넋을 거두러 온다.'},
 geuseunde:{n:'그슨대',c:'b',st:10,t:'shadow',A:'#100c14',proc:'geuseunde',d:'밤길을 막아서는 거대한 검은 그림자.'},
};
const ESPR={};
for(const id in EN){const e=EN[id];ESPR[id]=variants(mk(TPL[e.t],{...PAL,A:e.A,B:e.B||e.A,...(e.pal||{})}));}
const DOGAM_IDS=Object.keys(EN).filter(id=>!EN[id].tale);
const PSPR={tiger:variants(mk(TPL.tiger,{...PAL,A:'#d8862a',B:'#1a1418',k:'#1a1418',w:'#efe6d2'})),bear:variants(mk(TPL.bear,{...PAL,A:'#5a3e2a',B:'#efe6d2',k:'#1a1418',w:'#2a1a12'})),falcon:variants(mk(TPL.bird,{...PAL,A:'#8a8494',s:'#c8c4cc',k:'#e0b048',r:'#e0b048'}))};
const PETS={
 tiger:{n:'범',kind:'호랑이',col:'#d8862a',d:'앞장서 달려들어 할퀴는 산군. 몇 마리에 큰 피해를 몰아준다.',
  sk:{a:[{lv:1,n:'할퀴기',d:'가까운 요괴에게 달려들어 할퀸다.'},{lv:5,n:'범 발톱 연격',d:'요괴 셋을 차례로 덮쳐 할퀸다.'}],
      h:[{lv:2,n:'포효',d:'포효로 둘레의 요괴를 1.5초 얼어붙게 한다.'},{lv:6,n:'산을 울리는 포효',d:'더 넓게, 2.5초 동안 얼어붙게 한다.'}],
      u:[{lv:4,n:'산군 강림',d:'화면의 요괴 다섯을 차례로 덮친다.'},{lv:8,n:'백호 현신',d:'흰 범으로 변해 요괴 여덟을 덮친다.'}]}},
 bear:{n:'반달곰',kind:'곰',col:'#6a4a30',d:'곁을 지키는 우직한 짐승. 요괴를 끌어모아 붙잡고 땅을 울린다.',
  sk:{a:[{lv:1,n:'앞발치기',d:'곁에 다가온 요괴를 앞발로 쳐서 날려 버린다.'},{lv:5,n:'곰발 내려치기',d:'더 넓게, 더 세게 내려친다.'}],
      h:[{lv:2,n:'움켜쥐기',d:'둘레의 요괴를 끌어당겨 2초 붙잡는다.'},{lv:6,n:'곰의 품',d:'더 넓게 끌어당겨 3초 붙잡는다.'}],
      u:[{lv:4,n:'산 무너뜨리기',d:'땅을 세 번 내리쳐 큰 진동을 일으킨다.'},{lv:8,n:'반달곰 대지진',d:'네 번 내리치고, 5초 동안 내가 받는 피해를 30% 줄인다.'}]}},
 falcon:{n:'해동청',kind:'매',col:'#8a8494',d:'하늘을 도는 사냥매. 멀리 있는 요괴를 내리꽂아 잡고 바람으로 묶는다.',
  sk:{a:[{lv:1,n:'급강하',d:'요괴 하나에게 내리꽂힌다.'},{lv:5,n:'세 번 급강하',d:'요괴 셋에게 차례로 내리꽂힌다.'}],
      h:[{lv:2,n:'날개 회오리',d:'요괴 무리 위에 회오리를 일으켜 3초 붙잡는다.'},{lv:6,n:'해동청 회오리',d:'더 큰 회오리로 4초 붙잡는다.'}],
      u:[{lv:4,n:'해동청 폭풍',d:'화면 곳곳에 여덟 번 내리꽂힌다.'},{lv:8,n:'천리 해동청',d:'열네 번 내리꽂힌다.'}]}}};
const PET_CD={a:3,h:10,u:20};
const ELITE_BASE={hp:90,spd:22,dmg:14,r:9,xp:40,sc:1.6};

/* ======================= stages ======================= */
const STAGES=[
 {sub:'제1막',name:'한양 저잣거리',gr:['#3a2e26','#42352b','#2c231e','#54443a'],ob:'jang',early:['gwihwa','dokkaebi'],late:['kkeomeok'],elite:'geolgwi',mid:'yagwang',boss:'dokchief'},
 {sub:'제2막',name:'대숲 오솔길',gr:['#1c2a21','#213228','#16221b','#2c4234'],ob:'bamboo',early:['dungap','baekyeou'],late:['gwihwa'],elite:'samjokgu',mid:'jangsan',boss:'gumiho'},
 {sub:'제3막',name:'범 나오는 고개',gr:['#2e2a22','#36302a','#24201a','#4a4236'],ob:'rock',early:['sikingyeon','changgwi'],late:['sammokgu'],elite:'heukho',mid:'geumdwaeji',boss:'gangcheol'},
 {sub:'제4막',name:'안개 낀 나루',gr:['#1e2a30','#24323a','#182228','#3a5060'],ob:'reed',early:['ieoin','geumhyeol'],late:['ineo'],elite:'tanju',mid:'geodaeha',boss:'imugi'},
 {sub:'제5막',name:'폐허가 된 산사',gr:['#2a2a33','#31313b','#23232b','#3d3d48'],ob:'lantern',paved:1,early:['songaksi','dalgyal'],late:['mongdal'],elite:'palcheok',mid:'yeommae',boss:'eoduk'},
 {sub:'제6막',name:'역병 도는 마을',gr:['#2e2a1c','#363022','#241f16','#4a4230'],ob:'jangseung',early:['hwangchung','sikinchung'],late:['golsaeng'],elite:'sadu',mid:'yeoksin',boss:'bulgasari'},
 {sub:'제7막',name:'백두산 골짜기',gr:['#6a7488','#747e92','#5e687c','#9aa4b8'],ob:'pine',early:['jomagu','baekduyacha'],late:['geumgang'],elite:'daein',mid:'baekdusan',boss:'jiha'},
 {sub:'제8막',name:'동해 바닷가',gr:['#2a2a24','#34342c','#22221c','#4a6a7a'],ob:'reef',early:['inmyeonjo','haejungjo'],late:['mamyeongjo'],elite:'cheongu',mid:'bulgae',boss:'samdu'},
 {sub:'제9막',name:'저승길',gr:['#1a1420','#221a28','#140f18','#3a2a48'],ob:'stele',early:['honjwi','gwigok'],late:['jibak'],elite:'taejagwi',mid:'jigwi',boss:'saja'},
 {sub:'제10막',name:'근정전 앞뜰',gr:['#34262a','#3b2c30','#2a1e22','#4a383c'],ob:'pumgye',paved:1,early:['geuseunsae','dudu'],late:['mongdal','changgwi','jibak'],elite:'yeongno',mid:'jangjamari',boss:'geuseunde'},
];
const STAGE_T=120, MID_T=60;
const BOSS_HP=[700,2000,5000,8000,11500,16000,21500,28000,36000,47000];

/* ======================= classes: 2 branches × 5 tiers ======================= */
const lk=(hat,A,o={})=>Object.assign({hat,A},o);
const CHARS={
 seonbi:{name:'선비',seal:'士',start:'meok',trait:'재사용 대기시간 −10%',desc:'글 한 줄에 기를 싣는 유생. 가장 가까운 요괴에게 먹탄을 날린다.',
   base:B=>{B.cd=0.9;B.maxHp=90;},look:lk('gat','#efe6d2',{T:'#efe6d2',item:'brush'}),
   branches:[
    {name:'학문의 길',tiers:[
     {name:'진사',skill:'cheonja',bonus:'투사체 +1',apply:B=>{B.amount+=1},look:lk('gat','#dfe6f0',{T:'#efe6d2',item:'book'})},
     {name:'홍문관 교리',skill:'mukhyang',bonus:'재사용 대기 −6%',apply:B=>{B.cd*=0.94},look:lk('samo','#3a5f9e',{T:'#e0b048',item:'book'})},
     {name:'대제학',skill:'hunmin',bonus:'공격력 +15%',apply:B=>{B.might+=0.15},look:lk('samo','#c23b2a',{T:'#e0b048',L:'#e0b048',item:'brush'})},
     {name:'영의정',skill:'gyeongguk',bonus:'범위 +15%',apply:B=>{B.area+=0.15},look:lk('samo','#7a2018',{T:'#e0b048',L:'#e0b048',C:'#e0b048',item:'book'})},
     {name:'성현',skill:'ilpil',bonus:'공격력 +20% · 재사용 −8%',apply:B=>{B.might+=0.2;B.cd*=0.92},look:lk('jeongja','#efe6d2',{T:'#e0b048',L:'#3a5f9e',item:'brush',aura:'#ffe3a0'})}]},
    {name:'감찰의 길',tiers:[
     {name:'암행어사',skill:'mapae',bonus:'이동 속도 +15%',apply:B=>{B.spd+=0.15},look:lk('gat','#a89c8a',{H:'#4a3a30',T:'#a89c8a',item:'mapae'})},
     {name:'감찰 어사',skill:'yeokjol',bonus:'최대 체력 +30',apply:B=>{B.maxHp+=30},look:lk('gat','#5a6a7a',{T:'#efe6d2',item:'mapae'})},
     {name:'판의금부사',skill:'orat',bonus:'치명타 +8%',apply:B=>{B.crit+=0.08},look:lk('samo','#2a2a3a',{T:'#c23b2a',item:'staff'})},
     {name:'대사헌',skill:'tanhaek',bonus:'공격력 +15%',apply:B=>{B.might+=0.15},look:lk('samo','#3a1a2a',{T:'#e0b048',C:'#c23b2a',item:'staff'})},
     {name:'도체찰사',skill:'eomyeong',bonus:'치명 피해 +30%',apply:B=>{B.critDmg+=0.3},look:lk('jeonrip','#1a2b4a',{h:'#e0b048',T:'#e0b048',C:'#c23b2a',item:'sword',aura:'#ff8a6a'})}]}]},
 uiwon:{name:'의원',seal:'醫',start:'chim',trait:'초당 회복 0.4 · 최대 체력 +10',desc:'침과 약으로 사람을 살리는 의원. 가는 방향으로 은침을 부채꼴로 던진다.',
   base:B=>{B.regen=0.4;B.maxHp=110;},look:lk('tang','#3a5f9e',{T:'#efe6d2',L:'#b0702e',item:'bag'}),
   branches:[
    {name:'내의원의 길',tiers:[
     {name:'의관',skill:'gugeup',bonus:'최대 체력 +30',apply:B=>{B.maxHp+=30},look:lk('tang','#4f8fbf',{T:'#efe6d2',L:'#b0702e',item:'bag'})},
     {name:'내의',skill:'tteum',bonus:'회복량 +25%',apply:B=>{B.healM+=0.25},look:lk('tang','#2f7d6b',{T:'#efe6d2',item:'bag'})},
     {name:'어의',skill:'bogam',bonus:'최대 체력 +50 · 방어 +1',apply:B=>{B.maxHp+=50;B.armor+=1},look:lk('samo','#3a5f9e',{T:'#e0b048',item:'book'})},
     {name:'혜민서 제조',skill:'yakcho',bonus:'초당 회복 +1',apply:B=>{B.regen+=1},look:lk('samo','#2f6b5a',{T:'#e0b048',C:'#efe6d2',item:'staff'})},
     {name:'의성',skill:'hoesaeng',bonus:'최대 체력 +80',apply:B=>{B.maxHp+=80},look:lk('jeongja','#efe6d2',{T:'#3f9a7a',L:'#3f9a7a',item:'book',aura:'#9af0b0'})}]},
    {name:'독술의 길',tiers:[
     {name:'독의',skill:'bisang',bonus:'공격력 +15%',apply:B=>{B.might+=0.15},look:lk('hood','#5a4a6a',{H:'#4a3a30',item:'gourd'})},
     {name:'비방 의원',skill:'dokchim',bonus:'범위 +10%',apply:B=>{B.area+=0.1},look:lk('hood','#4a2a5a',{H:'#2a2228',T:'#b07fd0',item:'gourd'})},
     {name:'독선',skill:'mandok',bonus:'공격력 +20%',apply:B=>{B.might+=0.2},look:lk('gokkal','#3a1a4a',{H:'#b07fd0',T:'#b07fd0',item:'gourd'})},
     {name:'고독술사',skill:'godok',bonus:'투사체 +1',apply:B=>{B.amount+=1},look:lk('hood','#2a1a2a',{H:'#1a1418',T:'#7fe07f',C:'#b07fd0',item:'gourd'})},
     {name:'독왕',skill:'cheondok',bonus:'공격력 +25%',apply:B=>{B.might+=0.25},look:lk('crown','#3a1a4a',{H:'#b07fd0',h:'#7fe07f',T:'#7fe07f',C:'#1a1418',item:'gourd',aura:'#c080ff'})}]}]},
 mudang:{name:'무당',seal:'巫',start:'bujeok',trait:'레벨업 선택지 4개 · 범위 +10%',desc:'신을 모시는 무당. 몸 주위로 부적이 돌며 요괴를 쫓는다.',
   base:B=>{B.area=1.1;B.luck=1;},look:lk('flower','#c23b2a',{H:'#c23b2a',h:'#e0b048',T:'#efe6d2',L:'#3a5f9e',item:'bell'}),
   branches:[
    {name:'굿의 길',tiers:[
     {name:'큰무당',skill:'gut',bonus:'투사체 +1',apply:B=>{B.amount+=1},look:lk('flower','#d04030',{H:'#d04030',h:'#e0b048',T:'#e0b048',L:'#3a5f9e',item:'fan'})},
     {name:'당골',skill:'jakduchum',bonus:'범위 +10%',apply:B=>{B.area+=0.1},look:lk('flower','#3a5f9e',{H:'#3a5f9e',h:'#e0b048',T:'#c23b2a',L:'#c23b2a',item:'sword'})},
     {name:'나라무당',skill:'daedong',bonus:'재사용 대기 −8%',apply:B=>{B.cd*=0.92},look:lk('flower','#e0b048',{H:'#e0b048',h:'#c23b2a',T:'#c23b2a',L:'#c23b2a',C:'#c23b2a',item:'fan'})},
     {name:'신어머니',skill:'jinogwi',bonus:'지속시간 +15%',apply:B=>{B.dur+=0.15},look:lk('gokkal','#efe6d2',{H:'#efe6d2',T:'#c23b2a',L:'#3a5f9e',C:'#3a5f9e',item:'bell'})},
     {name:'무조',skill:'gil',bonus:'공격력 +20% · 범위 +10%',apply:B=>{B.might+=0.2;B.area+=0.1},look:lk('gokkal','#efe6d2',{H:'#efe6d2',T:'#e0b048',L:'#e0b048',item:'cloth',aura:'#fff6d0'})}]},
    {name:'신내림의 길',tiers:[
     {name:'만신',skill:'byeorak',bonus:'범위 +15%',apply:B=>{B.area+=0.15},look:lk('flower','#3a6fd0',{H:'#c23b2a',h:'#e0b048',T:'#e0b048',item:'bell'})},
     {name:'신장 만신',skill:'obang',bonus:'지속시간 +15%',apply:B=>{B.dur+=0.15},look:lk('jeonrip','#d04030',{H:'#c23b2a',h:'#e0b048',T:'#e0b048',item:'flag'})},
     {name:'천왕 만신',skill:'chilseong',bonus:'공격력 +15%',apply:B=>{B.might+=0.15},look:lk('crown','#1a2b4a',{H:'#e0b048',h:'#c23b2a',T:'#e0b048',item:'fan'})},
     {name:'일월성신 만신',skill:'ilwol',bonus:'치명타 +8%',apply:B=>{B.crit+=0.08},look:lk('crown','#c23b2a',{H:'#e0b048',h:'#efe6d2',T:'#efe6d2',C:'#1a2b4a',item:'bell'})},
     {name:'하늘 만신',skill:'noegong',bonus:'공격력 +20% · 범위 +10%',apply:B=>{B.might+=0.2;B.area+=0.1},look:lk('crown','#efe6d2',{H:'#efe6d2',h:'#e0b048',T:'#8fd3ff',C:'#3a6fd0',item:'bell',aura:'#a0d8ff'})}]}]},
 jangsu:{name:'장수',seal:'將',start:'hwando',trait:'최대 체력 +30 · 방어 +1',desc:'변방을 지킨 무관. 바라보는 쪽을 환도로 크게 벤다.',
   base:B=>{B.maxHp=130;B.armor=1;B.spd=0.95;},look:lk('helm','#7a2018',{H:'#8a8494',h:'#c23b2a',T:'#e0b048',L:'#4a3a30',item:'sword'}),
   branches:[
    {name:'지휘의 길',tiers:[
     {name:'만호',skill:'hakik',bonus:'방어 +2 · 최대 체력 +30',apply:B=>{B.armor+=2;B.maxHp+=30},look:lk('helm','#7a2018',{H:'#8a8494',h:'#e0b048',T:'#e0b048',item:'sword'})},
     {name:'병마절도사',skill:'chongtong',bonus:'공격력 +10%',apply:B=>{B.might+=0.1},look:lk('jeonrip','#3a5f9e',{h:'#c23b2a',T:'#e0b048',L:'#4a3a30',item:'sword'})},
     {name:'도원수',skill:'geobuk',bonus:'최대 체력 +50',apply:B=>{B.maxHp+=50},look:lk('helm','#c23b2a',{H:'#e0b048',h:'#c23b2a',T:'#e0b048',C:'#1a2b4a',item:'sword'})},
     {name:'삼도수군통제사',skill:'sugun',bonus:'방어 +2',apply:B=>{B.armor+=2},look:lk('jeonrip','#1a2b4a',{h:'#e0b048',T:'#e0b048',C:'#c23b2a',item:'flag'})},
     {name:'대원수',skill:'jindong',bonus:'공격력 +20% · 최대 체력 +60',apply:B=>{B.might+=0.2;B.maxHp+=60},look:lk('helm','#e0b048',{H:'#e0b048',h:'#c23b2a',T:'#c23b2a',C:'#c23b2a',item:'spear',aura:'#ff8a6a'})}]},
    {name:'궁술의 길',tiers:[
     {name:'사수',skill:'mangung',bonus:'재사용 대기 −10%',apply:B=>{B.cd*=0.9},look:lk('jeonrip','#4a3a30',{h:'#c23b2a',T:'#b0702e',item:'bow'})},
     {name:'신궁',skill:'hwasalbi',bonus:'투사체 +1',apply:B=>{B.amount+=1},look:lk('jeonrip','#2f6b5a',{h:'#e0b048',T:'#e0b048',item:'bow'})},
     {name:'천궁',skill:'ilsi',bonus:'치명타 +10%',apply:B=>{B.crit+=0.1},look:lk('helm','#2c4a7a',{H:'#8a8494',h:'#e0b048',T:'#e0b048',C:'#b0702e',item:'bow'})},
     {name:'어영대장',skill:'pyeonjeon',bonus:'재사용 대기 −8%',apply:B=>{B.cd*=0.92},look:lk('helm','#1d4d42',{H:'#e0b048',h:'#c23b2a',T:'#e0b048',C:'#c23b2a',item:'bow'})},
     {name:'궁성',skill:'yuseong',bonus:'치명 피해 +40%',apply:B=>{B.critDmg+=0.4},look:lk('helm','#efe6d2',{H:'#e0b048',h:'#efe6d2',T:'#e0b048',C:'#2f7d6b',item:'bow',aura:'#ffe3a0'})}]}]},
};
CHARS.gisaeng={name:'기생',seal:'妓',start:'gayageum',trait:'이동 속도 +10% · 경험치 +10%',desc:'가무와 시로 이름난 예인. 가야금 가락이 물결치며 요괴를 꿰뚫는다.',
   base:B=>{B.maxHp=95;B.spd+=0.1;B.xpGain+=0.1;},look:lk('gache','#d86a8a',{h:'#e0b048',T:'#efe6d2',L:'#c23b2a',item:'gayageum'}),
   branches:[
    {name:'풍류의 길',tiers:[
     {name:'관기',skill:'sori',bonus:'투사체 +1',apply:B=>{B.amount+=1},look:lk('gache','#c86a9a',{h:'#e0b048',T:'#efe6d2',L:'#c23b2a',item:'gayageum'})},
     {name:'행수기생',skill:'saranga',bonus:'범위 +10%',apply:B=>{B.area+=0.1},look:lk('gache','#9a3a6a',{h:'#e0b048',T:'#efe6d2',L:'#e0b048',C:'#efe6d2',item:'fan'})},
     {name:'명기',skill:'jinyang',bonus:'재사용 대기 −8%',apply:B=>{B.cd*=0.92},look:lk('hwagwan','#7a2a5a',{H:'#1a1418',h:'#e0b048',T:'#e0b048',L:'#e0b048',item:'gayageum'})},
     {name:'대명창',skill:'pansori',bonus:'공격력 +15%',apply:B=>{B.might+=0.15},look:lk('hwagwan','#3a5f9e',{H:'#1a1418',h:'#e0b048',T:'#e0b048',C:'#d86a8a',item:'fan'})},
     {name:'국창',skill:'deugeum',bonus:'공격력 +20% · 최대 체력 +50',apply:B=>{B.might+=0.2;B.maxHp+=50},look:lk('jokduri','#efe6d2',{H:'#1a1418',h:'#e0b048',T:'#e0b048',L:'#c23b2a',item:'gayageum',aura:'#ffb0d0'})}]},
    {name:'검무의 길',tiers:[
     {name:'검무기',skill:'ssanggeom',bonus:'치명타 +6%',apply:B=>{B.crit+=0.06},look:lk('jeonrip','#3a5f9e',{h:'#c23b2a',T:'#c23b2a',L:'#c23b2a',item:'sword'})},
     {name:'협기',skill:'kkotbi',bonus:'이동 속도 +10%',apply:B=>{B.spd+=0.1},look:lk('jeonrip','#2f6b5a',{h:'#c23b2a',T:'#e0b048',C:'#c23b2a',item:'sword'})},
     {name:'의기',skill:'kalbaram',bonus:'공격력 +15%',apply:B=>{B.might+=0.15},look:lk('jeonrip','#c23b2a',{h:'#e0b048',T:'#e0b048',L:'#1a1418',item:'sword'})},
     {name:'검무 대가',skill:'geomgi',bonus:'치명 피해 +30%',apply:B=>{B.critDmg+=0.3},look:lk('jeonrip','#1a2b4a',{h:'#e0b048',T:'#e0b048',C:'#c23b2a',item:'sword'})},
     {name:'검선',skill:'geomseon',bonus:'공격력 +20% · 치명타 +8%',apply:B=>{B.might+=0.2;B.crit+=0.08},look:lk('hwagwan','#efe6d2',{H:'#efe6d2',h:'#d86a8a',T:'#d86a8a',L:'#e0b048',item:'sword',aura:'#ffb0d0'})}]}]};
CHARS.sangin={name:'상인',seal:'商',start:'jupan',trait:'엽전 +30% · 줍는 범위 +20%',desc:'저잣거리에서 잔뼈가 굵은 장사꾼. 주판알을 튕겨 요괴를 맞히고, 셈이 빠른 만큼 엽전도 잘 모은다.',
   base:B=>{B.maxHp=95;B.magnet+=0.2;},look:lk('tang','#7a6a4a',{T:'#e0b048',L:'#4a3a30',item:'abacus'}),
   branches:[
    {name:'시전의 길',tiers:[
     {name:'상인',skill:'heungjeong',bonus:'치명타 +6%',apply:B=>{B.crit+=0.06},look:lk('tang','#5a4a3a',{T:'#e0b048',item:'abacus'})},
     {name:'행수',skill:'geumnan',bonus:'범위 +10%',apply:B=>{B.area+=0.1},look:lk('gat','#3a5f9e',{T:'#e0b048',item:'abacus'})},
     {name:'대행수',skill:'gaekju',bonus:'최대 체력 +40',apply:B=>{B.maxHp+=40},look:lk('gat','#2f6b5a',{T:'#e0b048',C:'#efe6d2',item:'pouch'})},
     {name:'도방',skill:'eoeum',bonus:'공격력 +15%',apply:B=>{B.might+=0.15},look:lk('gat','#7a2018',{T:'#e0b048',L:'#e0b048',item:'pouch'})},
     {name:'대방',skill:'mangeum',bonus:'공격력 +20% · 최대 체력 +50',apply:B=>{B.might+=0.2;B.maxHp+=50},look:lk('gat','#1a2b4a',{h:'#e0b048',T:'#e0b048',L:'#e0b048',C:'#e0b048',item:'abacus',aura:'#ffe080'})}]},
    {name:'보부상의 길',tiers:[
     {name:'보상',skill:'bottari',bonus:'이동 속도 +10%',apply:B=>{B.spd+=0.1},look:lk('paraengi','#9a8a6a',{h:'#efe6d2',T:'#4a3a30',item:'jige'})},
     {name:'접장',skill:'mulmi',bonus:'방어 +1',apply:B=>{B.armor+=1},look:lk('paraengi','#7a6a4a',{h:'#efe6d2',T:'#c23b2a',item:'mulmi'})},
     {name:'공원',skill:'tongmun',bonus:'공격력 +10%',apply:B=>{B.might+=0.1},look:lk('paraengi','#5a4a3a',{h:'#efe6d2',T:'#e0b048',item:'mulmi'})},
     {name:'반수',skill:'jangdol',bonus:'재사용 대기 −8%',apply:B=>{B.cd*=0.92},look:lk('paraengi','#3a5f9e',{h:'#efe6d2',T:'#e0b048',item:'jige'})},
     {name:'도반수',skill:'paldo',bonus:'공격력 +20% · 최대 체력 +50',apply:B=>{B.might+=0.2;B.maxHp+=50},look:lk('paraengi','#2a2228',{h:'#efe6d2',T:'#e0b048',L:'#e0b048',item:'mulmi',aura:'#ffe080'})}]}]};
const TIER_BONUS=[
 {n:'공격력 +10%',f:B=>{B.might+=0.1}},{n:'최대 체력 +40',f:B=>{B.maxHp+=40}},{n:'재사용 대기 −6%',f:B=>{B.cd*=0.94}},
 {n:'이동 속도 +10%',f:B=>{B.spd+=0.1}},{n:'범위 +10%',f:B=>{B.area+=0.1}},{n:'치명타 +6%',f:B=>{B.crit+=0.06}},
 {n:'방어 +2',f:B=>{B.armor+=2}},{n:'초당 회복 +0.6',f:B=>{B.regen+=0.6}},{n:'경험치 +15%',f:B=>{B.xpGain+=0.15}}];
const TIER_NAME=['','1차','2차','3차','4차','5차'];

/* ======================= passives ======================= */
const PD={
 insam:{name:'인삼',max:5,desc:'최대 체력 +20'},
 jipsin:{name:'짚신',max:5,desc:'이동 속도 +8%'},
 gat:{name:'넓은 갓',max:5,desc:'공격 범위 +10%'},
 yundo:{name:'윤도',max:5,desc:'아이템 끌어오는 거리 +30%'},
 seochaek:{name:'서책',max:5,desc:'재사용 대기시간 −8%'},
 gapot:{name:'두석린갑',max:5,desc:'방어 +1'},
 hwayak:{name:'화약',max:5,desc:'공격력 +10%'},
 horibyeong:{name:'호리병',max:5,desc:'지속시간 +12% · 초당 회복 +0.1'},
 yeonjeok:{name:'청자 연적',max:5,job:'seonbi',desc:'투사체 속도 +10% · 지속시간 +6%'},
 hongpae:{name:'홍패',max:5,job:'seonbi',desc:'경험치 +8%'},
 nakgwan:{name:'낙관',max:5,job:'seonbi',desc:'치명타 확률 +5%'},
 gamcho:{name:'감초',max:5,job:'uiwon',desc:'모든 회복량 +20% · 초당 회복 +0.15'},
 nogyong:{name:'녹용',max:5,job:'uiwon',desc:'최대 체력 +12 · 피격 후 무적 +0.06초'},
 sahyang:{name:'사향',max:5,job:'uiwon',desc:'치명타 피해 +15%'},
 myeongtae:{name:'명태',max:5,job:'mudang',also:['sangin'],desc:'엽전·떡·복주머니가 더 자주 나온다 (+25%)'},
 osaek:{name:'오색천',max:5,job:'mudang',desc:'범위 +6% · 지속시간 +6%'},
 jeonghwasu:{name:'정화수',max:5,job:'mudang',desc:'초당 회복 +0.25 · 경험치 +4%'},
 tugu:{name:'투구',max:5,job:'jangsu',desc:'방어 +1 · 최대 체력 +5'},
 gunryeong:{name:'군령기',max:5,job:'jangsu',desc:'공격력 +6% · 재사용 대기 −3%'},
 jeonma:{name:'전마',max:5,job:'jangsu',desc:'이동 속도 +7% · 끌어오는 거리 +10%'},
 norigae:{name:'노리개',max:5,job:'gisaeng',desc:'치명타 +4% · 이동 속도 +4%'},
 binyeo:{name:'비녀',max:5,job:'gisaeng',desc:'투사체 속도 +8% · 재사용 대기 −4%'},
 hwagwan:{name:'화관',max:5,job:'gisaeng',desc:'범위 +8% · 경험치 +5%'},
 jangbu:{name:'치부책',max:5,job:'sangin',desc:'경험치 +6% · 치명타 +3%'},
 jeondae:{name:'전대',max:5,job:'sangin',desc:'줍는 범위 +20% · 엽전 +20%'},
 jeoul:{name:'저울',max:5,job:'sangin',desc:'치명 피해 +12% · 공격력 +4%'},
};

/* ======================= shrine gods (도감 「신」 갈래 + 민간 신앙) ======================= */
const BLESS={
 sansin:{n:'산신',g:'山',col:'#2f6b5a',d:'최대 체력 +25 · 초당 회복 +0.3'},
 seonghwang:{n:'성황신',g:'城',col:'#7a2018',d:'범위 +10% · 지속시간 +10%'},
 eopsin:{n:'업신',g:'業',col:'#9a6a10',d:'엽전을 주울 때마다 1닢 더'},
 samsin:{n:'삼신',g:'産',col:'#c23b2a',d:'경험치 +12% · 떡 회복 +50%'},
 yong:{n:'용',g:'龍',col:'#2c4a7a',d:'공격이 요괴를 얼릴 확률 +6%'},
 baekho:{n:'백호',g:'虎',col:'#8a8494',d:'공격력 +12%'},
 cheongryong:{n:'청룡',g:'靑',col:'#1d4d42',d:'재사용 대기 −7%'},
 jujak:{n:'주작',g:'朱',col:'#d04030',d:'공격이 화상을 입힐 확률 +8%'},
 hyeonmu:{n:'현무',g:'玄',col:'#1a1418',d:'일정 시간마다 피해 한 번을 막는 등껍질 (12초, 단계마다 3초 단축)'},
 jowang:{n:'조왕신',g:'竈',col:'#b0702e',d:'떡·엽전·복주머니 드롭 +30%'},
 chilseong:{n:'칠성신',g:'七',col:'#3a5f9e',d:'치명타 +6% · 치명 피해 +15%'},
 seongju:{n:'성주신',g:'主',col:'#4a3a30',d:'방어 +1 · 받는 피해 −8%'},
};

/* ======================= fortune cards & curse levels ======================= */
const CARDS={
 gilil:{n:'길일',d:'경험치 +20%. 요괴가 15% 더 많이 나온다.'},
 hyungnyeon:{n:'흉년',d:'떡이 나오지 않는다. 엽전을 두 배로 얻는다.'},
 yeokma:{n:'역마살',d:'이동 속도 +25%. 최대 체력 −20%.'},
 dohwa:{n:'도화살',d:'끌어오는 거리 두 배. 요괴 이동 속도 +10%.'},
 hongsu:{n:'홍수',d:'범위 +25%. 투사체 속도 −20%.'},
 baekhosal:{n:'백호살',d:'치명타 +15%. 받는 피해 +20%.'},
 samjae:{n:'삼재',d:'엘리트가 두 배로 나온다. 보물상자에서 강화를 하나 더 얻는다.'},
 cheoneul:{n:'천을귀인',d:'쓰러져도 한 번 되살아난다. 공격력 −10%.'},
 jangwon:{n:'장원급제',d:'레벨업 선택지 +1. 요괴 체력 +15%.'},
 munchang:{n:'문창성',d:'전직 기술이 25% 더 자주 발동한다. 최대 체력 −10%.'},
 cheonsal:{n:'천살',d:'요괴 체력 +30%. 경험치 +40%.'},
};
const DIFFS={
 easy:{n:'쉬움',coin:0.7,d:'요괴 체력 −30%, 받는 피해 −30%. 보스는 정해진 순서대로 기술을 쓰고 기술 사이 쉬는 틈이 길다. 중간 보스가 있는 동안 엘리트가 나오지 않는다. 전우치가 더 자주 온다. 출정 뒤 엽전 −30%.'},
 normal:{n:'보통',coin:1,d:'보스는 자기 기술 가운데 무작위로 골라 쓴다. 중간 보스가 있는 동안 엘리트가 나오지 않는다.'},
 hard:{n:'어려움',coin:1.3,d:'요괴 체력 +35%, 받는 피해 +25%. 보스마다 다른 보스의 기술 두 가지를 무작위로 빌려 와 섞어 쓰고, 기술 사이 틈이 짧다. 중간 보스도 필살기를 쓰며 엘리트를 거느리고 나온다. 전우치가 드물게 온다. 출정 뒤 엽전 +30%.'}};
const CURSES=['','요괴 체력 +25%','요괴 이동 속도 +10%','엘리트가 두 배로 나온다','보스 체력 +35%','떡 회복량이 절반','요괴가 25% 더 많이 나온다','요괴 탄 속도·피해 +20%','중간 보스도 필살기를 쓴다','시작 최대 체력 −20%','막 보스가 필살기를 한 번 더 쓴다'];

/* ======================= tasks (과업) ======================= */
const T=(id,n,d,key,need,rw,rwText)=>({id,n,d,key,need,rw,rwText});
const TASKS=[
 T('k100','첫 퇴마','요괴 100마리 퇴치','kills',100,{coins:20},'엽전 20'),
 T('k1000','손에 익은 퇴마','요괴 1,000마리 퇴치','kills',1000,{unlock:'char:uiwon'},'의원 해금'),
 T('k5000','이름난 퇴마사','요괴 5,000마리 퇴치','kills',5000,{rr:1},'산통 흔들기 +1'),
 T('k20000','요괴의 천적','요괴 20,000마리 퇴치','kills',20000,{unlock:'card:cheonsal'},'점괘 패 · 천살'),
 T('s2','첫 고개를 넘다','제2막 도달','maxStage',2,{unlock:'card:yeokma'},'점괘 패 · 역마살'),
 T('c_jangsu','장수의 부름','중간 보스 3마리 퇴치','mids',3,{unlock:'char:jangsu'},'장수 해금'),
 T('c_gisaeng','풍류의 밤','성황당에서 3번 기도','shrines',3,{unlock:'char:gisaeng'},'기생 해금'),
 T('c_sangin','셈이 빠른 퇴마사','주막에서 엽전 200닢 쓰기','tavern',200,{unlock:'char:sangin'},'상인 해금'),
 T('s3','길이 열리다','제3막 도달','maxStage',3,{unlock:'char:mudang'},'무당 해금'),
 T('s5','절반의 밤','제5막 도달','maxStage',5,{unlock:'card:baekhosal'},'점괘 패 · 백호살'),
 T('s8','먼 바닷가','제8막 도달','maxStage',8,{coins:200},'엽전 200'),
 T('clear','새벽을 맞다','제10막 그슨대 퇴치','clears',1,{unlock:'card:cheoneul'},'점괘 패 · 천을귀인, 액운 1'),
 T('b_dok','도깨비 방망이','대장 도깨비 퇴치','boss_dokchief',1,{coins:30},'엽전 30'),
 T('b_fox','여우 사냥','구미호 퇴치','boss_gumiho',1,{unlock:'card:dohwa'},'점괘 패 · 도화살'),
 T('b_imugi','승천을 막다','이무기 퇴치','boss_imugi',1,{sk:1},'물리기 +1'),
 T('b_saja','명부를 찢다','저승사자 퇴치','boss_saja',1,{bn:1},'봉인 +1'),
 T('b_bul','쇠를 먹는 괴물','불가사리 퇴치','boss_bulgasari',1,{unlock:'card:hongsu'},'점괘 패 · 홍수'),
 T('elite10','엘리트 사냥꾼','엘리트 10마리 퇴치','elites',10,{unlock:'w:singijeon'},'신기전 해금'),
 T('mid10','중간 보스 사냥','중간 보스 10마리 퇴치','mids',10,{coins:120},'엽전 120'),
 T('tteok20','떡 좋아하는 퇴마사','떡 20개 먹기','tteok',20,{unlock:'w:yaktang'},'약탕 해금'),
 T('pot30','옹기 깨기','옹기 30개 깨기','pots',30,{coins:40},'엽전 40'),
 T('shrine5','기도하는 손','성황당에서 5번 기도','shrines',5,{unlock:'card:samjae'},'점괘 패 · 삼재'),
 T('shrine20','신령의 벗','성황당에서 20번 기도','shrines',20,{rr:1},'산통 흔들기 +1'),
 T('tav100','주막 단골','주막에서 엽전 100닢 쓰기','tavern',100,{unlock:'card:jangwon'},'점괘 패 · 장원급제'),
 T('evo1','첫 진화','무기 하나를 진화','evo',1,{coins:50},'엽전 50'),
 T('evo6','진화의 대가','서로 다른 무기 6종 진화','evo',6,{bn:1},'봉인 +1'),
 T('lv30','깊어진 수련','한 출정에서 레벨 30 도달','maxLevel',30,{sk:1},'물리기 +1'),
 T('t_seonbi','선비 1차 전직','선비로 1차 전직','tier_seonbi',1,{unlock:'w:seochal'},'서찰 해금'),
 T('t_uiwon','의원 1차 전직','의원으로 1차 전직','tier_uiwon',1,{unlock:'w:hwanyak'},'환약 해금'),
 T('t_mudang','무당 1차 전직','무당으로 1차 전직','tier_mudang',1,{unlock:'w:myeongdu'},'명두 해금'),
 T('t_jangsu','장수 1차 전직','장수로 1차 전직','tier_jangsu',1,{unlock:'w:jincheon'},'비격진천뢰 해금'),
 T('t5_seonbi','성현이 되다','선비로 5차 전직','tier_seonbi',5,{coins:150},'엽전 150'),
 T('t5_uiwon','의성이 되다','의원으로 5차 전직','tier_uiwon',5,{coins:150},'엽전 150'),
 T('t5_mudang','무조가 되다','무당으로 5차 전직','tier_mudang',5,{unlock:'card:munchang'},'점괘 패 · 문창성'),
 T('t_gisaeng','기생 1차 전직','기생으로 1차 전직','tier_gisaeng',1,{unlock:'w:janggu'},'장구 해금'),
 T('t_sangin','상인 1차 전직','상인으로 1차 전직','tier_sangin',1,{unlock:'w:jige'},'등짐 지게 해금'),
 T('t5_sangin','대방·도반수가 되다','상인으로 5차 전직','tier_sangin',5,{coins:150},'엽전 150'),
 T('t5_gisaeng','국창·검선이 되다','기생으로 5차 전직','tier_gisaeng',5,{coins:150},'엽전 150'),
 T('pet10','짐승과 한 몸','펫 레벨 10 달성','petLv',10,{coins:120},'엽전 120'),
 T('t5_jangsu','대원수가 되다','장수로 5차 전직','tier_jangsu',5,{coins:150},'엽전 150'),
 T('dogam30','요괴 도감 절반','요괴 30종 만나기','codex',30,{coins:100},'엽전 100'),
 T('dogam58','요괴 도감 완성','요괴 58종 모두 만나기','codex',58,{coins:300},'엽전 300'),
 T('curse5','액운을 이기다','액운 5에서 제10막 완주','curseClear',5,{coins:500},'엽전 500'),
 T('awk1','첫 깨달음','오의 각성 1번','awkTot',1,{coins:60},'엽전 60'),
 T('ult1','궁극에 이르다','궁극 오의 깨치기','ult',1,{coins:150},'엽전 150'),
 T('duo1','두 신의 가호','쌍신 축복 받기','duo',1,{coins:80},'엽전 80'),
 T('call30','신이 내리다','신내림 30번 쓰기','calls',30,{rr:1},'산통 흔들기 +1'),
 T('fuse1','두 무기가 하나로','합공 1번','fuse',1,{coins:100},'엽전 100'),
 T('seal10','인장 장인','인장 10개 새기기','seals',10,{coins:60},'엽전 60'),
 T('graze100','스치는 바람','요괴 탄 100번 스치기','graze',100,{sk:1},'물리기 +1'),
 T('loop1','끝없는 밤','끝없는 밤으로 들어서기','bestLoop',1,{coins:200},'엽전 200'),
 T('rush1','원정길에 오르다','퇴마 원정 보스 3마리 쓰러뜨리기','rushRounds',3,{coins:80},'엽전 80'),
 T('rush10','열 번의 원정','퇴마 원정 완주','rushClear',1,{coins:300},'엽전 300'),
 T('var100','변종 사냥꾼','변종 요괴 100마리 퇴치','variants',100,{rr:1},'산통 흔들기 +1'),
 T('anom6','괴이 탐문','괴이 6종 조사','anomKinds',6,{coins:120},'엽전 120'),
 T('anom12','괴이록 완성','괴이 12종 모두 조사','anomKinds',12,{bn:1},'봉인 +1'),
 T('temper1','명장의 손','담금질 1번','temper',1,{coins:60},'엽전 60'),
 T('temper10','버릇을 바꾸다','담금질 10번','temper',10,{bn:1},'봉인 +1'),
 T('dk1','도깨비와 거래','도깨비 샛길에 들기','dkIn',1,{coins:60},'엽전 60'),
 T('quest10','의뢰 해결사','막 의뢰 10번 완료','quests',10,{rr:1},'산통 흔들기 +1'),
 T('combo300','끊이지 않는 칼','연격 300 잇기','comboMax',300,{sk:1},'물리기 +1'),
 T('ks3','정 많은 퇴마사','정표 3개 받기','ksN',3,{coins:150},'엽전 150'),
 T('k50000','백귀야행을 끊다','요괴 50,000마리 퇴치','kills',50000,{coins:500},'엽전 500'),
 T('allchar','여섯 퇴마사','퇴마사 여섯 모두 해금','charN',6,{coins:300},'엽전 300'),
 T('runs30','서른 번의 밤','출정 30번','runs',30,{rr:1},'산통 흔들기 +1'),
 T('combo1000','천 번의 칼끝','연격 1,000 잇기','comboMax',1000,{coins:200},'엽전 200'),
 T('loop3','세 바퀴의 밤','끝없는 밤 3바퀴 들어서기','bestLoop',3,{coins:400},'엽전 400'),
 T('quest30','마을의 해결사','막 의뢰 30번 완료','quests',30,{coins:250},'엽전 250'),
 T('graze1000','바람을 걷는 자','요괴 탄 1,000번 스치기','graze',1000,{coins:200},'엽전 200'),
 T('evo12','열두 가지 진화','서로 다른 무기 12종 진화','evo',12,{bn:1},'봉인 +1'),
 T('dk10','도깨비의 단골','도깨비 샛길에 10번 들기','dkIn',10,{coins:200},'엽전 200'),
 T('lv100','백 번의 깨달음','한 출정에서 레벨 100 도달','maxLevel',100,{coins:300},'엽전 300'),
 T('curse10','액막이의 끝','액운 10에서 제10막 완주','curseClear',10,{coins:1000},'엽전 1000'),
 T('t_frag1','이야기의 실마리','설화 흔적을 조사해 설화 조각 얻기','fragN',1,{coins:30},'엽전 30'),
 T('t_tale1','옛이야기 한 편','설화 출정 한 편 끝맺기','taleN',1,{coins:100},'엽전 100'),
 T('t_ending','새벽의 이야기','제10막을 평정하고 본편 결말 보기','ending',1,{coins:100},'엽전 100'),
];
const MAXKEYS=new Set(['maxStage','maxLevel','tier_seonbi','tier_uiwon','tier_mudang','tier_jangsu','tier_gisaeng','tier_sangin','curseClear','petLv','ult','bestLoop','comboMax']);

/* ======================= weapon / skill archetypes ======================= */
function rainGlyph(n,dmg,r,chars,spread){const P=G.P;for(let i=0;i<n;i++){const tg=spread?null:randomEnemy();const x=tg?tg.x:P.x+rnd(-W/2,W/2),y=tg?tg.y:P.y+rnd(-H/2,H/2);G.fx.push({t:'glyph',life:9,x,y,h:80+i*(spread?5:14),ch:chars[Math.random()*chars.length|0],dmg,r,big:spread});}}
function nuke(dmg,frz){for(const e of G.enemies){if(!e.dead&&inView(e)){hurt(e,dmg,0);if(!e.boss&&frz)e.frz=frz;}}}
function pulseRing(x,y,R0,dmg,c,kb=40){aoe(x,y,R0,dmg,kb);G.fx.push({t:'ring',x,y,r:4,maxR:R0,col:c,life:0.35,max:0.35});}
function chainHit(start,jumps,dmg,c,frz){const P=G.P;let cur=start;const pts=[[P.x,P.y-4]],hit=new Set();
 for(let j=0;j<jumps&&cur;j++){hit.add(cur);pts.push([cur.x,cur.y-3]);const cx=cur.x,cy=cur.y;if(frz&&!cur.boss)cur.frz=Math.max(cur.frz,frz);hurt(cur,dmg,0);
  let nx=null,bd=80*80;for(const e of G.enemies){if(e.dead||e.prop||hit.has(e))continue;const d=(e.x-cx)**2+(e.y-cy)**2;if(d<bd){bd=d;nx=e;}}cur=nx;}
 G.fx.push({t:'chain',pts,col:c,life:0.25,max:0.25});}
function summon(w,n,dmg,look,sp=110,extra){let mine=0;for(const s of G.spirits)if(s.own===w.id){mine++;s.dmg=dmg;s.sp=sp;if(extra)Object.assign(s,extra);}
 while(mine<n){G.spirits.push(Object.assign({own:w.id,look,x:G.P.x+rnd(-10,10),y:G.P.y+rnd(-10,10),ph:Math.random()*TAU,id:Math.random(),dmg,sp},extra||{}));mine++;}}
function orbit(w,n,rad,dmg,sp,key,look,hitR=5){const P=G.P;w.pos=[];w.look=look;
 for(let i=0;i<n;i++){const a=G.time*sp+i/n*TAU;const x=P.x+Math.cos(a)*rad,y=P.y+Math.sin(a)*rad;w.pos.push([x,y,a]);
  for(const e of near(x,y,hitR,TMP).slice()){if((e.hc[key]||0)<G.time){e.hc[key]=G.time+0.45;hurt(e,dmg,26,P.x,P.y);}}}}
function sweep(w,n,len,dmg,speed,key,look,wid=4){const P=G.P;w.ang=(w.ang||0)+speed*G.dtNow;w.beams=[];w.look=look;
 for(let i=0;i<n;i++){const a=w.ang+i*TAU/n;w.beams.push([a,len]);const ex=P.x+Math.cos(a)*len,ey=P.y+Math.sin(a)*len;
  for(const e of G.enemies){if(e.dead||e.inv||(e.hc[key]||0)>G.time)continue;if(Math.abs(e.x-P.x)>len+12||Math.abs(e.y-P.y)>len+12)continue;if(segDist(e.x,e.y,P.x,P.y,ex,ey)<wid+e.r){e.hc[key]=G.time+0.3;hurt(e,dmg,6,P.x,P.y);}}}}
function beam(x,y,a,len,wid,dmg,c){const ex=x+Math.cos(a)*len,ey=y+Math.sin(a)*len;
 for(const e of G.enemies.slice()){if(e.dead||e.inv)continue;if(segDist(e.x,e.y,x,y,ex,ey)<wid/2+e.r)hurt(e,dmg,30,x,y);}
 G.fx.push({t:'beam',x,y,a,len,w:wid,col:c,life:0.3,max:0.3});}
function segDist(px,py,x1,y1,x2,y2){const dx=x2-x1,dy=y2-y1,l=dx*dx+dy*dy||1;let t=((px-x1)*dx+(py-y1)*dy)/l;t=clamp(t,0,1);return Math.hypot(px-(x1+dx*t),py-(y1+dy*t));}
let CUR_SRC=null,HSRC=null;
