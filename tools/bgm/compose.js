/* 조선퇴마록 배경음 작곡 코드 (v21.0) — tools/bgm.py가 브라우저(OfflineAudioContext)에서 실행해 audio/bgm/*.mp3를 만든다.
   게임은 이 코드를 쓰지 않고 만들어진 mp3만 재생한다. 곡을 고치면 python3 tools/bgm.py 로 다시 만든다.
   차례: 악기(makeGugak) → 장소 소리(extras) → 장단·막 설정(JANGDAN·STAGE_BGM) → 막 곡(stageSong) → 주변 소리(ambience) → 본부 곡(hubSong) */
/* 국악 악기(Web Audio 합성) — v21.0 배경음. 시험곡 1~3판에서 다듬음
   악기: 가야금(튕김, Karplus-Strong + 농현), 대금(부는 소리: 사인+세모파+숨소리, 떨림), 장구(덩·쿵·덕·더러러), 징, 낮은 지속음 */
function makeGugak(ctx, out) {
  const SR = ctx.sampleRate;
  let rs = 2024;
  const rand01 = () => (rs = (rs * 16807) % 2147483647) / 2147483647; // 씨앗 난수(같은 입력 같은 곡)
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  // 잔향: 짧은 소음으로 만든 공간
  function reverb(sec, decay) {
    const c = ctx.createConvolver(),
      n = Math.floor(SR * sec),
      b = ctx.createBuffer(2, n, SR);
    let s = 7;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647) * 2 - 1;
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch);
      for (let i = 0; i < n; i++) d[i] = rnd() * Math.pow(1 - i / n, decay);
    }
    c.buffer = b;
    return c;
  }
  // 가야금: Karplus-Strong(줄 튕김)을 미리 계산한 소리 조각
  const ksCache = {};
  function ks(midi, dur) {
    const key = midi + ':' + dur;
    if (ksCache[key]) return ksCache[key];
    const f = mtof(midi),
      N = Math.round(SR / f),
      len = Math.floor(SR * dur),
      b = ctx.createBuffer(1, len, SR),
      d = b.getChannelData(0),
      ring = new Float32Array(N);
    let s = midi * 977 + 13;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647) * 2 - 1;
    for (let i = 0; i < N; i++) ring[i] = rnd() * 0.9;
    let p = 0;
    const damp = 0.996 - Math.max(0, midi - 60) * 0.0006; // 높은 줄은 빨리 잦아듦
    for (let i = 0; i < len; i++) {
      const a = ring[p],
        bb = ring[(p + 1) % N];
      const v = damp * 0.5 * (a + bb);
      d[i] = a;
      ring[p] = v;
      p = (p + 1) % N;
    }
    // 손톱으로 뜯는 날카로운 시작
    for (let i = 0; i < Math.min(len, 120); i++) d[i] *= 1.3;
    return (ksCache[key] = b);
  }
  function gayageum(t, midi, dur, vel = 0.5, nong = 0) {
    const src = ctx.createBufferSource(),
      g = ctx.createGain(),
      lp = ctx.createBiquadFilter();
    src.buffer = ks(midi, Math.max(1.2, dur + 0.8));
    lp.type = 'lowpass';
    lp.frequency.value = 3200;
    g.gain.setValueAtTime(vel, t);
    g.gain.setTargetAtTime(0, t + dur, 0.25);
    // 농현: 줄을 눌러 음을 떠는 것(뒤쪽에서 천천히)
    if (nong) {
      const lfo = ctx.createOscillator(),
        lg = ctx.createGain();
      lfo.frequency.value = 5.2;
      lg.gain.setValueAtTime(0, t);
      lg.gain.linearRampToValueAtTime(0, t + dur * 0.35);
      lg.gain.linearRampToValueAtTime(nong * 0.012, t + dur * 0.8);
      lfo.connect(lg).connect(src.playbackRate);
      lfo.start(t);
      lfo.stop(t + dur + 1);
    }
    src.connect(lp).connect(g).connect(out.inst);
    src.start(t);
    src.stop(t + dur + 1);
  }
  // 대금: 부는 소리 + 숨소리 + 떨림(뒤로 갈수록 깊게)
  let noiseBuf = null;
  function noise() {
    if (noiseBuf) return noiseBuf;
    const n = SR * 2,
      b = ctx.createBuffer(1, n, SR),
      d = b.getChannelData(0);
    let s = 99;
    for (let i = 0; i < n; i++) d[i] = ((s = (s * 16807) % 2147483647) / 2147483647) * 2 - 1;
    return (noiseBuf = b);
  }
  function daegeum(t, midi, dur, vel = 0.22, opt = {}) {
    const f = mtof(midi),
      g = ctx.createGain(),
      o1 = ctx.createOscillator(),
      o2 = ctx.createOscillator(),
      g2 = ctx.createGain(),
      lfo = ctx.createOscillator(),
      lg = ctx.createGain(),
      bp = ctx.createBiquadFilter(),
      nz = ctx.createBufferSource(),
      ng = ctx.createGain();
    o1.type = 'sine';
    o2.type = 'triangle';
    o1.frequency.value = o2.frequency.value = f;
    g2.gain.value = 0.35;
    lfo.frequency.value = opt.vibHz || 4.6;
    lg.gain.setValueAtTime(0, t);
    lg.gain.linearRampToValueAtTime(0, t + dur * 0.3);
    lg.gain.linearRampToValueAtTime(f * (opt.vib || 0.012), t + dur * 0.9);
    lfo.connect(lg);
    lg.connect(o1.frequency);
    lg.connect(o2.frequency);
    // 끝에서 꺾어 내림(계면조 느낌)
    if (opt.fall) {
      o1.frequency.setValueAtTime(f, t + dur * 0.75);
      o1.frequency.linearRampToValueAtTime(f * Math.pow(2, -opt.fall / 12), t + dur);
      o2.frequency.setValueAtTime(f, t + dur * 0.75);
      o2.frequency.linearRampToValueAtTime(f * Math.pow(2, -opt.fall / 12), t + dur);
    }
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vel, t + Math.min(0.25, dur * 0.3));
    g.gain.setValueAtTime(vel, t + dur - 0.15);
    g.gain.linearRampToValueAtTime(0, t + dur + 0.1);
    // 숨소리(청 울림 비슷하게)
    nz.buffer = noise();
    nz.loop = true;
    bp.type = 'bandpass';
    bp.frequency.value = f * 2;
    bp.Q.value = 6;
    ng.gain.setValueAtTime(0, t);
    ng.gain.linearRampToValueAtTime(vel * 0.5, t + 0.08);
    ng.gain.linearRampToValueAtTime(vel * 0.15, t + 0.4);
    ng.gain.linearRampToValueAtTime(0, t + dur + 0.1);
    o1.connect(g);
    o2.connect(g2).connect(g);
    nz.connect(bp).connect(ng).connect(out.inst);
    g.connect(out.inst);
    for (const o of [o1, o2, lfo]) {
      o.start(t);
      o.stop(t + dur + 0.2);
    }
    nz.start(t, rand01() * 1.5);
    nz.stop(t + dur + 0.2);
  }
  // 장구: 쿵(궁편 낮은 울림) · 덕(채편 딱) · 덩(둘 다) · 더러러(굴림)
  function kung(t, v = 0.7) {
    const o = ctx.createOscillator(),
      g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(62, t + 0.18);
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    o.connect(g).connect(out.drum);
    o.start(t);
    o.stop(t + 0.5);
  }
  function deok(t, v = 0.35) {
    const nz = ctx.createBufferSource(),
      hp = ctx.createBiquadFilter(),
      g = ctx.createGain(),
      o = ctx.createOscillator(),
      og = ctx.createGain();
    nz.buffer = noise();
    hp.type = 'bandpass';
    hp.frequency.value = 2400;
    hp.Q.value = 1.2;
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    o.type = 'triangle';
    o.frequency.setValueAtTime(520, t);
    o.frequency.exponentialRampToValueAtTime(300, t + 0.05);
    og.gain.setValueAtTime(v * 0.6, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    nz.connect(hp).connect(g).connect(out.drum);
    o.connect(og).connect(out.drum);
    nz.start(t, rand01());
    nz.stop(t + 0.1);
    o.start(t);
    o.stop(t + 0.1);
  }
  const deong = (t, v = 0.7) => (kung(t, v), deok(t, v * 0.5));
  const deoreoreo = (t, step, v = 0.22) => [0, 1, 2].forEach(i => deok(t + (i * step) / 3, v * (1 - i * 0.15)));
  // 징: 어긋난 배음 여러 개가 길게 울림
  function jing(t, v = 0.35, base = 98) {
    [1, 1.52, 2.03, 2.71, 3.4].forEach((r, i) => {
      const o = ctx.createOscillator(),
        g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(base * r * 1.04, t);
      o.frequency.exponentialRampToValueAtTime(base * r, t + 0.6);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime((v / (1 + i * 0.9)) * (i === 0 ? 1 : 0.6), t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t + 5.5 - i * 0.6);
      o.connect(g).connect(out.drum);
      o.start(t);
      o.stop(t + 6);
    });
  }
  // 낮은 지속음(저승길 바탕)
  function drone(t, midi, dur, v = 0.06) {
    const o = ctx.createOscillator(),
      o2 = ctx.createOscillator(),
      g = ctx.createGain(),
      lp = ctx.createBiquadFilter();
    o.type = 'sawtooth';
    o2.type = 'sine';
    o.frequency.value = mtof(midi);
    o2.frequency.value = mtof(midi) * 1.004;
    lp.type = 'lowpass';
    lp.frequency.value = 520;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + 3);
    g.gain.setValueAtTime(v, t + dur - 3);
    g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(lp);
    o2.connect(lp);
    lp.connect(g).connect(out.inst);
    for (const x of [o, o2]) {
      x.start(t);
      x.stop(t + dur);
    }
  }
  return {gayageum, daegeum, kung, deok, deong, deoreoreo, jing, drone, reverb, mtof};
}


