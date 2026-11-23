"""조선퇴마록 배경음 만들기 (v21.0)

  python3 tools/bgm.py            # 21곡(막 s01~s10 · 보스 판 b01~b10 · 본부 hub)을 audio/bgm/에 만듦
  python3 tools/bgm.py s03 b03    # 몇 곡만
  python3 tools/bgm.py --force    # 곡 코드가 같아도 다시 만들기

곡은 tools/bgm/compose.js(Web Audio 합성)를 실제 브라우저의 OfflineAudioContext로 만들고 ffmpeg로 모노 mp3(96kbps).
- 반복: 곡 앞에 PRE초를 두고 장단 BARS번 + 한 번 더 연주 → [PRE, PRE+길이)를 자르고, 끝 다음 XF초를 앞에 겹쳐(이음새가 끊기지 않음)
- 주변 소리: 곡마다 음악만·주변만을 누르기 없이 재서 음악보다 AMB_DB 작게 맞춤
- 크기: 곡마다 RMS를 TARGET_DB로 맞추고, 넘치는 꼭대기는 부드럽게 누름
- 곡 코드(compose.js·bgm.py)가 같으면 다시 만들지 않음(받는 사람이 다시 받지 않게) · 이름에 내용 지문 6자리 · audio/bgm/bgm.json에 곡 목록·잰 값·코드 지문
"""
import sys, io, json, base64, hashlib, pathlib, subprocess, wave
import numpy as np
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'audio' / 'bgm'
JS = (ROOT / 'tools' / 'bgm' / 'compose.js').read_text(encoding='utf-8')
SR = 44100
PRE, XF, AIM, AMB_DB, TARGET_DB = 3.5, 1.5, 48.0, 15.0, -18.0
DELAY = 1105 / SR  # mp3(LAME) 앞 지연: 브라우저가 지우지 않으면 반복 시작점을 이만큼 뒤로

RENDER = """async ([kind, si, opt, sec])=>{
  const ctx=new OfflineAudioContext(2, Math.ceil(44100*sec), 44100);
  if(kind==='hub') hubSong(ctx, sec, opt); else stageSong(ctx, si, sec, opt);
  const b=await ctx.startRendering();
  const L=b.getChannelData(0), R=b.getChannelData(1), m=new Float32Array(b.length);
  for(let i=0;i<b.length;i++) m[i]=(L[i]+R[i])*0.5;
  const u=new Uint8Array(m.buffer);let s='';
  for(let i=0;i<u.length;i+=32768) s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));
  return btoa(s);
}"""


def pcm(pg, kind, si, opt, sec):
    return np.frombuffer(base64.b64decode(pg.evaluate(RENDER, [kind, si, opt, sec])), dtype=np.float32).astype(np.float64)


def rms_db(x):
    return 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-12)


def pick_bars(bar):
    """48초에 가장 가까운 짝수 바퀴(40~60초 안)"""
    best = None
    for n in range(2, 200, 2):
        s = n * bar
        if 40 <= s <= 60 and (best is None or abs(s - AIM) < abs(best * bar - AIM)):
            best = n
    return best


def loop_cut(x, L):
    """[PRE, PRE+L) 자르고 끝 다음 XF초를 앞에 곧은 비율로 겹침 → out[-1]→out[0]이 이어짐.
    양쪽은 같은 장단·반주가 이어지는 소리라(서로 닮음) 등전력(sin·cos)으로 겹치면 가운데가 +3dB 부풂 → 곧은 비율(합이 1)"""
    a, n = int(PRE * SR), int(XF * SR)
    seg = x[a:a + L].copy()
    ext = x[a + L:a + L + n]
    w = np.arange(n) / n
    seg[:n] = seg[:n] * w + ext * (1 - w)
    return seg


def level(x):
    x = x * 10 ** ((TARGET_DB - rms_db(x)) / 20)
    pk = 0.95
    over = np.abs(x) > pk
    x[over] = np.sign(x[over]) * (pk + (1 - pk) * np.tanh((np.abs(x[over]) - pk) / (1 - pk)))
    return x


def mp3(x):
    b = io.BytesIO()
    with wave.open(b, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())
    r = subprocess.run(['ffmpeg', '-v', 'error', '-f', 'wav', '-i', 'pipe:0', '-ac', '1', '-b:a', '96k', '-map_metadata', '-1', '-fflags', '+bitexact', '-flags:a', '+bitexact', '-f', 'mp3', 'pipe:1'],
                       input=b.getvalue(), capture_output=True, check=True)
    return r.stdout


