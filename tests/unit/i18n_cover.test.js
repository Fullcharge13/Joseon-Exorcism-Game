// 간체 번역 전수 검사(v18.1): 원문 목록(docs/i18n/원문.json) 모두에 간체가 있고, 간체에 한글·번체·가나가 없으며,
// 끼워 넣을 자리 {이름}·꾸밈 태그·숫자가 원문과 같고, 용어집 고정 번역을 지킨다.
// 「{p} 전직」처럼 용어가 끼워 넣을 자리 바로 뒤에 붙은 곳은 그 자리(예: 一转)가 용어를 품으므로 용어 검사를 건너뛴다.
const fs=require('fs');const fails=[],miss=[];const ok=(c,m)=>{if(!c)fails.push(m);};
const SRC=JSON.parse(fs.readFileSync('docs/i18n/원문.json','utf8')),GL=JSON.parse(fs.readFileSync('src/i18n/glossary.json','utf8'));delete GL._설명;
const Z=I18N.zh,HAN=/[가-힣ㄱ-ㅎㅏ-ㅣ]/,KANA=/[぀-ヿ]/,TRAD=/[們這個說為與來時會對進過開關點體學國長門馬鳥魚龍雲風電書劍鐵銀錢藥華聲氣後從讓還嗎]/;
const ph=s=>(s.match(/\{\w+(?::[^}]*)?\}/g)||[]).map(x=>x.replace(/:[^}]*/,'')).sort().join(',');
const tags=s=>(s.match(/<\/?[a-z]+/gi)||[]).map(x=>x.toLowerCase()).sort().join(',');
const nums=s=>(s.replace(/\{\w+(?::[^}]*)?\}/g,'').replace(/\d차/g,'')   // 「1차 전직」은 중국어에서 「一转」(한자 숫자)
.match(/\d[\d,.]*/g)||[]).map(x=>x.replace(/,/g,'').replace(/\.$/,''));
const glMiss={};
for(const k in SRC){const z=Z[k];if(z==null||z===''){miss.push(k);continue;}
 if(HAN.test(z))fails.push('한글 남음: '+k.slice(0,40)+' → '+z.slice(0,40));
 if(KANA.test(z))fails.push('가나: '+z.slice(0,40));if(TRAD.test(z))fails.push('번체자: '+z.slice(0,40)+' ['+z.match(TRAD)[0]+']');
 const base=k.includes('|')?k.slice(0,k.indexOf('|')):k;
 if(ph(base)!==ph(z))fails.push('끼워 넣을 자리 다름: '+base.slice(0,50)+' ('+ph(base)+' / '+ph(z)+')');
 if(tags(base)!==tags(z))fails.push('태그 다름: '+base.slice(0,50)+' ('+tags(base)+' / '+tags(z)+')');
 const zn=nums(z);for(const n of nums(base))if(!zn.includes(n)){fails.push('숫자 빠짐 '+n+': '+base.slice(0,50)+' → '+z.slice(0,50));break;}
 for(const g in GL)if(base.split(g).length-base.split('} '+g).length>0&&!z.includes(GL[g])){(glMiss[g]=glMiss[g]||[]).push(base.slice(0,30)+' → '+z.slice(0,30));}}
for(const g in glMiss)if(glMiss[g].length)fails.push('용어집 「'+g+'」→「'+GL[g]+'」 안 지킴 '+glMiss[g].length+'곳: '+glMiss[g].slice(0,2).join(' / '));
const total=Object.keys(SRC).length;
if(miss.length)fails.unshift('번역 없음 '+miss.length+'/'+total+' (예: '+miss.slice(0,3).map(x=>x.slice(0,30)).join(' | ')+')');
if(fails.length){console.log('FAIL i18n_cover ('+fails.length+')\n  '+fails.slice(0,40).join('\n  '));process.exitCode=1;}else console.log('PASS i18n_cover ('+total+'개 원문 모두 간체)');
