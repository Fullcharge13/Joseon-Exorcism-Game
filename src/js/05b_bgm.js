/* v21.0 배경음 — 미리 만든 국악풍 곡(audio/bgm/*.mp3, tools/bgm.py)을 상황에 맞게 반복 재생
   「지금 들려야 할 곡」 bgmWanted(상태) → {id, gain} 하나로 정하고, 1초에 네 번 보아 바뀌면 2초 동안 겹쳐 넘어감.
   곡: s01~s10 막 곡 · b01~b10 같은 막의 보스 판(빠르고 세게) · hub 판 밖(시작 화면·본부) */

/* 상황 → 곡과 크기(0~1). st = {G, modal, vol(설정 0~100), muted}
   - 판 밖(G 없음): hub · 판 안: 그 막(끝없는 밤은 10으로 돌림), 막 보스가 있으면 보스 판(중간 보스는 막 곡)
   - 창(레벨업·정지·보상…)이 떠 있으면 반 · 결과 화면·음소거는 같은 곡을 0으로(줄여 끔) · 설정 0이면 곡 없음(받지도 않음) */
function bgmWanted(st) {
  if (!(st.vol > 0)) return {id: null, gain: 0};
  const g = st.G;
  let id = 'hub',
    gain = 1;
  if (g) {
    // 설화 출정은 화면의 막(G.tale.st)을 따름 — G.stage는 세기용(eq)이라 다른 막일 수 있음
    const sn = g.mode === 'tale' && g.tale && g.tale.st != null ? g.tale.st : g.stage,
      n = (((Math.max(0, sn | 0) % 10) + 10) % 10) + 1,
      nn = String(n).padStart(2, '0');
    id = (g.boss ? 'b' : 's') + nn;
    if (g.over) gain = 0;
    else if (st.modal) gain = 0.5;
  }
  if (st.muted) gain = 0;
  return {id, gain};
}
/* 바꾸기 규칙: 곡이 바뀐 뒤 1초 안에는 다른 곡으로 다시 바꾸지 않음(보스가 잠깐 사라졌다 나오는 깜빡임 막기)
   cur = {id, at(바꾼 시각 초)} → 새 {id, at} */
const BGM_HOLD = 1;
function bgmNext(cur, want, now) {
  if (want.id === cur.id) return cur;
  if (cur.id && now - cur.at < BGM_HOLD) return cur;
  return {id: want.id, at: now};
}

/* ── 재생 ── */
const BGM_LEVEL = 0.55, // 「배경음 100」일 때 크기(효과음보다 뒤에 깔리게)
  BGM_FADE = 2, // 곡이 바뀔 때 겹치는 초
  BGM_KEEP = 3; // 한 번에 들고 있는 곡 수(메모리)
