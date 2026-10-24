// 하네스 안에서 실행: 데이터 표(L10N_TABLES)의 한글 문자열을 모두 모은다 (node tests/harness.js index.html tools/i18n_keys_tables.js)
{const out={},seen=new Set();
 const walk=(o,path,d)=>{if(!o||typeof o!=='object'||d>8||seen.has(o))return;seen.add(o);if(!Array.isArray(o)&&Object.getPrototypeOf(o)!==Object.prototype)return;
  for(const k of Object.keys(o)){const v=o[k];if(typeof v==='string'){if(HANGUL.test(v)&&!(v in out))out[v]=path+'.'+k;}else if(v&&typeof v==='object')walk(v,path+'.'+k,d+1);}};
 const T=L10N_TABLES();for(const n in T)walk(T[n],n,0);
 require('fs').writeFileSync(process.env.OUT,JSON.stringify(out));console.log('tables',Object.keys(out).length);}
