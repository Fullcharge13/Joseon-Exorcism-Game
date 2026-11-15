"""배경음 파일 검사 (v21.0 · 브라우저 없이 · tools/bgm.py가 만든 audio/bgm/ 을 봄)
사용: python3 tests/browser/bgm_tool.py
 1) bgm.json에 s01~s10 · b01~b10 · hub 21곡, 파일이 있고 이름의 지문 = 내용 앞 6자리(sha1)
 2) 곡 길이 = 장단 한 바퀴의 정수배(도구가 적은 bar·bars) · 40~60초
 3) 모노 · mp3
 4) 주변 소리 차이: 막 곡·보스 판은 음악보다 15±1dB 아래(도구가 잰 값) · 본부 곡은 주변 소리 없음
 5) 이음새: 끝→처음 점 차이가 곡 안 점 차이의 99.9번째 값보다 크지 않음(도구가 잰 값)
 6) 보스 판은 같은 막 곡보다 빠름(bpm × 1.15) · 막 곡은 1→10막 빠르기가 줄지 않음
 8) 이음새 겹치기가 같은 소리를 부풀리지 않음(±1dB) · 9) 풀린 mp3 반복 지점이 튀지 않음
 7) 곡마다 만든 코드 지문(compose.js+bgm.py) = 지금 코드 → 코드를 고치고 음원을 다시 안 만든 것을 잡음
"""
import sys, json, hashlib, pathlib, subprocess
ROOT = pathlib.Path(__file__).resolve().parent.parent.parent
B = ROOT / 'audio' / 'bgm'
fails = []
def ok(c, m):
    if not c: fails.append(m)
J = B / 'bgm.json'
ok(J.exists(), 'audio/bgm/bgm.json 있음')
if J.exists():
    M = json.loads(J.read_text(encoding='utf-8'))
    T = M.get('tracks', {})
    want = [f's{i:02d}' for i in range(1, 11)] + [f'b{i:02d}' for i in range(1, 11)] + ['hub']
    ok(sorted(T) == sorted(want), f'21곡 ({len(T)}): {sorted(set(want) ^ set(T))}')
    for k in want:
        t = T.get(k)
        if not t:
            continue
        f = B / t['file']
        ok(f.exists(), f'{k}: 파일 {t["file"]}')
        if not f.exists():
            continue
        h = hashlib.sha1(f.read_bytes()).hexdigest()[:6]
        ok(t['file'] == f'{k}-{h}.mp3', f'{k}: 이름 지문 {t["file"]} ≠ {k}-{h}.mp3')
        ok(abs(t['sec'] - t['bar'] * t['bars']) < 1e-4 and 40 <= t['sec'] <= 60, f'{k}: 길이 {t["sec"]} = 장단 {t["bar"]:.3f} × {t["bars"]}')
        pr = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=channels,codec_name', '-of', 'csv=p=0', str(f)], capture_output=True, text=True).stdout.strip()
        ok(pr == 'mp3,1', f'{k}: 모노 mp3 ({pr})')
        if k == 'hub':
            ok(t.get('ambDiff') is None, f'hub: 주변 소리 없음 ({t.get("ambDiff")})')
        else:
            ok(t.get('ambDiff') is not None and abs(t['ambDiff'] - 15) <= 1, f'{k}: 주변 소리 차이 {t.get("ambDiff")}dB')
        ok(t.get('seam') is not None and t['seam'] <= t['p999'], f'{k}: 이음새 {t.get("seam")} ≤ 곡 안 99.9% {t.get("p999")}')
    s = [T[f's{i:02d}']['bpm'] for i in range(1, 11) if f's{i:02d}' in T]
    ok(all(a <= b for a, b in zip(s, s[1:])), f'막 곡 빠르기가 줄지 않음 {s}')
    for i in range(1, 11):
        a, b = T.get(f's{i:02d}'), T.get(f'b{i:02d}')
        if a and b:
            ok(abs(b['bpm'] - a['bpm'] * 1.15) < 0.5, f'{i}막 보스 판 빠르기 {b["bpm"]} = {a["bpm"]}×1.15')
    ok(isinstance(M.get('delay'), (int, float)) and 0 <= M['delay'] < 0.1, f'mp3 앞 지연(초) 적힘 {M.get("delay")}')
    src = hashlib.sha1((ROOT / 'tools' / 'bgm' / 'compose.js').read_bytes() + (ROOT / 'tools' / 'bgm.py').read_bytes()).hexdigest()[:12]
    stale = [k for k in want if T.get(k, {}).get('src') != src]
    ok(not stale, f'곡 코드가 바뀌었는데 다시 만들지 않은 곡(python3 tools/bgm.py): {stale[:5]}')
# 8) 이음새 겹치기: 양쪽이 같은 소리(장단·반주)면 겹치는 가운데가 부풀면 안 됨(등전력이면 +3dB) — 도구의 겹치기 함수를 직접
import numpy as np
sys.path.insert(0, str(ROOT / 'tools')); sys.argv = [sys.argv[0]]
import bgm as BG
sr = BG.SR; t = np.arange(int((BG.PRE + 4 + BG.XF + 1) * sr)) / sr
x = 0.3 * np.sin(2 * np.pi * 220 * t)   # 이어지는 같은 소리
L = int(4 * sr); y = BG.loop_cut(x, L); n = int(BG.XF * sr)
mid = y[n // 2 - 2000:n // 2 + 2000]; rest = y[n + 1000:n + 5000]
swell = 20 * np.log10(np.sqrt((mid ** 2).mean()) / np.sqrt((rest ** 2).mean()))
ok(abs(swell) <= 1.0, f'이음새 겹치기: 같은 소리의 가운데 크기 차이 {swell:+.2f}dB(±1)')
# 9) 실제 mp3를 풀어 반복 지점(지연 반영)에서 끝 → 처음이 튀지 않음
if J.exists():
    for k in ('s01', 's04', 'b09', 'hub'):
        t_ = T.get(k)
        if not t_: continue
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(B / t_['file']), '-ac', '1', '-ar', str(sr), '-f', 'f32le', 'pipe:1'], capture_output=True).stdout
        z = np.frombuffer(raw, dtype=np.float32).astype(np.float64); Ls = int(round(t_['sec'] * sr))
        off = int(round(M['delay'] * sr)) if len(z) >= Ls + int(M['delay'] * sr) - 90 else 0
        jump = abs(z[off + Ls - 1] - z[off]); p999 = np.percentile(np.abs(np.diff(z[off:off + Ls])), 99.9)
        ok(jump <= p999, f'{k}: 풀린 mp3 반복 지점 튐 {jump:.4f} ≤ {p999:.4f} (앞 {off}점)')

if fails:
    print('FAIL bgm_tool\n  ' + '\n  '.join(fails)); sys.exit(1)
print('PASS bgm_tool (21곡 · 지문 · 길이 · 모노 · 주변 소리 15dB · 이음새 · 빠르기)')