const BGM = {cur: {id: null, at: 0}, man: null, manP: null, manNext: 0, manFail: 0, bufs: new Map(), raw: new Map(), use: [], play: null, want: {id: null, gain: 0}, tick: 0, failed: new Map(), master: null};
function bgmManifest() {
  if (BGM.man || BGM.manP) return BGM.manP;
  if (performance.now() < BGM.manNext) return null; // 못 받았으면 물러섬(5초 → 10초 → … 1분)
  BGM.manP = fetch('audio/bgm/bgm.json')
    .then(r => (r.ok ? r.json() : Promise.reject(new Error('bgm.json ' + r.status))))
    .then(m => {
      BGM.man = m;
      // 오프라인 저장소(sw.js의 jtm-bgm)에서 이 목록에 없는 옛 곡 파일(지문이 바뀐 것)을 지움
      try {
        const keep = new Set(Object.values(m.tracks || {}).map(t => t.file));
        if (window.caches)
          caches
            .open('jtm-bgm')
            .then(c => c.keys().then(ks => ks.forEach(k => keep.has(k.url.split('/').pop()) || c.delete(k))))
            .catch(() => {});
      } catch (_) {}
      return m;
    })
    .catch(e => {
      BGM.manP = null;
      BGM.manFail++;
      BGM.manNext = performance.now() + Math.min(60, 5 * 2 ** (BGM.manFail - 1)) * 1000;
      bgmFail('bgm.json', e);
    });
  return BGM.manP;
}
/* 받기 실패를 오류 기록에 넣을지 — 인터넷이 없거나 파일로 직접 연 때는 당연히 못 받으니 넣지 않음 */
function bgmLogFail(env) {
  return env.proto !== 'file:' && env.online !== false;
}
/* v21.2.1 받기 실패: 그 판 내내 막지 않고 30초 → 60초 → 120초(최대) 뒤 다시 받아 봄 · 오류 기록은 곡마다 한 번 */
function bgmRetryOk(id, now = performance.now()) {
  const f = BGM.failed.get(id);
  return !f || now >= f.next;
}
function bgmFail(id, e) {
  const f = BGM.failed.get(id) || {n: 0, logged: false},
    now = performance.now();
  f.n++;
  f.next = now + Math.min(120, 30 * 2 ** (f.n - 1)) * 1000;
  BGM.failed.set(id, f);
  if (f.logged) return;
  f.logged = true;
  try {
    const env = {
      proto: typeof location !== 'undefined' ? location.protocol : '',
      online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    };
    if (bgmLogFail(env)) diagNote(_t('배경음 못 받음'), id + ': ' + (e && e.message ? e.message : e));
  } catch (_) {}
}
/* 곡 파일 받기(한 번만) — 아이폰 첫 터치 전에도 받아만 둠(소리 엔진이 없어 풀지는 못함) */
function bgmFetch(id) {
  if (BGM.raw.has(id)) return BGM.raw.get(id);
  const t = BGM.man && BGM.man.tracks && BGM.man.tracks[id];
  if (!t) return null;
  const p = fetch('audio/bgm/' + t.file).then(r => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(r.status))));
  BGM.raw.set(id, p);
  p.catch(() => BGM.raw.delete(id));
  return p;
}
/* 곡 받기·풀기(한 번만) — 3곡 넘으면 오래 안 쓴 것부터 버림(지금 곡 빼고) */
function bgmLoad(id) {
  if (!id || !AC || !BGM.man || !bgmRetryOk(id)) return null;
  BGM.use = BGM.use.filter(x => x !== id).concat(id);
  if (BGM.bufs.has(id)) return BGM.bufs.get(id);
  const t = BGM.man.tracks && BGM.man.tracks[id];
  if (!t) return null;
  const p = (bgmFetch(id) || Promise.reject(new Error('no track')))
    .then(ab => new Promise((ok, no) => {
      BGM.raw.delete(id); // 풀고 나면 받은 바이트는 버림(메모리)
      let done = false;
      const ok1 = b => done || ((done = true), ok(b)),
        no1 = e => done || ((done = true), no(e));
      const q = AC.decodeAudioData(ab, ok1, no1); // 옛 사파리는 콜백, 새것은 약속(Promise) — 한 번만 받음
      if (q && q.then) q.then(ok1, no1);
    }))
    .then(buf => {
      if (BGM.bufs.get(id) === p) BGM.bufs.set(id, buf); // 받는 사이 버려졌으면 다시 넣지 않음
      const f = BGM.failed.get(id);
      if (f) f.n = 0; // 받았으면 다음 실패는 다시 30초부터(기록은 한 번 그대로)
      return buf;
    })
    .catch(e => {
      BGM.bufs.delete(id);
      bgmFail(id, e);
      return null;
    });
  BGM.bufs.set(id, p);
  while (BGM.use.length > BGM_KEEP) {
    const old = BGM.use.find(x => x !== BGM.cur.id && x !== id);
    if (!old) break;
    BGM.use = BGM.use.filter(x => x !== old);
    BGM.bufs.delete(old);
  }
  return p;
}
/* 반복 지점: 브라우저가 mp3 앞 지연을 지우지 않았으면(길이 ≥ 곡 + 지연) 그만큼 뒤에서 시작 ·
   앞은 지우고 끝 덧붙임(≤26ms)만 남긴 경우는 그대로 0에서 */
