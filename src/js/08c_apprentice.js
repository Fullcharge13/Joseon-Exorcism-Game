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
  AP_REV_T = 5,
  AP_CHASE = 105, // v22.2 움직이는 범위 +50%: 복돌이 쫓는 요괴는 퇴마사 105 안(예전 70)
  AP_LEASH = 90, //   복돌은 퇴마사에서 90까지(예전 60)
  AP_GIRL_OFF = 27; //   연이는 퇴마사 곁 27(예전 18)
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
/* v22.2 떡 나누기: 견습이 서 있고 체력이 덜 찼을 때만 */
function apCanEat() {
  const A = G.ap;
  return !!(A && !A.hidden && !A.down && A.hp < A.maxHp);
}
function apHeal(v) {
  const A = G.ap;
  if (!A) return;
  A.hp = Math.min(A.maxHp, A.hp + v);
  particle(A.x, A.y - 4, '#7fe0a0', 5, 30);
}
function apStart(kid, wid) {
  const P = G.P;
  if (!wid || !AWD[wid] || AWD[wid].kid !== kid) wid = kid === 'boy' ? 'mokgeom' : 'saechong';
  G.ap = {kid, w: {id: wid, lv: 1}, p: null, tr: 0, hp: 0, maxHp: AP_HP};
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
      G.fx.push({t: 'apw', w: 'mokgeom', x: A.x, y: A.y - 5, a, r: R0, face: A.face, life: 0.2, max: 0.2});
      for (const e of near(A.x, A.y, R0, TMP2).slice()) {
        let da = Math.atan2(e.y - A.y, e.x - A.x) - a;
        da = Math.atan2(Math.sin(da), Math.cos(da));
        if (Math.abs(da) < 1.1) hurt(e, dmg, 30, A.x, A.y, true);
      }
    } else if (w.id === 'dorikkae') {
      const R0 = D.r * area;
      G.fx.push({t: 'apw', w: 'dorikkae', x: A.x, y: A.y - 4, a, r: R0, life: 0.32, max: 0.32});
      for (const e of near(A.x, A.y, R0, TMP2).slice()) hurt(e, dmg, 40, A.x, A.y, true);
    } else if (w.id === 'jangdae') {
      const L = D.r * area;
      G.fx.push({t: 'apw', w: 'jangdae', x: A.x, y: A.y - 5, a, r: L, life: 0.22, max: 0.22});
      for (const e of G.enemies.slice())
        if (!e.dead && segDist(e.x, e.y, A.x, A.y - 4, A.x + Math.cos(a) * L, A.y - 4 + Math.sin(a) * L) < e.r + 4)
          hurt(e, dmg, 20, A.x, A.y, true);
    } else if (w.id === 'saechong') {
      G.fx.push({t: 'apw', w: 'saechong', x: A.x, y: A.y - 7, a, r: Math.hypot(tg.x - A.x, tg.y - A.y), life: 0.16, max: 0.16});
      hurt(tg, dmg, 15, A.x, A.y, true);
    } else if (w.id === 'daehwal') {
      const L = D.r * area,
        ex = A.x + Math.cos(a) * L,
        ey = A.y - 6 + Math.sin(a) * L;
      G.fx.push({t: 'apw', w: 'daehwal', x: A.x, y: A.y - 7, a, r: Math.min(L, Math.hypot(tg.x - A.x, tg.y - A.y) + 30), life: 0.24, max: 0.24});
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
        G.fx.push({t: 'apw', w: 'mulchong', x: A.x, y: A.y - 6, a: aa, r: L, life: 0.22, max: 0.22, sd: da});
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
  // 움직임: 소년은 퇴마사 105 안의 요괴에게 붙되 90을 넘지 않음 · 소녀는 곁 27에서(v22.2 +50%)
  const boy = A.kid === 'boy';
  const bo0 = [G.boss, G.mid].find(q => q && !q.dead && Math.hypot(q.x - P.x, q.y - P.y) < 90),
    tg = (boy && bo0) || apNearest(P.x, P.y, boy ? AP_CHASE : AWD[A.w.id].r); // 소년은 보스가 가까우면 보스 곁(거리는 apSafe가 지킴)
  let tx = P.x + (boy ? -16 : AP_GIRL_OFF),
    ty = P.y + 6;
  if (boy && tg) {
    const a = Math.atan2(A.y - tg.y, A.x - tg.x);
    tx = tg.x + Math.cos(a) * 10;
    ty = tg.y + Math.sin(a) * 10;
    const dx = tx - P.x,
      dy = ty - P.y,
      d = Math.hypot(dx, dy);
    if (d > AP_LEASH) {
      tx = P.x + (dx / d) * AP_LEASH;
      ty = P.y + (dy / d) * AP_LEASH;
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
/* v22.2 견습 공격 그림(fx 't: apw'): 무기마다 손에 든 것이 실제로 움직이게. t = 0 → 1 진행 */
function drawApFx(f) {
  const t = clamp(1 - f.life / f.max, 0, 1),
    fade = clamp(f.life / f.max, 0, 1) * 1.6,
    ca = Math.cos(f.a),
    sa = Math.sin(f.a);
  b.save();
  b.globalAlpha = Math.min(1, fade);
  if (f.w === 'mokgeom') {
    // 휘두른 자리에 굵은 반달 자국 + 목검
    const a0 = f.a - 1.1,
      cur = a0 + 2.2 * Math.min(1, t * 1.6),
      R0 = f.r * 0.85;
    b.strokeStyle = 'rgba(255,244,210,0.85)';
    b.lineWidth = 5;
    b.beginPath();
    b.arc(f.x, f.y, R0 * 0.75, a0, cur);
    b.stroke();
    b.strokeStyle = '#e0b048';
    b.lineWidth = 1;
    b.beginPath();
    b.arc(f.x, f.y, R0 * 0.95, a0 + 0.2, cur);
    b.stroke();
    b.strokeStyle = '#8a6a3a';
    b.lineWidth = 3;
    b.beginPath();
    b.moveTo(f.x + Math.cos(cur) * 4, f.y + Math.sin(cur) * 4);
    b.lineTo(f.x + Math.cos(cur) * R0, f.y + Math.sin(cur) * R0);
    b.stroke();
  } else if (f.w === 'dorikkae') {
    // 도리깨 머리가 한 바퀴 돌며 꼬리 자국
    const R0 = f.r * 0.8,
      cur = f.a + TAU * t;
    b.strokeStyle = 'rgba(200,160,112,0.55)';
    b.lineWidth = 4;
    b.beginPath();
    b.ellipse(f.x, f.y, R0, R0 * 0.8, 0, cur - 1.6, cur);
    b.stroke();
    const hx = f.x + Math.cos(cur) * R0,
      hy = f.y + Math.sin(cur) * R0 * 0.8;
    b.strokeStyle = '#6a5a3a';
    b.lineWidth = 3;
    b.beginPath();
    b.moveTo(f.x, f.y);
    b.lineTo(hx, hy);
    b.stroke();
    b.fillStyle = '#c8a070';
    b.fillRect(R(hx) - 4, R(hy) - 4, 8, 8);
    b.fillStyle = '#5a4a2a';
    b.fillRect(R(hx) - 2, R(hy) - 2, 4, 4);
  } else if (f.w === 'jangdae') {
    // 장대가 쭉 나갔다 돌아옴 + 찌른 줄
    const ext = f.r * (t < 0.45 ? t / 0.45 : 1 - ((t - 0.45) / 0.55) * 0.7),
      ex = f.x + ca * ext,
      ey = f.y + sa * ext;
    b.strokeStyle = 'rgba(255,244,210,0.5)';
    b.lineWidth = 6;
    b.beginPath();
    b.moveTo(f.x + ca * ext * 0.4, f.y + sa * ext * 0.4);
    b.lineTo(ex, ey);
    b.stroke();
    b.strokeStyle = '#7a8a4a';
    b.lineWidth = 3;
    b.beginPath();
    b.moveTo(f.x - ca * 6, f.y - sa * 6);
    b.lineTo(ex, ey);
    b.stroke();
    b.fillStyle = '#efe6d2';
    b.beginPath();
    b.moveTo(ex + ca * 6, ey + sa * 6);
    b.lineTo(ex - sa * 3, ey + ca * 3);
    b.lineTo(ex + sa * 3, ey - ca * 3);
    b.fill();
  } else if (f.w === 'saechong' || f.w === 'daehwal') {
    // 돌·화살이 날아감 + 꼬리
    const d = f.r * Math.min(1, f.w === 'daehwal' ? t * 1.15 : t * 1.4),
      px = f.x + ca * d,
      py = f.y + sa * d;
    b.strokeStyle = f.w === 'saechong' ? 'rgba(200,190,160,0.6)' : 'rgba(255,250,220,0.7)';
    b.lineWidth = 2;
    b.beginPath();
    b.moveTo(f.x + ca * Math.max(0, d - 22), f.y + sa * Math.max(0, d - 22));
    b.lineTo(px, py);
    b.stroke();
    if (f.w === 'saechong') {
      b.fillStyle = '#9a9488';
      b.fillRect(R(px) - 2, R(py) - 2, 4, 4);
      b.fillStyle = '#d8d0c0';
      b.fillRect(R(px) - 2, R(py) - 2, 2, 2);
      if (t > 0.7) {
        b.fillStyle = 'rgba(216,208,192,0.8)';
        for (let i = 0; i < 4; i++) b.fillRect(R(px + Math.cos(i * 1.7) * (t - 0.7) * 20), R(py + Math.sin(i * 1.7) * (t - 0.7) * 16), 2, 2);
      }
    } else {
      b.strokeStyle = '#8a6a3a';
      b.lineWidth = 2;
      b.beginPath();
      b.moveTo(px - ca * 10, py - sa * 10);
      b.lineTo(px, py);
      b.stroke();
      b.fillStyle = '#efe6d2';
      b.beginPath();
      b.moveTo(px + ca * 4, py + sa * 4);
      b.lineTo(px - sa * 2.5, py + ca * 2.5);
      b.lineTo(px + sa * 2.5, py - ca * 2.5);
      b.fill();
      b.fillStyle = '#c23b2a';
      b.fillRect(R(px - ca * 10) - 1, R(py - sa * 10) - 1, 3, 3);
    }
  } else if (f.w === 'mulchong') {
    // 굵은 물줄기 + 끝에서 튀는 물방울
    const d = f.r * Math.min(1, t * 2),
      ex = f.x + ca * d,
      ey = f.y + sa * d;
    b.strokeStyle = 'rgba(143,211,255,0.75)';
    b.lineWidth = 4;
    b.beginPath();
    b.moveTo(f.x, f.y);
    b.lineTo(ex, ey);
    b.stroke();
    b.strokeStyle = '#ffffff';
    b.lineWidth = 1;
    b.stroke();
    if (t > 0.45) {
      b.fillStyle = '#bfe6ff';
      const u = (t - 0.45) / 0.55;
      for (let i = 0; i < 4; i++) {
        const q = f.a + (i - 1.5) * 0.6 + (f.sd || 0);
        b.fillRect(R(ex + Math.cos(q) * u * 10), R(ey + Math.sin(q) * u * 8 + u * u * 6), 2, 2);
      }
    }
  }
  b.restore();
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
  const lg = A.swing > 0 ? Math.round(2 * Math.sin((A.swing / 0.15) * Math.PI)) * (A.face || 1) : 0; // v22.2 쏠 때 앞으로 살짝 내딛음
  drawSpr(s, A.x + lg, A.y + bob, (A.face || 1) < 0, A.white > 0, pk);
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
/* v22.2 상태창 「견습」 탭 */
function apStatusHTML() {
  const A = G.ap;
  if (!A) return '';
  const K = AP_KIDS[A.kid],
    W = AWD[A.w.id],
    seal = (g, col) => `<span class="seal" style="background:${col}">${g}</span>`,
    num = v => (v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e4 ? Math.round(v / 1e3) + 'k' : Math.round(v)),
    hpP = Math.max(0, Math.min(100, (A.hp / A.maxHp) * 100)),
    state = A.hidden ? _t('덤불 뒤에 숨음 · 다음 막에 돌아옴') : A.down ? _t('기절 · 곁에서 치료 {p}%', {p: Math.round(A.rev * 100)}) : _t('함께 싸우는 중'),
    rr = W.r * (1 + 0.1 * apLv('bangul')),
    cd = W.cd / (1 + 0.08 * apLv('jipsin'));
  let h = hcard(
    _t('{n} <small>견습 · {k}</small>', {n: K.n, k: A.kid === 'boy' ? _t('근접') : _t('원거리')}),
    _t(
      '<div class="strow"><span class="ic"><img src="{p}" alt=""></span><div><p><b>{st}</b></p><p>체력 {hp}/{mhp}</p><div style="height:6px;margin:4px 0;background:rgba(0,0,0,.15)"><i style="display:block;height:100%;width:{hpP}%;background:#c23b2a"></i></div><p>이번 막 기절 {d} / 3 · 단련 {tr}</p></div><div></div></div>',
      {p: big(charSpr(K.look).n, 3), st: state, hp: Math.ceil(A.hp), mhp: Math.round(A.maxHp), hpP, d: A.downs || 0, tr: A.tr || 0}
    )
  );
  h += hcard(
    _t('무기'),
    _t(
      '<div class="strow"><span class="ic">{ic}</span><div><p><b>{n}</b> <small>Lv {lv}/5</small></p><p>{d}</p><p><small>한 번 {dm} · 재사용 {cd}초 · 거리 {r} · 보스 한도 퇴마사의 {cap}%</small></p></div>{box}</div>',
      {ic: seal(W.g, W.col), n: W.n, lv: A.w.lv, d: W.d, dm: num(apDmg(A.w)), cd: cd.toFixed(2), r: Math.round(rr), cap: Math.round(apBossCapF() * 100), box: stDmgBox('ap:' + A.w.id)}
    )
  );
  h += hcard(
    _t('보패'),
    A.p
      ? _t('<div class="strow"><span class="ic">{ic}</span><div><p><b>{n}</b> <small>Lv {lv}/5</small></p><p>{d}</p></div><div class="dm"><strong>{lv2}</strong>단계</div></div>', {
          ic: seal(APD[A.p.id].g, APD[A.p.id].col),
          n: APD[A.p.id].n,
          lv: A.p.lv,
          d: APD[A.p.id].d,
          lv2: A.p.lv
        })
      : _t('<p>아직 보패가 없다. 다음 견습 레벨업 카드에서 고른다.</p>')
  );
  return h;
}
/* ---- 레벨업 카드: 견습이 있으면 두 칸 ---- */
function apOpts(B) {
  const A = G.ap,
    l = [],
    ok = id => !B.has('ap:' + id); // 봉인 id는 'ap:'를 붙임(퇴마사 짚신·방울과 따로)
  if (!A) return l;
  // v22.2 바꾸기 없음: 무기는 견습을 고를 때 정했고, 보패는 처음 하나를 고른 뒤 올리기만
  if (A.w.lv < 5 && ok(A.w.id)) l.push({k: 'apw', id: A.w.id, wt: 1});
  if (!A.p) for (const id in APD) if (ok(id)) l.push({k: 'app', id, wt: 1});
  if (A.p && A.p.lv < 5 && ok(A.p.id)) l.push({k: 'app', id: A.p.id, wt: 1});
  if (A.w.lv >= 5 && A.p && A.p.lv >= 5) l.push({k: 'aptr', id: 'aptr', wt: 1});
  return l;
}
function apPick2(B) {
  let pool = apOpts(B);
  const out = [];
  if (G.ap && !G.ap.p && pool.some(o => o.k === 'app')) pool = pool.filter(o => o.k === 'app'); // 첫 보패는 4개 가운데 둘 중 고르기
  while (out.length < 2 && pool.length) out.push(pool.splice((rand() * pool.length) | 0, 1)[0]);
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
/* v22.2 견습을 고른 뒤 그 아이의 무기 셋 가운데 하나(그 뒤로는 바꾸지 않고 올리기만) */
function apWeaponPick(kid, done) {
  const K = AP_KIDS[kid];
  openPick(
    'APPRENTICE WEAPON',
    _t('{n}의 무기', {n: K.n}),
    _t('{n:이} 압록강까지 들고 갈 무기 하나를 고른다. 레벨업 때 바꾸지 않고 키운다.', {n: K.n}),
    Object.keys(AWD)
      .filter(id => AWD[id].kid === kid)
      .map(id => ({
        ic: `<span class="seal" style="background:${AWD[id].col}">${AWD[id].g}</span>`,
        badge: _t('견습 무기'),
        bc: 'ap',
        name: AWD[id].n,
        desc: AWD[id].d,
        f: () => {
          apStart(kid, id);
          meta.ap.seen = true;
          saveMeta();
          show(null);
          done();
        }
      }))
  );
}
function apIntro(done) {
  const pick = () =>
    openPick('APPRENTICE', _t('견습 고르기'), _t('압록강까지 함께 갈 견습을 고른다. 다음 창에서 그 아이의 무기를 고르고, 레벨업 때 무기 하나·보패 하나를 키운다.'), [
      {
        ic: `<span class="seal" style="background:${AP_KIDS.boy.col}">${AP_KIDS.boy.g}</span>`,
        badge: _t('근접'),
        bc: 'ap',
        name: AP_KIDS.boy.n,
        desc: AP_KIDS.boy.d,
        f: () => apWeaponPick('boy', done)
      },
      {
        ic: `<span class="seal" style="background:${AP_KIDS.girl.col}">${AP_KIDS.girl.g}</span>`,
        badge: _t('원거리'),
        bc: 'ap',
        name: AP_KIDS.girl.n,
        desc: AP_KIDS.girl.d,
        f: () => apWeaponPick('girl', done)
      }
    ]);
  if (!meta.ap.seen) openScene(ENDING.apprentice.map((p, i) => (i ? p : {...p, art: 'ch:' + G.cid})), pick);
  else pick();
}
