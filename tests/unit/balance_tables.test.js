// 밸런스 표(v19.9): 점괘 패·액운·난이도·보패·축복의 숫자는 02_data 표에만 있고, 설명 글의 숫자가 표와 맞아야 한다.
// 표의 값 하나가 설명의 숫자 하나를 차지한다(같은 숫자가 두 번이면 설명에도 두 번). 두 배(×2)·절반(×0.5)은 글로 쓴다.
// 설명에 없는 효과는 UNDESCRIBED에 적어 둔다(바꾸면 이 목록도 함께 고칠 것).
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
const UNDESCRIBED=['diff:easy *M.elite','diff:hard *M.elite'];   // 엘리트 −30%·+20%: 설명에 아직 없음
const r1=v=>Math.round(v*1000)/10;
// 효과 하나 → 설명에서 찾을 글자. null이면 숫자로 쓰지 않는 효과(규칙 켜기·횟수)
function fxToken(k,v){const op=k[0],f=k.slice(3);
  if(op==='=')return null;if(op==='+'&&(f==='choice'||f==='revive'))return null;
  if(op==='*'&&v===2)return '두 배';if(op==='*'&&v===0.5)return '절반';
  const p=op==='*'?r1(Math.abs(v-1)):r1(Math.abs(v));return p+'%';}
// 설명에서 글자를 하나씩 지워 가며 찾는다(같은 숫자가 몇 번 나오는지까지 맞춤)
function consume(src,tokens,where){let d=src;
  for(const [tok,key] of tokens){if(UNDESCRIBED.includes(where+' '+key))continue;   // 설명에 쓰게 되면 남는 숫자로 드러난다
    const i=d.indexOf(tok);if(i<0){fails.push(`${where}: 표 ${key}=${tok} 이(가) 설명에 없음 — 「${src}」`);continue;}
    d=d.slice(0,i)+d.slice(i+tok.length);}
  const left=(d.match(/\d+(\.\d+)?%|두 배|절반/g)||[]);
  ok(!left.length,`${where}: 설명의 ${left.join(', ')} 에 맞는 표 값이 없음 — 「${src}」`);}
const fxTokens=fx=>Object.entries(fx).map(([k,v])=>[fxToken(k,v),k]).filter(t=>t[0]);

// 점괘 패
for(const id in CARDS){const c=CARDS[id];ok(c.fx&&typeof c.fx==='object',`점괘 패 ${id}에 fx가 없음`);if(c.fx)consume(c.d,fxTokens(c.fx),'card:'+id);}
// 액운: CURSES와 같은 자리, 0단계는 비어 있음
ok(CURSE_FX.length===CURSES.length,`CURSE_FX ${CURSE_FX.length}칸 · CURSES ${CURSES.length}칸`);
ok(!Object.keys(CURSE_FX[0]).length,'액운 0단계는 효과 없음');
for(let i=1;i<CURSES.length;i++)consume(CURSES[i],fxTokens(CURSE_FX[i]||{}),'curse:'+i);
// 난이도: 출정 뒤 엽전(coin)도 설명에 있어야 함
for(const id in DIFFS){const D=DIFFS[id];const t=fxTokens(D.fx||{});if(D.coin!==1)t.push([r1(Math.abs(D.coin-1))+'%','coin']);consume(D.d,t,'diff:'+id);}
// 효과 키 모양: 연산 + * =, 대상 B·M·P. 더하기·곱하기는 이미 있는 칸에만(없는 칸이면 오타라 NaN이 된다), 바꾸기(=)는 새 칸도 됨
newGame('seonbi',[],0,'normal','normal');
const all=[...Object.entries(CARDS).map(([i,c])=>['card:'+i,c.fx]),...CURSE_FX.map((f,i)=>['curse:'+i,f]),...Object.entries(DIFFS).map(([i,d])=>['diff:'+i,d.fx])];
for(const [w,fx] of all)for(const k in fx||{}){const T={B:G.base,M:G.mods,P:G.P}[k[1]];
  ok(/^[+*=][BMP]\.\w+$/.test(k)&&T&&(k[0]==='='||typeof T[k.slice(3)]==='number'),`${w}: 효과 키 ${k} 이(가) 맞지 않음(없는 칸이면 오타)`);}

// 보패·축복: STATS 값이 설명에 있어야 함(재사용 대기·받는 피해는 −, 체력·회복·무적·방어는 숫자 그대로)
const by={};for(const s in STATS)for(const k in STATS[s])(by[k]=by[k]||[]).push([s,STATS[s][k]]);
const statTok=(s,v,k)=>{if(s==='maxHp'||s==='armor'||s==='regen')return '+'+v;if(s==='iframeB')return '+'+v+'초';if(s==='coinPlus'&&k[0]==='@')return v+'닢';
  return (s==='cd'||s==='dmgRed'?'−':'+')+r1(v)+'%';};
for(const k in by){const isB=k[0]==='@',id=isB?k.slice(1):k,src=isB?BLESS[id]&&BLESS[id].d:PD[id]&&PD[id].desc;
  ok(src,`STATS의 ${k}: ${isB?'BLESS':'PD'}에 없음(오타)`);if(!src)continue;
  let d=src;for(const [s,v] of by[k]){const tok=statTok(s,v,k),i=d.indexOf(tok);ok(i>=0,`${k}: STATS.${s}=${v} → 「${tok}」이(가) 설명에 없음 — 「${src}」`);if(i>=0)d=d.slice(0,i)+d.slice(i+tok.length);}}
for(const id in PD)ok(by[id],`보패 ${id}가 STATS 어디에도 없음`);
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS balance_tables');
if(fails.length)process.exitCode=1;
