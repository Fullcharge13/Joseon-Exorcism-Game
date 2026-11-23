/* ======================= v22.0 2부 「압록강까지」 (제11~15막) =======================
   설계 docs/specs/2026-11-23-2부-압록강-설계.md · 계획 docs/plans/2026-11-23-2부-압록강.md
   요괴는 모두 『산해경』(山海經) 원문 묘사를 바탕으로 새로 그린 각색이다. 원문: Project Gutenberg #25288
   (https://www.gutenberg.org/ebooks/25288 , 공개 저작물, 2026-11-23 확인). 현대 작품의 디자인은 따르지 않는다.
   사람·나라를 적으로 그리지 않는다: 명·청 전쟁은 판의금부사 전갈의 배경 한 줄뿐이고, 적은 신화 속 짐승이다.
   제강(帝江)·촉음(燭陰)은 원문에서 「신(神)」이라, 쓰러뜨리면 「잠재운다」고 쓴다. */

/* ---- 전갈을 가져오는 판의금부사(이름 없는 가상 인물) ----
   판의금부사(判義禁府事): 의금부의 종1품 벼슬, 다른 관서 관원이 겸직. 출처: 한국민족문화대백과사전 「지의금부사」
   https://encykorea.aks.ac.kr/Article/E0054332 (2026-11-23 확인). 붉은 관복·사모는 게임 속 묘사(품계별 복식 고증 아님) */
const NPC_LOOK = {pangeumbu: lk('samo', '#a8322a', {T: '#e0b048', C: '#1a2b4a', item: 'book'})};

/* ---- 새 몸틀(코드 도트). 글자: A·B 요괴 색, k 검정, w 흰색, s 살빛, r 붉은색, y 금빛 ---- */
Object.assign(TPL, {
  ape: [
    '...AAAA...',
    '..AssssA..',
    '..skssks..',
    '..AsrrsA..',
    '.AAAAAAAA.',
    'AA.AAAA.AA',
    'A..ABBA..A',
    'k..AAAA..k',
    '...A..A...',
    '..kk..kk..'
  ],
  ape4: [
    '.AA....AA.',
    'AA.AAAA.AA',
    '..AssssA..',
    '..skssks..',
    '..AsrrsA..',
    '.AAAAAAAA.',
    'AA.ABBA.AA',
    'A..AAAA..A',
    '...A..A...',
    '..kk..kk..'
  ],
  bird1: [
    'A........A',
    'AA......AA',
    'AAA.ss.AAA',
    '.AAskksAA.',
    '..AsrrsA..',
    '...ABBA...',
    '....A.....',
    '...kk.....'
  ],
  wfish: [
    '..BB......',
    '...BB.....',
    '.wwAAAAA.A',
    'wkwAAAAAAA',
    'rwwAAAAAAA',
    '.wwAAAAA.A',
    '...BB.....',
    '..BB......'
  ],
  snake9: [
    'kA..kA..kA..',
    'AA..AA..AA..',
    '.A.kA.kA.A..',
    '.AAAA.AA.A..',
    'kA.AAAAAAkA.',
    'AA..AAAA.AA.',
    '.AAkAAAAkA..',
    '..AAAAAAAA..',
    '..ABABABAA..',
    '...AAAAAA...',
    '....AAAA....',
    '...AA..AA...'
  ],
  wsnake: [
    'BB......BB',
    'BBB....BBB',
    '.BBB..BBB.',
    '..BAkkAB..',
    '...AAAA...',
    '....AA....',
    '...AA.....',
    '..AA......',
    '..AAA.....',
    '...AAA....'
  ],
  wsnakeF: [
    'BB......BB',
    'BBB.ss.BBB',
    '.BBskksBB.',
    '..BsrrsB..',
    '...AAAA...',
    '....AA....',
    '...AA.....',
    '..AA......',
    '..AAA.....',
    '...AAA....'
  ],
  deer: [
    'B.B.B.B...',
    '.BBBB.....',
    '.AAA......',
    'AkAA......',
    '.AAAAAAAA.',
    '.AAAAAAAAA',
    '..AAAAAAA.',
    '..A.A..A.A',
    '..k.k..k.k'
  ],
  ox: [
    'w.w.......',
    '.AAA......',
    'AkAAAAAAA.',
    'AAAAAAAAAA',
    '.ABAAAAAAA',
    '..AAAAAAA.',
    '..A.A.A.A.',
    '..k.k.k.k.'
  ],
  oxsp: [
    '...B.B.B.B',
    'w.wBABABAB',
    '.AAAAAAAAB',
    'AkAAAAAAAA',
    'AAAAAAAAAA',
    '.ArAAAAAAA',
    '..AAAAAAA.',
    '..A.A.A.A.',
    '..k.k.k.k.'
  ],
  sack: [
    'BB..AAAA..BB',
    'BBBAAAAAABBB',
    '.BAAAAAAAAB.',
    'BBAAAAAAAABB',
    'B.AAAAAAAA.B',
    '..AAAAAAAA..',
    '...AAAAAA...',
    '.k.k.kk.k.k.'
  ],
  headless: [
    '..........yy',
    '...AAAA...yy',
    'x.AAAAAA.y..',
    'xxAkAAkAAy..',
    'xxAAAAAAA...',
    'xxAAArAAA...',
    'x.AAAAAA....',
    '..BBBBBB....',
    '..BB..BB....',
    '..AA..AA....',
    '..kk..kk....'
  ],
  serpentF: [
    '..AAAA....',
    '.AsssssA..',
    'AAskskAA..',
    '.AsrrsAA..',
    '..AAAA.AA.',
    '......AA..',
    '.....AA...',
    '....AAA...',
    '...AAAA...',
    '..AAAAA...',
    '.AAAAAAA..'
  ],
  bee: ['.w....w.', 'wwwAAwww', '.wAkkAw.', '..AAAA..', '..BBBB..', '..AAAA..', '...BB...', '....k...']
});
['deer', 'ox', 'oxsp'].forEach(t => LEFT_FACING.add(t));

