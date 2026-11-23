/* ======================= v22.1 견습 동행 (2부 제11막부터) =======================
   설계 docs/specs/2026-11-23-견습-동행-설계.md · 계획 docs/plans/2026-11-23-견습-동행.md
   1부에서 지나온 마을의 아이가 퇴마를 배우는 견습으로 따라나선다(가상 인물). 쓰러짐은 기절(별)로만, 다치는 연출 없음.
   견습은 판 안 상태(G.ap)만 가진다. 피해는 hurt(…, noCrit)로만, 출처 HSRC = 'ap:<무기 id>'. */

const AP_KIDS = {
  boy: {
    n: '복돌',
    g: '童',
    col: '#7a5a3a',
    d: '장터에서 지게를 지던 아이. 가까이 붙어 휘두른다(근접).',
    look: lk('sugeon', '#7a6a4a', {T: '#c8a070'})
  },
  girl: {
    n: '연이',
    g: '娘',
    col: '#a8506a',
    d: '나루터 주막집 딸. 곁에서 거리를 두고 쏜다(원거리).',
    look: lk('flower', '#c86a7a', {T: '#e0b048'})
  }
};
/* 견습 무기: kid 갈래 · cd 재사용(초) · k 피해 몫(여럿을 맞히는 무기는 작게) · r 거리 · g 글자 도장 */
const AWD = {
  mokgeom: {kid: 'boy', n: '목검', g: '木', col: '#8a6a3a', cd: 0.8, k: 0.5, r: 30, d: '가까운 요괴 쪽으로 부채꼴로 휘두른다.'},
  dorikkae: {kid: 'boy', n: '도리깨', g: '枷', col: '#6a5a3a', cd: 1.4, k: 0.4, r: 30, d: '제자리에서 한 바퀴 휘둘러 둘레를 모두 친다.'},
  jangdae: {kid: 'boy', n: '장대', g: '竿', col: '#5a7a3a', cd: 1.0, k: 0.5, r: 58, d: '한 줄로 길게 찔러 꿰뚫는다.'},
  saechong: {kid: 'girl', n: '새총', g: '彈', col: '#a8506a', cd: 0.6, k: 1.0, r: 150, d: '가까운 요괴에게 돌을 한 발 쏜다.'},
  daehwal: {kid: 'girl', n: '대나무 활', g: '弓', col: '#4a7a5a', cd: 1.1, k: 0.6, r: 170, d: '화살 한 발, 셋까지 꿰뚫는다.'},
  mulchong: {kid: 'girl', n: '물총', g: '水', col: '#3a7aa0', cd: 0.8, k: 0.35, r: 72, d: '짧은 물줄기 세 갈래. 맞은 요괴는 1초 느려진다.'}
};
const APD = {
  jipsin: {n: '짚신', g: '履', col: '#b0905a', d: '공격 빠르기 +8%(Lv마다)'},
  bokjumeoni: {n: '복주머니', g: '福', col: '#c23b2a', d: '최대 체력 +20% · 초당 체력 +1(Lv마다)'},
  bangul: {n: '방울', g: '鈴', col: '#e0b048', d: '범위 +10%(Lv마다)'},
  daenggi: {n: '댕기', g: '帶', col: '#a8322a', d: '피해 +12%(Lv마다)'}
};
const AP_HP = 160, // 내구 조정 2: 120 → 160(자동 플레이 막당 기절 복돌 3·연이 1.75)
  AP_TAKE = 0.15, // 견습이 받는 피해 배율(사용자 결정 「거리 두기 + 받는 피해 절반」: 0.3 → 0.15. 0.3일 땐 11막 보스 곁에서 10초에 두 번 기절)
  AP_K = 1, // 견습 피해 배율(균형 조정 대상)
  AP_REV_R = 26,
  AP_REV_T = 5;
