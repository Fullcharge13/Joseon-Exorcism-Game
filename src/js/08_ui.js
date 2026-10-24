/* ======================= tasks & codex ======================= */
function V(key){if(key==='anomKinds')return anomFound();
 if(key==='fragN')return TALE_IDS.reduce((a,id)=>a+meta.tale.frag[id],0);if(key==='taleN')return TALE_IDS.filter(id=>meta.tale.done[id]).length;if(key==='ending')return meta.ending.seen?1:0;if(key==='charN')return Object.keys(CHARS).filter(id=>unlocked('char:'+id)).length;if(key==='runs')return meta.hub.runs||0;
 if(key.startsWith('evo:')){const id=key.slice(4);return ((meta.stats.evoList||[]).includes(id)||(G&&G.rs.evo.has(id)))?1:0;}
 if(key.startsWith('kills_')){const c=key.slice(6);return (meta.stats[key]||0)+(G&&!G.merged&&G.cid===c?G.rs.kills:0);}
 if(/^br[01]_/.test(key)){const b=+key[2],c=key.slice(4);return Math.max(meta.stats[key]||0,G&&G.mode!=='tale'&&G.cid===c&&G.P.branch===b?G.P.tier:0);}
 if(G&&G.mode==='tale'&&TALE_NOREC.test(key))return meta.stats[key]||0;
 if(key.startsWith('clear_'))return meta.stats[key]||0;if(key==='ksN')return ksOwned().length;if(key==='codex'){const s=new Set([...Object.keys(meta.seen),...(G?Object.keys(G.rs.seen):[])]);return s.size;}
 if(key==='evo'){const s=new Set([...(meta.stats.evoList||[]),...(G?[...G.rs.evo]:[])]);return s.size;}
 const m=meta.stats[key]||0;if(!G||G.merged)return m;
 let r=G.rs[key]||0;if(key.startsWith('tier_'))r=key==='tier_'+G.cid?G.P.tier:0;if(key==='petLv')r=G.pet?G.pet.lv:0;if(key==='maxStage')r=G.mode==='tale'?0:G.stage+1;
 return MAXKEYS.has(key)?Math.max(m,r):m+r;}
function grantReward(rw){if(rw.coins)meta.coins+=rw.coins;if(rw.unlock&&!meta.unl.includes(rw.unlock))meta.unl.push(rw.unlock);
 for(const k of ['rr','sk','bn'])if(rw[k]){meta.extra[k]=(meta.extra[k]||0)+rw[k];if(G)G[k]+=rw[k];}}
function checkTasks(){let any=false;for(const t of TASKS){if(meta.done.includes(t.id))continue;if(V(t.key)>=t.need){meta.done.push(t.id);grantReward(t.rw);any=true;taskToast(t);}}
 if(any)saveMeta();}

/* ---- v16.2 다음 목표: 가까운 과업 셋, 이번 출정의 전→후 ---- */
const fmtN=n=>Number(n).toLocaleString('ko-KR');
// 퇴마사 전용 과업이면 그 퇴마사 id (목표 키가 「_퇴마사」로 끝나거나, 그 퇴마사 시작 무기의 진화)
function taskOwner(t){const k=t.key;for(const c in CHARS){if(k.endsWith('_'+c)||k==='evo:'+CHARS[c].start)return c;}return null;}
const isUnlockTask=t=>!!(t.rw.unlock&&/^(char|w):/.test(t.rw.unlock));
function goalOpen(t){if(meta.done.includes(t.id))return false;const o=taskOwner(t);return !o||unlocked('char:'+o);}
function goalItem(t){const v=Math.min(V(t.key),t.need);return {t,v,need:t.need,ratio:v/t.need};}
const goalCmp=(a,b)=>b.ratio-a.ratio||(isUnlockTask(b.t)-isUnlockTask(a.t))||a.need-b.need;
function nextGoals(n=3){const all=TASKS.filter(goalOpen).map(goalItem).sort(goalCmp);
 const pick=all.slice(0,n);
 if(n>=3&&pick.length===n&&!pick.some(g=>isUnlockTask(g.t))){const u=all.find(g=>isUnlockTask(g.t));if(u){u.unlockSlot=true;pick[n-1]=u;}}
 return pick;}
function goalSnap(){const s={};for(const t of TASKS)if(!meta.done.includes(t.id))s[t.id]=V(t.key);G.goal0=s;G.done0=meta.done.length;}
function runGoals(){if(!G||!G.goal0)return {moved:[],done:[]};
 const done=meta.done.slice(G.done0).map(id=>TASKS.find(t=>t.id===id)).filter(Boolean);
 const moved=[];for(const t of TASKS){if(!(t.id in G.goal0)||!goalOpen(t))continue;const to=Math.min(V(t.key),t.need),from=Math.min(G.goal0[t.id],t.need);
  if(to>from)moved.push({t,from,to,v:to,need:t.need,ratio:to/t.need});}
 moved.sort(goalCmp);return {moved:moved.slice(0,3),done};}
function goalLine(g){const t=g.t;let prog='';
 if(t.need>1)prog=g.from!==undefined?(t.need<1000?` · <b class="pgv">${g.from}/${t.need} → ${g.to}/${t.need}</b>`:` · <b class="pgv">${fmtN(g.from)} → ${fmtN(g.to)} / ${fmtN(t.need)}</b>`):` · <b class="pgv">${fmtN(g.v)}/${fmtN(t.need)}</b>`;
 return _t("<li><img class=\"bd\" src=\"{p}\" alt=\"\"><span><b>{n}</b> · {d}{prog}<small>보상: {rwText}</small></span></li>",{p:taskBadge(t),n:t.n,d:t.d,prog:prog,rwText:t.rwText});}
function goalsHTML(R){const near=R&&R.moved&&R.moved.length?null:nextGoals(3);
 const list=near||R.moved;let h='';
 if(R&&R.done&&R.done.length)h+=_t("<p class=\"gdone\">이번에 이룬 과업 {length}개: {p}</p>",{length:R.done.length,p:R.done.map(t=>t.n).join(' · ')});
 if(!list.length)h+=_t("<p class=\"gdone\">모든 과업을 이루었다.</p>");
 else h+=`<h3>${near?_t("가까운 과업"):_t("이번 출정으로 가까워진 과업")}</h3><ul>${list.map(goalLine).join('')}</ul>`;
 return h+_t("<button class=\"btn ghost small\" id=\"goalsMore\" type=\"button\">퇴마록에서 모두 보기</button>");}
function hubGoalsHTML(){const g=nextGoals(3);if(!g.length)return '';
 return _t("<b>가까운 과업</b> · ")+g.map(x=>`${x.t.n} <span class="pg">${x.t.need===1?x.t.d:`${fmtN(x.v)}/${fmtN(x.t.need)}`}</span>`).join(' · ');}

/* ---- 과업 휘장 (도트 로고) ---- */
const TASK_IC={k100:['enemy','dokkaebi'],k1000:['char','uiwon'],k5000:['enemy','dokchief'],k20000:['enemy','gumiho'],k50000:['seal','百','#7a2018'],
 s2:['seal','二','#2f6b5a'],s5:['seal','五','#2f6b5a'],s8:['seal','八','#2f6b5a'],clear:['seal','曉','#9a6a10'],curse5:['seal','厄','#7a2018'],curse10:['seal','厄','#1a1418'],
 elite10:['icon','chest'],mid10:['seal','中','#7a2018'],tteok20:['icon','tteok'],pot30:['seal','甕','#8a5a2b'],shrine5:['seal','神','#2f6b5a'],shrine20:['seal','神','#9a6a10'],tav100:['icon','makgeolli'],
 evo1:['icon','meok'],evo6:['seal','進','#3a5f9e'],evo12:['seal','進','#9a6a10'],lv30:['seal','卅','#3a5f9e'],lv100:['seal','百','#3a5f9e'],pet10:['pet','tiger'],dogam30:['seal','鑑','#4a3a30'],dogam58:['seal','鑑','#9a6a10'],
 awk1:['seal','覺','#7a2018'],ult1:['seal','極','#7a2018'],duo1:['seal','雙','#3a1a4a'],call30:['seal','降','#9a6a10'],fuse1:['seal','合','#7a2018'],seal10:['seal','印','#7a2018'],graze100:['seal','掠','#3a5f9e'],graze1000:['seal','風','#3a5f9e'],
 loop1:['seal','夜','#1a1418'],loop3:['seal','夜','#3a1a4a'],rush1:['seal','征','#7a2018'],rush10:['seal','征','#9a6a10'],var100:['seal','變','#2a2228'],anom6:['seal','怪','#3a1a4a'],anom12:['seal','怪','#9a6a10'],
 temper1:['seal','鍛','#9a4a10'],temper10:['seal','鍛','#7a2018'],dk1:['seal','鬼','#2a6a6a'],dk10:['seal','鬼','#1a4a4a'],quest10:['seal','依','#2f6b5a'],quest30:['seal','依','#9a6a10'],combo300:['seal','連','#9a6a10'],combo1000:['seal','連','#7a2018'],
 ks3:['seal','情','#7a2018'],allchar:['seal','六','#9a6a10'],runs30:['seal','卅','#4a3a30']};
const TALE_TASK_IC={t_frag1:['seal','話','#9a6a10'],t_tale1:['seal','說','#2f4a7a'],t_ending:['seal','曉','#7a2018']};
function taskSpec(t){if(TASK_IC[t.id])return TASK_IC[t.id];if(TALE_TASK_IC[t.id])return TALE_TASK_IC[t.id];const k=t.key;
 if(t.rw.unlock&&t.rw.unlock.startsWith('char:'))return ['char',t.rw.unlock.slice(5)];
 if(t.rw.unlock&&t.rw.unlock.startsWith('w:'))return ['icon',t.rw.unlock.slice(2)];
 if(k.startsWith('boss_'))return ['enemy',k.slice(5)];
 if(k.startsWith('tier_'))return ['tier',k.slice(5),0,t.need-1];
 if(/^br[01]_/.test(k))return ['tier',k.slice(4),+k[2],4];
 if(k.startsWith('evo:'))return ['icon',k.slice(4)];
 if(k.startsWith('kills_'))return ['char',k.slice(6)];
 if(k.startsWith('clear_'))return ['char',k.slice(6),'dawn'];
 if(k.startsWith('card:')||(t.rw.unlock||'').startsWith('card:'))return ['seal',CARDS[(t.rw.unlock||'').slice(5)]?CARDS[t.rw.unlock.slice(5)].n[0]:'卦','#2a2228'];
 return ['seal','功','#4a3a30'];}
const BADGE_BG={char:'#3a4a6a',tier:'#5a4a7a',enemy:'#6a2a22',icon:'#4a3a2a',pet:'#3a5a3a',seal:'#2a2228'};
const badgeCache={};
function taskBadge(t){if(badgeCache[t.id])return badgeCache[t.id];const sp=taskSpec(t),S=36,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d');x.imageSmoothingEnabled=false;
 // 양피지 틀
 x.fillStyle='#0a080c';x.fillRect(0,0,S,S);x.fillStyle='#c9b48a';x.fillRect(1,1,S-2,S-2);x.fillStyle='#a8925f';x.fillRect(1,S-3,S-2,2);x.fillRect(S-3,1,2,S-2);
 x.fillStyle='#e8dcb8';x.fillRect(1,1,S-2,1);x.fillRect(1,1,1,S-2);
 for(const [px,py] of [[3,3],[S-5,4],[4,S-6],[S-6,S-5]]){x.fillStyle='#8a7448';x.fillRect(px,py,1,1);}
 const ix=4,iy=4,iw=S-8;x.fillStyle=sp[0]==='seal'?sp[2]:BADGE_BG[sp[0]];x.fillRect(ix,iy,iw,iw);x.fillStyle='rgba(0,0,0,0.25)';x.fillRect(ix,iy+iw-2,iw,2);
 let spr=null;
 if(sp[0]==='char'){spr=charSpr(CHARS[sp[1]].look).n;if(sp[2]==='dawn'){x.fillStyle='#e0b048';x.fillRect(ix+2,iy+2,6,6);x.fillStyle='#ffd880';x.fillRect(ix+3,iy+3,4,4);}}
 else if(sp[0]==='tier'){const C=CHARS[sp[1]],tr=C.branches[sp[2]].tiers[Math.max(0,Math.min(4,sp[3]))];spr=charSpr(tr.look).n;}
 else if(sp[0]==='enemy'){spr=ESPR[sp[1]]?ESPR[sp[1]].n:null;}
 else if(sp[0]==='icon'){spr=ICS[sp[1]]||null;}
 else if(sp[0]==='pet'){spr=PSPR[sp[1]]?PSPR[sp[1]].n:null;}
 if(spr){const k=Math.max(1,Math.floor((iw-2)/Math.max(spr.width,spr.height)));const w=spr.width*k,h=spr.height*k;x.drawImage(spr,ix+Math.floor((iw-w)/2),iy+Math.floor((iw-h)/2),w,h);}
 else{const g=sp[0]==='seal'?sp[1]:'?';x.font=`bold ${g.length>1?11:18}px "Song Myung","Noto Serif CJK KR",serif`;x.textAlign='center';x.textBaseline='middle';x.fillStyle='#0a080c';x.fillText(g,S/2+1,S/2+2);x.fillStyle='#fff3d0';x.fillText(g,S/2,S/2+1);}
 return badgeCache[t.id]=big(c,2);}
function taskToast(t){const box=$('#ach');if(!box)return;const d=document.createElement('div');d.className='achv';d.setAttribute('role','status');d.innerHTML=_t("<img src=\"{p}\" alt=\"\"><div><small>과업 달성</small><b>{n}</b><span>{d}</span><em>{rwText}</em></div>",{p:taskBadge(t),n:t.n,d:t.d,rwText:t.rwText});box.appendChild(d);while(box.children&&box.children.length>4)box.firstChild.remove();setTimeout(()=>d.remove(),5000);snd(880,0.12,'triangle',0.04);setTimeout(()=>snd(1320,0.18,'triangle',0.035),110);}
function mergeRun(){const rs=G.rs,st=meta.stats;
 for(const k of ['kills','elites','mids','pots','tteok','shrines','tavern','awkTot','duo','calls','fuse','seals','graze','rushRounds','rushClear','variants','temper','dkIn','quests'])st[k]=(st[k]||0)+(rs[k]||0);st.comboMax=Math.max(st.comboMax||0,rs.comboMax||0);
 for(const k in rs)if(k.startsWith('boss_'))st[k]=(st[k]||0)+rs[k];
 if(G.mode!=='tale')st.maxStage=Math.max(st.maxStage||0,G.stage+1);if(G.mode!=='tale'){st.maxLevel=Math.max(st.maxLevel||0,rs.maxLevel);st['tier_'+G.cid]=Math.max(st['tier_'+G.cid]||0,G.P.tier);}st.ult=Math.max(st.ult||0,G.rs.ult||0);st.bestLoop=Math.max(st.bestLoop||0,G.rs.bestLoop||0);
 st.petLv=Math.max(st.petLv||0,G.pet?G.pet.lv:0);st['kills_'+G.cid]=(st['kills_'+G.cid]||0)+rs.kills;if(G.mode!=='tale'&&G.P.tier&&G.P.branch!=null){const bk='br'+G.P.branch+'_'+G.cid;st[bk]=Math.max(st[bk]||0,G.P.tier);}st.anoms=(st.anoms||0)+(rs.anoms||0);
 st.evoList=[...new Set([...(st.evoList||[]),...rs.evo])];
 for(const id in rs.seen){const m=meta.seen[id]||(meta.seen[id]={s:1,k:0});m.k+=rs.seen[id].k;}
 /* v16.2 이번 출정 수치를 저장했으니 과업 계산(V)에서 다시 더하지 않는다 */
 G.merged=true;}