/* ---- 요괴 표(2부). d의 앞부분은 원문 풀이, 「게임 속 각색」은 행동 ---- */
const A2_SRC = '『산해경』';
function a2AddEn(id, def) {
  EN[id] = def;
  ESPR[id] = variants(mk(TPL[def.t], {...PAL, A: def.A, B: def.B || def.A, ...(def.pal || {})}));
  if (!DOGAM_IDS.includes(id)) DOGAM_IDS.push(id);
}
const ACT2_EN = {
  // 일반
  bifang: {n: '필방', c: 'n', st: 11, t: 'bird1', A: '#2f7d8a', B: '#c23b2a', hp: 54, spd: 44, dmg: 14, r: 5, xp: 6, ai: 'shoot', fly: 1,
    d: `사람 얼굴에 다리가 하나인 새(${A2_SRC} 해외남경 「為鳥人面一腳」). 불씨를 던지는 것은 게임 속 각색.`},
  jaeng: {n: '쟁', c: 'n', st: 11, t: 'tiger', A: '#c23b2a', B: '#7a2018', hp: 66, spd: 40, dmg: 15, r: 6, xp: 6, ai: 'charge',
    d: `붉은 표범 같고 꼬리 다섯에 뿔 하나, 돌을 치는 소리를 낸다(${A2_SRC} 서산경 「如赤豹，五尾一角，其音如擊石」).`},
  gojo: {n: '고조', c: 'n', st: 11, t: 'bird', A: '#6a4a30', B: '#e0b048', hp: 58, spd: 48, dmg: 14, r: 5, xp: 6, ai: 'leap', fly: 1,
    d: `수리 같은데 뿔이 있고 아기 울음소리를 내며 사람을 먹는다(${A2_SRC} 남산경 「如雕而有角，其音如嬰兒」).`},
  munyo: {n: '문요어', c: 'n', st: 12, t: 'wfish', A: '#3a6a8a', B: '#efe6d2', hp: 52, spd: 50, dmg: 13, r: 5, xp: 6, ai: 'zig', fly: 1,
    d: `물고기 몸에 새 날개, 푸른 무늬에 흰 머리·붉은 부리, 밤에 난다(${A2_SRC} 서산경 「魚身而鳥翼…以夜飛」).`},
  hara: {n: '하라어', c: 'n', st: 12, t: 'fish', A: '#4a5a6a', B: '#8fd3ff', hp: 70, spd: 34, dmg: 14, r: 6, xp: 6, ai: 'split', sc: 1.25,
    d: `머리 하나에 몸이 열인 물고기, 개 짖는 소리를 낸다(${A2_SRC} 북산경 「一首而十身，其音如吠犬」). 쪼개지는 것은 각색.`},
  jeoyeo: {n: '저여', c: 'n', st: 13, t: 'rat', A: '#8a8494', B: '#efe6d2', hp: 34, spd: 56, dmg: 9, r: 4, xp: 3, ai: 'swarm',
    d: `쥐 같고 귀와 주둥이가 희며, 나타나면 나라에 큰 싸움이 난다(${A2_SRC} 중산경 「白耳白喙…見則其國有大兵」).`},
  heumwon: {n: '흠원', c: 'n', st: 13, t: 'bee', A: '#e0b048', B: '#1a1418', hp: 48, spd: 52, dmg: 14, r: 4, xp: 5, ai: 'zig', fly: 1,
    d: `벌 같은 새로 원앙만큼 크며, 쏘인 새와 짐승은 죽고 나무는 마른다(${A2_SRC} 서산경 「其狀如蜂，大如鴛鴦」).`},
  seogeo: {n: '서거', c: 'n', st: 14, t: 'ox', A: '#3a5a6a', B: '#2a3a46', hp: 82, spd: 36, dmg: 16, r: 6, xp: 6, ai: 'charge',
    d: `소 같고 몸이 푸르며 아기 울음소리를 내고 사람을 먹는다(${A2_SRC} 중산경 「其狀如牛。蒼身，其音如嬰兒」).`},
  // 엘리트(중간 보스 전)
  jangu: {n: '장우', c: 'e', st: 11, t: 'ape4', A: '#7a6a5a', B: '#3a3028', sc: 1.4,
    d: `원숭이 같은데 귀가 넷이다(${A2_SRC} 남산경 「其狀如禺而四耳，其名長右」).`},
  buje: {n: '부제', c: 'e', st: 12, t: 'deer', A: '#e8e4d6', B: '#c8b48a', sc: 1.4,
    d: `흰 사슴 같고 뿔이 넷이며, 나타나면 그 고을에 큰물이 진다(${A2_SRC} 중산경 「如白鹿而四角…見則其邑大水」).`},
  che: {n: '체', c: 'e', st: 13, t: 'tiger', A: '#d08a3a', B: '#4a3a30', sc: 1.4,
    d: `범 같은데 소 꼬리가 있고, 개 짖는 소리를 내며 사람을 먹는다(${A2_SRC} 남산경 「如虎而牛尾，其音如吠犬」).`},
  onghwa: {n: '옹화', c: 'e', st: 14, t: 'ape', A: '#c8a030', B: '#7a2018', pal: {s: '#d8b060', k: '#c23b2a'}, sc: 1.4,
    d: `원숭이 같고 눈과 부리가 붉고 몸은 누러며, 나타나면 나라에 큰 두려움이 인다(${A2_SRC} 중산경 「赤目，赤喙，黃身」).`},
  // 중간 보스
  mabok: {n: '마복', c: 'm', st: 11, t: 'tiger', A: '#c8862e', B: '#4a3a30', pal: {w: '#e8b98f'},
    d: `사람 얼굴에 범의 몸, 아기 울음소리를 내며 사람을 먹는다(${A2_SRC} 중산경 「人面虎身，其音如嬰兒」).`},
  myeongsa: {n: '명사', c: 'm', st: 12, t: 'wsnake', A: '#4a6a3a', B: '#8a9a5a',
    d: `뱀 같은데 날개가 넷, 경쇠 소리를 내며 나타나면 고을에 큰 가뭄이 든다(${A2_SRC} 중산경 「如蛇而四翼，其音如磬」).`},
  jegeon: {n: '제건', c: 'm', st: 13, t: 'tiger', A: '#b89a4a', B: '#3a3028', pal: {w: '#e8b98f'},
    d: `표범 같은데 꼬리가 길고 사람 머리에 소 귀, 눈이 하나이며 꼬리를 물고 다닌다(${A2_SRC} 북산경 「如豹而長尾，人首而牛耳，一目」).`},
  biyu: {n: '비유', c: 'm', st: 14, t: 'wsnake', A: '#a8642a', B: '#e0b048',
    d: `다리 여섯에 날개 넷인 뱀, 나타나면 온 세상이 크게 가문다(${A2_SRC} 서산경 태화산 「六足四翼，見則天下大旱」).`},
  hyeongcheon: {n: '형천', c: 'm', st: 15, t: 'headless', A: '#8a4a3a', B: '#3a2a28', pal: {x: '#8a8494', y: '#c8c8d0'},
    d: `천제와 신의 자리를 다투다 머리가 잘렸다(${A2_SRC} 해외서경 「形天與帝至此爭神，帝斷其首」). 방패·도끼는 전해지는 이야기를 따른 각색.`},
  // 막 보스
  sangryu: {n: '상류', c: 'b', st: 11, t: 'snake9', A: '#3a6a4a', B: '#c8b048',
    d: `공공의 신하로 머리가 아홉이다(${A2_SRC} 해외북경 「共工之臣曰相柳氏，九首」). 독을 뿜는 것은 게임 속 각색.`},
  hwasa: {n: '화사', c: 'b', st: 12, t: 'wsnakeF', A: '#5a4a6a', B: '#8a7aa0',
    d: `사람 얼굴에 승냥이 몸, 새 날개로 뱀처럼 기며, 나타나면 고을에 큰물이 진다(${A2_SRC} 중산경 「人面而豺身，鳥翼而蛇行」).`},
  jegang: {n: '제강', c: 'b', st: 13, t: 'sack', A: '#d8a030', B: '#c23b2a',
    d: `누런 자루 같고 붉은 불빛, 다리 여섯·날개 넷에 얼굴이 없으며 노래와 춤을 안다(${A2_SRC} 서산경 「渾敦無面目，是識歌舞」). 원문의 신(神)이라 「잠재운다」.`},
  gunggi: {n: '궁기', c: 'b', st: 14, t: 'oxsp', A: '#5a4a3a', B: '#c8c0a8',
    d: `소 같고 고슴도치 털에 개 짖는 소리를 내며 사람을 먹는다(${A2_SRC} 서산경 「其狀如牛，蝟毛…名曰窮奇」).`},
  chokeum: {n: '촉음', c: 'b', st: 15, t: 'serpentF', A: '#c23b2a', B: '#7a2018',
    d: `종산의 신. 눈을 뜨면 낮이 되고 감으면 밤이 된다(${A2_SRC} 해외북경 「鐘山之神，名曰燭陰，視為晝，瞑為夜」). 원문의 신(神)이라 「잠재운다」.`}
};
for (const id in ACT2_EN) a2AddEn(id, ACT2_EN[id]);

