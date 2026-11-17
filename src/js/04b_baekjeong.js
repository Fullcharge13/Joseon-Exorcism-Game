/* ======================= v21.2 새 퇴마사 「백정」(설계 docs/specs/2026-11-17-백정-퇴마사.md) =======================
   고증: 한국민족문화대백과사전 「화척」(E0064887) — 도살·버들고리(유기)·가죽(피물)·사냥, 1423년(세종 5) 「백정」으로 고쳐 부름,
   직업 때문에 천민으로 여겨져 혼인·거주에서 꺼림을 받음. 「형평사」(E0063567) — 1923년 4월 25일 진주, 백정의 신분 해방·차별 철폐.
   「임꺽정」(E0047411) — 양주 백정 출신, 명종 때 황해도 구월산 등지를 근거로 활동, 1562년 붙잡힘.
   묘사 원칙: 우스개·잔혹함의 상징으로 쓰지 않는다. 천대받던 손재주(칼·고리·가죽)와 「저울처럼 고르게」라는 형평의 뜻이 기둥.
   첫 모자 패랭이는 백정에게 강요된 차별의 표지 — 전직할수록 그 표지를 벗는다. */
ITEMS.cleaver = [
  [10, 5, 'x'],
  [11, 5, 'x'],
  [10, 6, 'x'],
  [11, 6, 'x'],
  [10, 7, 'x'],
  [11, 7, 'w'],
  [11, 8, 'n'],
  [11, 9, 'n']
];
{
  const BJ_IR = {
    neokal: ['........', '.xxxxx..', '.xxxxxw.', '.xxxxxw.', '.xxxxx..', '.....nn.', '......nn', '.......n'],
    galgori: ['...xx...', '..x..x..', '.....x..', '....x...', '...x....', '...n....', '...n....', '...n....'],
    gorideot: ['..oooo..', '.o.o.oo.', 'o.o.o.oo', 'oo.o.o.o', 'o.o.o.oo', '.oo.o.o.', '..oooo..', '........'],
    jeoulchu: ['...n....', '.nnnnnn.', '.n....n.', 'nn....nn', '......x.', '.....xxx', '.....xxx', '........'],
    sutdol: ['........', '........', '.wwwwww.', 'xxxxxxxx', 'xxxxxxxx', '.nnnnnn.', '........', '........'],
    soegajuk: ['.oo..oo.', 'oooooooo', 'oo.oo.oo', 'oooooooo', 'oo.oo.oo', 'oooooooo', '.oo..oo.', '........'],
    beodeul: ['........', '..oooo..', '.o.o.oo.', 'oooooooo', 'o.o.o.oo', 'oooooooo', '.oooooo.', '........']
  };
  for (const k in BJ_IR) {
    IR[k] = BJ_IR[k];
    ICS[k] = mk(BJ_IR[k]);
    ICON[k] = big(ICS[k], 4);
  }
}
/* 칼 던지기: 되돌아오는 탄(boomer)에 칼 모양(cleaver) */
function bjCleaver(a, dmg, r) {
  const P = G.P;
  return shoot(P.x, P.y, a, 170 * P.pspd, 'boomer', dmg, 99, 3, r * P.area, {v0: 170 * P.pspd, tt: 0, cleaver: 1});
}
/* 가장 체력이 많은 요괴(range 안) — 저울로 다는 대상 */
function bjHeaviest(range, skip) {
  const P = G.P;
  let best = null;
  for (const e of near(P.x, P.y, range, TMP2)) if (!e.prop && !(skip && skip.includes(e)) && (!best || e.hp > best.hp)) best = e;
  return best;
}
function bjAim(range) {
  const P = G.P,
    tg = nearest(P.x, P.y, range);
  return tg ? Math.atan2(tg.y - P.y, tg.x - P.x) : Math.atan2(P.diry, P.dirx);
}
/* 쇠갈고리: 요괴를 꿰어 퇴마사 쪽으로 끌어당김(보스는 끌리지 않음) */
function bjHook(e, dmg) {
  const P = G.P;
  const a = Math.atan2(e.y - P.y, e.x - P.x),
    d = Math.hypot(e.x - P.x, e.y - P.y);
  G.fx.push({t: 'beam', x: P.x, y: P.y - 4, a, len: d, w: 2, col: '#8a8494', life: 0.15, max: 0.15});
  hurt(e, dmg, e.boss ? 0 : 50, e.x + (e.x - P.x), e.y + (e.y - P.y));
}
Object.assign(WD, {
  neokal: {
    name: '넓적칼',
    type: 'w',
    job: 'baekjeong',
    max: 5,
    evo: 'sutdol',
    evoName: '포정의 칼',
    evoDesc: '여섯 자루 넓적칼이 사방으로 날아가 결대로 가르고 되돌아온다.',
    desc: [
      '가까운 요괴 쪽으로 넓적칼을 던진다. 칼은 꿰뚫고 되돌아온다.',
      '피해 +25%',
      '칼 +1',
      '피해 +20%, 빨라짐',
      '칼 +1, 피해 +25%'
    ],
    upd(w, dt, P) {
      w.t -= dt;
      if (w.t > 0) return;
      if (w.evo) {
        const o = rand() * TAU;
        for (let i = 0; i < 6 + P.amount; i++) bjCleaver(o + (i / (6 + P.amount)) * TAU, 20 * P.might, 6);
        w.t = 1.5 * P.cd; // v21.2.1: 34·1.3초 → 20·1.5초(진화 무기 중앙값의 2.5배였음)
        return;
      }
      const n = L5(w, [1, 1, 2, 2, 3]) + P.amount,
        a0 = bjAim(220);
      for (let i = 0; i < n; i++) bjCleaver(a0 + (i - (n - 1) / 2) * 0.45, L5(w, [20, 24, 24, 29, 36]) * P.might, 4); // v21.2 조정 1: +25%
      w.t = L5(w, [1.6, 1.6, 1.5, 1.5, 1.4]) * P.cd;
    }
  },
  galgori: {
    name: '쇠갈고리',
    type: 'w',
    job: 'baekjeong',
    max: 5,
    evo: 'soegajuk',
    evoName: '천근 갈고리',
    evoDesc: '둘레의 요괴를 모두 꿰어 한꺼번에 끌어당긴다.',
    desc: [
      '앞의 요괴를 쇠갈고리로 꿰어 퇴마사 쪽으로 끌어당긴다. 보스는 끌리지 않는다.',
      '피해 +20%',
      '갈고리 +1',
      '피해 +20%, 빨라짐',
      '갈고리 +1, 피해 +25%'
    ],
    upd(w, dt, P) {
      w.t -= dt;
      if (w.t > 0) return;
      if (w.evo) {
        for (const e of near(P.x, P.y, 140 * P.area, TMP2).slice()) if (!e.prop) bjHook(e, 40 * P.might); // v21.2.1: 30 → 40(중앙값의 0.5배였음)
        w.t = 1.6 * P.cd;
        return;
      }
      const n = L5(w, [1, 1, 2, 2, 3]) + P.amount,
        dmg = L5(w, [20, 24, 24, 29, 36]) * P.might,
        got = [];
      for (let i = 0; i < n; i++) {
        let tg = null,
          bd = 1e9;
        for (const e of near(P.x, P.y, 160 * P.area, TMP)) {
          const d = (e.x - P.x) ** 2 + (e.y - P.y) ** 2;
          if (!e.prop && !got.includes(e) && d < bd) {
            bd = d;
            tg = e;
          }
        }
        if (!tg) break;
        got.push(tg);
        bjHook(tg, dmg);
      }
      w.t = L5(w, [2.2, 2.1, 2.0, 1.9, 1.7]) * P.cd;
    }
  },
  gorideot: {
    name: '버들고리 덫',
    type: 'w',
    job: 'baekjeong',
    max: 5,
    evo: 'beodeul',
    evoName: '고리 그물',
    evoDesc: '넓은 고리 그물 셋을 펼쳐 요괴를 잠깐 묶고 꾸준히 조인다.',
    desc: [
      '요괴 무리 한가운데에 버들고리 덫을 놓는다. 덫 안의 요괴는 느려지고 피해를 입는다.',
      '피해 +20%',
      '덫 +1',
      '범위 +, 오래감',
      '덫 +1, 피해 +25%'
    ],
    upd(w, dt, P) {
      w.t -= dt;
      if (w.t > 0) return;
      const ev = w.evo,
        n = ev ? 3 : L5(w, [1, 1, 2, 2, 3]),
        r = (ev ? 40 : L5(w, [28, 28, 28, 34, 34])) * P.area,
        dmg = (ev ? 9 : L5(w, [7, 8.5, 8.5, 9, 11])) * P.might; // v21.2.1: 진화 14 → 9
      for (let i = 0; i < n; i++) {
        const tg = randomEnemy(170);
        const x = tg ? tg.x : P.x + rnd(-60, 60),
          y = tg ? tg.y : P.y + rnd(-60, 60);
        zone({x, y, r, life: ev ? 3.5 : L5(w, [3, 3, 3, 3.6, 3.6]), dmg, tick: 0.5, slow: 1, hold: ev ? 1 : 0, col: '#b08a4a'});
      }
      w.t = (ev ? 3 : 3.5) * P.cd;
    }
  },
  jeoulchu: {
    name: '저울추',
    type: 'w',
    job: 'baekjeong',
    lock: 1,
    max: 5,
    evo: 'sutdol',
    evoName: '천칭',
    evoDesc: '가장 무거운 요괴 셋 위에 큰 추가 차례로 떨어진다.',
    desc: [
      '둘레에서 체력이 가장 많은 요괴 위에 무쇠 추를 떨어뜨린다(경고 뒤 큰 피해).',
      '피해 +25%',
      '추 +1',
      '피해 +25%, 빨라짐',
      '추 +1, 피해 +25%'
    ],
    upd(w, dt, P) {
      w.t -= dt;
      if (w.t > 0) return;
      const n = w.evo ? 3 : L5(w, [1, 1, 2, 2, 3]),
        dmg = (w.evo ? 70 : L5(w, [40, 50, 50, 62, 78])) * P.might, // v21.2.1: 진화 90 → 70
        got = [];
      for (let i = 0; i < n; i++) {
        const tg = bjHeaviest(220, got);
        if (!tg) break;
        got.push(tg);
        warn({x: tg.x, y: tg.y, r: 26 * P.area, t: 0.6 + i * 0.15, dmg, friendly: 1, col: '#c9c4bc', fx: 'slam'});
      }
      w.t = (w.evo ? 2.4 : L5(w, [3, 3, 2.8, 2.8, 2.5])) * P.cd;
    }
  }
});
/* ---- 직업 보패 셋 ---- */
Object.assign(PD, {
  sutdol: {name: '숫돌', max: 5, job: 'baekjeong', desc: '공격력 +5% · 치명 피해 +10%'},
  soegajuk: {name: '쇠가죽', max: 5, job: 'baekjeong', desc: '방어 +1 · 최대 체력 +8'},
  beodeul: {name: '버들고리', max: 5, job: 'baekjeong', desc: '줍는 범위 +20% · 범위 +5%'}
});
STATS.might.sutdol = 0.05;
STATS.critDmg.sutdol = 0.1;
STATS.armor.soegajuk = 1;
STATS.maxHp.soegajuk = 8;
STATS.magnet.beodeul = 0.2;
STATS.area.beodeul = 0.05;
/* ---- 전직 기술 12 ---- */
const bjC = (name, g, col, desc, upd) => ({name, type: 'c', g, col, max: 5, desc, upd});
Object.assign(WD, {
  gyeol: bjC('결 따라 베기', '刃', '#a8a8b8', ['앞쪽을 반원으로 크게 베고, 칼바람이 앞으로 날아간다.', '피해 +', '범위 +', '피해 +', '피해 +30%'], (w, dt, P) => {
    w.t -= dt;
    if (w.t > 0) return;
    const a = bjAim(220),
      dmg = L5(w, [24, 30, 30, 36, 46]) * P.might;
    slash(P.x, P.y, a, L5(w, [50, 50, 58, 58, 66]) * P.area, dmg, 1.2, 0, '#d0d0d8');
    shoot(P.x, P.y - 4, a, 200 * P.pspd, 'wind', dmg * 0.7, 99, 0.7, 8 * P.area); // 조정 1: 칼바람이 앞으로 날아가 멀리 있는 보스에게도 닿음
    w.t = 1.8 * P.cd;
  }),
  ssangkal: bjC('쌍칼', '雙', '#8a8a9a', ['양옆으로 넓적칼 두 자루를 던진다. 칼은 되돌아온다.', '피해 +', '피해 +', '칼 +2', '피해 +30%'], (w, dt, P) => {
    w.t -= dt;
    if (w.t > 0) return;
    const a = bjAim(220),
      n = w.lv >= 4 ? 4 : 2;
    for (let i = 0; i < n; i++) bjCleaver(a + Math.PI / 2 + (i / n) * TAU, L5(w, [18, 22, 26, 26, 34]) * P.might, 4);
    w.t = 2.2 * P.cd;
  }),
  kalhoeori: bjC('칼회오리', '旋', '#c8c8d0', ['칼을 휘돌려 둘레를 벤다.', '피해 +', '범위 +', '두 번 휘돈다', '피해 +30%'], (w, dt, P) => {
    w.t -= dt;
    if (w.t > 0) return;
    const R0 = L5(w, [70, 70, 80, 80, 92]) * P.area, // 조정 1: 55~75 → 70~92
      dmg = L5(w, [20, 26, 26, 26, 34]) * P.might,
      k = w.lv >= 4 ? 2 : 1;
    for (let i = 0; i < k; i++) qpush({t: i * 0.35, f: () => pulseRing(P.x, P.y, R0, dmg, '#c8c8d0', 30)});
    w.t = 2.8 * P.cd;
  }),
  hwangso: bjC('황소 들이받기', '牛', '#7a4a2a', ['앞으로 황소처럼 들이받아 충격이 줄지어 터진다.', '피해 +', '길이 +', '피해 +', '피해 +30%'], (w, dt, P) => {
    w.t -= dt;
    if (w.t > 0) return;
    const a = bjAim(220),
      k = L5(w, [4, 4, 5, 5, 6]),
      dmg = L5(w, [18, 23, 23, 28, 36]) * P.might,
      x0 = P.x,
      y0 = P.y;
    for (let i = 1; i <= k; i++)
      qpush({
        t: i * 0.07,
        f: () => {
          const x = x0 + Math.cos(a) * i * 28,
            y = y0 + Math.sin(a) * i * 28;
          aoe(x, y, 24 * P.area, dmg, 50);
          G.fx.push({t: 'ring', x, y, r: 3, maxR: 24 * P.area, col: '#c08a5a', life: 0.25, max: 0.25});
        }
      });
    w.t = 3.2 * P.cd;
  }),
  pojeong: bjC('포정해우', '解', '#d0b080', ['가장 체력이 많은 요괴를 결대로 크게 가르고 표식을 남긴다(받는 피해 ×1.5).', '피해 +', '피해 +', '두 마리', '피해 +30%'], (w, dt, P) => {
    w.t -= dt;
    if (w.t > 0) return;
    const got = [];
    for (let i = 0; i < (w.lv >= 4 ? 2 : 1); i++) {
      const tg = bjHeaviest(240, got);
      if (!tg) break;
      got.push(tg);
      tg.mark = G.time + 3;
      warn({x: tg.x, y: tg.y, r: 30 * P.area, t: 0.5, dmg: L5(w, [60, 75, 90, 90, 118]) * P.might, friendly: 1, col: '#e0c890'});
    }
    w.t = 5 * P.cd;
  }),
  kkeokjeong: bjC('구월산 칼바람', '賊', '#4a4a4a', ['넓적칼 여덟 자루가 사방으로 날아가 되돌아온다.', '피해 +', '두 번 날린다', '피해 +', '피해 +30%'], (w, dt, P) => {
    w.t -= dt;
    if (w.t > 0) return;
    const dmg = L5(w, [26, 32, 32, 38, 48]) * P.might,
      k = w.lv >= 3 ? 2 : 1;
    for (let j = 0; j < k; j++)
      qpush({
        t: j * 0.4,
        f: () => {
          const o = rand() * TAU;
          for (let i = 0; i < 8; i++) bjCleaver(o + (i / 8) * TAU, dmg, 5);
        }
      });
    w.t = 3.5 * P.cd;
  }),
  gorideonji: bjC('고리 던지기', '環', '#b08a4a', ['요괴 무리에 고리 덫을 던져 느리게 하고 조인다.', '피해 +', '덫 +1', '피해 +', '덫 +1, 피해 +30%'], (w, dt, P) => {
    w.t -= dt;
    if (w.t > 0) return;
    for (let i = 0; i < L5(w, [1, 1, 2, 2, 3]); i++) {
      const tg = randomEnemy(170);
      zone({x: tg ? tg.x : P.x, y: tg ? tg.y : P.y, r: 28 * P.area, life: 2.5, dmg: L5(w, [8, 10, 10, 12, 15]) * P.might, tick: 0.5, slow: 1, col: '#c0a060'});
    }
    w.t = 3 * P.cd;
  }),
  gajukchae: bjC('가죽 채찍', '鞭', '#8a5a2b', ['가죽 채찍을 길게 휘둘러 앞의 요괴를 친다.', '피해 +', '길이 +', '피해 +', '피해 +30%'], (w, dt, P) => {
    w.t -= dt;
    if (w.t > 0) return;
    slash(P.x, P.y, bjAim(220), L5(w, [90, 90, 105, 105, 115]) * P.area, L5(w, [20, 25, 25, 30, 38]) * P.might, 0.35, 0, '#a0703a');
    w.t = 1.9 * P.cd;
  }),
  mongdung: bjC('몽둥이질', '棒', '#a07850', ['몽둥이로 둘레를 크게 쳐서 밀쳐 낸다.', '피해 +', '범위 +', '피해 +', '피해 +30%'], (w, dt, P) => {
    w.t -= dt;
    if (w.t > 0) return;
    pulseRing(P.x, P.y, L5(w, [45, 45, 52, 52, 60]) * P.area, L5(w, [16, 20, 20, 24, 31]) * P.might, '#a07850', 90);
    w.t = 2.4 * P.cd;
  }),
  jeouljil: bjC('저울질', '秤', '#c9c4bc', ['가장 무거운 요괴를 달아 치고 표식을 남긴다(받는 피해 ×1.5).', '피해 +', '두 마리', '피해 +', '세 마리, 피해 +30%'], (w, dt, P) => {
    w.t -= dt;
    if (w.t > 0) return;
    const got = [];
    for (let i = 0; i < L5(w, [1, 1, 2, 2, 3]); i++) {
      const tg = bjHeaviest(220, got);
      if (!tg) break;
      got.push(tg);
      tg.mark = G.time + 4;
      hurt(tg, L5(w, [45, 56, 56, 68, 86]) * P.might, 20, P.x, P.y); // v21.2 조정 2: +50%
      particle(tg.x, tg.y - 6, '#c9c4bc', 6, 40, 0.4);
    }
    w.t = 3 * P.cd; // 조정 2: 3.5 → 3초
  }),
  gitbal: bjC('형평의 깃발', '旗', '#c23b2a', ['깃발을 꽂아 둘레의 요괴를 꾸준히 치고, 깃발 곁에서는 체력이 조금씩 찬다.', '피해 +', '범위 +', '피해 +', '오래감, 피해 +30%'], (w, dt, P) => {
    w.t -= dt;
    if (w.t > 0) return;
    zone({x: P.x, y: P.y, r: L5(w, [50, 50, 58, 58, 66]) * P.area, life: L5(w, [4, 4, 4, 4, 5]), dmg: L5(w, [8, 10, 10, 12, 15]) * P.might, tick: 0.5, heal: 0.6, col: '#c23b2a'});
    w.t = 6 * P.cd;
  }),
  jijipil: bjC('저울은 고르다', '平', '#e0b048', ['화면 안 요괴 모두에게 지금 체력에 비례한 피해를 준다(보스는 초당 상한).', '비율 +', '빨라짐', '비율 +', '비율 +, 빨라짐'], (w, dt, P) => {
    w.t -= dt;
    if (w.t > 0) return;
    const pct = L5(w, [0.15, 0.17, 0.17, 0.2, 0.24]),
      cap = 250 * P.might,
      base = L5(w, [20, 24, 24, 28, 36]) * P.might;
    for (const e of G.enemies)
      if (!e.dead && !e.prop && inView(e)) {
        hurt(e, (e.boss ? base * 3 : base) + Math.min(e.hp * pct, cap), 0, 0, 0, true); // 조정 2: 보스에겐 기본 피해 ×3
        particle(e.x, e.y - 6, '#e0b048', 2, 30, 0.3);
      }
    flash('255,230,160', 0.12);
    w.t = L5(w, [8, 8, 7, 7, 6]) * P.cd;
  })
});
/* ---- 퇴마사 ---- */
CHARS.baekjeong = {
  name: '백정',
  seal: '衡',
  start: 'neokal',
  trait: '치명타 +8% · 최대 체력 +10',
  desc: '소를 잡고 버들고리를 엮던 이. 천대받던 손으로 요괴를 가른다. 넓적칼을 던지면 꿰뚫고 되돌아온다.',
  base: B => {
    B.crit += 0.08;
    B.maxHp = 110;
  },
  look: lk('paraengi', '#9a8a6a', {T: '#efe6d2', item: 'cleaver'}),
  branches: [
    {
      name: '칼의 길',
      tiers: [
        {name: '칼잡이', skill: 'gyeol', bonus: '치명타 +5%', apply: B => (B.crit += 0.05), look: lk('paraengi', '#8a7a62', {item: 'cleaver'})},
        {name: '날 선 백정', skill: 'ssangkal', bonus: '공격력 +10%', apply: B => (B.might += 0.1), look: lk('paraengi', '#6a5a48', {item: 'cleaver'})},
        {name: '칼바람 사냥꾼', skill: 'kalhoeori', bonus: '범위 +10%', apply: B => (B.area += 0.1), look: lk('hood', '#4a5a3a', {item: 'cleaver'})},
        {name: '황소 장사', skill: 'hwangso', bonus: '최대 체력 +30', apply: B => (B.maxHp += 30), look: lk('tang', '#7a4a2a', {item: 'cleaver'})},
        {
          name: '포정',
          skill: 'pojeong',
          bonus: '공격력 +15% · 치명 피해 +20%',
          apply: B => {
            B.might += 0.15;
            B.critDmg += 0.2;
          },
          look: lk('gat', '#efe6d2', {T: '#c23b2a', item: 'cleaver'})
        }
      ]
    },
    {
      name: '형평의 길',
      tiers: [
        {name: '고리장이', skill: 'gorideonji', bonus: '이동 속도 +10%', apply: B => (B.spd += 0.1), look: lk('paraengi', '#a08a5a', {item: 'bag'})},
        {name: '갖바치', skill: 'gajukchae', bonus: '방어 +1', apply: B => (B.armor += 1), look: lk('paraengi', '#7a5a3a', {item: 'cloth'})},
        {name: '장정', skill: 'mongdung', bonus: '최대 체력 +30', apply: B => (B.maxHp += 30), look: lk('hood', '#5a4a3a', {item: 'staff'})},
        {name: '형평사원', skill: 'jeouljil', bonus: '재사용 대기 −8%', apply: B => (B.cd *= 0.92), look: lk('gat', '#3a3a4a', {item: 'mapae'})},
        {
          name: '형평의 기수',
          skill: 'gitbal',
          bonus: '범위 +15% · 초당 회복 +0.5',
          apply: B => {
            B.area += 0.15;
            B.regen += 0.5;
          },
          look: lk('gat', '#efe6d2', {T: '#c23b2a', item: 'spear'})
        }
      ]
    }
  ]
};
CHARS.baekjeong.branches[0].tiers.push({
  name: '의적 임꺽정',
  skill: 'kkeokjeong',
  bonus: '공격력 +25% · 치명타 +8%',
  apply: B => {
    B.might += 0.25;
    B.crit += 0.08;
  },
  look: lk('jeonrip', '#2a2a2a', {T: '#c9b07a', item: 'sword', aura: '#c9b07a'}),
  who: '양주의 백정 출신. 명종 때 황해도 구월산 등지를 근거로 활동하다 1562년에 붙잡혔다고 기록된 인물.',
  src: 'https://encykorea.aks.ac.kr/Article/E0047411'
});
CHARS.baekjeong.branches[1].tiers.push({
  name: '형평사 장지필',
  skill: 'jijipil',
  bonus: '공격력 +20% · 재사용 대기 −10%',
  apply: B => {
    B.might += 0.2;
    B.cd *= 0.9;
  },
  look: lk('gat', '#1a1a1a', {T: '#efe6d2', item: 'book', aura: '#ffe3a0'}),
  who: '1923년 진주에서 백정의 신분 해방과 차별 철폐를 내건 형평사가 세워질 때 위원을 맡았고, 이후 형평 운동을 이끈 인물.',
  src: 'https://encykorea.aks.ac.kr/Article/E0063567'
});
ULT.baekjeong = {
  n: '형평',
  g: '衡',
  d: '24초마다 화면 안 요괴를 저울로 달아 가장 무거운 다섯에 큰 칼자국을 내고, 체력 10%를 회복한다.'
};
function baekUlt(P, D) {
  const got = [];
  for (let i = 0; i < 5; i++) {
    let tg = null;
    for (const e of G.enemies) if (!e.dead && !e.prop && inView(e) && !got.includes(e) && (!tg || e.hp > tg.hp)) tg = e;
    if (!tg) break;
    got.push(tg);
    warn({x: tg.x, y: tg.y, r: 34 * P.area, t: 0.4 + i * 0.12, dmg: D * 3, friendly: 1, col: '#e0c890', fx: 'slam'});
  }
  heal(P.maxHp * 0.1);
}
TASKS.push(
  T('c_baekjeong', '저울을 든 손', '엘리트 요괴 20마리 퇴치', 'elites', 20, {unlock: 'char:baekjeong'}, '백정 해금'),
  T('t_baekjeong', '백정 1차 전직', '백정으로 1차 전직', 'tier_baekjeong', 1, {unlock: 'w:jeoulchu'}, '저울추 해금'),
  T('t5_baekjeong', '포정·형평의 기수가 되다', '백정으로 5차 전직', 'tier_baekjeong', 5, {coins: 150}, '엽전 150')
);
MAXKEYS.add('tier_baekjeong');