/* 막 곡 — 막마다 빨라지고(72→132), 모두 계면조로 어둡게, 막 배경 소리 하나씩.
   gugak.js의 악기(가야금·대금·장구·징·지속음·잔향) 위에 장소 소리(바람·대나무·북·범종·목탁·파도·편종)를 더함 */
function extras(ctx, out) {
  const SR = ctx.sampleRate;
  let nb = null;
  const noise = () => {
    if (nb) return nb;
    const n = SR * 3,
      b = ctx.createBuffer(1, n, SR),
      d = b.getChannelData(0);
    let s = 4242;
    for (let i = 0; i < n; i++) d[i] = ((s = (s * 16807) % 2147483647) / 2147483647) * 2 - 1;
    return (nb = b);
  };
  // 바람: 걸러 낸 소음이 천천히 일렁임
  function wind(t, dur, v = 0.08, f = 500, rate = 0.13) {
    const src = ctx.createBufferSource(),
      bp = ctx.createBiquadFilter(),
      g = ctx.createGain(),
      lfo = ctx.createOscillator(),
      lg = ctx.createGain();
    src.buffer = noise();
    src.loop = true;
    bp.type = 'bandpass';
    bp.frequency.value = f;
    bp.Q.value = 1.4;
    lfo.frequency.value = rate;
    lg.gain.value = f * 0.6;
    lfo.connect(lg).connect(bp.frequency);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + 3);
    g.gain.setValueAtTime(v, t + dur - 2);
    g.gain.linearRampToValueAtTime(0, t + dur);
    src.connect(bp).connect(g).connect(out.inst);
    src.start(t);
    lfo.start(t);
    src.stop(t + dur);
    lfo.stop(t + dur);
  }
  // 파도: 낮게 걸러 낸 소음이 밀려왔다 빠짐
  function waves(t, dur, period = 6, v = 0.18) {
    const src = ctx.createBufferSource(),
      lp = ctx.createBiquadFilter(),
      g = ctx.createGain();
    src.buffer = noise();
    src.loop = true;
    lp.type = 'lowpass';
    lp.frequency.value = 700;
    g.gain.setValueAtTime(0, t);
    for (let x = t; x < t + dur; x += period) {
      g.gain.linearRampToValueAtTime(v, x + period * 0.45);
      g.gain.linearRampToValueAtTime(v * 0.08, x + period);
    }
    src.connect(lp).connect(g).connect(out.inst);
    src.start(t);
    src.stop(t + dur);
  }
  // 나무 소리(대나무 딱 · 목탁)
  function wood(t, f = 1400, v = 0.25, dec = 0.05) {
    const o = ctx.createOscillator(),
      g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * 0.8, t + dec);
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dec * 2.5);
    o.connect(g).connect(out.drum);
    o.start(t);
    o.stop(t + dec * 3);
  }
  // 북: 장구보다 낮고 무거움
  function buk(t, v = 0.8) {
    const o = ctx.createOscillator(),
      g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(95, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.3);
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    o.connect(g).connect(out.drum);
    o.start(t);
    o.stop(t + 0.8);
  }
  // 종(범종: 낮고 길게 · 편종: 높고 짧게) — 어긋난 배음
  function bell(t, base, v, len, rat = [1, 2.0, 2.76, 3.8, 5.4]) {
    rat.forEach((r, i) => {
      const o = ctx.createOscillator(),
        g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = base * r;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(v / (1 + i * 0.7), t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0005, t + len / (1 + i * 0.5));
      o.connect(g).connect(out.inst);
      o.start(t);
      o.stop(t + len);
    });
  }
  return {wind, waves, wood, buk, bell};
}