/* ======================= level-up options ======================= */
const jobHas=(d,c)=>d.job===c||!!(d.also&&d.also.includes(c));   // v17.4: also = 함께 쓰는 퇴마사(명태: 무당·상인, 상인 됫박의 진화 짝)
const jobOk=d=>!d.job||jobHas(d,G.cid);
const wUnlocked=id=>!WD[id].lock||unlocked('w:'+id);
function genOptions(){const pool=[],B=G.banned;
 for(const w of G.weapons){if(w.lv<WD[w.id].max&&!B.has(w.id))pool.push({k:'wup',id:w.id,wt:WD[w.id].type==='c'?1.5:1.3});}
 const wc=G.weapons.filter(w=>WD[w.id].type==='w').length;
 if(wc<6)for(const id in WD){const d=WD[id];if(d.type==='w'&&!d.fuse&&jobOk(d)&&wUnlocked(id)&&!B.has(id)&&!G.weapons.some(w=>w.id===id||(w.kids&&w.kids.some(k=>k.id===id))))pool.push({k:'wnew',id,wt:d.job?1.3:0.9});}
 const pc=Object.keys(G.passives).length;
 for(const id in PD){const d=PD[id];if(!jobOk(d)||B.has(id))continue;const l=G.passives[id]||0;if(l>0&&l<d.max)pool.push({k:'pup',id,wt:1});else if(!l&&pc<6)pool.push({k:'pnew',id,wt:d.job?1:0.7});}
 if(G.P.lvl>=50||!pool.length)for(const w of G.weapons)if(w.lv>=WD[w.id].max&&!B.has(w.id))pool.push({k:'lb',id:w.id,wt:0.8});
 const n=(G.P.luck?4:3)+G.mods.choice,picks=[];
 while(picks.length<n&&pool.length){const tot=pool.reduce((s,o)=>s+o.wt,0);let r=Math.random()*tot,i=0;for(;i<pool.length-1;i++){r-=pool[i].wt;if(r<=0)break;}picks.push(pool.splice(i,1)[0]);}
 if(!picks.length)return [{k:'heal'},{k:'cash'}].map(decorate);
 return picks.map(decorate);}
function iconHTML(id){const d=WD[id];if(d&&d.type==='c')return `<span class="seal" style="background:${d.col}">${d.g}</span>`;if(BLESS[id])return `<span class="seal" style="background:${BLESS[id].col}">${BLESS[id].g}</span>`;return `<img src="${ICON[id]}" alt="">`;}
/* v17.4 진화 짝 강조: 무기 카드는 짝 보패를 가졌는지, 보패 카드는 그 보패와 짝인 무기를 가졌는지 보여 준다.
   evoState → {kind:'w'|'p', pair(강조할지), ready(상자를 열면 진화), rows:[{wid,pid,own,lv,evoName}]} · 진화했거나 짝이 없으면 null */
function evoState(o){if(!G)return null;
 if(o.k==='wnew'||o.k==='wup'){const d=WD[o.id];if(!d||d.type!=='w'||!d.evo)return null;const w=G.weapons.find(w=>w.id===o.id);if(w&&w.evo)return null;
  const lv=w?w.lv:0,has=(G.passives[d.evo]||0)>0,nl=o.k==='wup'?lv+1:1;
  return {kind:'w',pair:has,ready:has&&nl>=d.max,rows:[{wid:o.id,pid:d.evo,own:has,lv,evoName:d.evoName}]};}
 if(o.k==='pnew'||o.k==='pup'){const rows=[];
  for(const wid in WD){const d=WD[wid];if(d.evo!==o.id||d.type!=='w'||!jobOk(d))continue;const w=G.weapons.find(w=>w.id===wid);
   if(w){if(!w.evo)rows.push({wid,pid:o.id,own:true,lv:w.lv,evoName:d.evoName});}
   else if(wUnlocked(wid)&&!G.weapons.some(x=>x.kids&&x.kids.some(k=>k.id===wid)))rows.push({wid,pid:o.id,own:false,lv:0,evoName:d.evoName});}
  if(!rows.length)return null;rows.sort((a,b)=>b.own-a.own);
  return {kind:'p',pair:rows.some(r=>r.own),ready:rows.some(r=>r.own&&r.lv>=WD[r.wid].max),rows};}
 return null;}
const epH=(id,name,own)=>`<span class="ep ${own?'own':'no'}"><img src="${ICON[id]}" alt="">${name}</span>`;
function evoHTML(o){const st=evoState(o);if(!st)return '';
 if(st.kind==='w'){const r=st.rows[0];
  return _t("<span class=\"evo\"><span class=\"et\">진화 짝</span> {p} <i class=\"{p2}\">{p3}</i> → <b>{evoName}</b>{p4}</span>",{p:epH(r.pid,PD[r.pid].name,r.own),p2:r.own?'y':'n',p3:r.own?_t("보유"):_t("아직 없음"),evoName:r.evoName,p4:st.ready?_t("<em>{p}보물상자를 열면 진화</em>",{p:o.k==='wup'?_t("이번에 LV ")+WD[o.id].max+' · ':''}):''});}
 const pn=PD[o.id].name;
 return _t("<span class=\"evo\"><span class=\"et\">진화 짝</span>{p}{p2}</span>",{p:st.rows.map(r=>`<span class="er">${epH(r.wid,WD[r.wid].name,r.own)} <i class="${r.own?'y':'n'}">${r.own?_t("보유 LV ")+r.lv:_t("없음")}</i> + ${pn} → <b>${r.evoName}</b></span>`).join(''),p2:st.ready?_t("<em>보물상자를 열면 진화</em>"):''});}
function decorate(o){
 if(o.k==='heal')return {...o,ic:iconHTML('tteok'),name:_t("떡 한 접시"),desc:_t("체력을 50 회복한다."),badge:_t("보급"),bc:''};
 if(o.k==='cash')return {...o,ic:iconHTML('coin'),name:_t("엽전 꾸러미"),desc:_t("엽전 25닢을 얻는다."),badge:_t("보급"),bc:''};
 if(o.k==='lb'){const d=WD[o.id],w=G.weapons.find(w=>w.id===o.id),l=w.lb||0;return {...o,ic:iconHTML(o.id),name:(w.evo?d.evoName:d.name)+_t(" 한계 돌파"),desc:_t("피해 +5%{p}. 끝없이 쌓을 수 있다.",{p:(l+1)%5===0?_t(" · 범위 +10%"):''}),badge:_t("돌파 {l} → {p}",{l:l,p:l+1}),bc:'lb'};}
 if(o.k==='wnew'||o.k==='wup'){const d=WD[o.id],w=G.weapons.find(w=>w.id===o.id);
  if(o.k==='wnew')return {...o,ic:iconHTML(o.id),name:d.name,desc:d.desc[0]+evoHTML(o),badge:d.job?_t("전용 무기"):_t("신규 무기"),bc:d.job?'job':'new',pair:!!(evoState(o)||{}).pair};
  return {...o,ic:iconHTML(o.id),name:w.evo?d.evoName:d.name,desc:d.desc[w.lv]+evoHTML(o),badge:`LV ${w.lv} → ${w.lv+1}`,bc:d.type==='c'?'cls':'',pair:!!(evoState(o)||{}).pair};}
 const d=PD[o.id],l=G.passives[o.id]||0;
 return {...o,ic:iconHTML(o.id),name:d.name,desc:d.desc+evoHTML(o),badge:l?`LV ${l} → ${l+1}`:(d.job?_t("전용 보패"):_t("신규 보패")),bc:l?'':(d.job?'job':'new'),pair:!!(evoState(o)||{}).pair};}
function applyOpt(o){
 if(o.k==='heal')heal(50);
 else if(o.k==='cash')G.coins+=25;
 else if(o.k==='wnew')addWeapon(o.id);
 else if(o.k==='wup')G.weapons.find(w=>w.id===o.id).lv++;
 else if(o.k==='lb'){const w=G.weapons.find(w=>w.id===o.id);w.lb=(w.lb||0)+1;}
 else{G.passives[o.id]=(G.passives[o.id]||0)+1;recompute();}
 refreshSlots();}

/* ======================= screens ======================= */
const ARM_MS=500;   // 입력 보호: 고르기 창이 열린 뒤 0.5초 동안 누름 무시(프로젝트 규칙 0.3~0.6초, v17.2에서 0.18초 → 0.5초로 되돌림)
const PICK_SCREENS=new Set(['levelup','adv','bless','petpick','pick','chest','scene']);let armUntil=0;
function show(id){for(const s of document.querySelectorAll('.screen'))s.hidden=s.id!==id;$('#overlay').hidden=!id;modal=id;
 {const hb=$('#hudbtns');if(hb)hb.style.visibility=id?'hidden':'';}
 if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();   /* 창이 떠도 누르고 있는 이동 손가락은 놓지 않는다(v16.3 이동 중 카드 고르기, v17.2에서 되돌림) */
 const ov=$('#overlay');if(PICK_SCREENS.has(id)){armUntil=performance.now()+ARM_MS;ov.classList.add('arming');clearTimeout(show._t);show._t=setTimeout(()=>ov.classList.remove('arming'),ARM_MS);}else ov.classList.remove('arming');}
const armed=()=>performance.now()>=armUntil;
/* v16.3 고르기 창 터치: 다른 손가락이 화면에 닿아 있으면(이동 중) 휴대폰 브라우저가 탭을 클릭으로 보내지 않는다.
   고르기 창에서는 같은 버튼 위에서 손가락을 떼면 바로 누른 것으로 처리하고, 뒤따르는 클릭은 한 번 걸러 두 번 처리되지 않게 한다. */
{const ov=$('#overlay'),down=new Map();let tapAt=-1e9;
 const btnOf=e=>e.target&&e.target.closest?e.target.closest('button'):null;
 ov.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;const bt=btnOf(e);if(bt&&ov.contains(bt))down.set(e.pointerId,{bt,x:e.clientX,y:e.clientY});},true);
 ov.addEventListener('pointerup',e=>{const d=down.get(e.pointerId);down.delete(e.pointerId);if(!d)return;
  if(btnOf(e)!==d.bt||Math.hypot(e.clientX-d.x,e.clientY-d.y)>14)return;
  if(d.bt.disabled||!PICK_SCREENS.has(modal)||!armed()||!document.body.contains(d.bt))return;
  tapAt=performance.now();d.bt.click();},true);
 ov.addEventListener('pointercancel',e=>down.delete(e.pointerId),true);
 ov.addEventListener('click',e=>{if(e.isTrusted&&performance.now()-tapAt<700){tapAt=-1e9;e.stopPropagation();e.preventDefault();}},true);}
let curOpts=[],banMode=false;
function openLevel(regen=true){if(regen)curOpts=genOptions();banMode=false;renderLevel();show('levelup');if(regen){snd(660,0.15,'triangle',0.05);setTimeout(()=>snd(990,0.2,'triangle',0.05),90);}}
function renderLevel(){const box=$('#luCards');box.innerHTML='';box.classList.toggle('banmode',banMode);
 $('#luEye').textContent=`LEVEL UP · LV ${G.P.lvl}`;$('#luTitle').textContent=banMode?_t("봉인할 것을 고르세요"):[_t("수련의 결실"),_t("깨달음이 오다"),_t("기운이 차오른다"),_t("한 고비를 넘다")][G.P.lvl%4];
 curOpts.forEach((o,i)=>{const bt=document.createElement('button');bt.className='card'+(o.pair?' pair':'');bt.id='opt'+i;
  bt.innerHTML=`<span class="ic">${o.ic}</span><div class="cm"><span class="bdgs"><span class="badge ${o.bc}">${o.badge}</span>${o.pair?_t("<span class=\"badge pairb\">진화 짝</span>"):''}</span><b>${o.name}</b><p>${o.desc}</p></div><kbd>${i+1}</kbd>`;
  bt.onclick=()=>pickOpt(i);box.appendChild(bt);});
 $('#rrN').textContent='×'+G.rr;$('#skN').textContent='×'+G.sk;$('#bnN').textContent='×'+G.bn;
 $('#rrBtn').disabled=G.rr<=0;$('#skBtn').disabled=G.sk<=0;$('#bnBtn').disabled=G.bn<=0;$('#bnBtn').setAttribute('aria-pressed',banMode);}
function pickOpt(i){const o=curOpts[i];if(!o)return;
 if(banMode){if(!o.id||G.bn<=0)return;G.bn--;G.banned.add(o.id);snd(200,0.2,'sawtooth',0.04);
  const fresh=genOptions().filter(x=>!curOpts.some(c=>c.id===x.id&&c.k===x.k));curOpts[i]=fresh[0]||decorate({k:'cash'});banMode=false;renderLevel();return;}
 applyOpt(o);show(null);}
function reroll(){if(G.rr<=0)return;G.rr--;curOpts=genOptions();banMode=false;renderLevel();snd(500,0.15,'square',0.03);}
function skipLevel(){if(G.sk<=0)return;G.sk--;G.coins+=5;show(null);}
let advPick=[];
function grantTier(bi,bonus){const P=G.P,C=CHARS[G.cid];P.branch=bi;const t=C.branches[bi].tiers[P.tier];P.tier++;
 t.apply(G.base);if(bonus)bonus.f(G.base);addWeapon(t.skill);recompute();refreshSlots();show(null);
 toast(_t("{p} 전직 · {name}",{p:TIER_NAME[P.tier],name:t.name}),'big');flash('255,230,160',0.3);particle(P.x,P.y-6,'#e0b048',24,70,0.7);
 if(P.tier===1&&!G.pet&&G.mode!=='tale')openPet();}
