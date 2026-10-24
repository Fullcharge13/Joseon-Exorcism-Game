'use strict';
const $=s=>document.querySelector(s);
const TAU=Math.PI*2, rnd=(a,b)=>a+Math.random()*(b-a), clamp=(v,a,b)=>v<a?a:v>b?b:v, R=Math.round;
const cvs=$('#game'), ctx=cvs.getContext('2d');
const buf=document.createElement('canvas'), b=buf.getContext('2d');
let S=3,W=320,H=180,DPR=1,vig=null;

/* ======================= 언어 (v18.0) =======================
   한국어 원문이 곧 열쇠다. _t('원문', {변수}) → 한국어면 원문, 간체면 I18N.zh[원문]에 변수를 끼워 넣는다.
   끼워 넣기 {name}, 한국어 조사 {name:을}·{name:으로}·{name:이}·{name:은}·{name:과} (마지막 글자가 한글이 아니면 받침 없음).
   같은 원문이 뜻이 다를 때만 '원문|꼬리표'. 데이터 표는 applyLang()이 사전으로 덧씌운다. 설계: docs/specs/2026-10-24-다국어.md */
const I18N={zh:{}};let LANG='ko';
const LANG_ZH_PUBLIC=false;let tMissed=false;   // v18.1에서 간체 사전이 채워지면 true(시작 화면 단추 공개)
const jongOf=w=>{w=String(w);const c=w.charCodeAt(w.length-1)-0xAC00;return c>=0&&c<11172?c%28:0;};
const JOSA={'을':['을','를'],'를':['을','를'],'이':['이','가'],'가':['이','가'],'은':['은','는'],'는':['은','는'],'과':['과','와'],'와':['과','와']};   //i18n-skip 조사 표(번역하지 않음)
function fillT(s,v,ko=true){return s.replace(/\{(\w+)(?::(을|를|이|가|은|는|과|와|으로|로))?\}/g,(m,k,j)=>{if(!v||!(k in v))return m;const x=String(v[k]);if(!j||!ko)return x;   // 간체 문구에 {x:을}이 남아도 조사를 붙이지 않음
 const jg=jongOf(x);if(j==='으로'||j==='로')return x+(jg===0||jg===8?'로':'으로');const p=JOSA[j];return x+(jg?p[0]:p[1]);});}   //i18n-skip 조사 고르기(번역하지 않음)
function _t(s,v){   // 이름이 _t 인 까닭: 코드 곳곳에 t 라는 지역 변수(시간·과업)가 있어 가려진다
const base=s.includes('|')?s.slice(0,s.indexOf('|')):s;if(LANG==='ko')return fillT(base,v);
 const z=I18N[LANG]&&I18N[LANG][s];if(z==null){if(!tMissed&&typeof diagNote==='function'){tMissed=true;diagNote('i18n',_t("번역 없음: ")+base.slice(0,60));}return fillT(base,v);}return fillT(z,v,false);}