/* ---- 엘리트2(중간 보스 뒤): 12×16 세 장(걷기 2 + 행동 1). ov(바탕, {줄: 새 줄}) ---- */
const a2Ov = (g, m) => g.map((r, i) => (m[i] !== undefined ? m[i] : r));
function a2Frames(base, walk2, act) {
  return [base, a2Ov(base, walk2), a2Ov(base, act)];
}
const HYO_G = [
  '....kkkk....',
  '...kAAAAk...',
  '..kAssssAk..',
  '..kskssksk..',
  '..kAssrsAk..',
  '...kAAAAk...',
  '..kAAAAAAk..',
  '.kAAABBAAAk.',
  'kAAkABBAkAAk',
  'kAk.ABBA.kAk',
  'kAk.AAAA.kAk',
  'kAk.AAAA.kAk',
  'kk..AkkA..kk',
  '....A..A....',
  '...kA..Ak...',
  '...kk..kk...'
];
addElite2('hyo', {
  n: '효',
  c: 'e',
  st: 11,
  t: 'ape',
  A: '#7a5a3a',
  B: '#c8a070',
  eai: 'throw',
  sc: 1.3,
  hp: 110,
  d: `원숭이 같은데 팔이 길고 잘 던진다(${A2_SRC} 서산경 「其狀如禺而長臂，善投，其名曰嚻」). 바위를 던지는 것은 게임 속 각색.`,
  frames: a2Frames(
    HYO_G,
    {14: '..kA....Ak..', 15: '..kk....kk..'},
    {6: 'kAk.kAAk.kAk', 7: 'kAkkABBAkkAk', 8: '.kAAABBAAAk.', 9: '..kABBBBAk..', 10: '...AAAAAA...', 11: '...AAAAAA...', 12: '....AkkA....'}
  )
});
const YEONGEO_G = [
  '..B......B..',
  '.BB......BB.',
  'BBB..AA..BBB',
  'BBBBAAAABBBB',
  '.BBAAAAAABB.',
  '..AwkAAkwA..',
  '..AAAAAAAA..',
  '..AArrrrAA..',
  '...AAAAAA...',
  '...AcAAcA...',
  '....AAAA....',
  '....AcAA....',
  '.....AA.....',
  '....AAAA....',
  '...AA..AA...',
  '..A......A..'
];
addElite2('yeongeo', {
  n: '영어',
  c: 'e',
  st: 12,
  t: 'fish',
  A: '#3a7a9a',
  B: '#efe6d2',
  eai: 'puddle',
  fly: 1,
  sc: 1.3,
  hp: 105,
  d: `물고기 몸에 새 날개, 원앙 소리를 내며 나타나면 고을에 큰물이 진다(${A2_SRC} 서산경 「嬴魚，魚身而鳥翼，音如鴛鴦，見則其邑大水」). 지나간 자리에 물웅덩이를 남기는 것은 각색.`,
  frames: a2Frames(
    YEONGEO_G,
    {0: '............', 1: '............', 2: 'B....AA....B', 3: 'BBB.AAAA.BBB', 4: 'BBBAAAAAABBB'},
    {7: '..AAccccAA..', 13: '.c..AAAA..c.', 14: 'c..AA..AA..c', 15: '.cA......Ac.'}
  )
});
const BI_G = [
  '...w....w...',
  '...wBBBBw...',
  '...BBBBBB...',
  '...BBkkBB...',
  '...BBBBBB...',
  '....BnnB....',
  '..AAAAAAAA..',
  '.AAAAAAAAAA.',
  '.AAAAAAAAAAA',
  '.AAAAAAAAAgA',
  '.AAAAAAAAgg.',
  '..AAAAAAAg..',
  '..A.A..A.gg.',
  '..A.A..A..g.',
  '..k.k..k....',
  '............'
];
addElite2('bi', {
  n: '비',
  c: 'e',
  st: 13,
  t: 'ox',
  A: '#6a5a4a',
  B: '#efe6d2',
  pal: {g: '#5a7a3a'},
  eai: 'blight',
  sc: 1.35,
  hp: 120,
  d: `소 같고 머리가 희며 눈이 하나에 뱀 꼬리. 물로 가면 물이 마르고 풀로 가면 풀이 죽으며, 나타나면 천하에 큰 역병이 돈다(${A2_SRC} 동산경 「行水則竭，行草則死，見則天下大疫」). 마른 독 땅은 각색.`,
  frames: a2Frames(BI_G, {12: '..A..AA..gg.', 13: '.A...A.A..g.', 14: '.k...k.k....'}, {3: '...BBggBB...', 5: '....BrrB....'})
});
const JUYEOM_G = [
  '....BBBB....',
  '...BBBBBB...',
  '..BBssssBB..',
  '..BskssksB..',
  '..BssrrssB..',
  '...BBssBB...',
  '..kAAAAAAk..',
  '.kAAAAAAAAk.',
  'kAAkAAAAkAAk',
  'kAk.AAAA.kAk',
  'kk..AAAA..kk',
  '....AAAA....',
  '....A..A....',
  '...AA..AA...',
  '...rr..rr...',
  '...rr..rr...'
];
addElite2('juyeom', {
  n: '주염',
  c: 'e',
  st: 14,
  t: 'ape',
  A: '#8a6a4a',
  B: '#efe6d2',
  eai: 'warcry',
  sc: 1.35,
  hp: 115,
  d: `원숭이 같고 머리가 희고 발이 붉으며, 나타나면 큰 싸움이 난다(${A2_SRC} 서산경 「其狀如猿，而白首赤足，名曰朱厭，見則大兵」). 둘레 요괴를 북돋우는 것은 각색.`,
  frames: a2Frames(
    JUYEOM_G,
    {13: '..AA....AA..', 14: '..rr....rr..', 15: '..rr....rr..'},
    {4: '..BsrrrrsB..', 6: 'kk.kAAAAk.kk', 7: 'kAkAAAAAAkAk', 8: '.kAAAAAAAAk.', 9: '...kAAAAk...', 10: '....AAAA....'}
  )
});
const GO_G = [
  '....kkkk....',
  '...kssssk...',
  '...skssks...',
  '...ssrrss...',
  '....ssss....',
  '...AAAAA....',
  '..AAyAAAA...',
  '..AAAAyAAA..',
  '...AAAAyAAA.',
  '.....AAAAAA.',
  '......AAAAA.',
  '.....AAyAA..',
  '....AAAAA...',
  '...AAAA.....',
  '..AAA.......',
  '..yA........'
];
addElite2('go', {
  n: '고',
  c: 'e',
  st: 15,
  t: 'serpent',
  A: '#2f6b5a',
  B: '#e0b048',
  eai: 'coil',
  fly: 1,
  sc: 1.35,
  hp: 125,
  d: `종산 신의 아들. 사람 얼굴에 용의 몸이다(${A2_SRC} 서산경 「其子曰鼓，其狀如人面而龍身」). 퇴마사 둘레를 감아 도는 것은 각색.`,
  frames: a2Frames(GO_G, {13: '....AAAA....', 14: '.....AAA....', 15: '......Ay....'}, {0: '..y.kkkk.y..', 3: '...srrrrs...'})
});

