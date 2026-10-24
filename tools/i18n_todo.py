#!/usr/bin/env python3
"""번역 진행 보기: python3 tools/i18n_todo.py [영역] [--n 개수]  → 아직 간체가 없는 원문을 영역별로 보여 준다(영역: WD, TASKS, 08_ui.js, shell …)."""
import json, sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
src = json.load(open(ROOT / 'docs/i18n/원문.json', encoding='utf8'))
zh = {}
for f in sorted((ROOT / 'src/i18n/zh').glob('*.json')): zh.update(json.load(open(f, encoding='utf8')))
area = lambda w: 'shell' if w.startswith('shell') else (w.split(':')[0] if ':' in w else w.split('.')[0])
todo = [(k, w) for k, w in src.items() if k not in zh]
if len(sys.argv) > 1 and not sys.argv[1].startswith('--'):
    sel = [x for x in todo if area(x[1]) == sys.argv[1]]
    n = int(sys.argv[sys.argv.index('--n') + 1]) if '--n' in sys.argv else 10**9
    for k, w in sel[:n]: print(json.dumps(k, ensure_ascii=False), '\t#', w)
    print(f'-- {sys.argv[1]}: 남음 {len(sel)}', file=sys.stderr)
else:
    from collections import Counter
    c = Counter(area(w) for _, w in todo)
    print(f'번역 {len(src) - len(todo)}/{len(src)} · 남음', ', '.join(f'{a} {n}' for a, n in c.most_common()))
