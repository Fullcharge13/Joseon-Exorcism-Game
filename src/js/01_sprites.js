/* ======================= pixel sprite toolkit ======================= */
const PAL = {
  k: '#1a1418',
  w: '#efe6d2',
  s: '#e8b98f',
  r: '#c23b2a',
  R: '#7a2018',
  g: '#3f9a5a',
  G: '#1d4d42',
  b: '#3a5f9e',
  B: '#1a2b4a',
  y: '#e0b048',
  o: '#b0702e',
  n: '#4a3a30',
  x: '#8a8494',
  X: '#4a4552',
  c: '#8fd3ff',
  p: '#b07fd0'
};
function mk(rows, pal = PAL) {
  const h = rows.length,
    w = Math.max(...rows.map(r => r.length));
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d');
  rows.forEach((r, j) => {
    for (let i = 0; i < r.length; i++) {
      const ch = r[i];
      if (ch !== '.' && pal[ch]) {
        x.fillStyle = pal[ch];
        x.fillRect(i, j, 1, 1);
      }
    }
  });
  return c;
}
/* v18.6 그림 다듬기(설계 docs/specs/2026-11-02-그림-다듬기.md): 둘레 1칸 여백 · 바깥 빈칸에만 테두리 · 안에 갇힌 빈칸과 1칸 골목은 비움.
   v20.5부터 테두리·가장자리 색은 색조 이동(아래 hueShift): 위·왼쪽 가장자리는 밝게, 아래·오른쪽은 어둡게, 짙은 칸·한 칸 무늬는 그대로 */
const REFINE_RIM = [122, 100, 108]; // v18.6.1 검은 요괴 테두리: 붉은 기 도는 밝은 회색(밤 바닥 위에서 보이게)
/* v20.5 은은한 색조 이동(설계 docs/specs/2026-11-03-그림-다듬기-v20.5.md · 생각은 github.com/mankidev/codixel(MIT)의
   hueRamp·selout·rimLight에서 빌리고 코드는 새로 씀): 밝게 할수록 노랑(50°) 쪽, 어둡게 할수록 파랑(250°) 쪽으로 조금 돌리고 채도를 줄인다 */
const REFINE_LIT = 0.1, // 빛 받는 가장자리(위·왼쪽) 밝기 +
  REFINE_SHADE = -0.12, // 그림자 가장자리(아래·오른쪽) 밝기 −
  REFINE_OUT_LIT = 0.55, // 빛 쪽 테두리(몸이 오른쪽·아래): 밝기 × (예전 테두리 × 0.45와 비슷한 짙기)
  REFINE_OUT_SHADE = 0.4, // 그림자 쪽 테두리: 밝기 ×
  REFINE_HUE_MAX = 15 / 360; // 색조는 15°까지만(은은하게 — 주황 테두리가 빨갛게 돌지 않게)
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const M = Math.max(r, g, b),
    m = Math.min(r, g, b),
    l = (M + m) / 2;
  if (M === m) return [0, 0, l];
  const d = M - m,
    s = l > 0.5 ? d / (2 - M - m) : d / (M + m);
  let h = M === r ? (g - b) / d + (g < b ? 6 : 0) : M === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
}
function hslToRgb(h, s, l) {
  if (!s) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s,
    p = 2 * l - q,
    f = t => {
      t = (t + 1) % 1;
      return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p;
    };
  return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
}
/* dl: 밝기 변화(+ 노랑 쪽, − 파랑 쪽). lMul을 주면 밝기는 곱으로(테두리), 색조·채도는 dl 세기로.
   같은 색·같은 세기는 한 번만 계산해 기억(v20.5: 그림을 처음 만드는 시간이 1.9배로 늘어 설계의 대비책대로) */