/* 장단: 한 장단을 「작은박」 단위로 쪼갠 칸에 장구 소리를 적음. D 덩 · K 쿵 · d 덕 · r 더러러 · . 쉼 */
/* 막마다의 장단 칸(빨라질수록 촘촘해지게 맞춤: 장구 1막 2.4회/초 → 10막 6회/초) */
const JANGDAN = {
  j1: {sub: 3, pat: 'D..K.dK..K.r'}, // 굿거리
  j2: {sub: 3, pat: 'D.dK.dKd.'}, // 세마치
  j3: {sub: 3, pat: 'D.dK.dKd.K.d'}, // 중중모리
  j4: {sub: 3, pat: 'D.dK.rK.dK.d'}, // 굿거리(조금 더 촘촘)
  j5: {sub: 3, pat: 'D.dK.dK.rK.d'}, // 중모리(줄임)
  j6: {sub: 3, pat: 'D.dKddK.dK.r'}, // 자진모리
  j7: {sub: 3, pat: 'D.dK.dK.rKdd'}, // 자진모리(몰아침)
  j8: {sub: 4, pat: 'D.dKd.K.d.dKd.Kd'}, // 휘모리
  j9: {sub: 2, pat: 'D.dKdrKrdKD.dKdrKrdK'}, // 엇모리 3+2+3+2
  j10: {sub: 4, pat: 'D.dKd.K.d.dKd.Kd'} // 휘모리(가장 빠름)
};