function openAdv(){const P=G.P,C=CHARS[G.cid],box=$('#advCards');box.innerHTML='';advPick=[];
 $('#advEye').textContent=_t("CLASS ADVANCE · {p}차 · LV {p2}",{p:P.tier+1,p2:(P.tier+1)*10});
 if(P.tier===0){
  $('#advTitle').textContent=_t("전직의 갈림길");$('#advLede').textContent=_t("한 길을 고르면 되돌릴 수 없다. 레벨 20·30·40·50에 같은 길의 다음 직업으로 오르며, 단계마다 새 기술과 새 차림을 얻는다.");
  C.branches.forEach((br,i)=>{const t=br.tiers[0],sk=WD[t.skill];const bt=document.createElement('button');bt.className='adv';bt.id='adv'+i;
   bt.innerHTML=_t("<span class=\"badge cls\">{name}</span><div class=\"top\"><img src=\"{p}\" alt=\"\"><b>{name2}</b></div><div class=\"sk\">{p2}고유 기술 · {name3}</div><p>{p3}</p><div class=\"bn\">전직 보너스 · {bonus}</div><div class=\"tree\">{name4} → <span>{name5}</span> → {p4}</div>",{name:br.name,p:big(charSpr(t.look).n,5),name2:t.name,p2:iconHTML(t.skill),name3:sk.name,p3:sk.desc[0],bonus:t.bonus,name4:C.name,name5:t.name,p4:br.tiers.slice(1).map(x=>`${x.name}(${WD[x.skill].name})`).join(' → ')});
   bt.onclick=()=>grantTier(i);box.appendChild(bt);advPick.push(()=>grantTier(i));});
 }else{
  const br=C.branches[P.branch],t=br.tiers[P.tier],sk=WD[t.skill];
  $('#advTitle').textContent=_t("{name}에서 {name2}(으)로",{name:br.tiers[P.tier-1].name,name2:t.name});$('#advLede').textContent=_t("새 직업과 기술, 새 차림이 주어진다. 함께 받을 수련 하나를 고르면 전직이 끝난다.");
  const card=document.createElement('div');card.className='adv advinfo';
  const bonus=TIER_BONUS.slice().sort(()=>Math.random()-0.5).slice(0,3);
  card.innerHTML=_t("<span class=\"badge cls\">{name} · {p}차</span><div class=\"top\"><img src=\"{p2}\" alt=\"\"><b>{name2}</b></div><div class=\"sk\">{p3}고유 기술 · {name3}</div><p>{p4}</p><div class=\"bn\">전직 보너스 · {bonus}</div><div class=\"tree\">{p5}</div>",{name:br.name,p:P.tier+1,p2:big(charSpr(t.look).n,5),name2:t.name,p3:iconHTML(t.skill),name3:sk.name,p4:sk.desc[0],bonus:t.bonus,p5:br.tiers.map((x,i)=>i===P.tier?`<span>${x.name}</span>`:x.name).join(' → ')});
  box.appendChild(card);
  /* v16.3 고르는 칸: 레벨업 카드처럼 칸 전체가 버튼 (전에는 큰 카드의 대부분이 눌리지 않고 아래 작은 버튼만 반응했다) */
  const picks=document.createElement('div');picks.className='cards advpicks';
  bonus.forEach((bn,i)=>{const bb=document.createElement('button');bb.className='card advpick';bb.id='adv'+i;
   bb.innerHTML=_t("<span class=\"ic\"><span class=\"seal\" style=\"background:#2f6b5a\">修</span></span><div class=\"cm\"><span class=\"badge cls\">함께 받을 수련</span><b>{n}</b><p>고르면 {name}(으)로 전직한다.</p></div><kbd>{p}</kbd>",{n:bn.n,name:t.name,p:i+1});
   bb.onclick=()=>grantTier(P.branch,bn);picks.appendChild(bb);advPick.push(()=>grantTier(P.branch,bn));});
  box.appendChild(picks);
  card.onclick=()=>{picks.scrollIntoView({block:'nearest',behavior:'smooth'});picks.classList.remove('nudge');void picks.offsetWidth;picks.classList.add('nudge');};}
 show('adv');snd(440,0.4,'triangle',0.06);}
let blessPick=[];
function openBless(title){const box=$('#blessCards');box.innerHTML='';blessPick=[];$('#blessTitle').textContent=title||_t("신령께 비나이다");
 const ids=Object.keys(BLESS).filter(id=>(G.bless[id]||0)<3).sort(()=>Math.random()-0.5).slice(0,3);
 const done=()=>{if(G.afterBless){const a=G.afterBless;G.afterBless=null;a();}else show(null);};
 const duos=Object.keys(DUO).filter(d=>!G.duo[d]&&G.bless[DUO[d].a]&&G.bless[DUO[d].b]);
 if(duos.length&&Math.random()<0.7){const id=duos[Math.random()*duos.length|0],u=DUO[id];if(ids.length>=3)ids.pop();
  const bt=document.createElement('button');bt.className='card';bt.innerHTML=_t("<span class=\"ic\"><span class=\"seal\" style=\"background:#3a1a4a;font-size:15px\">{p}</span></span><div class=\"cm\"><span class=\"badge duo\">쌍신 축복 · {n}+{n2}</span><b>{n3}</b><p>{d}</p></div><kbd>{p2}</kbd>",{p:duoG(id),n:BLESS[u.a].n,n2:BLESS[u.b].n,n3:u.n,d:u.d,p2:ids.length+1});
  const f=()=>{G.duo[id]=1;G.rs.duo=(G.rs.duo||0)+1;recompute();refreshSlots();toast(_t("쌍신 축복 · {n}",{n:u.n}),'big');flash('220,180,255',0.3);done();};bt.onclick=f;
  setTimeout(()=>{blessPick.push(f);box.appendChild(bt);},0);}
 if(!ids.length&&!duos.length){heal(G.P.maxHp*0.5);done();return;}
 ids.forEach((id,i)=>{const g=BLESS[id],l=G.bless[id]||0;const bt=document.createElement('button');bt.className='card';
  bt.innerHTML=`<span class="ic">${iconHTML(id)}</span><div class="cm"><span class="badge god">${l?_t("{l} → {p}단계",{l:l,p:l+1}):_t("첫 축복")}</span><b>${g.n}</b><p>${g.d}</p></div><kbd>${i+1}</kbd>`;
  const f=()=>{if(!l)G.blessOrder.push(id);G.bless[id]=l+1;recompute();refreshSlots();toast(_t("{n}의 축복",{n:g.n}),'big');done();};bt.onclick=f;blessPick.push(f);box.appendChild(bt);});
 show('bless');snd(780,0.4,'triangle',0.05);}
let petPick=[];
function openPet(){const box=$('#petCards');box.innerHTML='';petPick=[];
 Object.keys(PETS).forEach((id,i)=>{const p=PETS[id],bt=document.createElement('button');bt.className='adv';bt.id='pet'+i;
  const row=(k,lab)=>_t("<p><b>{lab} · {p}초</b> {p2}</p>",{lab:lab,p:PET_CD[k],p2:p.sk[k].map(s=>`Lv ${s.lv} 「${s.n}」 ${s.d}`).join(' → ')});
  bt.innerHTML=`<span class="badge" style="background:${p.col}">${p.kind}</span><div class="top"><img src="${big(PSPR[id].n,5)}" alt=""><b>${p.n}</b></div><p>${p.d}</p>${row('a',_t("일반 공격"))}${row('h',_t("홀딩 기술"))}${row('u',_t("궁극기"))}`;
  const f=()=>pickPet(id);bt.onclick=f;petPick.push(f);box.appendChild(bt);});
 show('petpick');snd(520,0.4,'triangle',0.05);}
let chestCb=null;
function openChest(n,cb){chestCb=cb||null;const list=$('#lootList');list.innerHTML='';
 const ev=G.weapons.find(w=>!w.evo&&WD[w.id].type==='w'&&w.lv>=WD[w.id].max&&(G.passives[WD[w.id].evo]||0)>0);
 if(ev){ev.evo=true;G.rs.evo.add(ev.id);const d=WD[ev.id];list.innerHTML+=`<div><img src="${ICON[ev.id]}" alt=""><div><span class="ev">${d.name} → ${d.evoName}</span><br>${d.evoDesc}</div></div>`;n--;}
 else{const fu=findFusion();if(fu){doFusion(fu);list.innerHTML+=_t("<div><img src=\"{p}\" alt=\"\"><div><span class=\"ev\">합공 · {evoName} + {evoName2} → {n}</span><br>{d}</div></div>",{p:ICON[fu.id],evoName:WD[fu.a].evoName,evoName2:WD[fu.b].evoName,n:fu.n,d:fu.d});n--;}}
 for(let i=0;i<n;i++){const c=[];for(const w of G.weapons)if(w.lv<WD[w.id].max)c.push({k:'wup',id:w.id});for(const id in G.passives)if(G.passives[id]<PD[id].max)c.push({k:'pup',id});
  if(!c.length&&G.weapons.length){const w=G.weapons[Math.random()*G.weapons.length|0];const o=decorate({k:'lb',id:w.id});applyOpt(o);list.innerHTML+=`<div><span class="ic">${o.ic}</span><b>${o.name}</b>&nbsp;${o.badge}</div>`;continue;}
  if(!c.length){G.coins+=25;list.innerHTML+=_t("<div><img src=\"{coin}\" alt=\"\">엽전 25닢</div>",{coin:ICON.coin});continue;}
  const o=decorate(c[Math.random()*c.length|0]);applyOpt(o);list.innerHTML+=`<div><span class="ic">${o.ic}</span><b>${o.name}</b>&nbsp;${o.badge}</div>`;}
 if(Math.random()<0.4){G.queue.push('seal');list.innerHTML+=_t("<div><span class=\"ic\"><span class=\"seal\" style=\"background:#7a2018\">印</span></span><b>인장 하나</b>&nbsp;상자를 닫으면 새긴다</div>");}
 refreshSlots();show('chest');snd(520,0.3,'triangle',0.05);setTimeout(()=>snd(780,0.3,'triangle',0.05),120);}

/* --- 주막 between stages --- */
const TAVERN=[
 {id:'gukbap',n:'국밥 한 그릇',d:'체력을 60% 회복한다.',p:12,f:()=>heal(G.P.maxHp*0.6/G.P.healM)},
 {id:'makgeolli',n:'막걸리 한 사발',d:'다음 막 동안 공격력 +20%.',p:18,f:()=>{G.stageMight+=0.2;recompute();}},
 {id:'santong',n:'새 산통',d:'산통 흔들기 +2.',p:10,f:()=>{G.rr+=2;}},
 {id:'bujeok',n:'봉인 부적',d:'봉인 +1.',p:10,f:()=>{G.bn+=1;}},
 {id:'mul',n:'물리기 패',d:'물리기 +2.',p:8,f:()=>{G.sk+=2;}},
 {id:'bottari',n:'보부상 보따리',d:'가진 무기나 보패 하나를 무작위로 강화한다.',p:25,f:()=>{const c=[];for(const w of G.weapons)if(w.lv<WD[w.id].max)c.push({k:'wup',id:w.id});for(const id in G.passives)if(G.passives[id]<PD[id].max)c.push({k:'pup',id});if(c.length){const o=decorate(c[Math.random()*c.length|0]);applyOpt(o);toast(_t("{name} 강화",{name:o.name}));}}},
 {id:'jeonghwa',n:'정화수 한 그릇',d:'신령께 올려 축복 하나를 고른다.',p:35,f:()=>{G.tavBless=true;}},
 {id:'injang',n:'인장 장인',d:'무기 하나에 인장을 새긴다.',p:30,f:()=>{G.tavSeal=true;}},
];
const TAV_ICON={gukbap:'gukbap',makgeolli:'makgeolli',santong:'santong',bujeok:'bujeok',mul:'santong',bottari:'bottari',jeonghwa:'jeonghwasu',injang:'nakgwan'};
function tavPrice(it){return Math.round(it.p*(1+G.stage*0.3)*Math.pow(1.5,G.tavBuy[it.id]||0));}
function openTavern(){const s=curStg();
 if(G.stage>=STAGES.length-1){if(G.mode==='normal'&&endingPages(G.cid).length)openEnding(openEndless);else openEndless();return;}
 G.tavBuy={};G.stageMight=0;recompute();
 $('#tavEye').textContent=`${s.sub} CLEAR`;$('#tavTitle').textContent=_t("{name} 평정 · 주막",{name:s.name});
 const n=STAGES[G.stage+1];$('#tavLede').textContent=_t("처치 {kills}. 주막에서 엽전을 쓰고 {sub} {name}(으)로 떠난다. 떠나면 체력을 30% 회복하고, 남은 엽전은 출정이 끝난 뒤 수련 도장에서 쓰는 엽전이 된다.",{kills:G.kills,sub:n.sub,name:n.name});
 renderTavern();show('tavern');}
function renderTavern(){$('#tavCoins').textContent=_t("가진 엽전 {coins}닢",{coins:G.coins});const box=$('#tavList');box.innerHTML='';
 if(ksOwned().length){const d=document.createElement('div');d.className='it';const K=G.ks?KS[G.ks]:null;d.innerHTML=_t("<span class=\"ic\"><span class=\"seal\" style=\"background:{p}\">{p2}</span></span><div class=\"cm\"><b>정표 바꾸기</b><p>{p3}</p></div><button id=\"tav-ks\">바꾸기</button>",{p:K?NPCS[K.npc].col:'#4a3a30',p2:K?NPCS[K.npc].g:'情',p3:K?_t("지금 「{n}」 — {d}",{n:K.n,d:K.d}):_t("지금은 정표를 차지 않았다.")});d.querySelector('button').onclick=()=>openKsSwap(()=>{renderTavern();show('tavern');});box.appendChild(d);}
 for(const it of TAVERN){const p=tavPrice(it);const d=document.createElement('div');d.className='it';
  d.innerHTML=_t("<span class=\"ic\"><img src=\"{p}\" alt=\"\"></span><div class=\"cm\"><b>{n}</b><p>{d}</p></div><button id=\"tav-{id}\" {p2}>{p3}닢</button>",{p:ICON[TAV_ICON[it.id]],n:it.n,d:it.d,id:it.id,p2:G.coins<p?'disabled':'',p3:p});
  d.querySelector('button').onclick=()=>{if(G.coins<p)return;G.coins-=p;G.rs.tavern+=p;G.tavBuy[it.id]=(G.tavBuy[it.id]||0)+1;it.f();snd(1000,0.1,'triangle');
   if(G.tavBless){G.tavBless=false;G.afterBless=()=>{renderTavern();show('tavern');};openBless(_t("정화수를 올리다"));return;}
   if(G.tavSeal){G.tavSeal=false;G.afterSeal=()=>{renderTavern();show('tavern');};openSeal();return;}renderTavern();};box.appendChild(d);}}
function nextStage(){G.gfx=[];G.stage++;G.st=0;G.bossDone=false;G.boss=null;G.mid=null;G.midDone=false;G.swarmDone=false;G.eliteT=40;G.shrine=null;G.shrineN=0;G.gateMsg=false;G.skyAt=rnd(32,95);G.skyGod=null;G.anom=null;G.anomAt=rnd(20,90);G.dkC=null;dkPlan();questPlan();tracePlan();
 G.enemies.length=0;G.ebul.length=0;G.warns=[];G.ezones=[];G.pull=null;G.wind=null;G.dark=0;
 G.zones=G.zones.filter(z=>z.follow);G.items=G.items.filter(i=>i.k==='chest');G.rs.maxStage=Math.max(G.rs.maxStage,G.stage+1);
 G.P.hp=Math.min(G.P.maxHp,G.P.hp+G.P.maxHp*0.3);show(null);stageToast();checkTasks();}