const HUE_MEMO = new Map();
function hueShift(c, dl, lMul) {
  const r0 = Math.round(c[0]),
    g0 = Math.round(c[1]),
    b0 = Math.round(c[2]),
    key = (r0 + g0 * 256 + b0 * 65536) * 4 + (dl > 0 ? 0 : lMul === undefined ? 1 : lMul === REFINE_OUT_LIT ? 2 : 3), // 수로 된 열쇠(글자 열쇠는 느림)
    hit = HUE_MEMO.get(key);
  if (hit) return hit;
  const out = hueShiftRaw([r0, g0, b0], dl, lMul);
  HUE_MEMO.set(key, out);
  return out;
}
function hueShiftRaw(c, dl, lMul) {
  let [h, s, l] = rgbToHsl(c[0], c[1], c[2]);
  const a = Math.abs(dl),
    dh = (((dl < 0 ? 250 / 360 : 50 / 360) - h + 1.5) % 1) - 0.5; // 목표까지 가까운 쪽으로
  if (s > 0) h = (h + Math.max(-REFINE_HUE_MAX, Math.min(REFINE_HUE_MAX, dh * Math.min(1, a * 1.6) * 0.35)) + 1) % 1; // 목표 쪽으로 최대 35%, 15°까지
  s *= 1 - a * 0.5;
  l = Math.min(1, Math.max(0, lMul !== undefined ? l * lMul : l + dl));
  // 색 짙기(채도×밝기 폭)가 원래보다 커지지 않게: 연한 흰 옷이 분홍으로, 갈색 머리가 주황으로 물들던 것을 막음(v20.5 캡처에서 찾음)
  const c0 = (Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2])) / 255,
    k = 1 - Math.abs(2 * l - 1);
  if (k > 0 && s * k > c0) s = c0 / k;
  return hslToRgb(h, s, l);
}
function refinePix(src, w, h) {
  const W = w + 2,
    H = h + 2,
    d = new Uint8ClampedArray(W * H * 4),
    A = new Uint8Array(W * H),
    out = new Uint8Array(W * H);
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) {
      const p = (j * w + i) * 4;
      if (src[p + 3] > 0) {
        const q = (j + 1) * W + i + 1;
        A[q] = 1;
        d.set([src[p], src[p + 1], src[p + 2], src[p + 3]], q * 4);
      }
    }
  let nOp = 0,
    nDk = 0;
  for (let i = 0; i < w * h; i++)
    if (src[i * 4 + 3] > 0) {
      nOp++;
      if (0.2126 * src[i * 4] + 0.7152 * src[i * 4 + 1] + 0.0722 * src[i * 4 + 2] < 60) nDk++;
    }
  const darkSpr = nOp > 0 && nDk > nOp * 0.6; // 몸의 60% 넘게 짙으면 검은 요괴
  const st = [];
  for (let i = 0; i < W; i++) {
    st.push(i, (H - 1) * W + i);
  }
  for (let j = 0; j < H; j++) {
    st.push(j * W, j * W + W - 1);
  }
  while (st.length) {
    const q = st.pop();
    if (out[q] || A[q]) continue;
    out[q] = 1;
    const x = q % W,
      y = (q - x) / W;
    if (x > 0) st.push(q - 1);
    if (x < W - 1) st.push(q + 1);
    if (y > 0) st.push(q - W);
    if (y < H - 1) st.push(q + W);
  }
  const isA = (x, y) => x >= 0 && y >= 0 && x < W && y < H && A[y * W + x] === 1,
    isO = (x, y) => x < 0 || y < 0 || x >= W || y >= H || out[y * W + x] === 1;
  const res = new Uint8ClampedArray(d);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const q = y * W + x,
        p = q * 4;
      if (out[q]) {
        const L = isA(x - 1, y),
          Rr = isA(x + 1, y),
          U = isA(x, y - 1),
          D = isA(x, y + 1);
        if (!(L || Rr || U || D) || (L && Rr) || (U && D)) continue;
        let r = 0,
          g = 0,
          bb = 0,
          n = 0,
          lit = false;
        for (const [a, b2, li] of [
          [x - 1, y, 0],
          [x + 1, y, 1],
          [x, y - 1, 0],
          [x, y + 1, 1]
        ])
          if (isA(a, b2)) {
            const k = (b2 * W + a) * 4;
            if (0.2126 * d[k] + 0.7152 * d[k + 1] + 0.0722 * d[k + 2] < 60) continue;
            r += d[k];
            g += d[k + 1];
            bb += d[k + 2];
            n++;
            if (li) lit = true; // 몸이 오른쪽·아래 = 이 테두리는 몸의 위·왼쪽(빛 쪽). 둘 다면 빛 쪽
          }
        if (!n) {
          if (darkSpr) {
            res[p] = REFINE_RIM[0];
            res[p + 1] = REFINE_RIM[1];
            res[p + 2] = REFINE_RIM[2];
            res[p + 3] = 255;
          }
          continue;
        } // 짙은 색에만 닿으면 테두리 없음(갓·눈처럼 이미 짙은 가장자리가 두꺼워져 뭉개지지 않게). 단 검은 요괴는 밝은 테두리
        const oc = hueShift([r / n, g / n, bb / n], -0.4, lit ? REFINE_OUT_LIT : REFINE_OUT_SHADE);
        res[p] = oc[0];
        res[p + 1] = oc[1];
        res[p + 2] = oc[2];
        res[p + 3] = 255;
        continue;
      }
      if (!A[q]) continue;
      const lum = 0.2126 * d[p] + 0.7152 * d[p + 1] + 0.0722 * d[p + 2];
      if (lum < 60) continue; // 짙은 칸(갓·눈·머리카락)은 그대로
      const lt = isO(x, y - 1) || isO(x - 1, y),
        sh = !lt && (isO(x, y + 1) || isO(x + 1, y));
      if (!lt && !sh) continue;
      // 한 칸 무늬(입·볼·단추): 몸 이웃 셋 이상이 다른 색이면 그대로
      const dif = (a, b2) => {
        if (!isA(a, b2)) return 0;
        const k = (b2 * W + a) * 4;
        return d[k] !== d[p] || d[k + 1] !== d[p + 1] || d[k + 2] !== d[p + 2] ? 1 : 0;
      };
      if (dif(x - 1, y) + dif(x + 1, y) + dif(x, y - 1) + dif(x, y + 1) >= 3) continue;
      const c = hueShift([d[p], d[p + 1], d[p + 2]], lt ? REFINE_LIT : REFINE_SHADE);
      res[p] = c[0];
      res[p + 1] = c[1];
      res[p + 2] = c[2];
    }
  return {data: res, w: W, h: H};
}
const REFINE_ERR = []; // 실제 브라우저에서 다듬기가 실패하면 숨기지 않고 모아 둔다(브라우저 시험이 비어 있는지 본다)
function refineCanvas(c) {
  const o = document.createElement('canvas');
  o.width = c.width + 2;
  o.height = c.height + 2;
  const x = o.getContext('2d'),
    cx = c.getContext('2d');
  if (typeof cx.getImageData !== 'function' || typeof x.createImageData !== 'function') {
    x.drawImage(c, 1, 1);
    return o;
  } // 점 읽기가 없는 곳(시험용 가짜 화면)만 여백만 둔 그림
  try {
    const s = cx.getImageData(0, 0, c.width, c.height),
      r = refinePix(s.data, c.width, c.height),
      im = x.createImageData(r.w, r.h);
    im.data.set(r.data);
    x.putImageData(im, 0, 0);
  } catch (e) {
    REFINE_ERR.push(String((e && e.message) || e));
    x.clearRect(0, 0, o.width, o.height);
    x.drawImage(c, 1, 1);
  }
  return o;
}
function refineOn() {
  return !(typeof meta !== 'undefined' && meta.set && meta.set.refine === 'off');
}
function variants(c) {
  const flip = c0 => {
    const f = document.createElement('canvas');
    f.width = c0.width;
    f.height = c0.height;
    const fx = f.getContext('2d');
    fx.translate(c0.width, 0);
    fx.scale(-1, 1);
    fx.drawImage(c0, 0, 0);
    return f;
  };
  const wh = c2 => {
    const h = document.createElement('canvas');
    h.width = c2.width;
    h.height = c2.height;
    const hx = h.getContext('2d');
    hx.drawImage(c2, 0, 0);
    hx.globalCompositeOperation = 'source-atop';
    hx.fillStyle = '#fff';
    hx.fillRect(0, 0, c2.width, c2.height);
    return h;
  };
  const f = flip(c),
    R0 = {n: c, f, h: wh(c), hf: wh(f)};
  let R1 = null;
  /* 다듬은 네 장은 처음 쓸 때 만든다(끔이면 만들지 않음). 뒤집힌 그림은 뒤집은 뒤에 다듬어, 어느 쪽을 보든 아래·오른쪽이 어둡다(빛이 늘 왼쪽 위) */
  const ref = () => {
      if (!R1) {
        const rc = refineCanvas(c),
          rf = refineCanvas(f);
        R1 = {n: rc, f: rf, h: wh(rc), hf: wh(rf)};
      }
      return R1;
    },
    pick = k => () => (refineOn() ? ref() : R0)[k];
  return Object.defineProperties(
    {w: c.width, hgt: c.height, raw: R0},
    {
      ref: {get: ref},
      n: {get: pick('n'), enumerable: true},
      f: {get: pick('f'), enumerable: true},
      h: {get: pick('h'), enumerable: true},
      hf: {get: pick('hf'), enumerable: true},
      pad: {get: () => (refineOn() ? 1 : 0), enumerable: true}
    }
  );
}
function big(c, s) {
  const o = document.createElement('canvas');
  o.width = c.width * s;
  o.height = c.height * s;
  const x = o.getContext('2d');
  x.imageSmoothingEnabled = false;
  x.drawImage(c, 0, 0, o.width, o.height);
  return o.toDataURL();
}