def src_hash():
    """곡을 만든 코드의 지문 — 이게 같고 파일이 있으면 다시 만들지 않음.
    (브라우저 합성은 돌릴 때마다 −130dB쯤 아주 작은 차이가 나고, mp3 압축이 바람·비 같은 소음 곡에서 그것을 −35dB까지 키워
     「만든 결과로 같은지」는 가를 수 없음 → 「만든 코드가 같은지」로 가름)"""
    return hashlib.sha1((ROOT / 'tools' / 'bgm' / 'compose.js').read_bytes() + (ROOT / 'tools' / 'bgm.py').read_bytes()).hexdigest()[:12]


def make(pg, tid):
    kind = 'hub' if tid == 'hub' else 'stage'
    si = 0 if kind == 'hub' else int(tid[1:]) - 1
    boss = tid.startswith('b')
    bar = pg.evaluate('()=>hubBar()') if kind == 'hub' else pg.evaluate('([si,b])=>stageBar(si,b)', [si, boss])
    bars = pick_bars(bar)
    secL = bars * bar
    L = int(round(secL * SR))
    total = PRE + secL + bar + XF + 1.0
    loop = {'pre': PRE, 'bars': bars}
    info = {'bar': bar, 'bars': bars, 'sec': secL}
    if kind == 'hub':
        x = pcm(pg, 'hub', 0, {'loop': loop}, total)
        info['bpm'] = pg.evaluate('()=>HUB.bpm')
    else:
        base = {'loop': loop, 'boss': boss}
        a, n = int(PRE * SR), L
        m = pcm(pg, 'stage', si, {**base, 'raw': True}, total)[a:a + n]
        e = pcm(pg, 'stage', si, {**base, 'raw': True, 'music': False, 'amb': 1}, total)[a:a + n]
        g = 10 ** ((rms_db(m) - AMB_DB - rms_db(e)) / 20)
        info['ambDiff'] = round(float(rms_db(m) - rms_db(e * g)), 2)
        info['bpm'] = round(pg.evaluate('(si)=>STAGE_BGM[si].bpm', si) * (pg.evaluate('()=>BOSS_TEMPO') if boss else 1), 2)
        x = pcm(pg, 'stage', si, {**base, 'amb': g}, total)
    y = level(loop_cut(x, L))
    d = np.abs(np.diff(y))
    info['seam'] = round(float(abs(y[0] - y[-1])), 5)
    info['p999'] = round(float(np.percentile(d, 99.9)), 5)
    data = mp3(y)
    name = f'{tid}-{hashlib.sha1(data).hexdigest()[:6]}.mp3'
    return name, data, info


def main():
    global SRC, FORCE
    SRC, FORCE = src_hash(), '--force' in sys.argv
    want = [a for a in sys.argv[1:] if not a.startswith('--')] or [f's{i:02d}' for i in range(1, 16)] + [f'b{i:02d}' for i in range(1, 16)] + ['hub']  # v22.0 2부 11~15막
    OUT.mkdir(parents=True, exist_ok=True)
    jf = OUT / 'bgm.json'
    M = json.loads(jf.read_text(encoding='utf-8')) if jf.exists() else {}
    T = M.get('tracks', {})
    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page()
        pg.set_content('<html><body></body></html>')
        pg.add_script_tag(content=JS)
        for tid in want:
            old = T.get(tid, {})
            if not FORCE and old.get('src') == SRC and (OUT / old.get('file', '-')).exists():
                print(f'{tid:4} 그대로(곡 코드가 같음)')
                continue
            name, data, info = make(pg, tid)
            info['src'] = SRC
            old = old.get('file')
            f = OUT / name
            if not f.exists() or f.read_bytes() != data:
                f.write_bytes(data)
            old = T.get(tid, {}).get('file')
            if old and old != name and (OUT / old).exists():
                (OUT / old).unlink()  # 지문이 바뀐 옛 파일(우리 도구가 만든 것)만 지움
            T[tid] = {'file': name, **{k: (round(v, 6) if isinstance(v, float) else v) for k, v in info.items()}}
            print(f"{tid:4} {info['sec']:5.1f}초 ({info['bars']}×{info['bar']:.2f}) {info['bpm']}박 · 주변 {info.get('ambDiff', '-')}dB 아래 · 이음새 {info['seam']} ≤ {info['p999']} · {len(data)//1024}KB")
        br.close()
    M = {'note': 'tools/bgm.py가 만듦 — 손으로 고치지 마세요', 'sr': SR, 'delay': round(DELAY, 6), 'tracks': dict(sorted(T.items()))}
    body = json.dumps(M, ensure_ascii=False, indent=1) + '\n'
    if not jf.exists() or jf.read_text(encoding='utf-8') != body:
        jf.write_text(body, encoding='utf-8')
    print(f"합계 {sum((OUT / t['file']).stat().st_size for t in T.values())//1024}KB · {len(T)}곡")


if __name__ == '__main__':
    main()
