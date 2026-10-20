// 설화 시험 공용 도우미 (시험 파일 앞에 붙여 실행). 창이 뜨면 첫 선택지를 고르고 장면은 넘긴다.
let __t=performance.now();
function autoPick(){armUntil=0;
  if(modal==='scene')sceneNext();else if(modal==='levelup')pickOpt(0);else if(modal==='adv'&&advPick.length)advPick[0]();
  else if(modal==='bless'&&blessPick.length)blessPick[0]();else if(modal==='petpick'&&petPick.length)petPick[0]();else if(modal==='pick'&&pickFns.length)pickFns[0]();
  else if(modal==='chest')$('#chestOk').onclick();else return false;return true;}
function step(sec,{pick=true,until=null}={}){const n=Math.round(sec*60);for(let i=0;i<n;i++){if(until&&until())return true;if(G.over)return false;if(modal){if(pick&&autoPick())continue;if(modal)return false;}__t+=1000/60;frame(__t);}return false;}
function god(){G.P.hp=G.P.maxHp=1e7;G.P.iframe=1e9;}
function killBoss(){if(G.boss)kill(G.boss);}