/* --- character composer: hat + face + robe + held item, so every class tier has its own look --- */
const HATS = {
  gat: ['...HHHH...', '...HHHH...', 'HHHHHHHHHH'],
  samo: ['...HHHH...', 'hH.HHHH.Hh', '...HHHH...'],
  jeongja: ['..H.H.H...', '..HHHHH...', '..HHHHHH..'],
  tang: ['..........', '...HHHH...', '...HHHH...'],
  flower: ['..hHHHHh..', '.HHHHHHHH.', '..........'],
  gokkal: ['....H.....', '...HHH....', '..HHHHH...'],
  jeonrip: ['....hh....', '..HHHHHH..', 'HHHHHHHHHH'],
  helm: ['....hh....', '...HHHH...', '..HHHHHH..'],
  crown: ['.h.h.h.h..', '.HHHHHHHH.', '..........'],
  hood: ['..HHHHHH..', '.HHHHHHHH.', '.HH....HH.'],
  gache: ['.HHHHHHHH.', 'HHhHHHHhHH', '.HH....HH.'],
  hwagwan: ['.hrhrhrh..', '.HHHHHHHH.', '..H....H..'],
  jokduri: ['...hhh....', '..hHhHh...', '.HHHHHHHH.'],
  paraengi: ['...HHHH...', 'h.HHHHHH.h', 'HHHHHHHHHH']
};
const FACE = ['...ssss...', '...sksk...', '...ssss...'];
const BODY = ['..AAAAAA..', '.AAATTAAA.', '.sAAAAAAs.', '..ALLLLA..', '..AAAAAA..', '..AA..AA..', '..kk..kk..'];
const col = (x, y0, y1, c) => {
  const a = [];
  for (let y = y0; y <= y1; y++) a.push([x, y, c]);
  return a;
};
const ITEMS = {
  brush: [
    [10, 6, 'k'],
    [10, 7, 'n'],
    [10, 8, 'n'],
    [10, 9, 'n']
  ],
  book: [
    [10, 8, 'b'],
    [11, 8, 'b'],
    [10, 9, 'w'],
    [11, 9, 'b']
  ],
  bag: [
    [10, 9, 'o'],
    [11, 9, 'o'],
    [10, 10, 'o'],
    [11, 10, 'n']
  ],
  fan: [
    [10, 6, 'y'],
    [11, 6, 'y'],
    [10, 7, 'y'],
    [11, 7, 'r'],
    [10, 8, 'n']
  ],
  bell: [
    [10, 8, 'n'],
    [10, 9, 'y'],
    [11, 9, 'y'],
    [10, 10, 'y'],
    [11, 10, 'y']
  ],
  sword: [...col(11, 2, 7, 'x'), [10, 8, 'y'], [11, 8, 'y'], [11, 9, 'n']],
  bow: [[10, 3, 'o'], ...col(11, 4, 9, 'o'), [10, 10, 'o'], ...col(10, 4, 9, 'w')],
  spear: [[11, 0, 'x'], [11, 1, 'x'], [11, 2, 'r'], ...col(11, 3, 12, 'n')],
  mapae: [
    [10, 8, 'y'],
    [11, 8, 'y'],
    [10, 9, 'y'],
    [11, 9, 'o']
  ],
  staff: [[11, 0, 'y'], ...col(11, 1, 12, 'o')],
  gourd: [
    [10, 7, 'n'],
    [10, 8, 'p'],
    [10, 9, 'p'],
    [11, 9, 'p'],
    [10, 10, 'p'],
    [11, 10, 'p']
  ],
  cloth: [...col(11, 3, 12, 'w'), ...col(10, 4, 8, 'w')],
  gayageum: [
    [10, 7, 'o'],
    [11, 7, 'o'],
    [10, 8, 'o'],
    [11, 8, 'w'],
    [10, 9, 'o'],
    [11, 9, 'w'],
    [10, 10, 'n']
  ],
  flag: [...col(10, 0, 12, 'n'), [11, 0, 'r'], [11, 1, 'r'], [11, 2, 'y'], [11, 3, 'r']],
  abacus: [
    [10, 7, 'o'],
    [11, 7, 'o'],
    [10, 8, 'y'],
    [11, 8, 'k'],
    [10, 9, 'k'],
    [11, 9, 'y'],
    [10, 10, 'o'],
    [11, 10, 'o']
  ],
  pouch: [
    [10, 8, 'n'],
    [10, 9, 'y'],
    [11, 9, 'y'],
    [10, 10, 'o'],
    [11, 10, 'y']
  ],
  jige: [...col(11, 2, 11, 'o'), [10, 4, 'o'], [10, 8, 'o'], [11, 12, 'o']],
  mulmi: [...col(11, 0, 11, 'n'), [11, 12, 'x']]
};
const charCache = {};
function charSpr(L) {
  const key = JSON.stringify(L);
  if (charCache[key]) return charCache[key];
  const pal = {
    ...PAL,
    H: L.H || '#1a1418',
    h: L.h || '#e0b048',
    A: L.A,
    T: L.T || L.A,
    L: L.L || '#1a1418',
    C: L.C || L.A
  };
  const g = [...HATS[L.hat], ...FACE, ...BODY].map(r => ('.' + r + '.').split(''));
  if (L.C)
    for (let j = 7; j <= 10; j++) {
      g[j][1] = 'C';
      g[j][10] = 'C';
    }
  for (const [x, y, c] of ITEMS[L.item] || []) g[y][x] = c;
  return (charCache[key] = variants(
    mk(
      g.map(r => r.join('')),
      pal
    )
  ));
}