const apLv = k => (G.ap && G.ap.p && G.ap.p.id === k ? G.ap.p.lv : 0);
/* 조정 3: 보스 초당 상한은 퇴마사가 이미 다 쓰므로, 견습은 따로 상한을 가진다 — 퇴마사 상한의 10%(Lv1) ~ 32%(Lv5·댕기5) */
function apBossCapF() {
  const A = G.ap;
  if (!A) return 0;
  return 0.1 * (1 + 0.25 * (A.w.lv - 1)) * (1 + 0.12 * apLv('daenggi')) * (1 + 0.05 * (A.tr || 0));
}
function apMaxHp() {
  return Math.round(AP_HP * (1 + 0.2 * apLv('bokjumeoni')));
}
function apStart(kid) {
  const P = G.P;
  G.ap = {kid, w: {id: kid === 'boy' ? 'mokgeom' : 'saechong', lv: 1}, p: null, tr: 0, hp: 0, maxHp: AP_HP};
  G.ap.x = P.x - 16;
  G.ap.y = P.y + 4;
  apStage();
  refreshSlots();
}
/* 막이 바뀔 때: 체력 가득 · 기절 0번 · 숨음 풀림 */
function apStage() {
  const A = G.ap;
  if (!A) return;
  A.maxHp = apMaxHp();
  A.hp = A.maxHp;
  A.downs = 0;
  A.down = false;
  A.hidden = false;
  A.rev = 0;
  A.iT = 0;
  A.cd = 0.5;
  A.x = G.P.x - 16;
  A.y = G.P.y + 4;
}
function apHit(d) {
  const A = G.ap;
  if (!A || A.hidden || A.down || A.iT > 0) return;
  A.hp = Math.max(0, A.hp - d);
  A.iT = 1.2; // 내구 조정 2: 0.6 → 1.2초
  A.white = 0.1;
  if (A.hp > 0) return;
  A.downs++;
  G.rs.apDowns = (G.rs.apDowns || 0) + 1;
  A.rev = 0;
  if (A.downs >= 3) {
    A.hidden = true;
    toast(_t('{n:을} 덤불 뒤에 숨겼다 · 다음 막에', {n: AP_KIDS[A.kid].n})); // 휴대폰 폭(검토 지적: big은 잘림)
  } else {
    A.down = true;
    toast(_t('{n:이} 쓰러졌다 · 곁에서 5초', {n: AP_KIDS[A.kid].n}), 'red');
  }
}
/* 견습 피해는 최근 20초의 초당 피해(보스 포함, G.rs.dmg 합의 증가)에 맞춘다 — 조정 2: 보스 제외(playerDps)로는 2부 피해 대부분인 보스전이 빠져 비중 0.3~2%. 조정 1 전에는 — 2부엔 퇴마사가 이미 다 커서 고정 수치로는 비중이 0.2%뿐이었음(조정 1).
   한 번 피해 = 기준 초당 피해 × 재사용 × 무기 몫 k × Lv 배율(Lv1 8% → Lv5 16%) × 보패 */