/* ---- 엘리트2 행동 ---- */
const a2Edmg = () => bdmg() * 0.75;
// 효: 거리를 두고 0.9초 경고 뒤 바위가 떨어진다(4초마다)
ELITE_AI.throw = (e, dt, P, vx, vy) => {
  e.cd = (e.cd === undefined ? 2 : e.cd) - dt;
  if (e.eactT > 0 && (e.eactT -= dt) <= 0) e.eact = null;
  if (e.cd <= 0) {
    e.cd = 4;
    e.eact = 'throw';
    e.eactT = 0.6;
    warn({x: P.x + rnd(-8, 8), y: P.y + rnd(-6, 6), r: 18, t: 0.9, dmg: a2Edmg(), col: '#b0905a', fx: 'slam', own: e.kind});
  }
  const dx = P.x - e.x,
    dy = P.y - e.y,
    d = Math.hypot(dx, dy) || 1;
  if (d < 80) return [(-dx / d) * e.spd, (-dy / d) * e.spd];
  return null;
};
// 영어: 날아다니며 0.5초마다 발밑에 물웅덩이(4초, 밟으면 느려짐, 피해 없음)
ELITE_AI.puddle = (e, dt) => {
  e.pt = (e.pt || 0) - dt;
  if (e.pt <= 0) {
    e.pt = 0.5;
    G.ezones.push({x: e.x, y: e.y + 4, r: 13, life: 4, max: 4, dmg: 0, slow: 1, col: '#3a7aa0', owner: e});
  }
  return null;
};
// 비: 지나간 풀이 말라 독 땅이 된다(0.6초마다, 4초)
ELITE_AI.blight = (e, dt) => {
  e.pt = (e.pt || 0) - dt;
  if (e.pt <= 0) {
    e.pt = 0.6;
    G.ezones.push({x: e.x, y: e.y + 4, r: 12, life: 4, max: 4, dmg: 4 + G.stage * 2, col: '#8a9a3a', owner: e});
  }
  return null;
};
// 주염: 6초마다 0.8초 외친 뒤 둘레 80 안 요괴가 4초 동안 30% 빨라진다
ELITE_AI.warcry = (e, dt) => {
  e.cd = (e.cd === undefined ? 3 : e.cd) - dt;
  if (e.cryT > 0) {
    e.cryT -= dt;
    if (e.cryT <= 0) {
      e.eact = null;
      for (const en of G.enemies) if (en !== e && !en.boss && (en.x - e.x) ** 2 + (en.y - e.y) ** 2 < 80 * 80) act2Haste(en, 4);
      G.fx.push({t: 'ring', x: e.x, y: e.y, r: 6, maxR: 80, col: '#ff6a3a', life: 0.35, max: 0.35});
    }
    return [0, 0];
  }
  if (e.cd <= 0) {
    e.cd = 6;
    e.cryT = 0.8;
    e.eact = 'cry';
    eWarn(e.x, e.y, 80, 0.8);
  }
  return null;
};
// 고: 퇴마사 둘레 70을 감아 돌다가 5초마다 둘레에 여섯 경고(1초)
ELITE_AI.coil = (e, dt, P) => {
  e.ca = (e.ca === undefined ? Math.atan2(e.y - P.y, e.x - P.x) : e.ca) + dt * 1.1;
  e.cd = (e.cd === undefined ? 3 : e.cd) - dt;
  if (e.eactT > 0 && (e.eactT -= dt) <= 0) e.eact = null;
  if (e.cd <= 0) {
    e.cd = 5;
    e.eact = 'coil';
    e.eactT = 1;
    for (let i = 0; i < 6; i++) {
      const a = e.ca + (i / 6) * TAU;
      warn({x: P.x + Math.cos(a) * 44, y: P.y + Math.sin(a) * 34, r: 14, t: 1, dmg: a2Edmg(), col: '#e0b048', own: e.kind});
    }
  }
  const tx = P.x + Math.cos(e.ca) * 70,
    ty = P.y + Math.sin(e.ca) * 56,
    dx = tx - e.x,
    dy = ty - e.y,
    d = Math.hypot(dx, dy) || 1;
  return [(dx / d) * e.spd * 1.2, (dy / d) * e.spd * 1.2];
};
/* 주염의 북돋움: 이동 빠르기를 잠깐 올리고 act2Tick이 되돌린다(주염이 먼저 쓰러져도 풀림) */
function act2Haste(en, t) {
  if (!en.haste0) {
    en.haste0 = en.spd;
    en.spd *= 1.3;
  }
  en.hasteT = t;
}
function act2Tick(dt) {
  for (const en of G.enemies)
    if (en.hasteT > 0 && (en.hasteT -= dt) <= 0) {
      en.spd = en.haste0;
      en.haste0 = 0;
    }
}
Object.assign(ELITE_RAGE, {
  hyo: {d: '바위 셋을 한꺼번에 던진다.', cd: 5, f: (e, P) => [0, 1, 2].forEach(i => rageWarn(e, P.x + (i - 1) * 26, P.y, 16, 0.9 + i * 0.15))},
  yeongeo: {d: '물살 여덟 줄기를 사방으로 뿜는다.', cd: 4, f: e => ringB(e, 8, 60, rand() * TAU)},
  bi: {d: '자기 둘레를 크게 말려 독 땅을 만든다.', cd: 6, f: (e, P) => rageWarn(e, e.x, e.y, 50, 1.0)},
  juyeom: {d: '외침과 함께 탄 여섯 발을 부채꼴로 쏜다.', cd: 4, f: e => rageFan(e, 6, 1.1, 75)},
  go: {d: '용의 몸을 뒤틀어 퇴마사 자리에 큰 경고를 남긴다.', cd: 4, f: (e, P) => rageWarn(e, P.x, P.y, 34, 0.9)}
});