/* 막 설정: 빠르기(작은박 기준 bpm), 장단, 으뜸음, 장소 소리, 잔향, 어긋난 음 */
const STAGE_BGM = [
  {n: '1막 한양 저잣거리', bpm: 72, jd: 'j1', root: 50, wet: 0.35, rv: 2.2, place: 'market'},
  {n: '2막 대숲 오솔길', bpm: 78, jd: 'j2', root: 52, wet: 0.4, rv: 2.5, place: 'bamboo'},
  {n: '3막 범 나오는 고개', bpm: 84, jd: 'j3', root: 45, wet: 0.35, rv: 2.4, place: 'tiger'},
  {n: '4막 안개 낀 나루', bpm: 90, jd: 'j4', root: 48, wet: 0.6, rv: 3.6, place: 'ferry'},
  {n: '5막 폐허가 된 산사', bpm: 96, jd: 'j5', root: 47, wet: 0.55, rv: 3.4, place: 'temple'},
  {n: '6막 역병 도는 마을', bpm: 102, jd: 'j6', root: 49, wet: 0.45, rv: 2.8, place: 'plague', clash: 1},
  {n: '7막 백두산 골짜기', bpm: 110, jd: 'j7', root: 43, wet: 0.55, rv: 3.8, place: 'mountain'},
  {n: '8막 동해 바닷가', bpm: 118, jd: 'j8', root: 46, wet: 0.5, rv: 3.2, place: 'sea'},
  {n: '9막 저승길', bpm: 124, jd: 'j9', root: 44, wet: 0.65, rv: 4.2, place: 'underworld', clash: 1},
  {n: '10막 근정전 앞뜰', bpm: 132, jd: 'j10', root: 47, wet: 0.45, rv: 3.0, place: 'palace', clash: 1},
  // v22.0 2부: 새 길을 떠나는 느낌으로 한 번 늦췄다가 압록강까지 다시 빨라짐(장소 소리는 1부 것을 빌림)
  {n: '11막 홍제원 고개', bpm: 112, jd: 'j6', root: 46, wet: 0.4, rv: 2.6, place: 'tiger'},
  {n: '12막 임진나루', bpm: 118, jd: 'j4', root: 48, wet: 0.6, rv: 3.6, place: 'ferry'},
  {n: '13막 송악 아래 개성', bpm: 124, jd: 'j9', root: 45, wet: 0.55, rv: 3.4, place: 'temple', clash: 1},
  {n: '14막 대동강 평양성', bpm: 130, jd: 'j7', root: 47, wet: 0.5, rv: 3.0, place: 'palace'},
  {n: '15막 의주 압록강', bpm: 138, jd: 'j8', root: 43, wet: 0.6, rv: 4.0, place: 'mountain', clash: 1}
];