function statHTML(){const P=G.P;
 return [[G.mode==='rush'?_t("원정"):_t("막"),G.mode==='rush'?`${G.stage+1} / ${STAGES.length}`:stageLabel()],[_t("버틴 시간"),fmtT(totalTime())],[_t("레벨"),P.lvl],[_t("처치"),G.kills],[_t("엽전"),G.coins],[_t("직업"),className(),1],[_t("펫"),G.pet?`${PETS[G.pet.type].n} Lv ${G.pet.lv}`:_t("없음"),1],[_t("난이도"),DIFFS[G.diff].n,1],[_t("액운"),G.curse],[_t("점괘 패"),G.card?CARDS[G.card].n:_t("없음"),1],[_t("공격력"),Math.round(P.might*100)+'%'],[_t("치명타"),Math.round(P.crit*100)+'%']].map(([a,v,k])=>`<div><span>${a}</span><strong${k?' class="k"':''}>${v}</strong></div>`).join('');}
function buildHTML(){return (G.pet?`<div class="slot pet" title="${PETS[G.pet.type].n}"><img src="${big(PSPR[G.pet.type].n,2)}" alt="${PETS[G.pet.type].n}"><b>${G.pet.lv}</b></div>`:'')+G.weapons.map(w=>{const d=WD[w.id];return d.type==='c'?`<div class="slot cls${w.awk?' awk':''}" title="${w.awk?AWK[w.awk].n+_t("의 "):''}${d.name}"><span class="si" style="background:${d.col}">${d.g}</span><b>${w.lv}${w.lb?'+'+w.lb:''}</b></div>`:`<div class="slot ${d.fuse?'fuse':w.evo?'evo':''}" title="${w.evo?d.evoName:d.name}${w.tm?_t(" · 담금질 ")+TEMPER[w.tm].n:''}${(w.seals||[]).length?_t(" · 인장 ")+w.seals.map(k=>SEALS[k].g).join(''):''}"><img src="${ICON[w.id]}" alt="${w.evo?d.evoName:d.name}">${(w.seals||[]).length?`<i class="sl">${'•'.repeat(w.seals.length)}</i>`:''}${w.tm?`<i class="tm">${TEMPER[w.tm].g}</i>`:''}<b>${d.fuse?'合':w.evo?'★':w.lv}${w.lb?'+'+w.lb:''}</b></div>`;}).join('')
 +Object.keys(G.passives).map(id=>`<div class="slot" title="${PD[id].name}"><img src="${ICON[id]}" alt="${PD[id].name}"><b>${G.passives[id]}</b></div>`).join('')
 +(G.ult?`<div class="slot ult" title="${ULT[G.cid].n}"><span class="si" style="background:#7a2018">${ULT[G.cid].g}</span></div>`:'')
 +Object.keys(G.duo||{}).map(id=>`<div class="slot god duo" title="${DUO[id].n}"><span class="si" style="background:#3a1a4a">${duoG(id)}</span></div>`).join('')
 +Object.keys(G.bless).map(id=>`<div class="slot god" title="${BLESS[id].n}"><span class="si" style="background:${BLESS[id].col}">${BLESS[id].g}</span><b>${G.bless[id]}</b></div>`).join('');}
function totalTime(){if(G.mode==='tale')return G.time-G.tale.t0;return (G.loop*STAGES.length+G.stage)*STAGE_T+Math.min(G.st,STAGE_T);}
function endGame(win){if(G.over)return;G.over=true;G.P.iframe=0;
 if(win&&G.mode==='normal')recordClear();if(win&&G.mode==='rush')meta.stats.rushBest=Math.max(meta.stats.rushBest||0,STAGES.length);const cleared=win||G.loop>0;
 mergeRun();
 const earned=Math.round((G.coins+Math.floor(G.kills/25)+(G.mode==='tale'?G.tale.act:G.stage)*15+(cleared?150:0)+G.loop*150)*(1+G.curse*0.15)*DIFFS[G.diff].coin*(G.mods.coinShop||1));meta.coins+=earned;
 {const r=archiveRun(win),h=meta.hub;h.runs++;h.mak+=(G.rs.mak||0);h.last={win:!!win,kills:G.kills,where:r.where,cls:r.cls,lvl:r.lvl};G.archR=r;}
 checkTasks();
 const rec={stage:G.stage,kills:G.kills,win};if(G.mode!=='tale'&&(!meta.best||G.stage>meta.best.stage||(G.stage===meta.best.stage&&G.kills>meta.best.kills)))meta.best=rec;saveMeta();
 if(G.mode==='tale'){const T=TALES[G.tale.id],A=T.acts[G.tale.act];$('#overEye').textContent=win?'TALE CLEAR':'TALE';
  $('#overTitle').textContent=win?_t("『{n}』{p} 끝맺었다 · {p2}{p3}",{n:T.n,p:jong(T.n)?'을':'를',p2:fmtT(G.tale.time),p3:G.tale.rec?_t(" · 새 기록"):''}):_t("『{n}』 {p}막 「{name}」에서 쓰러졌다",{n:T.n,p:G.tale.act+1,name:A.name});   //i18n-skip 조사(간체 문구는 {p}를 쓰지 않음)
  $('#overStats').innerHTML=statHTML()+overExtra(earned);showGoals();$('#overBuild').innerHTML=buildHTML();setTimeout(()=>show('over'),win?200:700);return;}
 if(G.mode==='rush'){$('#overEye').textContent=win?'EXPEDITION CLEAR':'EXPEDITION';$('#overTitle').textContent=win?_t("열 번의 원정을 모두 마쳤다"):_t("{p}번째 원정에서 쓰러졌다",{p:G.stage+1});$('#overStats').innerHTML=statHTML()+overExtra(earned);showGoals();$('#overBuild').innerHTML=buildHTML();setTimeout(()=>show('over'),win?200:700);return;}
 $('#overEye').textContent=win?'VICTORY':(G.loop?'ENDLESS NIGHT':'GAME OVER');
 $('#overTitle').textContent=win?(G.loop?_t("끝없는 밤 {p}바퀴 끝에 새벽을 맞았다",{p:G.loop+1}):_t("그슨대를 걷어 내고 새벽을 맞았다")):(G.loop?_t("끝없는 밤 {p}바퀴 · {name}에서 쓰러졌다",{p:G.loop+1,name:curStg().name}):_t("{name}에서 쓰러졌다",{name:curStg().name}));
 $('#overStats').innerHTML=statHTML()+overExtra(earned);showGoals();
 $('#overBuild').innerHTML=buildHTML();
 setTimeout(()=>show('over'),win?200:700);}
