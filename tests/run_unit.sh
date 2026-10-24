#!/usr/bin/env bash
# 단위 시험 전부 실행: bash tests/run_unit.sh [게임.html]
cd "$(dirname "$0")/.." || exit 1
G=${1:-index.html}; fail=0
if [ -z "$1" ]; then python3 build.py --check || fail=1; fi   # v18.0: src/ 를 고친 뒤 index.html 을 다시 만들었는지
for t in tests/unit/*.test.js; do
  case "$t" in *fx_alpha_save*|*tale_save*) continue;; esac
  node tests/harness.js "$G" "$t" || fail=1
done
SAVE=tests/fixtures/save_fxA_bad.json WANT=1 node tests/harness.js "$G" tests/unit/fx_alpha_save.test.js || fail=1
SAVE=tests/fixtures/save_fxA_mid.json WANT=0.7 node tests/harness.js "$G" tests/unit/fx_alpha_save.test.js || fail=1
SAVE=tests/fixtures/save_v12.json WANT=v12 node tests/harness.js "$G" tests/unit/tale_save.test.js || fail=1
SAVE=tests/fixtures/save_v13_bad.json WANT=bad node tests/harness.js "$G" tests/unit/tale_save.test.js || fail=1
DIAG_SAVE=tests/fixtures/diag_unclean.json WANT=unclean node tests/harness.js "$G" tests/unit/diag.test.js || fail=1
DIAG_SAVE=tests/fixtures/diag_hidden.json WANT=hidden node tests/harness.js "$G" tests/unit/diag.test.js || fail=1
SAVE=tests/fixtures/save_ent_bad.json node tests/harness.js "$G" tests/unit/ent_size.test.js || fail=1
for w in str mix arr; do SAVE=tests/fixtures/save_types_$w.json WANT=$w node tests/harness.js "$G" tests/unit/tale_save_types.test.js || fail=1; done
[ $fail = 0 ] && echo "ALL PASS" || { echo "SOME FAILED"; exit 1; }