/* ---- 새 보스 기술 ---- */
Object.assign(BSK, {
  // 상류: 아홉 머리가 차례로 독을 뱉는다(9개 경고가 퇴마사 둘레를 돌며)
  ninePoison: {
    label: '아홉 머리의 독',
    start(e) {
      e.k = 9;
      e.kt = 0;
      e.sa = rand() * TAU;
    },
    tick(e, dt) {
      e.kt -= dt;
      if (e.kt <= 0 && e.k > 0) {
        e.kt = 0.22;
        const P = G.P,
          a = e.sa + e.k * 0.7;
        warn({x: P.x + Math.cos(a) * 30, y: P.y + Math.sin(a) * 24, r: 16, t: 0.75, dmg: bdmg() * 0.7, col: '#7fe07f'});
        e.k--;
      }
      return e.k <= 0 && e.kt <= -0.4;
    },
    mv: 0.3
  },
  // 화사: 큰물 — 왼쪽에서 오른쪽으로 물결 경고가 지나가고, 지나간 자리에 4초 물웅덩이(느려짐)
  flood: {
    label: '큰물',
    start(e) {
      const P = G.P;
      e.k = 7;
      e.kt = 0;
      e.fy = P.y;
      e.fx0 = P.x - 96;
    },
    tick(e, dt) {
      e.kt -= dt;
      if (e.kt <= 0 && e.k > 0) {
        e.kt = 0.16;
        const x = e.fx0 + (7 - e.k) * 32;
        for (const oy of [-26, 0, 26]) {
          warn({x, y: e.fy + oy, r: 16, t: 0.7, dmg: bdmg() * 0.6, col: '#5aa0d0'});
          G.ezones.push({x, y: e.fy + oy, r: 15, life: 4.5, max: 4.5, dmg: 0, slow: 1, col: '#3a7aa0', owner: e});
        }
        e.k--;
      }
      return e.k <= 0 && e.kt <= -0.5;
    },
    mv: 0.2
  },
  // 제강: 혼돈의 춤 — 제자리에서 돌며 날개 네 쌍의 탄을 뿌린다(방향이 두 번 바뀜)
  dance: {
    label: '혼돈의 춤',
    start(e) {
      e.k = 3;
      e.kt = 0;
      e.sa = rand() * TAU;
      e.dir = 1;
    },
    tick(e, dt) {
      e.k -= dt;
      e.kt -= dt;
      if (e.k < 2 && e.dir === 1) e.dir = -1;
      else if (e.k < 1 && e.dir === -1) e.dir = 2;
      if (e.kt <= 0) {
        e.kt = 0.12;
        e.sa += 0.28 * Math.sign(e.dir);
        for (let j = 0; j < 4; j++) ebul(e.x, e.y - 6, e.sa + (j * TAU) / 4, 66, {col: '#ff8a3a'});
      }
      return e.k <= 0;
    },
    mv: 0
  },
  // 궁기: 고슴도치 털 — 가시 열여섯 발을 두 번, 사이에 한 번 짖으며 달려든다
  quills: {
    label: '고슴도치 털',
    start(e) {
      e.k = 3;
      e.kt = 0;
    },
    tick(e, dt) {
      e.kt -= dt;
      if (e.kt <= 0 && e.k > 0) {
        e.kt = 0.55;
        if (e.k === 2) {
          const P = G.P,
            a = Math.atan2(P.y - e.y, P.x - e.x);
          e.qvx = Math.cos(a) * 150; // (검토 지적) e.vx는 이동 코드가 매 장면 덮어써서 세로로만 갔음
          e.qvy = Math.sin(a) * 150;
          e.dashT = 0.35;
        } else ringB(e, 16, 78, e.k * 0.2);
        e.k--;
      }
      if (e.dashT > 0) {
        e.dashT -= dt;
        e.x += e.qvx * dt;
        e.y += e.qvy * dt;
      }
      return e.k <= 0 && e.kt <= 0;
    },
    mv: 0
  },
  // 촉음: 눈을 감다 — 밤(어둠)이 내리고 느린 탄이 촘촘히
  nightFall: {
    label: '눈을 감다',
    start(e) {
      G.dark = 5;
      e.eyes = 0;
      e.k = 3;
      e.kt = 0;
    },
    tick(e, dt) {
      e.k -= dt;
      e.kt -= dt;
      if (e.kt <= 0) {
        e.kt = 0.9;
        ringB(e, 22, 42, rand() * TAU);
      }
      return e.k <= 0;
    },
    mv: 0.2
  },
  // 촉음: 눈을 뜨다 — 번쩍 밝아지며 빠른 탄 세 줄기가 퇴마사 쪽으로
  dayBreak: {
    label: '눈을 뜨다',
    start(e) {
      G.dark = 0;
      e.eyes = 1;
      flash('255,230,170', 0.45);
      e.k = 4;
      e.kt = 0;
    },
    tick(e, dt) {
      e.kt -= dt;
      if (e.kt <= 0 && e.k > 0) {
        e.kt = 0.35;
        const P = G.P,
          a = Math.atan2(P.y - e.y, P.x - e.x);
        for (const d of [-0.25, 0, 0.25]) ebul(e.x, e.y - 6, a + d, 115, {col: '#ffd76a'});
        e.k--;
      }
      return e.k <= 0 && e.kt <= 0;
    },
    mv: 0.4
  }
});
Object.assign(BOSS, {
  mabok: {skills: ['charge', 'dash3'], ult: 'charge'},
  myeongsa: {skills: ['tailFan', 'pillars'], ult: 'tailFan'},
  jegeon: {skills: ['charge', 'ring'], ult: 'ring2'},
  biyu: {skills: ['fireTrail', 'tailFan'], ult: 'fireTrail'},
  hyeongcheon: {skills: ['charge', 'slam'], ult: 'slam'},
  // 조정 3: 6초 남는 독안개(fog)가 다른 기술과 겹쳐 11막 받는 피해가 10막의 2.2배 → 내려찍기(slam)로
  sangryu: {skills: ['heads', 'spiral', 'slam', 'ninePoison'], ults: [{n: '아홉 머리', sk: 'nineHeads'}]},
  hwasa: {skills: ['coil', 'tailFan', 'spiral', 'flood'], ults: [{n: '큰물이 진다', sk: 'flood'}]},
  jegang: {skills: ['dance', 'maskSpin', 'blink', 'ring2'], ults: [{n: '혼돈의 춤', sk: 'dance'}]},
  gunggi: {skills: ['quills', 'charge', 'dash3', 'slam'], ults: [{n: '고슴도치 털', sk: 'quills'}]},
  chokeum: {
    skills: ['spiral', 'ring2', 'fog', 'dayBreak'],
    ults: [
      {n: '눈을 감다 · 밤', sk: 'nightFall'},
      {n: '눈을 뜨다 · 낮', sk: 'dayBreak'}
    ],
    thr: [0.7, 0.4, 0.15]
  }
});
// (검토 지적) 1부 보스가 빌려 쓰는 BORROW 목록에는 넣지 않는다 — 넣으면 어려움·원정의 1부 판이 바뀜

