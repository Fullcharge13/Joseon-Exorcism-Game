/* 에셋 도감 v20.8 · 그릴 목록과 그리는 법 (게임 페이지 위에 얹어 실행 — 게임 코드는 건드리지 않음)
   assetList()      → [{kind, id, name, readme, scale, draw}]  draw.t: 'spr'(도트) | 'url'(게임이 이미 그린 그림 주소: 아이콘·휘장) | 'seal'(도장 글자, 도움말 hseal과 같은 그림) | 'ground'(막 바닥)
   assetCanvas(a, refined) → 캔버스('url'만 null — assetURL로) · refined: 그림 다듬기 켬(variants의 ref), 끔(raw)
   쓰는 게임 함수·표: charSpr·variants(raw/ref)·ESPR·PSPR·GNPC·SKY·ICS·ICON·taskBadge·shieldSpr·PROP·CHARS·EN·WD·PD·TASKS·BLESS·CALL·DUO·duoG·SEALS·TEMPER·VARIANTS·PATHS·GIFTS·DKB·KS·NPCS·ULT·ANOM·GRADES·STAGES */
const ASSET_KINDS = [
  // [종류, 이름, README 접두, 기본 배율]
  ['char', '퇴마사·전직', 'char', 4],
  ['enemy', '요괴', 'e', 3],
  ['npc', '본부 사람', 'npc', 3],
  ['wander', '길에서 만나는 이', null, 3],
  ['sky', '하늘 손님', 'sky', 3],
  ['pet', '펫', 'pet', 3],
  ['weapon', '무기·진화·합공', 'w', 1],
  ['skill', '직업 기술', 's', 1],
  ['passive', '보패', 'p', 1],
  ['item', '줍는 것', 'i', 1],
  ['shield', '방패 단계', null, 4],
  ['task', '과업 휘장', 'task', 1],
  ['prop', '설화 흔적', 'tale', 3],
  ['seal', '인장', 'seal', 1],
  ['temper', '담금질', 'tm', 1],
  ['variant', '변종', 'var', 1],
  ['bless', '신령 축복', 'b', 1],
  ['call', '신내림', 'c', 1],
  ['duo', '쌍신 축복', 'd', 1],
  ['path', '갈림길', 'path', 1],
  ['gift', '넋의 선물', 'gift', 1],
  ['dkb', '도깨비의 짐', 'dkb', 1],
  ['ks', '정표', 'ks', 1],
  ['ult', '궁극 오의', 'u', 1],
  ['anom', '이상한 것', 'anom', 1],
  ['grade', '요괴 등급', 'grade', 1],
  ['ground', '막 바닥', null, 2]
];
const ASSET_KIND = Object.fromEntries(ASSET_KINDS.map(([k, n, p, s]) => [k, {n, p, s}]));
function assetList() {
  const L = [],
    add = (kind, id, name, draw, extra) => {
      const K = ASSET_KIND[kind];
      L.push({kind, id: String(id), name: String(name || id), readme: K.p ? `${K.p}_${id}` : null, scale: K.s, draw, ...(extra || {})});
    },
    seal = (g, bg, color) => ({t: 'seal', g, bg, color: color || null}); // 글자 크기는 assetSeal이 정함(한 글자 18px · 두 글자 11px, hseal·taskBadge와 같음)
  // 퇴마사: 기본 차림(char_<cid> ×4, charS_<cid> ×2) + 갈래마다 차수 차림(char_<cid>_<갈래><차수>: 갈래 0의 1~6차 → 01~06, 갈래 1 → 11~16)
  for (const cid in CHARS) {
    const C = CHARS[cid];
    add('char', cid, C.name, {t: 'spr', look: [cid]}, {used: C.name, refine: true, also: [`charS_${cid}`]});
    C.branches.forEach((B, bi) =>
      B.tiers.forEach((T, ti) => {
        const id = `${cid}_${bi}${ti + 1}`;
        add('char', id, T.name, {t: 'spr', look: [cid, bi, ti]}, {used: `${C.name} · ${B.name} ${ti + 1}차`, refine: true, scale: 3}); // 지금 README 규칙: 전직 차림 ×3
      })
    );
  }
  for (const id in EN) {
    const e = EN[id];
    add('enemy', id, e.n, {t: 'spr', en: id}, {refine: true, used: e.st ? `제${e.st}막` : e.tale ? '설화' : ''});
  }
  for (const id in NPCS) add('npc', id, NPCS[id].n, {t: 'spr', npcLook: id}, {refine: true, used: NPCS[id].role || ''});
  // 장소 안내인(06_run.js GUIDE의 설명: 성황당 = 당 지기 할머니, 괴이 = 포도청 포졸, 샛길 = 길잡이 도깨비)
  const GUIDE_N = {halmi: '당 지기 할머니', pojol: '포도청 포졸', dokkaebi: '길잡이 도깨비'};
  for (const id in GNPC) add('wander', id, GUIDE_N[id] || id, {t: 'spr', npc: id}, {refine: true, used: '장소 안내인'});
  for (const id in SKY) add('sky', id, SKY[id].n, {t: 'spr', sky: id}, {refine: true});
  for (const id in PSPR) add('pet', id, (PETS[id] && PETS[id].n) || id, {t: 'spr', pet: id}, {refine: true});
  for (const id in WD) {
    const d = WD[id];
    if (d.type === 'c') add('skill', id, d.name, seal(d.g, d.col), {used: d.job ? (CHARS[d.job] || {}).name : ''});
    else if (ICON[id]) add('weapon', id, d.name, {t: 'url', icon: id}, {used: d.fuse ? '합공' : d.job ? (CHARS[d.job] || {}).name + ' 전용' : d.evoOf ? '진화' : '공용'});
  }
  for (const id in PD) if (ICON[id]) add('passive', id, PD[id].name || PD[id].n, {t: 'url', icon: id});
  for (const id of ['coin', 'chest', 'pouch', 'tteok']) if (ICS[id]) add('item', id, {coin: '엽전', chest: '보물 상자', pouch: '복주머니', tteok: '떡'}[id], {t: 'url', icon: id});
  for (let i = 0; i < 6; i++) add('shield', i + 1, i < 5 ? `방패 ${i + 1}단계` : '방패 진화', {t: 'spr', shield: i});
  for (const t of TASKS) add('task', t.id, t.name || t.n, {t: 'url', task: t.id});
  // 설화 흔적: 설화의 흔적 이름(TALES traceN) → 설화 규칙 이름(TALE_RULES) → 엔딩 그림(새벽) 순으로 게임에 있는 이름
  for (const id in PROP) {
    const T = Object.values(TALES).find(t => t.trace === id),
      nm = T ? T.traceN : TALE_RULES[id] ? TALE_RULES[id].n : id === 'dawn' ? '새벽' : id;
    add('prop', id, nm, {t: 'spr', prop: id}, {used: T ? T.n : TALE_RULES[id] ? '설화 규칙' : '설화 끝'});
  }
  for (const id in SEALS) add('seal', id, SEALS[id].n, seal(SEALS[id].g, '#7a2018'));
  for (const id in TEMPER) add('temper', id, TEMPER[id].n, seal(TEMPER[id].g, '#9a4a10'));
  for (const id in VARIANTS) add('variant', id, VARIANTS[id].n, seal(VARIANTS[id].n[0], '#2a2228', VARIANTS[id].col));
  for (const id in BLESS) add('bless', id, BLESS[id].n, seal(BLESS[id].g, BLESS[id].col));
  for (const id in CALL) add('call', id, CALL[id].n, seal(CALL[id].g, id === 'none' ? '#4a3a30' : BLESS[id].col));
  for (const id in DUO) add('duo', id, DUO[id].n, seal(duoG(id), '#3a1a4a'));
  for (const id in PATHS) add('path', id, PATHS[id].n, seal(PATHS[id].g, '#2f6b5a'));
  for (const id in GIFTS) add('gift', id, GIFTS[id].n, seal(GIFTS[id].g, '#3a1a4a'));
  for (const id in DKB) add('dkb', id, DKB[id].n, seal(DKB[id].g, '#2a6a6a'));
  for (const id in KS) {
    const N = NPCS[KS[id].npc];
    add('ks', id, KS[id].n, seal(N ? N.g : '無', N ? N.col : '#4a3a30'), {used: N ? N.n : ''});
  }
  for (const id in ULT) add('ult', id, ULT[id].n, seal(ULT[id].g, '#7a2018'), {used: (CHARS[id] || {}).name || ''});
  for (const a of ANOM) add('anom', a.id, a.n, seal(a.g, '#3a1a4a'));
  for (const g of GRADES) add('grade', g.k, g.n + '급', seal(g.n, g.col));
  STAGES.forEach((S, i) => add('ground', i + 1, `제${i + 1}막 ${S.name || S.n || ''}`.trim(), {t: 'ground', st: i}, {used: `제${i + 1}막`}));
  return L;
}
/* 다듬기 끔(raw)·켬(ref)을 설정과 상관없이 직접 고름 */
function assetSpr(d) {
  if (d.look) {
    const [cid, bi, ti] = d.look,
      C = CHARS[cid];
    return charSpr(bi === undefined ? C.look : C.branches[bi].tiers[ti].look);
  }
  if (d.en) return ESPR[d.en];
  if (d.npcLook) {
    const l = NPCS[d.npcLook].look();
    return l ? charSpr(l) : GNPC[d.npcLook] || null; // 도깨비는 차림 대신 떠돌이 도깨비 그림
  }
  if (d.npc) return GNPC[d.npc];
  if (d.sky) return charSpr(SKY[d.sky].look);
  if (d.pet) return PSPR[d.pet];
  return null;
}
function assetCanvas(a, refined) {
  const d = a.draw;
  if (d.t === 'seal') return assetSeal(d);
  if (d.shield !== undefined) return shieldSpr(d.shield + 1, d.shield === 5);
  if (d.prop) return PROP[d.prop];
  if (d.t === 'url') return null; // 그림 주소(assetURL)로
  if (d.t === 'ground') {
    // 막 바닥: 게임이 굽는 128px 바닥 조각(막별 무늬 포함) 네 장을 붙인 256px
    const c = document.createElement('canvas');
    c.width = c.height = VFX_CH * 2;
    const x = c.getContext('2d');
    for (let iy = 0; iy < 2; iy++) for (let ix = 0; ix < 2; ix++) x.drawImage(vfxChunk(d.st, ix, iy), ix * VFX_CH, iy * VFX_CH);
    return c;
  }
  const s = assetSpr(d);
  if (!s) return null;
  return refined ? s.ref.n : s.raw.n;
}
/* 도장 글자: 게임 도움말의 hseal과 같은 그림(검은 테 · 금 테 · 바탕 · 굵은 글자) + 글자 색·두 글자 크기 */
function assetSeal(d) {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const x = c.getContext('2d');
  x.fillStyle = '#0a080c';
  x.fillRect(0, 0, 32, 32);
  x.fillStyle = '#e0b048';
  x.fillRect(2, 2, 28, 28);
  x.fillStyle = d.bg;
  x.fillRect(4, 4, 24, 24);
  x.font = `bold ${String(d.g).length > 1 ? 11 : 18}px ` + FD();
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillStyle = d.color || '#fff6d0';
  x.fillText(d.g, 16, 17);
  return c;
}
function assetURL(a) {
  const d = a.draw;
  if (d.icon) return ICON[d.icon];
  if (d.task) return taskBadge(TASKS.find(t => t.id === d.task));
  return null;
}
/* 시험 하네스(엄격 모드 eval)에서도 보이게 */
Object.assign(globalThis, {ASSET_KINDS, ASSET_KIND, assetList, assetSpr, assetSeal, assetCanvas, assetURL});
