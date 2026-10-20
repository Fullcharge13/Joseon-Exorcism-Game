#!/usr/bin/env bash
# 설화 세 편을 동시에 자동 플레이: bash tests/sim/run_tales.sh [판 수] [씨앗] [출력 폴더]
cd "$(dirname "$0")/../.." || exit 1
N=${1:-12};SEED=${2:-7};OUT=${3:-/tmp/tale_sim};mkdir -p "$OUT"
for t in woochi jiha bari; do TALE=$t RUNS=$N SEED=$SEED node tests/harness.js index.html tests/sim/tale_bot.js > "$OUT/$t.txt" 2>&1 & done
wait;grep -h SUMMARY "$OUT"/*.txt