function showGoals(){$('#overGoals').innerHTML=goalsHTML(runGoals());const b=$('#goalsMore');if(b)b.onclick=()=>openCodex('over');}
function overExtra(earned){const r=G.archR,J=jdate(r.t),m=G.rs.mak||0,top=r.dmg[0];return _t("<div><span>가져가는 엽전</span><strong>+{earned}</strong></div><div><span>최대 연격</span><strong>{combo}</strong></div><div><span>막 의뢰</span><strong>{q}번</strong></div><div><span>막걸리</span><strong>+{m}병</strong></div>{p}<div><span>기록관</span><strong class=\"k\">{j}</strong></div>",{earned:earned,combo:r.combo,q:r.q,m:m,p:top?_t("<div><span>주력</span><strong class=\"k\">{p} {p2}%</strong></div>",{p:srcName(top[0],r.cid),p2:Math.round(top[1]/Math.max(1,r.tot)*100)}):'',j:J.j});}
function openPause(){if(!G||G.over||modal)return;$('#pauseStats').innerHTML=statHTML();$('#pauseBuild').innerHTML=buildHTML();show('pause');}
function refreshSlots(){if(G){$('#slots').innerHTML=buildHTML();$('#clsName').textContent=className();}}
function fmtT(t){const m=Math.floor(t/60),s=Math.floor(t%60);return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');}

/* --- title, prep, codex, shop, settings --- */
function charLock(id){const t=TASKS.find(t=>t.rw.unlock==='char:'+id);return t?_t("과업 「{n}」: {d}",{n:t.n,d:t.d}):'';}
function renderTitle(){checkTasks();{const mn=$('#migNote');if(mn)mn.hidden=!meta.migNote;}const box=$('#chars');box.innerHTML='';
 for(const id in CHARS){const C=CHARS[id],ok=unlocked('char:'+id);const bt=document.createElement('button');bt.className='ch'+(ok?'':' locked');bt.id='ch-'+id;bt.setAttribute('aria-pressed',selChar===id);
  bt.innerHTML=`<span class="seal">${C.seal}</span><img src="${big(charSpr(C.look).n,6)}" alt=""><b>${C.name}</b><span class="trait">${ok?C.trait:_t("잠김")}</span><p>${ok?C.desc:charLock(id)}</p>${ok?`<div class="path">${C.branches.map(br=>br.tiers.map(t=>t.name).join(' → ')).join('<br>')}</div>`:''}`;
  bt.onclick=()=>{if(!ok)return;selChar=id;renderTitle();};bt.ondblclick=()=>{if(ok){selChar=id;openPrep();}};box.appendChild(bt);}
 if(selChar&&!unlocked('char:'+selChar))selChar=null;
 if(!selChar){selChar=Object.keys(CHARS).find(id=>unlocked('char:'+id))||null;if(selChar){renderTitle();return;}}
 $('#startBtn').disabled=!selChar;
 diffChips($('#titleDiffChips'),$('#titleDiffDesc'),renderTitle);
 const bst=meta.best?_t(" · 최고 기록 {sub}{p}, 처치 {kills}",{sub:STAGES[Math.min(meta.best.stage,9)].sub,p:meta.best.win?_t(" 완주"):'',kills:meta.best.kills}):'';
 $('#titleCoins').textContent=_t("보유 엽전 {coins}닢 · 과업 {length}/{length2}{bst}",{coins:meta.coins,length:meta.done.length,length2:TASKS.length,bst:bst});}
function openPrep(){if(!selChar)return;prep.curse=Math.min(prep.curse,meta.curseMax);if(prep.card&&!unlocked('card:'+prep.card))prep.card=null;$('#prepTitle').textContent=_t("{name} · 출정 준비",{name:CHARS[selChar].name});renderPrep();show('prep');}
function diffChips(box,desc,after){box.innerHTML='';
 for(const k of ['easy','normal','hard']){const bt=document.createElement('button');bt.textContent=DIFFS[k].n;bt.setAttribute('aria-pressed',prep.diff===k);bt.onclick=()=>{prep.diff=k;meta.diff=k;saveMeta();after();};box.appendChild(bt);}
 desc.textContent=DIFFS[prep.diff].d;}
const MODES={normal:{n:'출정',d:'열 개의 막을 차례로 버티며 평정한다. 제10막 뒤에는 끝없는 밤으로 이어 갈 수 있다.'},tale:{n:'설화 출정',d:'옛이야기 한 편을 세 막으로 따라간다. 퇴마사와 시작 힘이 정해져 있고, 막마다 이야기의 규칙이 붙는다. 끝내면 옷 빛깔과 결말 글을 얻고, 다시 하면 가장 빠른 완주에 도전한다.'},rush:{n:'퇴마 원정',d:'보스만 열 번 연달아 상대한다. 막마다 보스 셋 가운데 하나를 등급(하·중·상)을 보고 고르고, 쓰러뜨리면 넋의 선물을 받는다. 요괴는 적게 나온다.'}};
function taleCards(){return TALE_IDS.map(id=>{const T=TALES[id],f=meta.tale.frag[id],D=meta.tale.done[id],S=STAGES[T.st];
  if(f<3)return {id,state:'lock',name:'???',sub:_t("조각 {f}/3 · {sub} {name}에서 금빛 흔적을 찾자",{f:f,sub:S.sub,name:S.name})};
  const base=_t("{name} · {lede} · 보상 {n}",{name:CHARS[T.cid].name,lede:T.lede,n:T.skin.n});
  return D?{id,state:'done',name:T.n,sub:_t("{base} · 가장 빠른 완주 {p} ({n}번)",{base:base,p:fmtT(D.best),n:D.n})}:{id,state:'open',name:T.n,sub:base};});}
function skinChoices(cid){const l=[{id:null,n:_t("기본")}];for(const id of TALE_IDS){const T=TALES[id];if(T.cid===cid&&meta.tale.done[id])l.push({id:T.skin.id,n:T.skin.n,A:T.skin.A});}return l;}
function setSkin(cid,k){if(!skinChoices(cid).some(c=>c.id===k))return;meta.tale.skin[cid]=k;saveMeta();}
function renderTalePrep(){const tale=prep.mode==='tale';
 for(const id of ['#panDiff','#panCurse','#panKs','#panPae'])$(id).hidden=tale;$('#panTale').hidden=!tale;
 const cards=taleCards(),openN=cards.filter(c=>c.state!=='lock').length;
 if(prep.tale&&!cards.some(c=>c.id===prep.tale&&c.state!=='lock'))prep.tale=null;
 if(tale&&!prep.tale&&openN)prep.tale=cards.find(c=>c.state!=='lock').id;
 if(tale){const box=$('#taleList');box.innerHTML='';
  $('#taleHint').textContent=openN?_t("설화를 하나 고르세요. 퇴마사와 시작 힘은 설화마다 정해져 있습니다."):_t("아직 열린 설화가 없습니다. 출정 중 관련 막에 나타나는 금빛 흔적을 조사해 설화 조각 3개를 모으면 열립니다.");
  for(const c of cards){const bt=document.createElement('button');bt.disabled=c.state==='lock';bt.setAttribute('aria-pressed',prep.tale===c.id);bt.id='tale-'+c.id;
   bt.innerHTML=`<b>${c.name}${c.state==='done'?_t(" · 완주"):''}</b><span>${c.sub}</span>`;bt.onclick=()=>{prep.tale=c.id;renderPrep();};box.appendChild(bt);}}
 const sk=skinChoices(selChar);$('#panSkin').hidden=tale||sk.length<2;
 if(!tale&&sk.length>=2){const cur=meta.tale.skin[selChar]||null,cc=$('#skinChips');cc.innerHTML='';
  for(const c of sk){const bt=document.createElement('button');bt.textContent=c.n;bt.setAttribute('aria-pressed',cur===c.id);bt.onclick=()=>{setSkin(selChar,c.id);renderPrep();};cc.appendChild(bt);}
  $('#skinDesc').textContent=_t("설화 출정에서 얻은 옷 빛깔. 모든 전직 차림의 옷 색이 바뀐다. 지금: {n}",{n:(sk.find(c=>c.id===cur)||sk[0]).n});}
 const go=$('#goBtn');go.textContent=tale?_t("설화 출정"):_t("출정");go.disabled=tale&&!prep.tale;
 $('#prepTitle').textContent=tale?_t("설화 출정 준비"):_t("{name} · 출정 준비",{name:CHARS[selChar].name});}
function renderPrep(){diffChips($('#diffChips'),$('#diffDesc'),renderPrep);
 {const mc=$('#modeChips');mc.innerHTML='';for(const k in MODES){const bt=document.createElement('button');bt.textContent=MODES[k].n;bt.setAttribute('aria-pressed',(prep.mode||'normal')===k);bt.onclick=()=>{prep.mode=k;meta.mode=k;saveMeta();renderPrep();};mc.appendChild(bt);}$('#modeDesc').textContent=MODES[prep.mode||'normal'].d;}
 const cc=$('#curseChips');cc.innerHTML='';
 for(let i=0;i<=10;i++){const bt=document.createElement('button');bt.textContent=i;bt.disabled=i>meta.curseMax;bt.setAttribute('aria-pressed',prep.curse===i);bt.onclick=()=>{prep.curse=i;renderPrep();};cc.appendChild(bt);}
 $('#curseDesc').textContent=prep.curse?_t("액운 {curse}: {p}. 출정 뒤 엽전 +{p2}%.",{curse:prep.curse,p:CURSES.slice(1,prep.curse+1).join(' · '),p2:prep.curse*15}):(meta.curseMax?_t("액운이 없는 평범한 밤. 높은 단계일수록 어렵고 엽전을 더 받는다."):_t("제10막을 완주하면 액운 단계가 열린다. 액운이 높을수록 어렵고 엽전을 더 받는다."));
 {const kc=$('#ksChips');kc.innerHTML='';const own=ksOwned();if(meta.hub.ks&&!own.includes(meta.hub.ks))meta.hub.ks=null;
  for(const id of [null,...own]){const bt=document.createElement('button');bt.id='ks-'+(id||'none');bt.textContent=id?KS[id].n:_t("없음");bt.setAttribute('aria-pressed',meta.hub.ks===id);bt.onclick=()=>{meta.hub.ks=id;saveMeta();renderPrep();};kc.appendChild(bt);}
  $('#ksDesc').textContent=meta.hub.ks?_t("{n}의 정표 · {d}",{n:NPCS[KS[meta.hub.ks].npc].n,d:KS[meta.hub.ks].d}):own.length?_t("정표를 하나 차고 나가면 이번 출정 내내 효과가 이어진다. 주막에서 바꿀 수 있다."):_t("퇴마사 본부의 식구에게 막걸리를 건네면 정표를 받는다.");}
 const pl=$('#paeList');pl.innerHTML='';
 const none=document.createElement('button');none.innerHTML=_t("<b>패 없음</b><span>규칙을 바꾸지 않는다.</span>");none.setAttribute('aria-pressed',!prep.card);none.onclick=()=>{prep.card=null;renderPrep();};pl.appendChild(none);
 for(const id in CARDS){const ok=unlocked('card:'+id),c=CARDS[id];const bt=document.createElement('button');bt.disabled=!ok;bt.setAttribute('aria-pressed',prep.card===id);
  bt.innerHTML=`<b>${ok?c.n:'???'}</b><span>${ok?c.d:_t("과업으로 해금")}</span>`;bt.onclick=()=>{prep.card=id;renderPrep();};pl.appendChild(bt);}
 renderTalePrep();}
let codexTab='task';
let codexFrom='title';
function openCodex(from){codexFrom=from||'title';codexTab='task';renderCodex();show('codex');}
function renderCodex(){$('#tabTask').setAttribute('aria-selected',codexTab==='task');$('#tabDogam').setAttribute('aria-selected',codexTab==='dogam');$('#tabAnom').setAttribute('aria-selected',codexTab==='anom');$('#tabTale').setAttribute('aria-selected',codexTab==='tale');const body=$('#codexBody');
 if(codexTab==='tale'){const f=TALE_IDS.reduce((a,id)=>a+meta.tale.frag[id],0);$('#codexSum').textContent=_t("설화 조각 {f} / {p} · 끝맺은 설화 {length} / {length2}",{f:f,p:TALE_IDS.length*3,length:TALE_IDS.filter(id=>meta.tale.done[id]).length,length2:TALE_IDS.length});body.innerHTML=taleCodexHTML();return;}
 if(codexTab==='anom'){const n=anomFound();$('#codexSum').textContent=_t("조사한 괴이 {n} / {length}",{n:n,length:ANOM.length});
  body.innerHTML=_t("<div class=\"help\"><div class=\"hcard\"><h3>괴이</h3><p>막마다 한 번, 평소와 다르게 구는 물건이 나타난다. 화면 가장자리 보라색 화살표를 따라가 곁에 2.5초 머물면 조사한다. 처음 조사한 괴이는 여기에 기록되고, 모은 수에 따라 퇴마사들의 이야기 조각이 열린다.</p>{p}</div>",{p:ANOM.map(a=>{const c=(meta.anom||{})[a.id];return `<div class="hrow"><span class="ic"><span class="seal" style="width:32px;height:32px;font-size:16px;background:${c?'#3a1a4a':'#2a2228'}">${c?a.g:'?'}</span></span><div><p><b>${c?a.n:'???'}</b>${c?_t(" · 조사 {c}번",{c:c}):''}</p><p>${c?a.d:_t("아직 만나지 못했다.")}</p></div></div>`;}).join('')})
   +Object.keys(STORY).map(cid=>_t("<div class=\"hcard\"><h3>{name}의 이야기</h3><ol>{p}</ol></div>",{name:CHARS[cid].name,p:STORY[cid].map((t,i)=>`<li>${n>=STORY_AT[i]?t:_t("<small>괴이 {p}종을 조사하면 열린다.</small>",{p:STORY_AT[i]})}</li>`).join('')})).join('')+'</div>';return;}
 if(codexTab==='task'){$('#codexSum').textContent=_t("이룬 과업 {length} / {length2}",{length:meta.done.length,length2:TASKS.length});
  body.innerHTML=`<div class="tasklist">${TASKS.map(t=>{const d=meta.done.includes(t.id),v=Math.min(V(t.key),t.need);return `<div class="${d?'done':''}"><img class="bd" src="${taskBadge(t)}" alt="${d?_t("달성"):_t("미달성")}"><p style="margin:0"><b>${t.n}</b><span>${t.d}</span> <span class="pg">${d?'':`${v}/${t.need}`}</span></p><em>${t.rwText}</em></div>`;}).join('')}</div>`;}
 else{const seen=Object.keys(meta.seen).length;$('#codexSum').textContent=_t("만난 요괴 {seen} / {length}",{seen:seen,length:DOGAM_IDS.length});
  const cat={n:_t("일반"),e:_t("엘리트"),m:_t("중간 보스"),b:_t("막 보스")};
  body.innerHTML=_t("<div class=\"dogam\">{p}</div><p class=\"credit\">요괴 이름은 고성배 『한국 요괴 도감』(위즈덤하우스, 2019) 수록 요괴를 따랐고, 게임 속 행동은 놀이에 맞게 지어냈습니다.</p>",{p:STAGES.map((s,i)=>`<h3>${s.sub} ${s.name}</h3><div class="dgrid">${Object.keys(EN).filter(id=>EN[id].st===i+1).map(id=>{const e=EN[id],m=meta.seen[id];return `<div class="${m?'':'unk'}"><img src="${big(ESPR[id].n,3)}" alt=""><p style="margin:0;min-width:0"><b>${m?e.n:'???'}</b><span>${cat[e.c]}${m?_t(" · 퇴치 {k}",{k:m.k}):''}</span><span>${m?e.d:_t("아직 만나지 못했다.")}</span></p></div>`;}).join('')}</div>`).join('')});}}
function renderShop(){$('#shopCoins').textContent=_t("보유 엽전 {coins}닢",{coins:meta.coins});const box=$('#shopList');box.innerHTML='';
 for(const u of UPG){const l=meta.up[u.id]||0,mx=l>=u.max,c=u.cost(l),B=!!meta.upB[u.id],nm=B?u.b.name:u.name,ds=B?u.b.desc:u.desc;const d=document.createElement('div');d.className='it';
  d.innerHTML=_t("<div class=\"cm\"><b>{nm}</b> <span class=\"pips\">{p}{p2}</span><p>{ds} (단계마다)</p><div class=\"upg2\"><button id=\"upa-{id}\" aria-pressed=\"{p3}\">갑 · {name}</button><button id=\"upb-{id2}\" aria-pressed=\"{B}\">을 · {name2}</button></div></div><button id=\"buy-{id3}\" {p4}>{p5}</button>",{nm:nm,p:'●'.repeat(l),p2:'○'.repeat(u.max-l),ds:ds,id:u.id,p3:!B,name:u.name,id2:u.id,B:B,name2:u.b.name,id3:u.id,p4:mx||meta.coins<c?'disabled':'',p5:mx?_t("완료"):c+_t("닢")});
  d.querySelector('#upa-'+u.id).onclick=()=>{meta.upB[u.id]=false;saveMeta();renderShop();snd(600,0.08,'triangle');};
  d.querySelector('#upb-'+u.id).onclick=()=>{meta.upB[u.id]=true;saveMeta();renderShop();snd(700,0.08,'triangle');};
  d.querySelector('#buy-'+u.id).onclick=()=>{if(meta.coins<c||mx)return;meta.coins-=c;meta.up[u.id]=l+1;saveMeta();renderShop();snd(1000,0.1,'triangle');};box.appendChild(d);}}
function openSettings(from){prevScreen=from;diagRender();const s=meta.set;$('#setVol').value=s.vol;$('#setShake').checked=s.shake;$('#setNums').checked=s.nums;$('#setFlash').checked=s.flash;$('#setFxA').value=String(s.fxA);$('#setScale').value=s.scale;$('#setEnt').value=String(entOff?1:s.ent);$('#setEntNote').textContent=entOff?_t("화면이 느려져 지금은 기본 크기로 그리고 있습니다. 2배를 다시 고르면 돌아갑니다."):_t("보이는 넓이는 그대로 두고 그림만 키웁니다. 맞는 범위는 바뀌지 않습니다. 성능 모드가 자동이면 느려질 때 저절로 기본으로 돌아갑니다.");$('#setJoy').checked=s.joy;$('#setPerf').value=s.perf;$('#setFps').checked=s.fps;perfNote();show('settings');}
function perfNote(){const n=$('#perfNote');if(n)n.textContent=meta.set.perf==='auto'?(autoLow?_t("자동: 지금은 절약 모드로 돌아가는 중입니다."):_t("자동: 지금은 고화질로 돌아가는 중입니다. 3초 넘게 느려지면 절약으로 바뀝니다.")):'';}
function bindSettings(){const s=meta.set,save=()=>{saveMeta();};$('#diagCopy').onclick=diagCopy;$('#diagClear').onclick=()=>{diagClear();diagRender(_t("지웠습니다"));};
 $('#setVol').oninput=e=>{s.vol=+e.target.value;save();};$('#setVol').onchange=()=>{initAudio();snd(660,0.1,'triangle');};
 $('#setShake').onchange=e=>{s.shake=e.target.checked;save();};$('#setNums').onchange=e=>{s.nums=e.target.checked;save();};
 $('#setFlash').onchange=e=>{s.flash=e.target.checked;save();};$('#setFxA').onchange=e=>{const v=+e.target.value;s.fxA=v===0.7||v===0.4?v:1;save();};$('#setScale').onchange=e=>{s.scale=e.target.value;save();resize();};$('#setEnt').onchange=e=>{const v=+e.target.value;s.ent=v===2?2:1;entOff=false;save();resize();};$('#setJoy').onchange=e=>{s.joy=e.target.checked;save();};
 $('#setPerf').onchange=e=>{s.perf=e.target.value;autoLow=false;save();applyPerf();resize();perfNote();};$('#setFps').onchange=e=>{s.fps=e.target.checked;save();};}
const HELP_TABS=[['basic','처음이라면'],['class','직업과 전직'],['pet','펫'],['weapon','무기와 진화'],['item','보패와 축복'],['rule','난이도·점괘·액운'],['foe','요괴와 보스']];
let helpTab='basic',helpFrom='title';
function openHelp(from){helpFrom=from;renderHelp();show('help');}
const lockText=k=>{const t=TASKS.find(t=>t.rw.unlock===k);return t?_t("과업 「{n}」({d})로 해금",{n:t.n,d:t.d}):'';};
const hcard=(h,body)=>`<div class="hcard"><h3>${h}</h3>${body}</div>`;
/* 도움말 그림(v17.3): 게임이 쓰는 도트를 정수 배율로 키워 그림으로 쓴다. 장판·경고·성황당은 실제 그리기 함수로 작은 장면을 그려 잘라 낸다 */
const HELPIMG={};
function hpix(c,box=32,sq=true){const w=c.width,h=c.height,k=Math.max(1,Math.floor(box/Math.max(w,h)));const o=document.createElement('canvas');o.width=sq?box:w*k;o.height=sq?box:h*k;
 const x=o.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(c,sq?Math.floor((box-w*k)/2):0,sq?Math.floor((box-h*k)/2):0,w*k,h*k);return o.toDataURL();}
function hsnap(w,h,fn){const G0=G,rx=RCX,ry=RCY;try{if(!G)G={time:0.45,P:{x:0,y:0}};RCX=0;RCY=0;EMQ.length=0;BUBQ.length=0;b.save();b.setTransform(1,0,0,1,0,0);b.globalAlpha=1;b.imageSmoothingEnabled=false;
  b.fillStyle='#2a2620';b.fillRect(0,0,w,h);fn();b.restore();
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(buf,0,0,w,h,0,0,w,h);
  for(let i=0;i<EMQ.length;i+=4){const inf=embInfo(EMQ[i]);if(!inf)continue;const ex=Math.round(EMQ[i+1]-6),ey=Math.round(EMQ[i+2]-6);x.fillStyle='#0a080c';x.fillRect(ex,ey,12,12);x.fillStyle=inf.bd;x.fillRect(ex+1,ey+1,10,10);x.fillStyle=inf.bg;x.fillRect(ex+2,ey+2,8,8);
   if(inf.ic)x.drawImage(inf.ic,ex+2,ey+2,8,8);else if(inf.bang){x.fillStyle='#fff6d0';x.fillRect(ex+5,ey+3,2,4);x.fillRect(ex+5,ey+8,2,1);}}
  return c;}catch(e){return null;}finally{G=G0;RCX=rx;RCY=ry;EMQ.length=0;BUBQ.length=0;}}
const inl=src=>src?`<img class="inl" src="${src}" alt="">`:'';
function hrowI(img,t,wide){return `<div class="hrow${wide?' wide':''}"><span class="ic">${img?`<img src="${img}" alt="">`:''}</span><div><p>${t}</p></div></div>`;}
function hseal(g,bg){const c=document.createElement('canvas');c.width=c.height=32;const x=c.getContext('2d');x.fillStyle='#0a080c';x.fillRect(0,0,32,32);x.fillStyle='#e0b048';x.fillRect(2,2,28,28);x.fillStyle=bg;x.fillRect(4,4,24,24);
 x.font='bold 18px "Song Myung", serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#fff6d0';x.fillText(g,16,17);return c.toDataURL();}
function helpImgs(){if(HELPIMG.ok)return HELPIMG;const H=HELPIMG,sp=s=>s&&s.n?hpix(s.n):'',ic=k=>ICS[k]?hpix(ICS[k]):'';
 H.hero=sp(charSpr(CHARS.seonbi.look));H.tier=sp(charSpr(CHARS.seonbi.branches[0].tiers[0].look));H.mudang=sp(charSpr(CHARS.mudang.look));H.jw=sp(charSpr(JW_LOOK));
 H.boss=sp(ESPR.dokchief);H.tiger=sp(PSPR.tiger);H.bear=sp(PSPR.bear);H.falcon=sp(PSPR.falcon);
 for(const k of ['chest','pot','tteok','pouch','coin','gukbap','makgeolli','santong','bottari','meok','seochaek','deungpae'])H[k]=ic(k);
 H.evo=ICON.meok||H.meok;H.ban=hseal('封','#5a2a50');H.btns=hseal('停','#3a3a48');H.status=hseal('狀','#2f4a7a');H.book=hseal('錄','#7a2018');H.hub=hseal('府','#2f6b5a');
 const el=STAGES[0].early.find(id=>ESPR[id])||'dokkaebi';
 const sn=(w,h,fn,box)=>{const c=hsnap(w,h,fn);return c?hpix(c,box||Math.max(w,h)*2,false):'';};
 H.elite=sn(24,24,()=>{const s=ESPR[el];drawSpr(s,12,19,false,false,1.6);b.fillStyle='#000';b.fillRect(4,20,16,2);b.fillStyle='#e0b048';b.fillRect(4,20,12,2);},32);
 H.gem=sn(12,12,()=>{const c='#7fb0ff';b.fillStyle=c;b.fillRect(5,6,3,1);b.fillRect(6,5,1,3);b.fillStyle='#6fd3c1';b.fillRect(2,3,3,1);b.fillRect(3,2,1,3);b.fillStyle='#ff7a8a';b.fillRect(8,9,3,1);b.fillRect(9,8,1,3);},32);
 H.shrine=sn(60,60,()=>drawShrine({x:34,y:54,prog:0,need:1}),64);   // v17.5 서낭나무·할머니가 들어가게 넓힘
 H.ob=sn(24,24,()=>drawOb(STAGES[0].ob,12,18,7),32);
 H.zone=sn(36,24,()=>{pxArea(18,13,14,'#8fd3ff',1,0.3,false);const ry=14*0.75;emblem('bujeok',18,13-ry,1);},72);
 H.warn=sn(36,24,()=>drawWarn({x:18,y:12,r:14,t:0.5,max:1.2,col:'#ff5a3a',src:'boss'}),72);
 H.line=sn(36,24,()=>drawWarn({kind:'line',x:2,y:12,a:0,len:32,w:10,t:0.6,max:1.2,col:'#ff5a3a',src:'boss'}),72);
 H.tele=sn(24,24,()=>{b.fillStyle='rgba(255,60,40,0.35)';b.beginPath();b.ellipse(12,19,9,4.5,0,0,TAU);b.fill();drawSpr(ESPR.dokchief,12,19,false,false,1.4);},32);
 H.ok=true;return H;}
function renderHelp(){const tb=$('#helpTabs');tb.innerHTML='';
 for(const [k,n] of HELP_TABS){const bt=document.createElement('button');bt.setAttribute('role','tab');bt.setAttribute('aria-selected',helpTab===k);bt.textContent=n;bt.onclick=()=>{helpTab=k;renderHelp();};tb.appendChild(bt);}
 const ul=a=>`<ul>${a.map(x=>`<li>${x}</li>`).join('')}</ul>`;let h='';
 if(helpTab==='basic'){const I=helpImgs(),r=(img,t)=>hrowI(img,t),rw=(img,t)=>hrowI(img,t,true);
  h+=hcard(_t("장판과 경고 표식 읽기"),rw(I.zone,_t("내 장판은 점무늬로 채운 도트 원에 <b>점선 테두리가 돌고</b>, 위쪽 테두리에 <b>그 장판을 만든 무기·기술 아이콘</b>이 붙는다. 아이콘은 왼쪽 위 슬롯 아이콘과 같다. 펫이 깐 장판에는 펫 표식(虎·熊·鷹)이 붙는다."))
   +rw(I.warn,_t("<b>붉은 점선 원과 가운데 ! 표식</b>은 보스나 요괴의 공격 예고다. 안쪽 점무늬가 바깥 테두리까지 차오르면 터지고, 직전에는 테두리가 깜빡인다."))
   +rw(I.line,_t("띠 모양 경고는 돌진·광선 경로다. 화살표(>)가 가리키는 방향으로 온다.")))
   +hcard(_t("조작"),r(I.hero,_t("이동: <b>WASD</b> 또는 방향키. 휴대폰은 화면 아무 곳이나 누른 채 끌면 그쪽으로 걷는다. 공격은 모두 자동이다. 움직이며 피하는 데만 집중하면 된다."))
   +r(I.btns,_t("일시정지: <b>ESC</b> 또는 <b>P</b>, 휴대폰은 오른쪽 아래 <b>정지</b> 버튼. 오른쪽 아래 버튼은 왼쪽부터 <b>신내림</b>·<b>소리</b>·<b>상태</b>·<b>정지</b>."))
   +r(I.status,_t("<b>캐릭터 상태창</b>: <b>C</b>(또는 Tab) 키나 오른쪽 아래 <b>상태</b> 버튼. 지금 쓰는 무기·직업 기술·보패·축복·정표와 능력치, 무기마다 이번 출정에서 준 피해와 비중을 본다. 열어 둔 동안 게임이 멈춘다. 일시정지 화면에서도 열 수 있다."))
   +r(I.santong,_t("레벨업 화면: 숫자 키로 고르기, <b>R</b> 산통 흔들기, <b>X</b> 물리기, <b>B</b> 봉인.")));
  h+=hcard(_t("한 판의 흐름"),r(I.boss,_t("막은 모두 10개. 막마다 {p}분을 버틴다. {MID_T}초가 되면 <b>중간 보스</b>가 나온다. 중간 보스를 토벌해야 <b>막 보스</b>가 나타난다. 시간이 다 되어도 중간 보스가 살아 있으면 막 보스는 기다린다.",{p:STAGE_T/60,MID_T:MID_T}))
   +r(I.chest,_t("막 보스를 쓰러뜨리면 보물상자를 열고 <b>주막</b>에 들른 뒤 다음 막으로 간다."))
   +r(I.gem,_t("요괴가 떨군 구슬로 레벨이 오른다. 레벨이 오를 때마다 무기나 보패 하나를 고른다."))
   +r(I.tier,_t("레벨 10·20·30·40·50에 <b>전직</b>한다.")));
  h+=hcard(_t("막 안에서 만나는 것"),r(I.elite,_t("<b>엘리트</b>: 금빛 체력 막대가 달린 큰 요괴. 쓰러뜨리면 보물상자를 떨군다."))
   +r(I.chest,_t("<b>보물상자</b>: 진화 조건을 갖춘 무기가 있으면 진화시키고, 없으면 가진 것 하나를 강화한다."))
   +r(I.shrine,_t("<b>성황당</b>: 막마다 두 번 나타난다. 화면 가장자리의 금빛 화살표를 따라가 그 안에 3.5초 머물면 신령의 축복을 받는다."))
   +r(I.pot,_t("<b>옹기</b>: 아무 공격에나 깨진다. 떡, 엽전, 복주머니, 큰 구슬이 나온다."))
   +r(I.tteok,_t("<b>떡</b>은 체력 회복, {p}<b>복주머니</b>는 화면의 구슬을 모두 끌어온다.",{p:inl(I.pouch)}))
   +r(I.tiger,_t("레벨 10 전직 직후 <b>펫</b>({p}범·{p2}반달곰·{p3}해동청)을 고른다. 자세한 것은 「펫」 탭.",{p:inl(I.tiger),p2:inl(I.bear),p3:inl(I.falcon)}))
   +r(I.ob,_t("막마다 장애물(장독, 대숲, 바위, 석등, 장승, 비석 등)이 길을 막는다. 날아다니는 요괴와 보스는 넘어온다.")));
  h+=hcard(_t("도사 전우치"),r(I.jw,_t("체력이 <b>50%</b> 아래로 떨어지면 전우치가 구름을 타고 나타나 5초 동안 부적과 벼락으로 요괴를 친다. 보통 난이도 기준 {p}초에 한 번.",{p:45}))
   +r(I.jw,_t("체력이 <b>20%</b> 아래로 떨어지면 「금강불괴」 도술로 체력을 40% 채워 주고 10초 동안 방어 +5, 받는 피해 −30%를 걸어 준 뒤 5초 동안 함께 싸운다. 보통 난이도 기준 90초에 한 번."))
   +_t("<p class=\"hint\">쉬움은 더 자주, 어려움은 더 드물게 온다. 화면 오른쪽 위에 다음 출현까지 남은 시간이 보인다.</p>"));
  h+=hcard(_t("주막과 엽전"),r(I.gukbap,_t("막 사이 주막에서 이번 출정의 엽전으로 국밥(회복), {p}막걸리(다음 막 공격력 +20%), {p2}산통·봉인 부적·물리기 패, {p3}보부상 보따리(무작위 강화), 정화수(신령 축복)를 산다. 같은 물건은 살수록 비싸진다.",{p:inl(I.makgeolli),p2:inl(I.santong),p3:inl(I.bottari)}))
   +r(I.coin,_t("출정이 끝나면 남은 엽전과 처치 수, 도달한 막에 따라 <b>엽전</b>을 받는다. 수련 도장에서 영구 강화를 산다."))
   +r(I.book,_t("<b>퇴마록</b>의 과업을 이루면 퇴마사·무기·점괘 패가 해금되고 엽전과 산통 같은 보상이 붙는다. 처음에는 <b>선비</b>만 출정할 수 있고, 의원·장수·기생·무당은 과업으로 하나씩 열린다."))
   +r(I.hub,_t("출정이 끝나면 <b>퇴마사 본부</b>로 돌아온다. 식구와 이야기하고 막걸리를 건네 <b>정표</b>를 받는다. 지난 출정은 <b>기록관</b>에 날짜와 함께 남는다.")));
  h+=hcard(_t("팁"),r(I.evo,_t("진화 조건: 무기 최대 레벨(5) + 짝 보패 보유 + 보물상자. 카드 아래 「진화 짝」을 보고 보패를 같이 모으자. (예: {p}먹탄 + {p2}서책 → {evoName})",{p:inl(I.meok),p2:inl(I.seochaek),evoName:WD.meok.evoName}))
   +r(I.ban,_t("원치 않는 무기나 보패가 계속 나오면 <b>봉인</b>으로 그 판에서 지워 버리자."))
   +r(I.tele,_t("보스 발밑이 붉게 깜빡이면 돌진·순간이동 같은 큰 기술을 준비 중이다. 붉은 장판과 선 예고를 먼저 피하자. 보스 체력 막대의 금색 눈금(60%, 25%)에서 필살기가 나온다. 눈금 직전에 체력을 채워 두자."))
   +r(I.boss,_t("「홀림」에 걸리면 보스 쪽으로 끌려간다. 반대 방향으로 계속 걸으면 버틸 수 있다."))
   +r(I.deungpae,_t("장수의 등패는 요괴 탄을 막는다. 탄막이 많은 뒤쪽 막에서 특히 쓸모 있다."))
   +r(I.mudang,_t("무당은 레벨업 선택지가 4개라 원하는 조합을 맞추기 쉽다. 처음이라면 무당이나 장수가 편하다."))); }
 if(helpTab==='class'){
  h+=hcard(_t("5차 전직 이후의 성장"),_t("<p>5차 전직(Lv 50)을 마친 뒤에도 레벨업마다 성장이 이어진다.</p>")
   +_t("<div class=\"hrow\"><span class=\"ic\"><span class=\"seal\" style=\"width:32px;height:32px;font-size:16px;background:#7a2018\">覺</span></span><div><p><b>오의 각성</b> · Lv {p}</p><p>직업 기술 하나를 골라 각성한다. 한 기술은 한 번만 각성한다. {p2} 늘 켜져 있는 기술(결계·소환·궤도형)은 극의만 고를 수 있다.</p></div></div>",{p:AWK_LV.join('·'),p2:Object.values(AWK).map(a=>`<b>${a.n}</b> ${a.d}`).join(' / ')})
   +_t("<div class=\"hrow\"><span class=\"ic\"><span class=\"seal\" style=\"width:32px;height:32px;font-size:16px;background:#7a2018\">極</span></span><div><p><b>궁극 오의</b> · Lv {ULT_LV} (각성 4번 이상)</p><p>{p} — 직업마다 하나. 24초마다 저절로 펼쳐진다.</p></div></div>",{ULT_LV:ULT_LV,p:Object.values(ULT).map(u=>`<b>${u.n}</b>`).join(' · ')})
   +_t("<div class=\"hrow\"><span class=\"ic\"><span class=\"seal\" style=\"width:32px;height:32px;font-size:16px;background:#9a6a10\">破</span></span><div><p><b>한계 돌파</b> · Lv 50부터, 또는 더 올릴 것이 없을 때</p><p>만렙 무기·기술의 카드가 「한계 돌파」로 나온다. 돌파마다 피해 +5%, 5번마다 범위 +10%. 끝없이 쌓인다. 보물 상자도 올릴 것이 없으면 돌파를 준다.</p></div></div>"));
  for(const id in CHARS){const C=CHARS[id],ok=unlocked('char:'+id);
   const jw=Object.keys(WD).filter(k=>WD[k].job===id&&WD[k].type==='w'&&!WD[k].fuse).map(k=>WD[k].name).join(', '),jp=Object.keys(PD).filter(k=>jobHas(PD[k],id)).map(k=>PD[k].name).join(', ');
   let body=_t("<p>{desc}</p><p><b>특성</b> {trait} · <b>시작 무기</b> {name}</p><p><b>전용 무기</b> {jw} · <b>전용 보패</b> {jp}</p>{p}",{desc:C.desc,trait:C.trait,name:WD[C.start].name,jw:jw,jp:jp,p:ok?'':_t("<p><span class=\"tag\">잠김</span> {p}</p>",{p:charLock(id)})});
   for(const br of C.branches){body+=`<h4>${br.name}</h4><div class="looks"><figure><img src="${big(charSpr(C.look).n,3)}" alt=""><figcaption>${C.name}</figcaption></figure>${br.tiers.map(t=>`<figure><img src="${big(charSpr(t.look).n,3)}" alt=""><figcaption>${t.name}</figcaption></figure>`).join('')}</div>`;
    body+=`<ol>${br.tiers.map((t,i)=>_t("<li><b>Lv {p} {name}</b> · 기술 「{name2}」 {p2} <small>보너스: {bonus}</small></li>",{p:(i+1)*10,name:t.name,name2:WD[t.skill].name,p2:WD[t.skill].desc[0],bonus:t.bonus})).join('')}</ol>`;}
   h+=hcard(`<span class="seal" style="width:28px;height:28px;font-size:18px">${C.seal}</span>${C.name}`,body);}
  h+=hcard(_t("전직 규칙"),ul([_t("레벨 10에 두 갈래 중 하나를 고른다. 이후 레벨 20·30·40·50에는 같은 갈래의 다음 직업으로 오른다."),_t("전직할 때마다 그 직업의 고유 기술을 얻고, 차림(쓰개·옷·손에 든 것)이 바뀐다. 5차 전직에는 후광이 생긴다."),_t("2차부터는 공격력·체력·재사용 대기·범위·치명타 등 수련 보너스 셋 가운데 하나를 골라 함께 받는다."),_t("전직 기술은 레벨업에서 다른 카드보다 자주 나오며 5레벨까지 오른다.")])); }
 if(helpTab==='pet'){
  h+=hcard(_t("펫 규칙"),ul([_t("레벨 10에서 1차 전직을 고르면 바로 펫을 고른다. 한 번 고르면 그 출정 동안 바뀌지 않는다."),_t("펫은 죽지 않고 요괴에게 맞지도 않는다. 곁을 따라다니며 기술을 스스로 쓴다."),_t("펫 레벨은 레벨 10에서 1로 시작해 네 레벨마다 하나씩 오른다(최대 10). 오를 때마다 기술 피해 +30%, 범위 +7%."),_t("기술은 셋이다. <b>일반 공격</b> {a}초 · <b>홀딩 기술</b> {h}초 · <b>궁극기</b> {u}초마다 쓴다.",{a:PET_CD.a,h:PET_CD.h,u:PET_CD.u}),_t("홀딩 기술은 펫 레벨 2, 궁극기는 4에 익힌다. 레벨 5·6·8에는 세 기술이 차례로 강해진 기술로 바뀐다."),_t("펫 기술은 공격력 보정을 받고, 막이 깊어질수록 피해가 함께 커진다.")]));
  for(const id in PETS){const p=PETS[id];h+=hcard(`<img src="${big(PSPR[id].n,3)}" alt="" style="image-rendering:pixelated">${p.n} <small>${p.kind}</small>`,`<p>${p.d}</p>`+[['a',_t("일반 공격")],['h',_t("홀딩 기술")],['u',_t("궁극기")]].map(([k,lab])=>_t("<h4>{lab} · {p}초</h4><ul>{p2}</ul>",{lab:lab,p:PET_CD[k],p2:p.sk[k].map(s=>_t("<li><b>펫 Lv {lv} 「{n}」</b> {d}</li>",{lv:s.lv,n:s.n,d:s.d})).join('')})).join(''));} }
 if(helpTab==='weapon'){
  const row=id=>{const d=WD[id],lt=d.lock?lockText('w:'+id):'';return _t("<div class=\"hrow\"><span class=\"ic\"><img src=\"{p}\" alt=\"\"></span><div><p><b>{name}</b>{p2} · {p3}</p><p><small>진화: {name2} → <b>{evoName}</b>. {evoDesc}</small></p>{p4}</div></div>",{p:ICON[id],name:d.name,p2:lt?_t(" <span class=\"tag\">잠김</span>"):'',p3:d.desc[0],name2:PD[d.evo].name,evoName:d.evoName,evoDesc:d.evoDesc,p4:lt?`<p><small>${lt}</small></p>`:''});};
  h+=hcard(_t("진화하는 법"),ul([_t("무기를 최대 레벨(5)까지 올린다."),_t("그 무기의 <b>짝 보패</b>를 하나 이상 갖는다."),_t("엘리트·중간 보스·막 보스가 떨군 <b>보물상자</b>를 열면 진화한다. 조건을 갖춘 무기가 여럿이면 한 번에 하나씩 진화한다."),_t("무기는 6개, 보패는 6개까지 가질 수 있다. 전직 기술은 따로 세며 칸을 차지하지 않는다.")]));
  h+=hcard(_t("공용 무기"),Object.keys(WD).filter(k=>WD[k].type==='w'&&!WD[k].job&&!WD[k].fuse).map(row).join(''));
  for(const id in CHARS)h+=hcard(_t("{name} 전용 무기",{name:CHARS[id].name}),Object.keys(WD).filter(k=>WD[k].type==='w'&&WD[k].job===id&&!WD[k].fuse).map(row).join(''));
  h+=hcard(_t("합공 (무기 합체)"),_t("<p>짝이 맞는 두 무기를 <b>모두 진화</b>시킨 채 보물 상자를 열면 두 무기가 하나로 합쳐진다. 무기 칸이 하나 비고, 두 무기의 공격은 피해 +20%로 그대로 나가며, 합공 무기만의 기술이 더해진다. 인장 칸은 3개.</p>")+FUSE.map(f=>`<div class="hrow"><span class="ic"><img src="${ICON[f.id]}" alt=""></span><div><p><b>${f.n}</b> · ${WD[f.a].evoName} + ${WD[f.b].evoName}${f.job?` <small>(${CHARS[f.job].name})</small>`:_t(" <small>(공용)</small>")}</p><p>${f.d}</p></div></div>`).join(''));
  h+=hcard(_t("인장 각인"),_t("<p>보물 상자를 열면 40% 확률로, 또는 주막의 「인장 장인」에게서 인장을 얻는다. 인장 셋 가운데 하나를 골라 무기에 새기면 그 무기만 강해진다. 칸은 일반 무기 1개, 진화 무기 2개, 합공 무기 4개(합칠 때 두 무기의 인장을 모두 옮긴다). 그 무기가 쓰지 않는 능력을 올리는 인장(예: 칼날 무기에 투사체 속도)은 나오지 않는다. 같은 인장을 겹쳐 새길 수 있다. 새긴 인장은 슬롯 왼쪽 위 점으로 보인다.</p>")+Object.keys(SEALS).map(k=>_t("<div class=\"hrow\"><span class=\"ic\"><span class=\"seal\" style=\"width:32px;height:32px;font-size:16px;background:#7a2018\">{g}</span></span><div><p><b>{n}의 인장</b> · {d}</p></div></div>",{g:SEALS[k].g,n:SEALS[k].n,d:SEALS[k].d})).join('')); }
 if(helpTab==='item'){
  const prow=id=>{const d=PD[id],ev=Object.keys(WD).filter(k=>WD[k].evo===id).map(k=>`${WD[k].name} → ${WD[k].evoName}`).join(', ');return _t("<div class=\"hrow\"><span class=\"ic\"><img src=\"{p}\" alt=\"\"></span><div><p><b>{name}</b> · {desc} <small>(최대 {max}레벨)</small></p>{p2}</div></div>",{p:ICON[id],name:d.name,desc:d.desc,max:d.max,p2:ev?_t("<p><small>진화 짝: {ev}</small></p>",{ev:ev}):''});};
  h+=hcard(_t("공용 보패"),Object.keys(PD).filter(k=>!PD[k].job).map(prow).join(''));
  for(const id in CHARS)h+=hcard(_t("{name} 전용 보패",{name:CHARS[id].name}),Object.keys(PD).filter(k=>jobHas(PD[k],id)).map(prow).join(''));
  h+=hcard(_t("신내림"),_t("<p>요괴를 잡으면 오른쪽 아래 <b>신내림</b> 버튼의 게이지가 찬다 (보통 요괴 0.25, 엘리트 6, 중간 보스 25, 막 보스 40, 맞을 때 2). 가득 차면 <b>Space</b> 또는 버튼을 눌러 신령의 힘을 빌린다. 축복을 가장 많이 받은 신령(같으면 먼저 받은 신령)의 기술이 나간다.</p>")+Object.keys(CALL).map(k=>`<div class="hrow"><span class="ic"><span class="seal" style="width:32px;height:32px;font-size:16px;background:${k==='none'?'#4a3a30':BLESS[k].col}">${CALL[k].g}</span></span><div><p><b>${CALL[k].n}</b>${k==='none'?_t(" (축복이 없을 때)"):' · '+BLESS[k].n} — ${CALL[k].d}</p></div></div>`).join(''));
  h+=hcard(_t("쌍신 축복"),_t("<p>짝이 맞는 두 신령의 축복을 모두 받으면, 다음 축복 고르기에 두 신령이 함께 내리는 쌍신 축복이 섞여 나온다.</p>")+Object.keys(DUO).map(id=>`<div class="hrow"><span class="ic"><span class="seal" style="width:32px;height:32px;font-size:12px;background:#3a1a4a">${duoG(id)}</span></span><div><p><b>${DUO[id].n}</b> · ${BLESS[DUO[id].a].n} + ${BLESS[DUO[id].b].n} — ${DUO[id].d}</p></div></div>`).join(''));
  h+=hcard(_t("신령 축복"),_t("<p>성황당에서 기도하거나 주막에서 정화수를 사면 신령 셋 가운데 하나의 축복을 고른다. 같은 신령은 3단계까지 깊어진다.</p>")+Object.keys(BLESS).map(id=>_t("<div class=\"hrow\"><span class=\"ic\">{p}</span><div><p><b>{n}</b> · {d} <small>(단계마다)</small></p></div></div>",{p:iconHTML(id),n:BLESS[id].n,d:BLESS[id].d})).join('')); }
 if(helpTab==='rule'){
  h+=hcard(_t("명장의 담금질"),_t("<p>갈림길의 <b>대장간(鍛)</b> 길을 고르고 막을 평정하면, 무기 하나를 골라 움직임을 바꾼다. 무기마다 한 번만 담글 수 있고, 담근 무기는 슬롯 오른쪽 위에 글자가 붙는다. 투사체를 쏘는 무기와 장판을 까는 무기는 그에 맞는 담금질이 더 자주 나온다. 합공하면 담금질이 이어진다.</p>")+Object.keys(TEMPER).map(k=>`<div class="hrow"><span class="ic"><span class="seal" style="width:32px;height:32px;font-size:16px;background:#9a4a10">${TEMPER[k].g}</span></span><div><p><b>${TEMPER[k].n}</b> <small>(${TEMPER[k].k==='p'?_t("투사체 무기"):TEMPER[k].k==='z'?_t("장판 무기"):_t("모든 무기")})</small> · ${TEMPER[k].d}</p></div></div>`).join(''));
  h+=hcard(_t("도깨비 샛길"),_t("<p>막마다 절반 확률로, 40~110초 사이 청록색 도깨비불 문이 열린다(청록 화살표). 1.2초 서 있으면 도깨비가 거래를 건다. 들어가면 체력 15%를 내고 그 막이 끝날 때까지 <b>짐</b> 하나를 진다. 막을 평정하면 갈림길 보상보다 먼저 <b>도깨비 보물</b> 셋 가운데 하나를 고른다. 문은 45초 뒤 꺼진다.</p><p><b>짐</b>: {p}</p>",{p:Object.values(DKC).map(c=>`${c.n}(${c.d})`).join(' · ')})+Object.keys(DKB).map(k=>`<div class="hrow"><span class="ic"><span class="seal" style="width:32px;height:32px;font-size:16px;background:#2a6a6a">${DKB[k].g}</span></span><div><p><b>${DKB[k].n}</b> · ${DKB[k].d}</p></div></div>`).join(''));
  h+=hcard(_t("막 의뢰"),_t("<p>막마다 마을에서 의뢰 하나가 들어온다. 오른쪽 위 정보창에 진행이 보이고, 끝내면 곧바로 엽전과 <b>막걸리 한 병</b>을 받는다. 막걸리는 퇴마사 본부 식구에게 건네는 선물이다. 제5막·제10막 보스를 쓰러뜨려도 한 병씩 보내온다.</p><p>{p}</p>",{p:Object.values(QUESTS).map(q=>q.n).join(' · ')}));
  h+=hcard(_t("연격"),_t("<p>요괴를 2.2초 안에 이어서 잡으면 연격이 쌓인다. 끊기면 0부터 다시 센다. 정보창에 10연격부터 보인다.</p><ul>{p}</ul>",{p:CB_TIERS.map((v,i)=>_t("<li><b>{v}연격</b> · 이동 속도 +{p}% · 깨달음(경험치) +{p2}%</li>",{v:v,p:(i+1)*5,p2:(i+1)*10})).join('')}));
  h+=hcard(_t("퇴마사 본부와 정표"),_t("<p>출정이 끝나면 본부로 돌아온다. 식구들은 출정을 거듭할수록, 정이 깊어질수록 새 이야기를 들려준다(이야기 버튼에 ! 표시). 막걸리를 건네면 정이 한 칸(최대 다섯 칸) 깊어지고, 처음 건넬 때 <b>정표</b>를 준다. 출정 준비나 본부에서 정표 하나를 차고 나가며, 주막에서 바꿀 수 있다.</p>")+Object.keys(NPCS).map(id=>_t("<div class=\"hrow\"><span class=\"ic\"><span class=\"seal\" style=\"width:32px;height:32px;font-size:16px;background:{col}\">{g}</span></span><div><p><b>{n}</b> · 정표 「{n2}」 — {d}{p}</p></div></div>",{col:NPCS[id].col,g:NPCS[id].g,n:NPCS[id].n,n2:NPCS[id].ks.n,d:NPCS[id].ks.d,p:NPCS[id].appear?_t(" <small>(도깨비 샛길에 한 번 들어간 뒤 나타난다)</small>"):''})).join(''));
  h+=hcard(_t("수련 도장"),_t("<p>엽전으로 사는 영구 수련. 수련마다 <b>갑</b>·<b>을</b> 두 길이 있고, 쌓은 단계는 그대로 둔 채 언제든 공짜로 바꿀 수 있다.</p>")+UPG.map(u=>_t("<div class=\"hrow\"><span class=\"ic\"><span class=\"seal\" style=\"width:32px;height:32px;font-size:14px;background:#3a5f9e\">修</span></span><div><p><b>갑 {name}</b> {desc} ↔ <b>을 {name2}</b> {desc2} <small>(최대 {max}단계)</small></p></div></div>",{name:u.name,desc:u.desc,name2:u.b.name,desc2:u.b.desc,max:u.max})).join(''));
  h+=hcard(_t("기록관"),_t("<p>출정이 끝날 때마다 퇴마사, 직업, 결과, 버틴 시간, 처치 수, 레벨, 연격, 무기·보패 조합, 주력 무기의 피해 비중을 날짜와 함께 남긴다. 날짜는 간지 해와 열두 시각(자시~해시)으로 적는다.</p><ul><li><b>명예록</b>: 가장 빠른 새벽, 최다 처치, 가장 높은 레벨, 가장 오래 버틴 밤, 가장 긴 연격, 가장 큰 피해, 가장 높은 액운 평정, 가장 먼 끝없는 밤, 가장 빠른 원정.</li><li><b>퇴마사별</b>: 출정·새벽 횟수, 가장 좋았던 판의 조합, 분당 피해가 가장 큰 무기·기술 셋.</li><li><b>출정 일지</b>: 최근 50번의 출정.</li></ul>"));
  h+=hcard(_t("퇴마 원정"),_t("<p>출정 준비에서 「퇴마 원정」을 고르면 보스만 열 번 연달아 상대한다. 막마다 보스 셋이 하·중·상 등급으로 제시되고, 하나를 골라 싸운다. 시작할 때 레벨업 세 번을 받는다.</p>")+GRADES.map(g=>_t("<div class=\"hrow\"><span class=\"ic\"><span class=\"seal\" style=\"width:32px;height:32px;font-size:16px;background:{col}\">{n}</span></span><div><p><b>{n2}급</b> · 체력 ×{hp}{p}{p2} · 넋의 선물 {gifts}개</p></div></div>",{col:g.col,n:g.n,n2:g.n,hp:g.hp,p:g.borrow?_t(" · 다른 보스 기술 {borrow}개를 빌려 씀",{borrow:g.borrow}):'',p2:g.ult?_t(" · 필살기 한 번 더"):'',gifts:g.gifts})).join('')+_t("<p><b>넋의 선물</b>: {p} 가운데 셋이 나오고 하나를 고른다.</p>",{p:Object.values(GIFTS).map(x=>x.n).join(' · ')}));
  h+=hcard(_t("액운 변종"),_t("<p>액운 단계마다 변종 요괴가 나올 확률이 3%씩 오른다(어려움 +5%, 끝없는 밤 바퀴마다 +5%, 최대 45%). 변종은 발밑에 색 고리가 돈다.</p>")+Object.keys(VARIANTS).map(k=>`<div class="hrow"><span class="ic"><span class="seal" style="width:32px;height:32px;font-size:15px;background:#2a2228;color:${VARIANTS[k].col}">${VARIANTS[k].n[0]}</span></span><div><p><b>${VARIANTS[k].n}</b> · ${VARIANTS[k].d}</p></div></div>`).join(''));
  h+=hcard(_t("괴이 조사"),_t("<p>막마다 한 번, 무대의 물건 하나가 이상하게 군다(거꾸로 서거나, 피눈물을 흘리거나, 혼자 돈다). 보라색 화살표를 따라가 곁에 2.5초 머물면 조사해 엽전·신내림·깨달음·인장 가운데 하나를 받는다. 조사한 괴이는 퇴마록의 「괴이록」에 남고, 2·5·8·12종을 모으면 퇴마사마다 이야기 조각이 열린다.</p>"));
  h+=hcard(_t("끝없는 밤"),_t("<p>제10막을 평정하면 출정을 마치거나 <b>끝없는 밤</b>으로 이어 갈 수 있다. 이어 가면 제1막부터 다시 돌며, 바퀴마다 요괴 체력 ×1.9·받는 피해 ×1.3·엽전 +25%가 겹쳐 쌓인다. 쓰러져도 평정은 이미 인정되고, 바퀴마다 엽전 150닢이 더해진다. 결과 화면과 퇴마록에 가장 멀리 간 바퀴가 남는다.</p>"));
  h+=hcard(_t("스치기"),_t("<p>요괴 탄을 맞지 않고 아슬아슬하게 스쳐 지나가면 「스침」이 뜬다. 스칠 때마다 신내림 게이지가 1.2 차고, 2초 동안 모든 무기의 재사용 대기가 15% 짧아진다. 탄막 사이를 누비며 다닐수록 강해진다.</p>"));
  h+=hcard(_t("갈림길"),_t("<p>주막을 나서면 다음 막으로 가는 길 셋이 나온다. 길마다 끝에 기다리는 보상이 미리 보이고, 보상은 그 막을 평정한 뒤 보물 상자보다 먼저 받는다. <b>험로</b>는 요괴 체력 +30%·수 +15%지만 보상이 두 배다. 마지막 막으로 가는 길에는 갈림길이 없다.</p>")+Object.keys(PATHS).map(id=>`<div class="hrow"><span class="ic"><span class="seal" style="width:32px;height:32px;font-size:16px;background:#2f6b5a">${PATHS[id].g}</span></span><div><p><b>${PATHS[id].n}</b> — ${PATHS[id].d}</p></div></div>`).join(''));
  h+=hcard(_t("하늘 신령의 강림"),_t("<p>환웅을 따라 내려온 풍백·우사·운사 가운데 한 분이 막마다 한 번, 30~95초 사이 아무 때나 구름을 타고 내려온다. 셋 가운데 한 가지 가호를 무작위로 내리며 {SKY_T}초 동안 이어진다. 남은 시간은 오른쪽 위 정보창에 나온다.</p>",{SKY_T:SKY_T})+Object.keys(SKY).map(k=>`<div class="hrow"><span class="ic"><span class="seal" style="width:32px;height:32px;font-size:16px;background:#2a2228;color:${SKY[k].col}">${SKY[k].n[0]}</span></span><div><p><b>${SKY[k].n}</b> · ${SKY[k].t}</p><p>${SKY[k].fx.map(f=>`<b>${f.n}</b> ${f.d}`).join(' / ')}</p></div></div>`).join(''));
  h+=hcard(_t("난이도"),Object.keys(DIFFS).map(k=>`<div class="hrow"><span class="ic"><span class="seal" style="width:32px;height:32px;font-size:16px;background:${k==='easy'?'#2f6b5a':k==='hard'?'#7a2018':'#3a5f9e'}">${DIFFS[k].n[0]}</span></span><div><p><b>${DIFFS[k].n}</b> · ${DIFFS[k].d}</p></div></div>`).join('')+_t("<p>모든 난이도에서 막 보스는 중간 보스를 토벌한 뒤에 나타난다.</p>"));
  h+=hcard(_t("점괘 패"),_t("<p>출정 준비 화면에서 한 장을 고른다. 이번 출정의 규칙을 바꾼다.</p>")+Object.keys(CARDS).map(id=>{const ok=unlocked('card:'+id),lt=lockText('card:'+id);return `<div class="hrow"><span class="ic"><span class="seal" style="width:32px;height:32px;font-size:15px;background:#2a2228">${CARDS[id].n[0]}</span></span><div><p><b>${CARDS[id].n}</b>${ok?'':_t(" <span class=\"tag\">잠김</span>")} · ${CARDS[id].d}</p>${!ok&&lt?`<p><small>${lt}</small></p>`:''}</div></div>`;}).join(''));
  h+=hcard(_t("액운 단계"),_t("<p>제10막을 완주하면 다음 단계가 열린다. 단계는 앞 단계의 효과를 모두 안고 간다. 단계마다 출정 뒤 엽전 +15%.</p><ol>{p}</ol>",{p:CURSES.slice(1).map(c=>`<li>${c}</li>`).join('')})); }
 if(helpTab==='foe'){
  const cat={n:_t("일반"),e:_t("엘리트"),m:_t("중간 보스"),b:_t("막 보스")};
  h+=hcard(_t("읽는 법"),ul([_t("요괴 이름은 고성배 『한국 요괴 도감』(위즈덤하우스, 2019)을 따랐다. 게임 속 행동은 놀이에 맞게 지어냈다."),_t("중간 보스와 막 보스는 아래 기술을 섞어 쓴다. 어려움에서는 다른 보스의 기술 두 가지가 무작위로 더해진다."),_t("막 보스는 체력 60%와 25%에서 필살기를 쓴다(그슨대는 70%·40%·15%)."),_t("보스 체력은 그때까지 내가 보여 준 화력(최근 20초 동안 준 피해)에 맞춰 정해진다. 너무 빨리 녹지 않도록, 보스는 1초에 최대 체력의 6%(중간 보스 10%)까지만 피해를 받는다."),_t("자세한 설명과 처치 수는 퇴마록의 요괴 도감에서 본다.")]));
  STAGES.forEach(s=>{const D=BOSS[s.mid],B=BOSS[s.boss];const nm=id=>meta.seen[id]?EN[id].n:'???';
   const sk=d=>d.skills.map(k=>BSK[k].label).join(', ');
   h+=hcard(`${s.sub} ${s.name}`,_t("<p><b>일반</b> {p} · <b>엘리트</b> {p2}</p><p><b>중간 보스</b> {p3} · {p4}</p><p><b>막 보스</b> {p5} · {p6} · <b>필살기</b> {p7}</p>",{p:s.early.concat(s.late).map(nm).join(', '),p2:nm(s.elite),p3:nm(s.mid),p4:sk(D),p5:nm(s.boss),p6:sk(B),p7:B.ults.map(u=>u.n).join(', ')}));});
  h+=_t("<p class=\"credit\">아직 만나지 못한 요괴는 ???로 표시된다.</p>"); }
 $('#helpBody').innerHTML=h;}
{const _u=castUlt;castUlt=function(){const f0=G.fx.length,m0=G.movers.length;_u();tagNew(f0,m0,'ult');};const _c=castCall;castCall=function(){if(!G)return;const f0=G.fx.length,m0=G.movers.length;_c();tagNew(f0,m0,'call');};}
function begin(){if(!selChar)return;if(meta.migNote){meta.migNote=false;saveMeta();}initAudio();
 if(prep.mode==='tale'){const c=taleCards().find(c=>c.id===prep.tale);if(c&&c.state!=='lock')taleStart(prep.tale);return;}newGame(selChar,prep.card,prep.curse,prep.diff,prep.mode||'normal');}
function goHome(){G=null;$('#hud').hidden=true;$('#hudbtns').hidden=true;renderTitle();show('title');}

$('#startBtn').onclick=openPrep;
$('#goBtn').onclick=begin;
$('#prepBack').onclick=()=>{renderTitle();show('title');};
$('#paeRand').onclick=()=>{const ok=Object.keys(CARDS).filter(id=>unlocked('card:'+id));prep.card=ok[Math.random()*ok.length|0]||null;renderPrep();snd(500,0.15,'square',0.03);};
$('#codexBtn').onclick=()=>openCodex('title');$('#helpBtn').onclick=()=>openHelp('title');$('#pauseHelp').onclick=()=>openHelp('pause');
$('#helpBack').onclick=()=>{if(helpFrom==='pause')show('pause');else{renderTitle();show('title');}};$('#codexBack').onclick=()=>{if(codexFrom==='over'&&G)show('over');else if(codexFrom==='hub')openHub();else{renderTitle();show('title');}};
$('#tabTask').onclick=()=>{codexTab='task';renderCodex();};$('#tabTale').onclick=()=>{codexTab='tale';renderCodex();};$('#tabAnom').onclick=()=>{codexTab='anom';renderCodex();};$('#tabDogam').onclick=()=>{codexTab='dogam';renderCodex();};
$('#shopBtn').onclick=()=>{renderShop();show('shop');};
$('#shopBack').onclick=()=>{renderTitle();show('title');};
$('#setBtn').onclick=()=>openSettings('title');$('#pauseSet').onclick=()=>openSettings('pause');
$('#setBack').onclick=()=>{if(prevScreen==='pause')show('pause');else{renderTitle();show('title');}};
$('#sceneNext').onclick=()=>sceneNext();
$('#chestOk').onclick=()=>{const cb=chestCb;chestCb=null;show(null);if(cb)cb();};
$('#tavGo').onclick=openPath;
$('#resumeBtn').onclick=()=>show(null);
$('#quitBtn').onclick=()=>{show(null);endGame(false);};
$('#againBtn').onclick=()=>{if(G.mode==='tale'){taleStart(G.tale.id);return;}newGame(G.cid,G.card,G.curse,G.diff,G.mode);};
$('#homeBtn').onclick=()=>{$('#toast').innerHTML='';G=null;$('#hud').hidden=true;$('#hudbtns').hidden=true;openHub();};
$('#hubBtn').onclick=openHub;$('#hubGo').onclick=()=>{renderTitle();show('title');};$('#hubArch').onclick=()=>openArch('hub');$('#archBtn').onclick=()=>openArch('title');
$('#archBack').onclick=()=>{if(archFrom==='hub')openHub();else{renderTitle();show('title');}};
$('#tabRec').onclick=()=>{archTab='rec';renderArch();};$('#tabCls').onclick=()=>{archTab='cls';renderArch();};$('#tabLog').onclick=()=>{archTab='log';renderArch();};
$('#pauseBtn').onclick=openPause;$('#statBtn').onclick=e=>{e.stopPropagation();openStatus();};$('#pauseStat').onclick=openStatus;$('#statClose').onclick=closeStatus;
$('#tabStW').onclick=()=>{stTab='w';renderStatus();};$('#tabStP').onclick=()=>{stTab='p';renderStatus();};$('#tabStS').onclick=()=>{stTab='s';renderStatus();};$('#callBtn').onclick=e=>{e.stopPropagation();castCall();};
$('#muteBtn').onclick=()=>{muted=!muted;$('#muteBtn').textContent=muted?_t("소리 끔"):_t("소리");};
$('#rrBtn').onclick=reroll;$('#skBtn').onclick=skipLevel;$('#bnBtn').onclick=()=>{if(G.bn>0){banMode=!banMode;renderLevel();}};
bindSettings();
/* 홈 화면 앱: 오프라인 캐시 (https 배포에서만) */
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{});});}
$('#resetBtn').onclick=()=>{if(!confirm(_t("엽전·과업·해금·본부·기록관을 모두 지우고 처음(선비만)부터 다시 시작합니다. 되돌릴 수 없습니다. 지울까요?")))return;try{localStorage.removeItem(SAVE_KEY);}catch(e){}location.reload();};

