#!/usr/bin/env bash
# 단위 시험 전부 실행: bash tests/run_unit.sh [게임.html]
cd "$(dirname "$0")/.." || exit 1
G=${1:-index.html}; fail=0
for t in tests/unit/*.test.js; do
  case "$t" in *fx_alpha_save*) continue;; esac
  node tests/harness.js "$G" "$t" || fail=1
done
SAVE=tests/fixtures/save_fxA_bad.json WANT=1 node tests/harness.js "$G" tests/unit/fx_alpha_save.test.js || fail=1
SAVE=tests/fixtures/save_fxA_mid.json WANT=0.7 node tests/harness.js "$G" tests/unit/fx_alpha_save.test.js || fail=1
[ $fail = 0 ] && echo "ALL PASS" || { echo "SOME FAILED"; exit 1; }