/* ---- 다섯 막(의주로를 따라 남 → 북). 홍제원·영서도 등은 한국민족문화대백과사전 「의주로」
   https://encykorea.aks.ac.kr/Article/E0043406 (2026-11-23 확인) ---- */
STAGES.push(
  {sub: '제11막', name: '홍제원 고개', gr: ['#3a342a', '#423a2e', '#2c2820', '#56493a'], ob: 'pine',
    early: ['bifang', 'jaeng'], late: ['gojo'], elite: 'jangu', elite2: 'hyo', mid: 'mabok', boss: 'sangryu'},
  {sub: '제12막', name: '임진나루', gr: ['#1e2a2e', '#243238', '#182226', '#38505a'], ob: 'reed',
    early: ['munyo', 'gojo'], late: ['hara'], elite: 'buje', elite2: 'yeongeo', mid: 'myeongsa', boss: 'hwasa'},
  {sub: '제13막', name: '송악 아래 개성', gr: ['#2c2a30', '#343238', '#222026', '#46424e'], ob: 'stele', paved: 1,
    early: ['jeoyeo', 'jaeng'], late: ['heumwon'], elite: 'che', elite2: 'bi', mid: 'jegeon', boss: 'jegang'},
  {sub: '제14막', name: '대동강 평양성', gr: ['#2a2c32', '#30343a', '#202428', '#444a54'], ob: 'rampart', paved: 1,
    early: ['seogeo', 'munyo'], late: ['heumwon'], elite: 'onghwa', elite2: 'juyeom', mid: 'biyu', boss: 'gunggi'},
  {sub: '제15막', name: '의주 압록강', gr: ['#4a5262', '#525a6a', '#3a4252', '#6a7488'], ob: 'ice',
    early: ['jeoyeo', 'bifang'], late: ['seogeo'], elite: 'jangu', elite2: 'go', mid: 'hyeongcheon', boss: 'chokeum'}
);
BOSS_HP.push(60000, 76000, 95000, 118000, 145000);

