#!/usr/bin/env python3
"""조선퇴마록 빌드: src/ 를 합쳐 배포용 index.html 한 장을 만든다 (v18.0).
  python3 build.py           # index.html 을 새로 만든다
  python3 build.py --check   # 만들 결과가 지금 index.html 과 같은지만 본다(다르면 실패)
src/shell.html 의 <!--JS--> 자리에 src/i18n/*.js 와 src/js/*.js 를 이름 순서대로 이어 붙인다.
"""
import sys, pathlib, hashlib
ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / 'src'
OUT = ROOT / 'index.html'
MARK = '<!--JS-->\n'

def build_text():
    shell = (SRC / 'shell.html').read_text(encoding='utf8')
    if shell.count(MARK) != 1:
        raise SystemExit('src/shell.html 에 <!--JS--> 줄이 정확히 한 번 있어야 합니다')
    parts = sorted((SRC / 'js').glob('*.js'))
    if not parts:
        raise SystemExit('src/js/*.js 가 없습니다')
    i18n = sorted((SRC / 'i18n').glob('*.js')) if (SRC / 'i18n').exists() else []
    js = ''.join(p.read_text(encoding='utf8') for p in parts[:1] + i18n + parts[1:])   # 00_boot 다음에 문구 표
    if '</script' in js.lower():
        raise SystemExit('src/js 안에 </script 글자가 있으면 페이지가 깨집니다(문자열이면 <\\/script 로)')
    for p in parts + i18n:
        if not p.read_text(encoding='utf8').endswith('\n'): raise SystemExit(f'{p.name} 이 줄바꿈으로 끝나지 않습니다')
    return shell.replace(MARK, js)

def syntax_check(js):
    import shutil, subprocess, tempfile
    if not shutil.which('node'): return
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf8') as f: f.write(js); name = f.name
    r = subprocess.run(['node', '--check', name], capture_output=True, text=True)
    if r.returncode: raise SystemExit('합친 스크립트 문법 오류:\n' + r.stderr[-800:])

def main():
    if not (SRC / 'shell.html').exists():
        print('FAIL build: src/shell.html 이 없습니다'); sys.exit(1)
    text = build_text()
    syntax_check(text.split('<script>',1)[1].rsplit('</script>',1)[0])
    if '--check' in sys.argv:
        cur = OUT.read_text(encoding='utf8') if OUT.exists() else ''
        if cur != text:
            a, b = cur.splitlines(), text.splitlines()
            i = next((k for k in range(min(len(a), len(b))) if a[k] != b[k]), min(len(a), len(b)))
            print(f'FAIL build --check: index.html 과 다름 (처음 다른 줄 {i+1}) — python3 build.py 로 다시 만드세요'); sys.exit(1)
        print('PASS build --check', hashlib.sha256(text.encode()).hexdigest()[:12]); return
    OUT.write_text(text, encoding='utf8')
    print('built index.html', len(text.encode()) // 1024, 'KB')

if __name__ == '__main__':
    main()