/* --- monster templates (A = main colour, B = secondary) --- */
const TPL = {
  wisp: ['...A...', '..AAA..', '.ABABA.', '.AAABA.', 'ABAwABA', 'ABwwwBA', '.AwwwA.', '..AAA..'],
  blob: ['..AAAA..', '.AAAAAA.', 'AAwAAwAA', 'AArAArAA', 'AAAAAAAA', '.AAAAAA.', 'A.A..A.A'],
  goblin: [
    '....y.....',
    '...AAA....',
    '..AAAAAB..',
    '..AwAwAB..',
    '..AAAAA.B.',
    '..ArrrA.B.',
    '.AAAAAAA..',
    '.A.AAA.A..',
    '...AAA....',
    '...A.A....',
    '..kk.kk...'
  ],
  ghost: [
    '..kkkk..',
    '.kkkkkk.',
    '.kAkkAk.',
    '.kAAAAk.',
    '.krAArk.',
    '.kAAAAk.',
    '.BBBBBB.',
    'BBBBBBBB',
    '.BBBBBB.',
    '.BBBBBB.',
    '..B.BB.B',
    '.B..B...'
  ],
  ghostHat: [
    '..kkkk..',
    '..kkkk..',
    'kkkkkkkk',
    '..AAAA..',
    '..ArAr..',
    '..AAAA..',
    '.BBBBBB.',
    'BBBBBBBB',
    '.BBBBBB.',
    '.BBBBBB.',
    '..B.BB.B',
    '.B..B...'
  ],
  egg: [
    '..AAAA..',
    '.AAAAAA.',
    '.AAAAAA.',
    '.AAAAAA.',
    '..AAAA..',
    '.BBBBBB.',
    'BBBBBBBB',
    'sBBBBBBs',
    '.BB..BB.',
    '.kk..kk.'
  ],
  fox: [
    '.A.A........',
    '.AAA......ww',
    'AAkAA....wAw',
    'AAAAAAAAAAA.',
    '.AAAAAAAAA..',
    '.AwwAAAAAA..',
    '..A.A..A.A..',
    '..k.k..k.k..'
  ],
  fox9: [
    '.A.A......ww',
    '.AAA.....wAw',
    'AAkAA...wwAw',
    'AAAAAAAAAAAw',
    '.AAAAAAAAAww',
    '.AwwAAAAAA..',
    '..A.A..A.A..',
    '..k.k..k.k..'
  ],
  dog: ['.A........', 'AAA.......', 'AkAA...A..', 'AAAAAAAAA.', '.AAAAAAAAA', '.ABAAAAAA.', '.A.A..A.A.', '.k.k..k.k.'],
  dog3: [
    '.A........',
    'AAA.......',
    'rkrA...A..',
    'AAAAAAAAA.',
    '.AAAAAAAAA',
    '.ABAAAAAA.',
    '.A.A..A.A.',
    '.k.k..k.k.'
  ],
  tiger: [
    '.A.A........',
    '.AAA.....AA.',
    'AkAkA...A...',
    'AAwAAAAAA...',
    '.AAAAAAAAA..',
    '.ABABABABA..',
    '.AAAAAAAAA..',
    '.A.A...A.A..',
    '.k.k...k.k..'
  ],
  rat: ['.A.A.....', 'AAAA.....', 'AkAAAAA..', 'AAAAAAAAB', '.k.k.k...'],
  fishman: [
    '..AAAA..',
    '.AkAAkA.',
    '.AAAAAA.',
    '..AwwA..',
    '.BBBBBB.',
    'BABBBBAB',
    '.BBBBBB.',
    '..BBBB..',
    '..B..B..',
    '.B....B.',
    'BB....BB'
  ],
  fish: ['....B.....', '.AAAAAA..B', 'AkAAAAAABB', 'AAAAAAAAAB', '.AwwwAA..B', '....B.....'],
  bird: [
    'A........A',
    'AA......AA',
    'AAA.ss.AAA',
    '.AAsssAAA.',
    '..AskksA..',
    '...ArrA...',
    '...A..A...',
    '..k....k..'
  ],
  worm: ['..A..A..', '.AAAAAA.', 'AkABABAA', 'AAAAAAA.', '.A.A.A..'],
  worm4: ['A.A..A.A', 'AAAAAAAA', 'kAkAAkAk', 'AAAAAAAA', '.ABABAB.', '..AAAA..'],
  yaksha: [
    '.y......y.',
    '.yAAAAAAy.',
    '..AwAAwA..',
    '..AAAAAA..',
    '..ArrrrA..',
    '.AAAAAAAA.',
    'AABBBBBBAA',
    'A.BBBBBB.A',
    'A.BBBBBB.A',
    '..BBBBBB..',
    '..AA..AA..',
    '..AA..AA..',
    '..kk..kk..'
  ],
  giant: [
    '..AAAAAA..',
    '.AAAAAAAA.',
    '..AwAAwA..',
    '..AAAAAA..',
    '..ArrrrA..',
    '.AAAAAAAA.',
    'AABBBBBBAA',
    'A.BBBBBB.A',
    'A.BBBBBB.A',
    '..BBBBBB..',
    '..AA..AA..',
    '..AA..AA..',
    '..kk..kk..'
  ],
  pig: [
    '.A........A.',
    'AAAAAAAAAAA.',
    'AkAAAAAAAAAA',
    'AwwAAAAAAAAA',
    'AAAAAAAAAAA.',
    '.AAAAAAAAA..',
    '.A.A...A.A..',
    '.k.k...k.k..'
  ],
  beast: [
    '..B......B..',
    '.BAB....BAB.',
    '.AAAAAAAAAA.',
    'AArAAAAAArAA',
    'AAAAAAAAAAAA',
    'AwkwkwkwkwkA',
    'AAAAAAAAAAAA',
    'ABABABABABAA',
    'AAAAAAAAAAAA',
    '.AA.AAAA.AA.',
    '.kk.k..k.kk.'
  ],
  reaper: [
    '..kkkkkk..',
    '.kkkkkkkk.',
    'kkkkkkkkkk',
    '...wwww...',
    '...wrwr...',
    '...wwww...',
    '..kkkkkk..',
    '.kkkkkkkk.',
    '.wkkkkkkw.',
    '..kkkkkk..',
    '..kkkkkk..',
    '..kkkkkk..',
    '..kk..kk..'
  ],
  mask: [
    '..AAAAAA..',
    '.AAAAAAAA.',
    'AAwkAAkwAA',
    'AAAAAAAAAA',
    'AAArrrrAAA',
    '.AAAAAAAA.',
    '..BBBBBB..',
    '.BBBBBBBB.',
    'BBBBBBBBBB',
    '.BB....BB.',
    '.kk....kk.'
  ],
  tall: [
    '..kk..',
    '.kkkk.',
    '.kAAk.',
    '.krrk.',
    '.kkkk.',
    '.BBBB.',
    'BBBBBB',
    '.BBBB.',
    '.BBBB.',
    '.BBBB.',
    '.BBBB.',
    '.BBBB.',
    '.BBBB.',
    '.B..B.',
    '.B..B.',
    '.k..k.'
  ],
  child: ['.kkkk.', 'kAAAAk', 'kArrAk', 'kAAAAk', '.BBBB.', 'BBBBBB', '.BBBB.', '.B..B.'],
  heads3: [
    '.y..y..y..y.',
    'AAA.AAA.AAA.',
    'AwA.AwA.AwA.',
    'AAA.AAA.AAA.',
    '.AAAAAAAAA..',
    'AAABBBBBAAA.',
    'A.BBBBBBB.A.',
    'A.BBBBBBB.A.',
    '..BBBBBBB...',
    '..AA...AA...',
    '..kk...kk...'
  ],
  eagle3: [
    'A..A..A.....',
    'Ay.Ay.Ay....',
    'AAAAAAAA....',
    '.AAAAAAAAA.A',
    '..AAAAAAAAAA',
    '...AAAAAA..A',
    '.....AA.....',
    '.....y......',
    '....yyy.....'
  ],
  shadow: [
    '..AAAA..',
    '.AAAAAA.',
    '.ArAArA.',
    '.AAAAAA.',
    'AAAAAAAA',
    'AAAAAAAA',
    'AAAAAAAA',
    'AAAAAAAA',
    'AAAAAAAA',
    '.A.AA.A.'
  ],
  bear: [
    '.AA.......',
    'AAAA......',
    'AkAAA.....',
    'AAAwAAAAA.',
    '.AAAAAAAAA',
    '.ABBBAAAAA',
    '.AAAAAAAAA',
    '.AA.AA.AA.',
    '.kk.kk.kk.'
  ],
  serpent: [
    '..AAAA....',
    '.AwAAwA...',
    'AAAAAAAA..',
    '.ArrA.AA..',
    '......AA..',
    '.....AA...',
    '....AA....',
    '...AAAA...'
  ]
};
const LEFT_FACING = new Set(['fox', 'fox9', 'dog', 'dog3', 'tiger', 'rat', 'fish', 'pig', 'bear']);

