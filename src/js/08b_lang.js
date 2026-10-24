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
const L10N_NODE=new WeakMap();   // 글 마디 → [원문, 마지막으로 넣은 글]. 코드가 그 뒤에 글을 바꿨으면 바뀐 글을 새 원문으로 본다(v18.1)
function l10nDom(){if(typeof document.createTreeWalker!=='function'||!document.body)return;const D=I18N[LANG]||{};
 const tw=document.createTreeWalker(document.body,4);let n;
 while((n=tw.nextNode())){const m=L10N_NODE.get(n),src=m&&n.nodeValue===m[1]?m[0]:n.nodeValue;if(!HANGUL.test(src))continue;
  const key=src.trim();const z=LANG==='ko'?null:D[key];const out=z==null?src:src.replace(key,z);if(n.nodeValue!==out)n.nodeValue=out;L10N_NODE.set(n,[src,out]);}
 for(const el of document.querySelectorAll('[title],[aria-label],[placeholder]'))for(const a of ['title','aria-label','placeholder']){const v=el.getAttribute(a);if(!v)continue;
  const ok='data-l10n-'+a,last='data-l10n-out-'+a,src=el.getAttribute(ok)!=null&&v===el.getAttribute(last)?el.getAttribute(ok):v;if(!HANGUL.test(src))continue;
  const z=LANG==='ko'?null:D[src],out=z==null?src:z;el.setAttribute(ok,src);el.setAttribute(last,out);if(v!==out)el.setAttribute(a,out);}}
const TITLE_KO='조선퇴마록';   //i18n-skip
function l10nFont(){if(LANG!=='zh'||document.getElementById('fontSC')||typeof document.createElement!=='function'||!document.head)return;
 const l=document.createElement('link');l.id='fontSC';l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=Noto+Sans+SC:wght@400;700&display=swap';document.head.appendChild(l);}
function applyLang(){l10nWalk(L10N_TABLES(),0,new Set());l10nDom();
 try{document.documentElement.lang=LANG==='zh'?'zh-CN':'ko';document.title=LANG==='ko'?TITLE_KO:(I18N[LANG][TITLE_KO]||TITLE_KO);l10nFont();}catch(e){}}
function setLang(l,save=true){LANG=l==='zh'?'zh':'ko';if(save){meta.set.lang=LANG;saveMeta();}applyLang();}
const LANG_NAMES=[['ko','한국어'],['zh','中文']];   //i18n-skip 언어 이름은 늘 제 말로
function langSwSync(){for(const b of document.querySelectorAll('#langSw button'))b.setAttribute('aria-pressed',String(b.dataset.l===LANG));const L=$('#setLang');if(L)L.value=LANG;}
/* 판 도중에 바꾸면(일시정지 → 설정) 한 번만 쓰고 마는 글을 지금 언어로 다시 쓴다: 상단 막 이름, 상단 숫자판(다음 프레임 전에), 일시정지 화면 */
function langRunRefresh(){if(typeof G==='undefined'||!G||G.over)return;
 try{const el=$('#stageName');if(G.mode==='tale'&&G.tale){const T=TALES[G.tale.id],i=G.tale.act;el.textContent=_t("{n} · {p}막 {name}",{n:T.n,p:i+1,name:T.acts[i].name});}
  else{const s=curStg();el.textContent=`${s.sub} ${s.name}${G.loop?_t(" · {p}바퀴",{p:G.loop+1}):''}`;}}catch(e){}
 try{hud();}catch(e){}
 try{$('#pauseStats').innerHTML=statHTML();$('#pauseBuild').innerHTML=buildHTML();}catch(e){}}
function switchLang(l){if(l===LANG)return;setLang(l);langSwSync();langRunRefresh();
 if(modal==='title')renderTitle();else if(modal==='settings')openSettings(prevScreen);snd(700,0.08,'triangle');}
let langSwBound=false;
function bindLangSw(){if(!LANG_ZH_PUBLIC||langSwBound)return;langSwBound=true;const box=$('#langSw'),sel=$('#setLang');
 try{for(const [l,n] of LANG_NAMES){const b=document.createElement('button');b.className='btn ghost small';b.dataset.l=l;b.textContent=n;b.lang=l==='zh'?'zh-CN':'ko';b.onclick=()=>switchLang(l);box.appendChild(b);}box.hidden=false;
  for(const [l,n] of LANG_NAMES){const o=document.createElement('option');o.value=l;o.textContent=n;sel.appendChild(o);}sel.onchange=e=>switchLang(e.target.value);$('#setLangRow').hidden=false;}
 catch(e){}   // 화면 없는 시험 틀(가짜 화면)에서는 단추를 만들지 못해도 그냥 넘어감
 langSwSync();}