/* 계면조(라도레미솔 꼴): 으뜸음에서 0,3,5,7,10 반음 */
const BOSS_TEMPO = 1.15;
/* 장단 한 바퀴(초) — 도구가 48초 안팎의 짝수 바퀴를 고를 때 */
function stageBar(si, boss) {
  const S = STAGE_BGM[si],
    J = JANGDAN[S.jd];
  return (60 / (S.bpm * (boss ? BOSS_TEMPO : 1)) / J.sub) * J.pat.length;
}
const KYEMYEON = [0, 3, 5, 7, 10];
function scaleNote(root, deg) {
  const o = Math.floor(deg / 5),
    i = ((deg % 5) + 5) % 5;
  return root + o * 12 + KYEMYEON[i];
}
/* 씨앗 난수(같은 막은 늘 같은 곡) */
function rng(seed) {
  let s = seed % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function stageSong(ctx, si, sec = 32, opt = {}) {
  const S = STAGE_BGM[si],
    R = rng(1000 + si * 7919);
  const master = ctx.createGain(),
    inst = ctx.createGain(),
    drum = ctx.createGain(),
    comp = ctx.createDynamicsCompressor(),
    dark = ctx.createBiquadFilter();
  // 어둡게: 전체 높은 소리를 걸러 냄(뒤 막일수록 조금 더 밝게 — 긴장)
  dark.type = 'lowpass';
  dark.frequency.value = 2600 + si * 180;
  const G = makeGugak(ctx, {inst, drum}),
    X = extras(ctx, {inst, drum});
  const rv = G.reverb(S.rv, 2.4),
    rg = ctx.createGain();
  rg.gain.value = S.wet;
  inst.gain.value = 0.9;
  drum.gain.value = 0.75 + si * 0.03;
  inst.connect(dark);
  drum.connect(dark);
  inst.connect(rv);
  drum.connect(rv);
  rv.connect(rg).connect(dark);
  // 주변 소리 층: 멀리서 들리게 잔향 위주(마른 소리는 조금만) · 크기는 opt.amb(재어서 맞춤)
  if (opt.music === false) inst.gain.value = drum.gain.value = 0;
  if (opt.amb && typeof ambience === 'function') {
    const amb = ctx.createGain(),
      dry = ctx.createGain(),
      wet = ctx.createGain(),
      arv = G.reverb(3.5, 2.2);
    amb.gain.value = opt.amb;
    dry.gain.value = 0.45;
    wet.gain.value = 0.9;
    amb.connect(dry).connect(dark);
    amb.connect(arv);
    arv.connect(wet).connect(dark);
    ambience(ctx, amb, si, sec, rng(5000 + si * 104729));
  }
  dark.connect(master).connect(opt.raw ? ctx.destination : comp);
  if (!opt.raw) comp.connect(ctx.destination);

  // 반복 곡(opt.loop = {pre, bars}): pre초 뒤에 시작, 장단 bars번 + 한 번 더(이음새를 겹칠 꼬리) · 세기 일정
  //  보스 판(opt.boss): 빠르기 ×1.15, 장구 세게, 장단마다 징
  const LP = opt.loop,
    J = JANGDAN[S.jd],
    step = 60 / (S.bpm * (opt.boss ? BOSS_TEMPO : 1)) / J.sub,
    bar = step * J.pat.length,
    t0 = LP ? LP.pre : 0.3,
    bars = LP ? LP.bars + 1 : Math.ceil((sec - 0.5) / bar);
  if (opt.boss) drum.gain.value *= 1.3;
  // 장단(첫 장단은 장구만, 시험곡은 뒤로 갈수록 세게 · 반복 곡은 일정)
  for (let b = 0; b < bars; b++)
    [...J.pat].forEach((c, k) => {
      const t = t0 + b * bar + k * step,
        v = LP ? (opt.boss ? 0.72 : 0.62) : 0.5 + Math.min(0.3, b * 0.02);
      if (c === 'D') G.deong(t, v + 0.1);
      else if (c === 'K') G.kung(t, v);
      else if (c === 'd') G.deok(t, v * 0.4);
      else if (c === 'r') G.deoreoreo(t, step, v * 0.3);
    });
  // 장소 소리
  const P = S.place,
    end = LP ? t0 + LP.bars * bar : t0 + bars * bar;
  if (opt.boss) for (let b = 0; b < bars; b++) G.jing(t0 + b * bar, 0.2, 86 + si * 2);
  if (P === 'market') for (let b = 0; b < bars; b += 2) G.jing(t0 + b * bar, 0.12, 110);
  if (P === 'bamboo') {
    X.wind(0, sec, 0.06, 900, 0.17);
    for (let b = 0; b < bars; b++) for (let k = 0; k < J.pat.length; k += 3) if (R() < 0.6) X.wood(t0 + b * bar + (k + 1.5) * step, 1800 + R() * 600, 0.12, 0.03);
  }
  if (P === 'tiger') for (let b = 0; b < bars; b++) (X.buk(t0 + b * bar, 0.9), X.buk(t0 + b * bar + step * 6, 0.6));
  if (P === 'tiger') G.drone(0, S.root - 12, sec, 0.035);
  if (P === 'ferry') X.waves(0, sec, 7, 0.07);
  if (P === 'temple') {
    for (let b = 0; b < bars; b += 2) X.bell(t0 + b * bar, 65, 0.35, 9);
    for (let b = 0; b < bars; b++) for (let k = 0; k < 4; k++) X.wood(t0 + b * bar + k * (bar / 4) + step, 620, 0.22, 0.06);
  }
  if (P === 'plague') {
    G.drone(0, S.root - 12, sec, 0.03);
    G.drone(0, S.root - 11, sec, 0.018); // 반음 부딪힘
  }
  if (P === 'mountain') {
    X.wind(0, sec, 0.11, 380, 0.09);
    G.drone(0, S.root - 12, sec, 0.03);
    G.drone(0, S.root - 5, sec, 0.02);
  }
  if (P === 'sea') X.waves(0, sec, 5, 0.12);
  if (P === 'underworld') {
    G.drone(0, S.root - 12, sec, 0.035);
    for (let b = 0; b < bars; b++) G.jing(t0 + b * bar, 0.28, 78);
  }
  if (P === 'palace') {
    for (let b = 0; b < bars; b++) G.jing(t0 + b * bar, 0.2, 92);
    for (let b = 0; b < bars; b++) [0, 2, 4, 6].forEach((k, i) => X.bell(t0 + b * bar + k * step, G.mtof(scaleNote(S.root + 24, [0, 2, 1, 3][(b + i) % 4])), 0.07, 1.6, [1, 2.4, 4.1]));
  }
  // 가락: 대금이 긴 소리로 주제를 부르고(계면조 떨고 꺾기), 가야금이 짧게 받음 — 빨라질수록 음이 촘촘
  const dense = 0.35 + si * 0.06,
    beat = step * J.sub;
  let deg = 2,
    t = t0 + bar; // 첫 장단은 장구만
  const phrase = [];
  while (t < end - beat) {
    const len = beat * (R() < 0.5 - si * 0.03 ? 2 : 1) * (R() < 0.25 ? 1.5 : 1);
    deg += R() < 0.5 ? (R() < 0.5 ? -1 : 1) : R() < 0.5 ? -2 : 2;
    deg = Math.max(0, Math.min(8, deg));
    phrase.push([t, deg, len]);
    t += len;
  }
  // 대금: 앞 절반은 대금이 이끌고
  phrase.forEach(([tt, d, len], i) => {
    const half = tt < t0 + (end - t0) * 0.6;
    const m = scaleNote(S.root + 12, d);
    if (half || i % 2 === 0) G.daegeum(tt, m, len * 0.95, 0.17, {vib: d % 5 === 3 ? 0.03 : 0.015, vibHz: 4.2 + si * 0.15, fall: d % 5 === 4 ? 2 : 0});
    // 가야금: 대금 뒤를 받는 짧은 뜯음(빨라질수록 자주)
    if (R() < dense) G.gayageum(tt + len * 0.5, scaleNote(S.root, d + (R() < 0.5 ? 0 : 2)), len * 0.5, 0.4, 1);
    // 어긋난 음(역병·저승·궁): 반음 위를 살짝
    if (S.clash && R() < 0.18) G.gayageum(tt + len * 0.25, scaleNote(S.root, d) + 1, len * 0.4, 0.22, 2);
  });
  // 뒤 절반: 가야금이 낮은 반주를 장단마다
  for (let b = LP ? 0 : 1; b < bars; b++) {
    G.gayageum(t0 + b * bar, scaleNote(S.root - 12, 0), bar * 0.5, 0.42, 1);
    G.gayageum(t0 + b * bar + bar / 2, scaleNote(S.root - 12, b % 2 ? 3 : 2), bar * 0.45, 0.32, 1);
  }
  return Math.min(sec, end + 1.5);
}

/* 주변 소리 — 막마다(목소리·짐승·날씨)를 음악 아래에 아주 작게(도구가 15dB 아래로 맞춤).
   목소리: 성대 떨림(톱니파+숨소리) → 입 모양 울림(모음 포먼트 3개). 멀리서 들리게 낮게 거르고 잔향을 많이. */
const FORMANT = {a: [800, 1150, 2900], o: [450, 800, 2830], u: [325, 700, 2530], e: [400, 1600, 2700], i: [270, 2300, 3000], eo: [550, 900, 2600]};
function ambience(ctx, bus, si, sec, R) {
  const SR = ctx.sampleRate;
  let nb = null;
  const noise = () => {
    if (nb) return nb;
    const n = SR * 3,
      b = ctx.createBuffer(1, n, SR),
      d = b.getChannelData(0);
    let s = 31337 + si;
    for (let i = 0; i < n; i++) d[i] = ((s = (s * 16807) % 2147483647) / 2147483647) * 2 - 1;
    return (nb = b);
  };
  const pan = (node, p) => {
    if (!ctx.createStereoPanner) return node;
    const sp = ctx.createStereoPanner();
    sp.pan.value = p;
    node.connect(sp);
    return sp;
  };
  /* 목소리 하나: f0=[[초, Hz]...] 높이 흐름, vw=[[초, 모음]...], fs=입 크기(여자 1.15·남자 1·짐승 0.6), br=숨 섞임 */
  function voice(t, dur, f0, vw, v, o = {}) {
    const src = ctx.createOscillator(),
      nz = ctx.createBufferSource(),
      ng = ctx.createGain(),
      sg = ctx.createGain(),
      env = ctx.createGain(),
      lp = ctx.createBiquadFilter(),
      fs = o.fs || 1;
    src.type = 'sawtooth';
    f0.forEach(([x, f], i) => (i ? src.frequency.linearRampToValueAtTime(f, t + x) : src.frequency.setValueAtTime(f, t + x)));
    // 떨림(울음·고통의 흔들림)
    const lfo = ctx.createOscillator(),
      lg = ctx.createGain();
    lfo.frequency.value = o.vibHz || 5.5;
    lg.gain.value = (o.vib || 0.03) * f0[0][1];
    lfo.connect(lg).connect(src.frequency);
    // 으르렁(짐승): 빠른 세기 흔들림
    let am = null;
    if (o.growl) {
      am = ctx.createGain();
      const gl = ctx.createOscillator(),
        gg = ctx.createGain();
      gl.frequency.value = o.growl;
      gg.gain.value = 0.5;
      am.gain.value = 0.5;
      gl.connect(gg).connect(am.gain);
      gl.start(t);
      gl.stop(t + dur + 0.1);
    }
    nz.buffer = noise();
    nz.loop = true;
    ng.gain.value = o.br === undefined ? 0.25 : o.br;
    sg.gain.value = 1;
    const mixIn = ctx.createGain();
    src.connect(sg).connect(mixIn);
    nz.connect(ng).connect(mixIn);
    const head = am ? (mixIn.connect(am), am) : mixIn;
    // 포먼트 셋(모음이 바뀌면 함께 움직임)
    const out = ctx.createGain();
    [0, 1, 2].forEach(k => {
      const bp = ctx.createBiquadFilter(),
        g = ctx.createGain();
      bp.type = 'bandpass';
      bp.Q.value = [9, 11, 13][k];
      vw.forEach(([x, w], i) => {
        const f = FORMANT[w][k] * fs;
        i ? bp.frequency.linearRampToValueAtTime(f, t + x) : bp.frequency.setValueAtTime(f, t + x);
      });
      g.gain.value = [1, 0.55, 0.25][k];
      head.connect(bp).connect(g).connect(out);
    });
    // 멀리서: 높은 소리 깎기
    lp.type = 'lowpass';
    lp.frequency.value = o.lp || 2200;
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(v, t + (o.att || 0.08));
    env.gain.setValueAtTime(v, t + dur * (o.hold || 0.6));
    env.gain.linearRampToValueAtTime(0, t + dur);
    pan(out.connect(lp).connect(env), o.pan || 0).connect(bus);
    for (const x of [src, lfo]) {
      x.start(t);
      x.stop(t + dur + 0.1);
    }
    nz.start(t, R() * 2);
    nz.stop(t + dur + 0.1);
  }
  // 걸러 낸 소음 층(비·바람·파도의 바탕)
  function noiseBed(t, dur, type, f, q, v, mod) {
    const src = ctx.createBufferSource(),
      fl = ctx.createBiquadFilter(),
      g = ctx.createGain();
    src.buffer = noise();
    src.loop = true;
    fl.type = type;
    fl.frequency.value = f;
    fl.Q.value = q;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + 2);
    if (mod) mod(g.gain, fl.frequency, t, dur);
    g.gain.setValueAtTime(v, t + dur - 2);
    g.gain.linearRampToValueAtTime(0, t + dur);
    src.connect(fl).connect(g).connect(bus);
    src.start(t, R() * 2);
    src.stop(t + dur);
  }
  function ping(t, f, v, dec) {
    const o = ctx.createOscillator(),
      g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * 0.7, t + dec);
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.0005, t + dec);
    pan(o.connect(g), R() * 1.6 - 0.8).connect(bus);
    o.start(t);
    o.stop(t + dec + 0.05);
  }
  const span = (a, b) => a + R() * (b - a),
    side = () => span(-0.8, 0.8);
  // 신음(낮게 흘러내리는 「오… 우…」)
  const moan = (t, base, v, o = {}) => {
    const d = span(1.8, 3.6);
    voice(t, d, [[0, base * span(1, 1.25)], [d * 0.4, base * span(1.05, 1.3)], [d, base * span(0.7, 0.85)]], [[0, 'o'], [d * 0.6, 'u']], v, {vib: 0.035, vibHz: span(4, 6.5), br: 0.45, lp: 1500, hold: 0.5, pan: side(), att: 0.4, ...o});
  };
  // 비명(높이 올라갔다 꺾이는 「아—」)
  const scream = (t, v) => {
    const d = span(0.7, 1.3),
      b = span(480, 650);
    voice(t, d, [[0, b], [d * 0.25, b * 1.6], [d, b * 1.05]], [[0, 'a'], [d * 0.7, 'eo']], v, {fs: 1.15, vib: 0.05, vibHz: 7, br: 0.35, lp: 2400, hold: 0.55, pan: side(), att: 0.05});
  };
  const end = sec;
  // v22.0 2부는 1부 장소 소리를 빌림: 11 고개(범) · 12 나루(비) · 13 옛 도읍(읊조림) · 14 대동강(물결) · 15 압록강(바람)
  switch (si < 10 ? si : [2, 3, 4, 7, 6][si - 10]) {
    case 0: // 1막: 도망가는 사람들의 비명(멀리 · 드문드문 · 가끔 겹침)
      for (let t = span(3, 5); t < end - 2; t += span(3.5, 6.5)) {
        scream(t, 0.5);
        if (R() < 0.4) scream(t + span(0.2, 0.8), 0.35);
      }
      noiseBed(0, sec, 'bandpass', 500, 0.8, 0.05); // 웅성임 바탕
      break;
    case 1: // 2막: 대숲을 가르는 바람(휘파람 같은 높은 바람 + 댓잎 서걱임)
      noiseBed(0, sec, 'bandpass', 1600, 9, 0.22, (g, f, t, d) => {
        for (let x = t + 2; x < t + d - 2; x += span(2, 4)) f.linearRampToValueAtTime(span(900, 2600), x);
      });
      noiseBed(0, sec, 'highpass', 4000, 0.7, 0.05, (g, f, t, d) => {
        for (let x = t + 2; x < t + d - 2; x += span(0.3, 0.9)) g.linearRampToValueAtTime(span(0.01, 0.07), x);
      });
      break;
    case 2: // 3막: 범의 으르렁(낮고 거칠게, 길게)
      for (let t = span(4, 6); t < end - 3; t += span(7, 10)) {
        const d = span(1.8, 2.6);
        voice(t, d, [[0, 70], [d * 0.3, 115], [d, 58]], [[0, 'a'], [d * 0.6, 'o']], 0.9, {fs: 0.6, growl: span(22, 30), br: 0.6, vib: 0.02, lp: 900, hold: 0.45, pan: side(), att: 0.25});
      }
      break;
    case 3: // 4막: 비(쏴— 바탕 + 빗방울 톡톡)
      noiseBed(0, sec, 'highpass', 2200, 0.5, 0.1);
      noiseBed(0, sec, 'lowpass', 600, 0.5, 0.05);
      for (let t = 1; t < end - 1; t += span(0.04, 0.16)) ping(t, span(2500, 4500), span(0.02, 0.05), span(0.02, 0.05));
      break;
    case 4: { // 5막: 불경 읊조림(낮은 남자 목소리, 같은 높이로 「나무아미타불」 꼴 모음 흐름, 장단 맞춰)
      const syl = ['a', 'u', 'a', 'i', 'a', 'u'],
        base = 98;
      for (let t = 1.5; t < end - 2; t += 3.6) {
        const d = 3.2,
          vw = syl.map((w, i) => [(i * d) / syl.length, w]);
        voice(t, d, [[0, base], [d * 0.8, base], [d, base * 0.94]], vw, 0.7, {vib: 0.006, vibHz: 3, br: 0.2, lp: 1200, hold: 0.85, pan: -0.3, att: 0.15});
        if (R() < 0.6) voice(t + 0.05, d, [[0, base * 1.5], [d, base * 1.45]], vw, 0.25, {vib: 0.006, br: 0.2, lp: 1200, hold: 0.85, pan: 0.3, att: 0.15});
      }
      break;
    }
    case 5: // 6막: 죽어가는 사람들(약한 신음 · 기침 같은 숨)
      for (let t = span(1.5, 3); t < end - 3; t += span(2.5, 4.5)) moan(t, span(120, 170), 0.6);
      // 힘없는 기침(짧은 숨 터짐 두 번)
      for (let t = span(3, 5); t < end - 2; t += span(4, 7)) [0, 0.28].forEach(dx => voice(t + dx, 0.22, [[0, 150], [0.22, 120]], [[0, 'eo']], 0.4, {br: 1.6, lp: 1600, hold: 0.2, pan: side(), att: 0.01}));
      break;
    case 6: // 7막: 강한 바람(낮게 우는 바람 + 세찬 돌풍)
      noiseBed(0, sec, 'lowpass', 420, 0.8, 0.22, (g, f, t, d) => {
        for (let x = t + 2; x < t + d - 2; x += span(1.5, 3.5)) g.linearRampToValueAtTime(span(0.08, 0.32), x);
      });
      noiseBed(0, sec, 'bandpass', 380, 10, 0.12, (g, f, t, d) => {
        for (let x = t + 2; x < t + d - 2; x += span(2, 4)) f.linearRampToValueAtTime(span(260, 620), x);
      });
      break;
    case 7: // 8막: 파도(밀려와 부서지고 쏴— 빠짐)
      for (let t = 0.5; t < end - 4; t += span(5, 7)) {
        const src = ctx.createBufferSource(),
          lp = ctx.createBiquadFilter(),
          g = ctx.createGain();
        src.buffer = noise();
        src.loop = true;
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(300, t);
        lp.frequency.linearRampToValueAtTime(2800, t + 2.2);
        lp.frequency.linearRampToValueAtTime(900, t + 5);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.32, t + 2.2);
        g.gain.linearRampToValueAtTime(0.06, t + 5);
        g.gain.linearRampToValueAtTime(0, t + 6);
        pan(src.connect(lp).connect(g), side() * 0.5).connect(bus);
        src.start(t, R() * 2);
        src.stop(t + 6.2);
      }
      break;
    case 8: // 9막: 저승의 고통받는 목소리(여럿이 겹쳐 웅웅 울부짖음)
      for (let t = 0.5; t < end - 3; t += span(0.8, 1.8)) moan(t, span(90, 220), 0.45, {fs: R() < 0.4 ? 1.15 : 1, lp: 1300, vib: 0.05});
      for (let t = span(5, 8); t < end - 3; t += span(6, 9)) scream(t, 0.25);
      break;
    case 9: // 10막: 쓰러지는 병사들(외침 · 신음 · 멀리 칼 부딪힘)
      for (let t = span(1, 2); t < end - 3; t += span(2.5, 4)) {
        if (R() < 0.5) {
          const d = span(0.5, 0.8),
            b = span(170, 230);
          voice(t, d, [[0, b], [d * 0.3, b * 1.3], [d, b * 0.8]], [[0, 'eo'], [d * 0.5, 'a']], 0.55, {vib: 0.04, br: 0.4, lp: 1800, hold: 0.4, pan: side(), att: 0.04});
        } else moan(t, span(95, 140), 0.55);
      }
      for (let t = 1; t < end - 1; t += span(0.6, 2)) [1, 2.7, 4.3].forEach((r, i) => ping(t, 1300 * r * span(0.95, 1.05), 0.02 / (1 + i), span(0.15, 0.35)));
      break;
  }
}