const IR = {
  meok: ['.....kk.', '....kyk.', '...kyk..', '..kkk...', '.kkkk...', 'kkkk....', '.kk..ww.', '.....ww.'],
  chim: ['.x.x.x..', '.x.x.x..', '.x.x.x..', '.x.x.x..', '.x.x.x..', '.x.x.x..', '.w.w.w..', '.y.y.y..'],
  bujeok: ['.yyyyyy.', '.yrrrry.', '.yyryyy.', '.yrrrry.', '.yyryyy.', '.yrryry.', '.yyyyyy.', '...yy...'],
  hwando: ['.......w', '......wx', '.....wx.', '....wx..', '.y.wx...', '..yx....', '.nyy....', 'n..y....'],
  bangul: ['...nn...', '..yyyy..', '.yyyyyy.', '.yyyyyy.', 'yyyyyyyy', 'yyyyyyyy', '...kk...', '........'],
  hwasal: ['.......x', '......xx', '.....x..', '....x...', '.w.x....', '.wx.....', 'www.....', '........'],
  singijeon: ['......rr', '.....rrr', '....nrr.', '...nn...', '..nn....', '.yn.....', 'yyo.....', '.o......'],
  yaktang: ['..oooo..', '.o....o.', '.gggggg.', 'ogwggwgo', 'oggggggo', 'oggggggo', '.oooooo.', '........'],
  byeoru: ['........', '.kkkkkk.', 'kXXXXXXk', 'kXkkkkXk', 'kXkbbkXk', 'kXkkkkXk', 'kXXXXXXk', '.kkkkkk.'],
  buchae: ['y.y.y.y.', '.yyyyyy.', '.ywywyw.', '..yyyy..', '..ywyw..', '...yy...', '...nn...', '...nn...'],
  seochal: ['........', 'wwwwwwww', 'wkwwwwkw', 'wwkwwkww', 'wwwkkwww', 'wwwwwwww', 'wwwwrrww', '........'],
  buhang: ['........', '..xxxx..', '.x....x.', '.x....x.', '.xrrrrx.', '.xrrrrx.', '..xxxx..', '........'],
  jakdu: ['xxxxxxx.', 'xwwwwwx.', '.xxxxxxn', '......nn', '.....nn.', '....nn..', '........', '........'],
  hwanyak: ['........', '..nnnn..', '.nooonn.', 'nooyoonn', 'noooooon', '.nooonn.', '..nnnn..', '........'],
  singal: ['......xw', '.....xw.', '....xw..', '...xw...', '.rrx....', '.rr.....', 'y.r.....', '........'],
  bara: ['..yyyy..', '.yyyyyy.', 'yyynnyyy', 'yyynnyyy', '.yyyyyy.', '..yyyy..', '...rr...', '..r..r..'],
  myeongdu: ['..yyyy..', '.yccccy.', 'ycwcccyy', 'ycccccyy', 'yccccccy', '.yccccy.', '..yyyy..', '........'],
  pyeongon: ['.......n', '......n.', '.....n..', '....n...', '...x....', '..xxx...', '.xxxxx..', '..xxx...'],
  deungpae: ['..oooo..', '.oyyyyo.', 'oyyrryyo', 'oyrkkryo', 'oyyrryyo', '.oyyyyo.', '..oooo..', '........'],
  jincheon: ['....y...', '...y....', '..kk....', '.kXXkk..', 'kXXXXXk.', 'kXXXXXk.', '.kXXXk..', '..kkk...'],
  insam: ['...gg...', '..g..g..', '...oo...', '..oooo..', '..oooo..', '.o.oo.o.', 'o..oo..o', '..o..o..'],
  jipsin: ['........', '..yyyy..', '.yoyoyy.', 'yoyoyoyy', 'yyyyyyyy', '.oooooo.', '........', '........'],
  gat: ['..kkkk..', '..kkkk..', '..kkkk..', 'kkkkkkkk', '.k....k.', '........', '........', '........'],
  yundo: ['.oooooo.', 'oyyyyyyo', 'oyyryyyo', 'oyrrryyo', 'oyyrkyyo', 'oyyyyyyo', 'oyyyyyyo', '.oooooo.'],
  seochaek: ['bbbbbbb.', 'bwwwwwb.', 'bwkkkwb.', 'bwwwwwb.', 'bwkkwwb.', 'bwwwwwb.', 'bbbbbbb.', '........'],
  gapot: ['.r....r.', 'rrrrrrrr', 'ryryryry', 'rrrrrrrr', 'ryryryry', 'rrrrrrrr', '.rrrrrr.', '........'],
  hwayak: ['...kk...', '..nkkn..', '.nnnnnn.', 'nnnnnnnn', 'nnrrnnnn', 'nnnnnnnn', '.nnnnnn.', '........'],
  horibyeong: ['...n....', '...oo...', '..oyyo..', '..oyyo..', '.oyyyyo.', 'oyyyyyyo', 'oyyyyyyo', '.oooooo.'],
  yeonjeok: ['...gg...', '..gGGg..', '.gGGGGg.', 'gGGGGGGg', 'gGGGGGGg', '.gGGGGg.', '..gggg..', '........'],
  hongpae: ['rrrrrrrr', 'rwwwwwwr', 'rwkkkkwr', 'rwwwwwwr', 'rwkkkwwr', 'rwwwwwwr', 'rrrrrrrr', '........'],
  nakgwan: ['..nnnn..', '..nnnn..', '...nn...', '..rrrr..', '.rrwwrr.', '.rwrrwr.', '.rrrrrr.', '........'],
  gamcho: ['.....g..', '....gg..', '...oo...', '..oo....', '.oo.....', 'oo......', 'o.......', '........'],
  nogyong: ['o..o..o.', 'o..o..o.', '.o.o.o..', '..ooo...', '...o....', '...o....', '..oo....', '........'],
  sahyang: ['...kk...', '..pkkp..', '.pppppp.', 'pppwpppp', 'pppppppp', '.pppppp.', '..pppp..', '........'],
  myeongtae: ['........', 'x.....xx', 'xx..xxxx', 'xxxxxxkx', 'xxxxxxxx', 'xx..xxxx', 'x.....xx', '........'],
  osaek: ['rrrrrrrr', 'yyyyyyyy', 'gggggggg', 'bbbbbbbb', 'wwwwwwww', 'rrrrrrrr', '.y.g.b..', '........'],
  jeonghwasu: ['........', '........', 'cccccccc', 'wwwwwwww', '.wwwwww.', '..wwww..', '...ww...', '........'],
  tugu: ['...rr...', '...rr...', '..xxxx..', '.xxxxxx.', 'xxXXXXxx', 'x......x', '........', '........'],
  gunryeong: ['n.......', 'nrrrrrr.', 'nryyyrr.', 'nrryrrr.', 'nrrrrrr.', 'n.......', 'n.......', 'n.......'],
  jeonma: ['......oo', '.....ooo', 'oooooooo', 'ooooooo.', '.oooooo.', '.o.o.o.o', '.o.o.o.o', '........'],
  gayageum: ['.......o', '......oo', '.....owo', '....owo.', '...owo..', '..owo...', '.owo....', 'oo......'],
  geommu: ['w.....w.', '.x...x..', '..x.x...', '...x....', '..x.x...', '.y...y..', 'r.....r.', '........'],
  buchaechum: ['p.p.p.p.', '.pppppp.', '.pwpwpw.', '..pppp..', '..pwpw..', '...pp...', '...nn...', '...nn...'],
  janggu: ['rrr..rrr', 'rwr..rwr', 'rwrrrrwr', 'rwr..rwr', 'rrr..rrr', '.n....n.', '........', '........'],
  norigae: ['...yy...', '..yrry..', '...yy...', '...rr...', '..rrrr..', '..rrrr..', '..r.r.r.', '.r..r..r'],
  binyeo: ['......yy', '.....yry', '....yy..', '...yy...', '..yy....', '.yy.....', 'yy......', '........'],
  tuho: ['.......x', '......x.', '..ooox..', '.oyyyxo.', '.oyyyyo.', '.oyrryo.', '.oyyyyo.', '..oooo..'],
  yut: ['.w..w...', '.wo.wo..', '.wo.wo.w', '.wo.wo.w', '.wo.wowo', '.wo.wowo', '.w..wowo', '......w.'],
  yeon: ['.wwwwww.', 'wbwwwwbw', 'wwbwwbww', 'wwwrrwww', 'wwbwwbww', 'wbwwwwbw', '.wwwwww.', '...nn...'],
  jegi: ['..r.p...', '..rbp...', '...rp.g.', '...rgg..', '..yyy...', '..ykky..', '..yyyy..', '........'],
  jupan: ['oooooooo', 'o.y.k.yo', 'oooooooo', 'oy.k.y.o', 'oooooooo', 'o.k.y.ko', 'oooooooo', '........'],
  yeopjeon: ['..yyyy..', '.yykkyy.', '.yk..ky.', '.yykkyy.', '..yyyy..', '...rr...', '..r..r..', '........'],
  jige: ['o......o', 'o......o', 'oooooooo', 'o..nn..o', 'o.nnnn.o', 'oooooooo', 'o......o', 'o......o'],
  doe: ['........', '.oooooo.', '.owwwwo.', '.owwwwo.', '.oooooo.', '..oooo..', '........', '........'],
  jangbu: ['bbbbbbb.', 'bwwwwwb.', 'bwkkkwb.', 'bwwwwwb.', 'bwkwkwb.', 'bwwwwwb.', 'bbbbbbb.', '.y.y.y..'],
  jeondae: ['........', '.rrrrrr.', 'rryyyyrr', 'ryykkyyr', 'rryyyyrr', '.rrrrrr.', '..r..r..', '........'],
  jeoul: ['...n....', '.xxnxx..', '.x.n.x..', 'xx.n.xx.', '...n....', '...n....', '.nnnnn..', '........'],
  hwagwan: ['.r.p.r..', 'rprprpr.', 'yyyyyyy.', 'y.....y.', '........', '........', '........', '........'],
  tteok: ['........', '..wwww..', '.wwwwww.', 'wwgwwgww', 'wwwwwwww', '.wwwwww.', '........', '........'],
  coin: ['..yyyy..', '.yyyyyy.', 'yyykkyyy', 'yyk..kyy', 'yyk..kyy', 'yyykkyyy', '.yyyyyy.', '..yyyy..'],
  chest: ['.yyyyyy.', 'yrrrrrry', 'yrrrrrry', 'yyyyyyyy', 'yrryyrry', 'yrrrrrry', 'yrrrrrry', 'yyyyyyyy'],
  pouch: ['...yy...', '..rrrr..', '.rrrrrr.', 'rrryyrrr', 'rryrryrr', 'rrrrrrrr', '.rrrrrr.', '........'],
  pot: ['..nnnn..', '.noooon.', 'noooooon', 'nonoonon', 'noooooon', 'noooooon', '.noooon.', '..nnnn..'],
  gukbap: ['........', '.wwwwww.', 'yywwwwyy', 'oooooooo', '.oooooo.', '..oooo..', '........', '........'],
  makgeolli: ['...nn...', '..oooo..', '.oooooo.', 'owwwwwwo', 'owwwwwwo', 'oooooooo', '.oooooo.', '........'],
  santong: ['..y.y...', '..y.y.y.', '.nnnnnn.', '.nooooon', '.nooooon', '.nooooon', '.nnnnnn.', '........'],
  bottari: ['...yy...', '..b..b..', '.bbbbbb.', 'bbwbbwbb', 'bbbbbbbb', 'bbbbbbbb', '.bbbbbb.', '........']
};
const ICS = {},
  ICON = {};
