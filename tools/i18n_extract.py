#!/usr/bin/env python3
"""한국어 화면 문구 찾기 (v18.0): src/js/*.js 와 src/shell.html 에서 한글이 든 문자열·화면 글을 찾는다.
  python3 tools/i18n_extract.py            # 요약
  python3 tools/i18n_extract.py --list     # 파일:줄  문구 목록을 docs/i18n/남은문구.txt 로
주석은 뺀다. src/i18n/ 의 문구 표는 「옮김」이라 세지 않는다. 줄 끝에 //i18n-skip 이 있으면 뺀다(시험·개발용 글)."""
import re, sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
HAN = re.compile(r'[가-힣]')

def js_strings(src):
    """간단한 자바스크립트 낱말 나누기: 주석을 건너뛰고 문자열 조각(줄 번호, 내용)을 돌려준다."""
    out, i, n, line = [], 0, len(src), 1
    stack = []          # 템플릿 안의 ${ } 깊이
    def take_str(q, i, line):
        start_line, buf = line, []
        i += 1
        while i < n:
            c = src[i]
            if c == '\\': buf.append(src[i:i+2]); i += 2; continue
            if c == '\n': line += 1
            if q == '`' and c == '$' and i + 1 < n and src[i+1] == '{':
                out.append((start_line, ''.join(buf))); buf = []
                return i + 2, line, 'tmpl'
            if c == q:
                out.append((start_line, ''.join(buf))); return i + 1, line, None
            buf.append(c); i += 1
        return i, line, None
    while i < n:
        c = src[i]
        if c == '\n': line += 1; i += 1; continue
        if src.startswith('//', i):
            j = src.find('\n', i); i = n if j < 0 else j; continue
        if src.startswith('/*', i):
            j = src.find('*/', i + 2); seg = src[i:(n if j < 0 else j + 2)]; line += seg.count('\n'); i += len(seg); continue
        if c in '\'"`':
            i, line, st = take_str(c, i, line)
            if st == 'tmpl': stack.append(0)
            continue
        if stack:
            if c == '{': stack[-1] += 1
            elif c == '}':
                if stack[-1] == 0:
                    stack.pop(); i, line, st = take_str('`', i, line)   # 템플릿 이어 읽기
                    if st == 'tmpl': stack.append(0)
                    continue
                stack[-1] -= 1
        i += 1
    return out

def scan():
    found = []
    for p in sorted((ROOT / 'src' / 'js').glob('*.js')):
        src = p.read_text(encoding='utf8'); lines = src.split('\n')
        for ln, s in js_strings(src):
            if HAN.search(s) and '//i18n-skip' not in lines[ln - 1]:
                found.append((p.name, ln, s))
    sh = (ROOT / 'src' / 'shell.html').read_text(encoding='utf8')
    body = re.sub(r'<style>[\s\S]*?</style>', lambda m: '\n' * m.group(0).count('\n'), sh)
    for ln, row in enumerate(body.split('\n'), 1):
        if 'data-t=' in row: row = re.sub(r'<([a-z0-9]+)[^>]*data-t="[^"]*"[^>]*>[^<]*', '', row)
        txt = re.sub(r'<[^>]+>', ' ', row)
        if HAN.search(txt): found.append(('shell.html', ln, txt.strip()))
        for a in re.findall(r'(?:title|aria-label|placeholder|alt)="([^"]*)"', row):
            if HAN.search(a): found.append(('shell.html', ln, a))
    return found

if __name__ == '__main__':
    f = scan(); chars = sum(len(HAN.findall(s)) for _, _, s in f)
    by = {}
    for fn, _, s in f: by[fn] = by.get(fn, 0) + 1
    print(f'남은 한국어 화면 문구 {len(f)}개 (한글 {chars}자)', ' · '.join(f'{k} {v}' for k, v in by.items()))
    if '--list' in sys.argv:
        out = ROOT / 'docs' / 'i18n' / '남은문구.txt'
        out.write_text('\n'.join(f'{fn}:{ln}\t{s[:120]}' for fn, ln, s in f) + '\n', encoding='utf8')
        print('목록:', out.relative_to(ROOT))