addEventListener('keydown',e=>{keys[e.code]=true;
 if(modal&&PICK_SCREENS.has(modal)&&(e.repeat||!armed())){if(e.code.startsWith('Arrow')||e.code==='Space'||e.code==='Enter')e.preventDefault();return;}
 if(e.code==='KeyC'||e.code==='Tab'){if(e.code==='Tab')e.preventDefault();if(modal==='status')closeStatus();else if(G&&!G.over&&(!modal||modal==='pause'))openStatus();return;}
 if(e.code==='Escape'||e.code==='KeyP'){if(modal==='status'){closeStatus();return;}if(modal==='pause')show(null);else if(!modal)openPause();}
 const n=parseInt(e.key,10);
 if(modal==='levelup'){if(n>=1&&n<=curOpts.length)pickOpt(n-1);else if(e.code==='KeyR')reroll();else if(e.code==='KeyX')skipLevel();else if(e.code==='KeyB')$('#bnBtn').click();}
 else if(modal==='adv'&&n>=1&&n<=advPick.length)advPick[n-1]();
 else if(modal==='bless'&&n>=1&&n<=blessPick.length)blessPick[n-1]();
 else if(modal==='petpick'&&n>=1&&n<=petPick.length)petPick[n-1]();
 else if(modal==='pick'&&n>=1&&n<=pickFns.length)pickFns[n-1]();
 if(!modal&&e.code==='Space'&&!e.repeat)castCall();
 if(modal==='chest'&&(e.code==='Enter'||e.code==='Space')){e.preventDefault();$('#chestOk').click();}
 if(modal==='scene'&&(e.code==='Enter'||e.code==='Space'||n===1)){e.preventDefault();sceneNext();}
 if(e.code.startsWith('Arrow')||e.code==='Space')e.preventDefault();});
addEventListener('keyup',e=>{keys[e.code]=false;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;if(G&&!G.over&&!modal)openPause();});
cvs.addEventListener('pointerdown',e=>{if(modal||joy)return;initAudio();joy={id:e.pointerId,ox:e.clientX,oy:e.clientY,x:e.clientX,y:e.clientY,active:true};try{cvs.setPointerCapture(e.pointerId);}catch(_){}});
cvs.addEventListener('pointermove',e=>{if(joy&&joy.id===e.pointerId){joy.x=e.clientX;joy.y=e.clientY;}});
const endJoy=e=>{if(joy&&joy.id===e.pointerId){try{cvs.releasePointerCapture(e.pointerId);}catch(_){}joy=null;}};
cvs.addEventListener('pointerup',endJoy);cvs.addEventListener('pointercancel',endJoy);cvs.addEventListener('lostpointercapture',endJoy);   // 붙잡기를 잃어도 이동 손가락이 남아 다음 터치를 막지 않게