function apDmg(w) {
  const d = AWD[w.id],
    base = Math.max(apTotDps(), 40 * (1 + G.stage));
  return base * d.cd * d.k * 0.08 * (1 + 0.25 * (w.lv - 1)) * (1 + 0.12 * apLv('daenggi')) * (1 + 0.05 * (G.ap.tr || 0)) * AP_K;
}
function apNearest(x, y, r) {
  let best = null,
    bd = r * r;
  for (const e of G.enemies) {
    if (e.dead || e.prop || e.inv) continue;
    const d = (e.x - x) ** 2 + (e.y - y) ** 2;
    if (d < bd) {
      bd = d;
      best = e;
    }
  }
  return best;
}
/* 최근 20초 초당 피해(모든 출처, 견습 포함 — 몫 f<1이라 수렴) */
function apTotDps() {
  const A = G.ap;
  return A && A.dbuf && A.dbuf.length ? A.dbuf.reduce((x, y) => x + y, 0) / A.dbuf.length : 0;
}
function apDpsTick(dt) {
  const A = G.ap;
  A.dT = (A.dT || 0) + dt;
  if (A.dT < 1) return;
  A.dT -= 1;
  let tot = 0;
  for (const k in G.rs.dmg || {}) tot += G.rs.dmg[k];
  const b0 = A.dbuf || (A.dbuf = []);
  if (A.dLast !== undefined) b0.push(Math.max(0, tot - A.dLast));
  A.nbTot = (A.nbTot || 0) + ((G.dpsBuf || []).slice(-1)[0] || 0); // 보스 아닌 요괴에게 준 피해(모든 출처, 초마다)
  A.dLast = tot;
  if (b0.length > 20) b0.shift();
}
/* 무기 한 번 쓰기 — 맞히면 true */
function apFire(A, tg) {
  const w = A.w,
    D = AWD[w.id],
    area = 1 + 0.1 * apLv('bangul'),
    dmg = apDmg(w),
    a = Math.atan2(tg.y - A.y, tg.x - A.x);
  HSRC = 'ap:' + w.id;
  const hp0 = new Map();
  for (const e of G.enemies) if (!e.boss) hp0.set(e, Math.max(0, e.hp));
  try {
    if (w.id === 'mokgeom') {
      const R0 = D.r * area;
      G.fx.push({t: 'slash', x: A.x, y: A.y - 4, a, r: R0, life: 0.16, max: 0.16, delay: 0, half: 1.0, col: '#e8d8b0'});
      for (const e of near(A.x, A.y, R0, TMP2).slice()) {
        let da = Math.atan2(e.y - A.y, e.x - A.x) - a;
        da = Math.atan2(Math.sin(da), Math.cos(da));
        if (Math.abs(da) < 1.1) hurt(e, dmg, 30, A.x, A.y, true);
      }
    } else if (w.id === 'dorikkae') {
      const R0 = D.r * area;
      G.fx.push({t: 'ring', x: A.x, y: A.y - 3, r: 4, maxR: R0, col: '#c8a070', life: 0.25, max: 0.25});
      for (const e of near(A.x, A.y, R0, TMP2).slice()) hurt(e, dmg, 40, A.x, A.y, true);
    } else if (w.id === 'jangdae') {
      const L = D.r * area;
      G.fx.push({t: 'beam', x: A.x, y: A.y - 4, a, len: L, w: 4, col: '#c8b080', life: 0.15, max: 0.15});
      for (const e of G.enemies.slice())
        if (!e.dead && segDist(e.x, e.y, A.x, A.y - 4, A.x + Math.cos(a) * L, A.y - 4 + Math.sin(a) * L) < e.r + 4)
          hurt(e, dmg, 20, A.x, A.y, true);
    } else if (w.id === 'saechong') {
      G.fx.push({t: 'beam', x: A.x, y: A.y - 6, a, len: Math.hypot(tg.x - A.x, tg.y - A.y), w: 1, col: '#a09070', life: 0.08, max: 0.08});
      hurt(tg, dmg, 15, A.x, A.y, true);
    } else if (w.id === 'daehwal') {
      const L = D.r * area,
        ex = A.x + Math.cos(a) * L,
        ey = A.y - 6 + Math.sin(a) * L;
      G.fx.push({t: 'beam', x: A.x, y: A.y - 6, a, len: L, w: 1, col: '#e0d8b0', life: 0.1, max: 0.1});
      const hit = G.enemies
        .filter(e => !e.dead && !e.prop && segDist(e.x, e.y, A.x, A.y - 6, ex, ey) < e.r + 3)
        .sort((p, q) => (p.x - A.x) ** 2 + (p.y - A.y) ** 2 - ((q.x - A.x) ** 2 + (q.y - A.y) ** 2))
        .slice(0, 3);
      if (tg.boss && !hit.includes(tg)) hit[Math.min(hit.length, 2)] = tg; // 보스를 노린 화살은 보스까지 닿음
      for (const e of hit) hurt(e, dmg, 10, A.x, A.y, true);
    } else if (w.id === 'mulchong') {
      const L = D.r * area;
      for (const da of [-0.25, 0, 0.25]) {
        const aa = a + da,
          ex = A.x + Math.cos(aa) * L,
          ey = A.y - 5 + Math.sin(aa) * L;
        G.fx.push({t: 'beam', x: A.x, y: A.y - 5, a: aa, len: L, w: 2, col: '#8fd3ff', life: 0.12, max: 0.12});
        const e =
          da === 0 && tg.boss
            ? tg // 가운데 물줄기는 노린 보스에게
            : G.enemies
                .filter(e => !e.dead && !e.prop && segDist(e.x, e.y, A.x, A.y - 5, ex, ey) < e.r + 3)
                .sort((p, q) => (p.x - A.x) ** 2 + (p.y - A.y) ** 2 - ((q.x - A.x) ** 2 + (q.y - A.y) ** 2))[0];
        if (e) {
          hurt(e, dmg, 5, A.x, A.y, true);
          e.slow = Math.max(e.slow || 0, 1);
        }
      }
    }
  } finally {
    HSRC = null;
    for (const [e, h] of hp0) A.nbAp = (A.nbAp || 0) + Math.max(0, h - Math.max(0, e.hp)); // 보스 아닌 요괴에게 실제로 준 피해(비중 재기)
  }
  snd(AWD[w.id].kid === 'boy' ? 300 : 700, 0.03, 'triangle', 0.012);
}
/* 위험 피하기(사용자 결정): 보스 몸에서 떨어지고(소년 r+14 · 소녀 r+40), 곧 터질 경고 장판 밖으로 간 자리를 돌려준다 */
function apSafe(A, tx, ty, boy) {
  const P = G.P;
  for (const bo of [G.boss, G.mid])
    if (bo && !bo.dead) {
      const keep = bo.r + (boy ? 14 : 40),
        dx = tx - bo.x,
        dy = ty - bo.y,
        d = Math.hypot(dx, dy);
      if (d < keep) {
        const ux = d > 0.5 ? dx / d : Math.sign(P.x - bo.x) || 1,
          uy = d > 0.5 ? dy / d : 0;
        tx = bo.x + ux * keep;
        ty = bo.y + uy * keep;
      }
    }
  for (let it = 0; it < 2; it++)
    for (const w of G.warns) {
      if (w.friendly || !(w.dmg > 0) || w.kind === 'line') continue;
      const R0 = w.r + 9,
        dx = tx - w.x,
        dy = ty - w.y,
        d = Math.hypot(dx, dy);
      if (d < R0) {
        const ax = A.x - w.x,
          ay = A.y - w.y,
          ad = Math.hypot(ax, ay),
          ux = d > 0.5 ? dx / d : ad > 0.5 ? ax / ad : 1,
          uy = d > 0.5 ? dy / d : ad > 0.5 ? ay / ad : 0;
        tx = w.x + ux * R0;
        ty = w.y + uy * R0;
      }
    }
  return [tx, ty];
}
/* 매 장면(update 안) */
function apTick(dt) {
  const A = G.ap;
  if (!A) return;
  const P = G.P;
  A.iT = Math.max(0, (A.iT || 0) - dt);
  A.white = Math.max(0, (A.white || 0) - dt);
  A.ph = (A.ph || 0) + dt;
  apDpsTick(dt);
  if (A.hidden) {
    A.x = P.x - 16;
    A.y = P.y + 4;
    return;
  }
  if (A.down) {
    if ((P.x - A.x) ** 2 + (P.y - A.y) ** 2 < AP_REV_R * AP_REV_R) {
      A.rev = Math.min(1, A.rev + dt / AP_REV_T);
      if (A.rev >= 1) {
        A.down = false;
        A.rev = 0;
        A.hp = A.maxHp * 0.5;
        toast(_t('{n:이} 깨어났다', {n: AP_KIDS[A.kid].n}));
        particle(A.x, A.y - 6, '#e0b048', 8, 40, 0.4);
      }
    }
    return;
  }
  // 회복(복주머니)
  const rg = apLv('bokjumeoni');
  if (rg) A.hp = Math.min(A.maxHp, A.hp + rg * dt);
  // 움직임: 소년은 퇴마사 70 안의 요괴에게 붙되 60을 넘지 않음 · 소녀는 곁에서
  const boy = A.kid === 'boy';
  const bo0 = [G.boss, G.mid].find(q => q && !q.dead && Math.hypot(q.x - P.x, q.y - P.y) < 90),
    tg = (boy && bo0) || apNearest(P.x, P.y, boy ? 70 : AWD[A.w.id].r); // 소년은 보스가 가까우면 보스 곁(거리는 apSafe가 지킴)
  let tx = P.x + (boy ? -16 : 18),
    ty = P.y + 6;
  if (boy && tg) {
    const a = Math.atan2(A.y - tg.y, A.x - tg.x);
    tx = tg.x + Math.cos(a) * 10;
    ty = tg.y + Math.sin(a) * 10;
    const dx = tx - P.x,
      dy = ty - P.y,
      d = Math.hypot(dx, dy);
    if (d > 60) {
      tx = P.x + (dx / d) * 60;
      ty = P.y + (dy / d) * 60;
    }
  }
  [tx, ty] = apSafe(A, tx, ty, boy);
  const dx = tx - A.x,
    dy = ty - A.y,
    d = Math.hypot(dx, dy),
    sp = Math.max(80, (P.spd || 60) * 1.2);
  A.vx = d > 2 ? (dx / d) * sp : 0;
  if (d > 2) {
    const s = Math.min(d, sp * dt);
    A.x += (dx / d) * s;
    A.y += (dy / d) * s;
  }
  if (d > 160) {
    A.x = tx;
    A.y = ty;
  } // 너무 떨어지면 곁으로
  // 공격
  A.cd -= dt * (1 + 0.08 * apLv('jipsin'));
  if (A.cd <= 0) {
    const rr = AWD[A.w.id].r * (1 + 0.1 * apLv('bangul')),
      bo = [G.boss, G.mid].find(q => q && !q.dead && !q.inv && Math.hypot(q.x - A.x, q.y - A.y) < rr + q.r),
      t2 = bo || apNearest(A.x, A.y, rr); // 보스전 조력자: 보스가 닿으면 보스부터
    if (t2) {
      A.face = t2.x > A.x ? 1 : -1;
      apFire(A, t2);
      A.cd = AWD[A.w.id].cd;
      A.swing = 0.15;
    } else A.cd = 0.1;
  }
  A.swing = Math.max(0, (A.swing || 0) - dt);
  // 맞기: 요괴 몸·탄·장판·곧 터질 경고
  const hitR = 5;
  for (const e of G.enemies)
    if (!e.dead && !e.prop && (e.x - A.x) ** 2 + (e.y - A.y) ** 2 < (e.r + hitR) ** 2) {
      apHit(e.dmg * AP_TAKE * (boy ? 0.5 : 1)); // 내구 조정 3: 근접인 복돌은 몸 닿는 피해 절반(막당 기절 2.0 → 목표 1 안팎)
      break;
    }
  for (const q of A.iT > 0 ? [] : G.ebul) // 무적 중엔 탄을 지우지 않음(검토 지적: 탄 방패가 됨)
    if (q.life > 0 && (q.x - A.x) ** 2 + (q.y - A.y) ** 2 < ((q.r || 3) + hitR) ** 2) {
      apHit(q.dmg * AP_TAKE);
      q.life = 0;
      break;
    }
  for (const z of G.ezones)
    if (!z.slow && z.dmg > 0 && (z.x - A.x) ** 2 + (z.y - A.y) ** 2 < z.r * z.r) {
      apHit(z.dmg * AP_TAKE);
      break;
    }
  for (const w of G.warns)
    if (!w.friendly && w.dmg > 0 && w.t <= dt && w.kind !== 'line' && (w.x - A.x) ** 2 + (w.y - A.y) ** 2 < (w.r + hitR) ** 2) {
      apHit(w.dmg * AP_TAKE);
      break;
    }
}
/* 그리기(펫 다음) */
function drawAp() {
  const A = G.ap;
  if (!A || A.hidden) return;
  const pk = entK() * 0.8,
    s = charSpr(AP_KIDS[A.kid].look);
  shadow(A.x, A.y, 4 * pk);
  if (A.down) {
    b.save();
    b.translate(R(A.x), R(A.y - 4));
    b.rotate(Math.PI / 2);
    drawSpr(s, 0, 0, false, false, pk);
    b.restore();
    for (let i = 0; i < 3; i++) {
      const a = A.ph * 3 + (i * TAU) / 3;
      b.fillStyle = '#ffd76a';
      b.fillRect(R(A.x + Math.cos(a) * 6), R(A.y - 14 + Math.sin(a) * 2), 2, 2);
    }
    b.strokeStyle = 'rgba(224,176,72,0.35)';
    b.lineWidth = 1;
    b.beginPath();
    b.arc(R(A.x), R(A.y), AP_REV_R, 0, TAU);
    b.stroke();
    b.strokeStyle = '#9af0b0';
    b.lineWidth = 2;
    b.beginPath();
    b.arc(R(A.x), R(A.y), AP_REV_R, -Math.PI / 2, -Math.PI / 2 + TAU * A.rev);
    b.stroke();
    return;
  }
  const bob = Math.sin(A.ph * 10) > 0 ? -1 : 0;
  drawSpr(s, A.x, A.y + bob, (A.face || 1) < 0, A.white > 0, pk);
  // 머리 위 체력 막대
  const w = 12,
    x0 = R(A.x - w / 2),
    y0 = R(A.y - 22);
  b.fillStyle = 'rgba(0,0,0,0.6)';
  b.fillRect(x0 - 1, y0 - 1, w + 2, 4);
  b.fillStyle = A.hp / A.maxHp > 0.35 ? '#9af0b0' : '#ff8a6a';
  b.fillRect(x0, y0, Math.round((w * A.hp) / A.maxHp), 2);
}
/* 칸 줄(왼쪽 위) 앞에 붙는 견습 칸 둘 */
function apSlotsHTML() {
  const A = G && G.ap;
  if (!A) return '';
  const K = AP_KIDS[A.kid],
    W = AWD[A.w.id],
    seal = (g, col) => `<span class="seal" style="background:${col}">${g}</span>`;
  return (
    `<div class="slot" title="${K.n} · ${W.n}">${seal(W.g, W.col)}<b>${A.w.lv}</b></div>` +
    (A.p ? `<div class="slot" title="${K.n} · ${APD[A.p.id].n}">${seal(APD[A.p.id].g, APD[A.p.id].col)}<b>${A.p.lv}</b></div>` : '')
  );
}
/* ---- 레벨업 카드: 견습이 있으면 두 칸 ---- */
function apOpts(B) {
  const A = G.ap,
    l = [],
    ok = id => !B.has('ap:' + id); // 봉인 id는 'ap:'를 붙임(퇴마사 짚신·방울과 따로)
  if (!A) return l;
  if (A.w.lv < 5 && ok(A.w.id)) l.push({k: 'apw', id: A.w.id, wt: 1.4});
  for (const id in AWD) if (AWD[id].kid === A.kid && id !== A.w.id && ok(id)) l.push({k: 'apw', id, wt: 0.6});
  if (!A.p) for (const id in APD) if (ok(id)) l.push({k: 'app', id, wt: 0.8});
  if (A.p) {
    if (A.p.lv < 5 && ok(A.p.id)) l.push({k: 'app', id: A.p.id, wt: 1.2});
    for (const id in APD) if (id !== A.p.id && ok(id)) l.push({k: 'app', id, wt: 0.3});
  }
  if (A.w.lv >= 5 && (!A.p || A.p.lv >= 5)) l.push({k: 'aptr', id: 'aptr', wt: 1});
  return l;
}
function apPick2(B) {
  const pool = apOpts(B),
    out = [];
  while (out.length < 2 && pool.length) {
    const tot = pool.reduce((s, o) => s + o.wt, 0);
    let r = rand() * tot,
      i = 0;
    for (; i < pool.length - 1; i++) {
      r -= pool[i].wt;
      if (r <= 0) break;
    }
    out.push(pool.splice(i, 1)[0]);
  }
  if (out.length < 2 && !out.some(o => o.k === 'aptr')) out.push({k: 'aptr', id: 'aptr', wt: 1}); // 단련은 한 장만
  return out;
}
function apDecorate(o) {
  const A = G.ap,
    K = AP_KIDS[A.kid],
    seal = (g, col) => `<span class="seal" style="background:${col}">${g}</span>`;
  if (o.k === 'aptr')
    return {...o, ic: seal(K.g, K.col), name: _t('{n} 단련', {n: K.n}), desc: _t('견습의 피해 +5%. 끝없이 쌓을 수 있다.'), badge: _t('견습 · 단련 {p}', {p: (A.tr || 0) + 1}), bc: 'ap'};
  if (o.k === 'apw') {
    const D = AWD[o.id],
      same = A.w.id === o.id;
    return {
      ...o,
      ic: seal(D.g, D.col),
      name: same ? _t('{n}의 {w}', {n: K.n, w: D.n}) : _t('{n}에게 {w}', {n: K.n, w: D.n}),
      desc: D.d,
      badge: same ? _t('견습 · LV {a} → {b}', {a: A.w.lv, b: A.w.lv + 1}) : _t('견습 · 바꾸기 LV {a}', {a: Math.max(1, A.w.lv - 1)}),
      bc: 'ap'
    };
  }
  const D = APD[o.id],
    same = A.p && A.p.id === o.id;
  return {
    ...o,
    ic: seal(D.g, D.col),
    name: _t('{n}에게 {p}', {n: K.n, p: D.n}),
    desc: D.d,
    badge: same ? _t('견습 · LV {a} → {b}', {a: A.p.lv, b: A.p.lv + 1}) : A.p ? _t('견습 · 바꾸기 LV {a}', {a: Math.max(1, A.p.lv - 1)}) : _t('견습 · 새 보패'),
    bc: 'ap'
  };
}
function apApply(o) {
  const A = G.ap;
  if (!A) return;
  if (o.k === 'aptr') A.tr = (A.tr || 0) + 1;
  else if (o.k === 'apw') {
    if (A.w.id === o.id) A.w.lv = Math.min(5, A.w.lv + 1);
    else A.w = {id: o.id, lv: Math.max(1, A.w.lv - 1)};
  } else if (o.k === 'app') {
    if (A.p && A.p.id === o.id) A.p.lv = Math.min(5, A.p.lv + 1);
    else A.p = {id: o.id, lv: A.p ? Math.max(1, A.p.lv - 1) : 1};
    const m = apMaxHp();
    A.hp = Math.min(m, A.hp + Math.max(0, m - A.maxHp));
    A.maxHp = m;
  }
  refreshSlots();
}
/* ---- 등장: 북으로 간 뒤(처음엔 장면 2쪽) 고르기 ---- */
ENDING.apprentice = [
  // v22.1 번역 표(ENDING)에 함께 둠
  {
    eye: '견습 1/2',
    title: '길 어귀의 아이들',
    art: null, // apIntro가 그 판 퇴마사로 채움
    t: '북으로 떠나려는 새벽, 길 어귀에 아이 둘이 서 있었다. 장터에서 지게를 지던 복돌이와 나루터 주막집 딸 연이. 지난밤 요괴에게서 마을을 지켜 준 퇴마사를 기억하고 있었다.'
  },
  {
    eye: '견습 2/2',
    title: '저도 데려가 주세요',
    art: 'prop:scroll',
    t: '「심부름이라도 하겠어요. 위험하면 숨으라는 말도 꼭 들을게요.」 퇴마사는 한 아이에게만 고개를 끄덕였다. 압록강까지의 길에 견습 하나가 함께한다.'
  }
];
function apIntro(done) {
  const pick = () =>
    openPick('APPRENTICE', _t('견습 고르기'), _t('압록강까지 함께 갈 견습을 고른다. 견습은 레벨업 때 무기 하나·보패 하나를 키운다.'), [
      {
        ic: `<span class="seal" style="background:${AP_KIDS.boy.col}">${AP_KIDS.boy.g}</span>`,
        badge: _t('근접'),
        bc: 'ap',
        name: AP_KIDS.boy.n,
        desc: AP_KIDS.boy.d,
        f: () => {
          apStart('boy');
          meta.ap.seen = true;
          saveMeta();
          show(null);
          done();
        }
      },
      {
        ic: `<span class="seal" style="background:${AP_KIDS.girl.col}">${AP_KIDS.girl.g}</span>`,
        badge: _t('원거리'),
        bc: 'ap',
        name: AP_KIDS.girl.n,
        desc: AP_KIDS.girl.d,
        f: () => {
          apStart('girl');
          meta.ap.seen = true;
          saveMeta();
          show(null);
          done();
        }
      }
    ]);
  if (!meta.ap.seen) openScene(ENDING.apprentice.map((p, i) => (i ? p : {...p, art: 'ch:' + G.cid})), pick);
  else pick();
}