for (const k in IR) {
  ICS[k] = mk(IR[k]);
  ICON[k] = big(ICS[k], 4);
}

/* --- v18.5 장수의 방패 다섯 단계 + 진화(코드 도트). 고증: 한국민족문화대백과사전 「방패」
   죽패(대를 두세 겹 엮음) · 생우피방패(네 발 나무틀에 날소가죽, 선조 때) · 장방패(나무에 가죽·흰 베, 귀면) · 원방패(둥근 판, 쇠테, 귀면) · 등패(등나무를 감아 엮음, 가운데 귀면)
   귀면은 기와의 도깨비 얼굴(귀면와) 꼴: 뿔·부릅뜬 눈·드러낸 이빨. 중군 빨강·좌군 파랑 */
const SHIELD_FACE = ['F.....F', 'FF.F.FF', 'FekFkeF', 'FFFFFFF', 'FwkkkwF', '.wFFFw.'];
function shieldRound(D, ring, face, fc) {
  const rows = [],
    c = (D - 1) / 2,
    R = D / 2;
  for (let y = 0; y < D; y++) {
    let s = '';
    for (let x = 0; x < D; x++) {
      const d = Math.hypot(x - c, y - c);
      s += d > R - 0.15 ? '.' : ring(d, R, Math.atan2(y - c, x - c));
    }
    rows.push(s);
  }
  if (face) {
    const fx = Math.round(c - 3),
      fy = Math.round(c - 3);
    face.forEach((r, j) => {
      const a = rows[fy + j].split('');
      for (let i = 0; i < r.length; i++) if (r[i] !== '.') a[fx + i] = r[i] === 'F' ? fc : r[i];
      rows[fy + j] = a.join('');
    });
  }
  return rows;
}
const SHIELD_ROWS = (() => {
  const face = (rows, x0, y0, fc) =>
    rows.map((r, j) => {
      const k = j - y0;
      if (k < 0 || k >= SHIELD_FACE.length) return r;
      const a = r.split('');
      SHIELD_FACE[k].split('').forEach((ch, i) => {
        if (ch !== '.') a[x0 + i] = ch === 'F' ? fc : ch;
      });
      return a.join('');
    });
  const jukpae = [
    '.GgGgGgG.',
    'GgGgGgGgG',
    'GgGgGgGgG',
    'nnnnnnnnn',
    'GgGgGgGgG',
    'GgGgGgGgG',
    'GgGgGgGgG',
    'nnnnnnnnn',
    'GgGgGgGgG',
    'GgGgGgGgG',
    '.GgGgGgG.',
    '..n...n..'
  ];
  const ugpi = [
    'nnnnnnnnn',
    'nsosoooon',
    'nooonoson',
    'nooooooon',
    'nosoooson',
    'noonooson',
    'nooooooon',
    'nsoooonon',
    'noosoooon',
    'nnnnnnnnn',
    '.n.....n.',
    '.n.....n.'
  ];
  let jang = ['nnnnnnnnnnn', ...Array(12).fill('nwwwwwwwwwn'), 'nnnnnnnnnnn', '.n.......n.'];
  jang = face(jang, 2, 3, 'b');
  const won = shieldRound(13, (d, R) => (d > R - 1.4 ? 'x' : 'r'), SHIELD_FACE, 'y');
  const deung = shieldRound(17, d => (d < 1 ? 'o' : Math.floor(d) % 2 ? 'o' : 'y'), SHIELD_FACE, 'r');
  const cheol = shieldRound(
    17,
    (d, R, a) =>
      d > R - 1.4
        ? (Math.round(a / (Math.PI / 4)) * (Math.PI / 4) - a) ** 2 < 0.03
          ? 'e'
          : 'X'
        : Math.floor(d) % 2
          ? 'o'
          : 'y',
    SHIELD_FACE,
    'r'
  );
  return [jukpae, ugpi, jang, won, deung, cheol];
})();
const SHIELD_PAL = {...PAL, s: '#d09858', e: '#f4e8c8'};
const SHIELD_SPR = [];
function shieldSpr(lv, evo) {
  const i = evo ? 5 : Math.max(0, Math.min(4, (Math.floor(+lv) || 1) - 1));
  return SHIELD_SPR[i] || (SHIELD_SPR[i] = mk(SHIELD_ROWS[i], SHIELD_PAL));
}
/* v18.5 가진 무기의 아이콘: 방패는 단계 그림(가운데 맞춰 2배), 다른 무기는 예전 아이콘 */
const SHIELD_ICON = {};
function wIcon(w) {
  const d = WD[w.id];
  if (!d || !d.lvName || w.id !== 'deungpae') return ICON[w.id];
  const sp = shieldSpr(w.lv, w.evo),
    k = w.evo ? 5 : Math.max(0, Math.min(4, (Math.floor(+w.lv) || 1) - 1));
  if (SHIELD_ICON[k]) return SHIELD_ICON[k];
  const c = document.createElement('canvas');
  c.width = c.height = 17;
  const x = c.getContext('2d');
  x.drawImage(sp, Math.floor((17 - sp.width) / 2), Math.floor((17 - sp.height) / 2));
  return (SHIELD_ICON[k] = big(c, 2));
}