function bgmLoopPts(buf, t, man = BGM.man) {
  const dl = (man && man.delay) || 0,
    d = buf.duration >= t.sec + dl - 0.002 ? dl : 0;
  return [d, d + t.sec];
}
/* 크기 흐름을 스스로 기억(소리 노드의 value는 재생 전·흐름 중에 믿을 수 없음 — 새 노드가 1로 읽혀 크게 시작하던 것) */
function bgmRampNow(r, now) {
  if (!r) return 0;
  if (now >= r.t1) return r.v1;
  if (now <= r.t0) return r.v0;
  return r.v0 + ((r.v1 - r.v0) * (now - r.t0)) / (r.t1 - r.t0);
}
function bgmRamp(p, v, sec) {
  const now = AC.currentTime,
    cur = bgmRampNow(p.r, now);
  p.g.gain.cancelScheduledValues(now);
  p.g.gain.setValueAtTime(cur, now);
  p.g.gain.linearRampToValueAtTime(v, now + sec);
  p.r = {v0: cur, v1: v, t0: now, t1: now + sec};
}
function bgmBus() {
  if (!BGM.master) {
    BGM.master = AC.createGain();
    BGM.master.connect(AC.destination);
  }
  return BGM.master;
}
function bgmStart(id, buf) {
  const t = BGM.man.tracks[id],
    [a, b] = bgmLoopPts(buf, t),
    src = AC.createBufferSource(),
    g = AC.createGain(),
    now = AC.currentTime;
  src.buffer = buf;
  src.loop = true;
  src.loopStart = a;
  src.loopEnd = b;
  g.gain.value = 0; // 새 소리 노드는 처음 1 — 첫 소리가 나기 전에 0으로(크게 시작하지 않게)
  g.gain.setValueAtTime(0, now);
  src.connect(g).connect(bgmBus());
  src.start(now, a);
  bgmStop(BGM.play);
  BGM.play = {id, src, g, r: {v0: 0, v1: 0, t0: now, t1: now}};
  bgmLevel(true);
}
function bgmStop(p, sec = BGM_FADE) {
  if (!p) return;
  try {
    bgmRamp(p, 0, sec);
    p.src.stop(AC.currentTime + sec + 0.05);
  } catch (_) {}
}
function bgmTarget() {
  return BGM.want.gain * (Math.max(0, Math.min(100, meta.set.bgm | 0)) / 100) * BGM_LEVEL;
}
/* 지금 곡 크기를 목표로(새 곡은 BGM_FADE초, 창 열고 닫기는 0.3초) */
function bgmLevel(fresh) {
  const p = BGM.play;
  if (!p || !AC) return;
  const v = bgmTarget();
  bgmRamp(p, v, fresh ? BGM_FADE : 0.3);
  p.tgt = v;
}
/* 1초에 네 번: 원하는 곡 → 받기 → 바꾸기 · 다음에 쓸 곡 미리 받기 */
function bgmTick(nowS) {
  if (nowS - BGM.tick < 0.25) return;
  BGM.tick = nowS;
  const w = bgmWanted({G, modal, vol: meta.set.bgm, muted});
  BGM.want = w;
  if (!AC) {
    // 아이폰: 첫 터치 전에는 소리를 낼 수 없음 → 목록과 지금 곡 파일을 받아만 둠
    if (w.id) BGM.man ? bgmFetch(w.id) : bgmManifest();
    return;
  }
  if (!w.id) {
    if (BGM.play) {
      bgmStop(BGM.play);
      BGM.play = null;
    }
    BGM.cur = {id: null, at: nowS};
    return;
  }
  if (!BGM.man) return void bgmManifest();
  BGM.cur = bgmNext(BGM.cur, w, nowS);
  const id = BGM.cur.id;
  if (!BGM.play || BGM.play.id !== id) {
    const b = bgmLoad(id);
    if (b && !(b instanceof Promise)) bgmStart(id, b);
    else if (b) b.then(buf => buf && BGM.cur.id === id && (!BGM.play || BGM.play.id !== id) && bgmStart(id, buf)); // 받은 뒤 아직 그 곡일 때만
  } else if (Math.abs((BGM.play.tgt || 0) - bgmTarget()) > 1e-6) bgmLevel(false);
  // 미리 받기: 막 곡이면 그 보스 판, 보스 판이면 다음 막 곡(꺼져 있을 때는 받지 않음)
  if (G && id !== 'hub' && w.gain > 0) {
    const n = +id.slice(1);
    bgmLoad(id[0] === 's' ? 'b' + id.slice(1) : 's' + String((n % 10) + 1).padStart(2, '0'));
  }
}
/* 시험·오류 기록용: 지금 상태 */
function bgmState() {
  return {
    want: BGM.want.id,
    playing: BGM.play ? BGM.play.id : null,
    target: bgmTarget(),
    level: BGM.play && AC ? +BGM.play.g.gain.value.toFixed(4) : 0,
    loaded: [...BGM.bufs.keys()].filter(k => !(BGM.bufs.get(k) instanceof Promise)),
    ctx: AC ? AC.state : null
  };
}
/* 첫 터치·클릭·키(아이폰은 손가락을 뗄 때만 소리를 열어 줌)에 소리 엔진을 켬 — 그 뒤로 배경음이 시작됨 */
function bgmUnlock() {
  if (AC && AC.state === 'running') return; // 켜져 있으면 할 일 없음(가벼움) — 전화 등으로 끊긴('interrupted') 뒤 다음 터치에 다시 켜려고 듣기는 계속
  initAudio();
  resumeAudio();
}
for (const ev of ['touchend', 'click', 'keydown']) addEventListener(ev, bgmUnlock, {capture: true, passive: true});
