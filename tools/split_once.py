#!/usr/bin/env python3
"""v18.0 한 번만 쓰는 도구: v17.5 index.html 을 src/shell.html + src/js/NN_*.js 로 나눈다(글자 하나 바꾸지 않음).
경계는 스크립트 안의 큰 머리말(/* ===== */) 줄 번호. 나눈 뒤 python3 build.py --check 로 같은지 확인한다."""
import pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
L = (ROOT / 'index.html').read_text(encoding='utf8').splitlines(keepends=True)
assert L[644].strip() == '<script>' and L[3914].strip() == '</script>', '스크립트 경계가 예상과 다릅니다'
cuts = [(646, 'boot'), (653, 'sprites'), (801, 'data'), (1173, 'systems'), (1671, 'meta'), (1832, 'run'),
        (2216, 'world'), (2683, 'v12'), (2980, 'ui'), (3541, 'render'), (3915, None)]
js = ROOT / 'src' / 'js'; js.mkdir(parents=True, exist_ok=True)
for i, (start, name) in enumerate(cuts[:-1]):
    end = cuts[i + 1][0]
    (js / f'{i:02d}_{name}.js').write_text(''.join(L[start - 1:end - 1]), encoding='utf8')
(ROOT / 'src' / 'shell.html').write_text(''.join(L[:645]) + '<!--JS-->\n' + ''.join(L[3914:]), encoding='utf8')
print('split into', len(cuts) - 1, 'files')
