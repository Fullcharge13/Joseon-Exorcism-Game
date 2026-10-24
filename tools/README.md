# 도구 (v18.0~)

게임 소스는 `src/`에 있고, 배포물 `index.html`은 **만들어지는 파일**이다. `index.html`을 직접 고치지 말고 `src/`를 고친 뒤 다시 만든다.

| 명령 | 하는 일 |
|---|---|
| `python3 build.py` | `src/shell.html` + `src/js/*.js`(+ `src/i18n/*.js`) → `index.html` |
| `python3 build.py --check` | 지금 `index.html`이 `src/`로 만든 결과와 같은지(단위 시험 처음에 자동으로 돈다) |
| `node tools/i18n_wrap.js` | 코드 속에 아직 `_t()`로 감싸지 않은 한국어 문구를 센다(0이어야 함). `--apply`는 자동으로 감싼다 |
| `python3 tools/i18n_extract.py` | 한글이 든 문자열을 모두 훑어 센다(표·감싼 문구 포함, 대략의 양 보기) |
| `tools/split_once.py` | v18.0에서 한 번 쓴 나누기 도구(기록용, 다시 쓰지 않음) |

- `i18n_wrap.js`는 `@babel/parser`·`@babel/traverse` 7.25.6이 필요하다(배포물에는 들어가지 않음): `npm i --prefix /tmp/i18n @babel/parser@7.25.6 @babel/traverse@7.25.6` 뒤 `NODE_PATH=/tmp/i18n/node_modules node tools/i18n_wrap.js`.
- 번역 함수 이름이 `_t`인 까닭: 코드 곳곳에 `t`라는 지역 변수(시간·과업)가 있어 `t`로 하면 가려진다(v18.0에서 실제로 겪음).
- 문구 규칙: `_t('원문 {이름}', {이름: 값})`, 한국어 조사는 `{이름:을}`·`{이름:으로}`·`{이름:이}`·`{이름:은}`·`{이름:과}`. 데이터 표(대문자 이름의 표)는 감싸지 않는다(언어를 바꾸면 `applyLang()`이 사전으로 덧씌움). 자세한 설계는 `docs/specs/2026-10-24-다국어.md`.
