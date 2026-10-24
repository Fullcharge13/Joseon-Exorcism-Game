#!/usr/bin/env python3
"""번역할 한국어 원문 전체를 docs/i18n/원문.json 으로 모은다 (v18.1).
  데이터 표 문자열(실행해서 모음) + 코드의 _t 열쇠(Babel) + 화면 틀(src/shell.html)의 글·title·aria-label·placeholder
  NODE_PATH 에 @babel/parser·@babel/traverse 가 있어야 한다(tools/README.md)."""
import json, os, re, subprocess, tempfile, pathlib, html.parser
ROOT = pathlib.Path(__file__).resolve().parent.parent
HAN = re.compile(r'[가-힣]')
def run(args, out):
    env = dict(os.environ, OUT=out); r = subprocess.run(args, cwd=ROOT, env=env, capture_output=True, text=True)
    if r.returncode: raise SystemExit(r.stderr[-1500:])
    if r.stderr.strip(): print(r.stderr.strip()[-600:])
    return json.load(open(out, encoding='utf8'))
class P(html.parser.HTMLParser):
    def __init__(s): super().__init__(convert_charrefs=True); s.out = {}; s.skip = 0
    def handle_starttag(s, tag, attrs):
        if tag in ('style', 'script'): s.skip += 1
        for k, v in attrs:
            if k in ('title', 'aria-label', 'placeholder', 'alt') and v and HAN.search(v): s.out.setdefault(v, 'shell@' + k)
    def handle_endtag(s, tag):
        if tag in ('style', 'script'): s.skip -= 1
    def handle_data(s, d):
        if not s.skip and HAN.search(d): s.out.setdefault(d.strip(), 'shell')
def main():
    tmp = tempfile.mkdtemp()
    tables = run(['node', 'tests/harness.js', 'index.html', 'tools/i18n_keys_tables.js'], tmp + '/t.json')
    code = run(['node', 'tools/i18n_keys_code.js'], tmp + '/c.json')
    p = P(); p.feed((ROOT / 'src' / 'shell.html').read_text(encoding='utf8'))
    allk = {}
    for src, d in (('표', tables), ('코드', code), ('화면 틀', p.out)):
        for k, w in d.items(): allk.setdefault(k, w)
    out = ROOT / 'docs' / 'i18n' / '원문.json'
    out.write_text(json.dumps(allk, ensure_ascii=False, indent=0), encoding='utf8')
    print(f'원문 {len(allk)}개 (표 {len(tables)} · 코드 {len(code)} · 화면 틀 {len(p.out)}, 겹침 제외) 한글 {sum(len(HAN.findall(k)) for k in allk)}자 →', out.relative_to(ROOT))
if __name__ == '__main__': main()