/* 본부 곡 — 느린 가야금 산조풍(진양조 18작은박), 계면조, 대금 조금, 징 두 장단마다 · 주변 소리 없음 */
const HUB = {bpm: 46, sub: 3, len: 18, root: 50};
function hubBar() {
  return (60 / HUB.bpm / HUB.sub) * HUB.len;
}
function hubSong(ctx, sec, opt = {}) {
  const R = rng(777),
    master = ctx.createGain(),
    inst = ctx.createGain(),
    drum = ctx.createGain(),
    comp = ctx.createDynamicsCompressor(),
    dark = ctx.createBiquadFilter();
  dark.type = 'lowpass';
  dark.frequency.value = 2400;
  const G = makeGugak(ctx, {inst, drum}),
    rv = G.reverb(3.2, 2.4),
    rg = ctx.createGain();
  rg.gain.value = 0.45;
  drum.gain.value = 0.6;
  inst.connect(dark);
  drum.connect(dark);
  inst.connect(rv);
  drum.connect(rv);
  rv.connect(rg).connect(dark);
  dark.connect(master).connect(comp).connect(ctx.destination);
  const LP = opt.loop || {pre: 0.3, bars: Math.floor(sec / hubBar())},
    step = 60 / HUB.bpm / HUB.sub,
    bar = hubBar(),
    t0 = LP.pre,
    bars = LP.bars + 1,
    end = t0 + LP.bars * bar;
  G.drone(0, HUB.root - 12, sec, 0.025);
  for (let b = 0; b < bars; b++) {
    if (b % 2 === 0) G.jing(t0 + b * bar, 0.14, 98);
    G.kung(t0 + b * bar + step * 6, 0.25);
    G.deok(t0 + b * bar + step * 12, 0.08);
  }
  // 가야금 산조: 길게 뜯고 깊게 떨며(농현) 오르내리는 가락 — 장단 하나에 서너 음
  let deg = 4,
    t = t0;
  while (t < end - step * 3) {
    const n = [3, 3, 6, 6, 9][Math.floor(R() * 5)];
    deg = Math.max(0, Math.min(9, deg + [-2, -1, -1, 1, 1, 2][Math.floor(R() * 6)]));
    G.gayageum(t, scaleNote(HUB.root, deg), n * step * 0.95, 0.5, deg % 5 === 3 ? 2.5 : 1.5);
    if (R() < 0.3) G.gayageum(t + step * 1.5, scaleNote(HUB.root, deg - 2), step * 1.4, 0.28, 1);
    t += n * step;
  }
  // 대금: 둘째 장단부터 드문드문 긴 소리
  for (let b = 1; b < LP.bars; b += 2) G.daegeum(t0 + b * bar + step * 3, scaleNote(HUB.root + 12, [3, 2, 4, 1][((b - 1) / 2) % 4]), step * 9, 0.13, {vib: 0.025, vibHz: 4.2, fall: b % 4 === 3 ? 2 : 0});
  return sec;
}
/* 하네스·도구에서 부르기 쉽게 */
if (typeof globalThis !== 'undefined') Object.assign(globalThis, {stageSong, stageBar, hubSong, hubBar, STAGE_BGM, BOSS_TEMPO});
