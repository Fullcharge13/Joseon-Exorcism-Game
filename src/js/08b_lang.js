/* ======================= 언어 바꾸기 (v18.0) =======================
   detectLang: 저장된 언어(ko·zh) → 없으면 기기 언어(zh로 시작하면 간체) → 한국어.
   applyLang: 데이터 표와 화면 틀의 한국어를 사전(I18N[LANG])으로 덧씌운다. 원문은 따로 기억해 한국어로 돌아갈 때 되돌린다.
   데이터 표에 번역이 빠진 것은 오류 기록에 남기지 않는다(v18.1 시험 i18n_keys가 빠짐없이 있는지 본다). */
function detectLang(){const s=meta.set.lang;if(s==='ko'||s==='zh')return s;
 const n=(typeof navigator!=='undefined'&&navigator.language)||'';return /^zh/i.test(n)?'zh':'ko';}
const L10N_TABLES=()=>({WD,TASKS,CHARS,EN,NPCS,TALES,PD,PETS,BSK,GUIDE,JOBTASK,FUSE,CALL,ANOM,BLESS,SKY,STORY,UPG,CARDS,STAGES,PATHS,TEMPER,DUO,TAVERN,DKB,ENDING,GIFTS,BOSS,KS,SEALS,ULT,CURSES,DKC,VARIANTS,QUESTS,TALE_RULES,TIER_BONUS,HELP_TABS,AWK,DIFFS,MODES,TIER_NAME,FLOWERS,GRADES,JMON,JDAY});
const L10N_ORIG=new WeakMap(),HANGUL=/[가-힣]/;
function l10nWalk(o,d,seen){if(!o||typeof o!=='object'||d>8||seen.has(o))return;seen.add(o);
 if(!Array.isArray(o)&&Object.getPrototypeOf(o)!==Object.prototype)return;   // 그림판·이미지 같은 것은 건너뜀
 let orig=L10N_ORIG.get(o);
 for(const k of Object.keys(o)){const v=o[k];
  if(typeof v==='string'){const src=orig&&k in orig?orig[k]:v;if(!HANGUL.test(src))continue;
   if(!orig){orig={};L10N_ORIG.set(o,orig);}if(!(k in orig))orig[k]=src;
   const z=LANG==='ko'?src:I18N[LANG]&&I18N[LANG][src];o[k]=z==null?src:z;}
  else if(v&&typeof v==='object')l10nWalk(v,d+1,seen);}}
const L10N_NODE=new WeakMap();
function l10nDom(){if(typeof document.createTreeWalker!=='function'||!document.body)return;const D=I18N[LANG]||{};
 const tw=document.createTreeWalker(document.body,4);let n;
 while((n=tw.nextNode())){const src=L10N_NODE.has(n)?L10N_NODE.get(n):n.nodeValue;if(!HANGUL.test(src))continue;if(!L10N_NODE.has(n))L10N_NODE.set(n,src);
  const key=src.trim();const z=LANG==='ko'?null:D[key];n.nodeValue=z==null?src:src.replace(key,z);}
 for(const el of document.querySelectorAll('[title],[aria-label],[placeholder]'))for(const a of ['title','aria-label','placeholder']){const v=el.getAttribute(a);if(!v)continue;
  const ok='data-l10n-'+a,src=el.getAttribute(ok)||v;if(!HANGUL.test(src))continue;el.setAttribute(ok,src);const z=LANG==='ko'?null:D[src];el.setAttribute(a,z==null?src:z);}}
function applyLang(){l10nWalk(L10N_TABLES(),0,new Set());l10nDom();try{document.documentElement.lang=LANG==='zh'?'zh-CN':'ko';}catch(e){}}
function setLang(l,save=true){LANG=l==='zh'?'zh':'ko';if(save){meta.set.lang=LANG;saveMeta();}applyLang();}