/* ---- 2부 결말(제15막 첫 평정) ---- */
ENDING.north = [ // v22.0 번역 표(ENDING)에 함께 둠
  {
    eye: '2부 결말 1/3',
    title: '해가 다시 뜨다',
    art: 'en:chokeum',
    t: '압록강 얼음 위에서 촉음이 마침내 눈을 감고 잠들자, 밤과 낮이 제자리를 찾았다. 강 건너로 날개 돋친 물고기와 머리 아홉 달린 그림자가 하나둘 물러갔다.'
  },
  {
    eye: '2부 결말 2/3',
    title: '돌아오는 길',
    art: 'npc:pangeumbu',
    t: '의주에서 한양까지 내려오는 길, 고을마다 사람들이 나와 길을 쓸었다. 판의금부사 대감은 장계 끝에 짧게 적었다. 「요괴는 강 밖으로 물러갔고, 길은 다시 열렸다.」'
  },
  {
    eye: '2부 결말 3/3',
    title: '퇴마록의 새 장',
    art: 'prop:scroll',
    t: '퇴마록에 낯선 이름들이 더해졌다. 필방, 상류, 제강, 촉음. 먼 옛 책에 적혀 있던 것들도 이제 이 땅의 이야기가 되었다. 밤은 여전히 길지만, 길을 아는 이가 있다.'
  }
];
function northEndingPages() {
  return meta.north && !meta.north.ending ? ENDING.north : [];
}
function openNorthEnding(done) {
  openScene(northEndingPages(), () => {
    meta.north.ending = true;
    meta.stats.northEnding = 1;
    saveMeta();
    checkTasks();
    done && done();
  });
}

/* ---- 2부 과업(기존 과업·목표는 그대로) ---- */
TASKS.push(
  T('n_enter', '북으로 가는 길', '판의금부사의 전갈을 받고 제11막 도달', 'maxStage', 11, {coins: 200}, '엽전 200'),
  T('n_kaesong', '옛 도읍에 이르다', '제13막 도달', 'maxStage', 13, {coins: 300}, '엽전 300'),
  T('n_clear', '강 밖으로', '제15막 압록강 평정', 'northClears', 1, {coins: 500}, '엽전 500'),
  T('n_ending', '압록강의 새벽', '2부 결말 보기', 'northEnding', 1, {coins: 150}, '엽전 150'),
  T('n_loop', '긴 길의 밤', '제15막을 평정하고 끝없는 밤으로 들어서기', 'northLoop', 1, {coins: 400}, '엽전 400'),
  T('n_clear3', '국경을 지키다', '제15막을 세 번 평정', 'northClears', 3, {coins: 800}, '엽전 800'),
  T('dogam95', '산해경 도감', '요괴 95종 모두 만나기', 'codex', 95, {coins: 500}, '엽전 500')
);
