// v21.2.2 백정 차림새: 다른 퇴마사와 겹치지 않게(사용자 「차림새가 너무 겹친다」) — 가죽 앞치마 · 대나무 패랭이·수건·망건·두건 · 백정 전용 물건
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
{
const looks=cid=>{const C=CHARS[cid];return [['기본',C.look],...C.branches.flatMap(b=>b.tiers.map(t=>[t.name,t.look]))];};
const sig=L=>[L.hat,(L.A||'').toLowerCase(),L.item||'',L.apron?1:0].join('/');
const others=new Map();for(const c in CHARS)if(c!=='baekjeong')for(const [n,L] of looks(c))others.set(sig(L),c+':'+n);
const bj=looks('baekjeong');
ok(bj.length===13,'백정 모습 13 ('+bj.length+')');
for(const [n,L] of bj){ok(!others.has(sig(L)),`${n}: 다른 퇴마사(${others.get(sig(L))})와 모자·옷 색·물건이 모두 같음`);}
ok(new Set(bj.map(([,L])=>sig(L))).size===bj.length-1,'백정 안에서도 기본=칼잡이 하나만 같고 나머지는 서로 다름');
// 다른 퇴마사가 안 쓰는 백정 전용 모자·물건
const usedBy=(k,v)=>{const s=new Set();for(const c in CHARS)if(c!=='baekjeong')for(const [,L] of looks(c))s.add(L[k]);return s.has(v);};
for(const h of ['jukparaengi','sugeon','manggeon','dugeon'])ok(HATS[h]&&!usedBy('hat',h)&&bj.some(([,L])=>L.hat===h),'백정 전용 모자 '+h);
for(const it of ['cleaver2','doggi','gori','whip','club','scale','hflag'])ok(ITEMS[it]&&!usedBy('item',it)&&bj.some(([,L])=>L.item===it),'백정 전용 물건 '+it);
// 앞치마: 기본·칼의 길 1~5·형평의 길 1~3, 형평사원부터 벗음(임꺽정도 없음)
const ap=bj.map(([,L])=>L.apron?1:0).join('');
ok(ap==='1'+'111110'+'111000','앞치마 차례 '+ap);
ok(typeof charGrid==='function','charGrid 있음');
if(typeof charGrid==='function'){
 const g1=charGrid(bj[0][1]).join(''),g0=charGrid(Object.assign({},bj[0][1],{apron:0})).join('');
 ok(g1.includes('P')&&!g0.includes('P'),'앞치마는 격자에 P(가죽색)로 그려짐');
 ok(charGrid(CHARS.seonbi.look).join('')===charGrid(CHARS.seonbi.look).join('')&&!charGrid(CHARS.seonbi.look).join('').includes('P'),'다른 퇴마사 격자는 그대로(앞치마 없음)');
}
ok(/^#c8a868$/i.test(bj[0][1].H||''),'패랭이는 누런 대나무색 ('+bj[0][1].H+')');
}
if(fails.length){console.log('FAIL bj_looks\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS bj_looks');
