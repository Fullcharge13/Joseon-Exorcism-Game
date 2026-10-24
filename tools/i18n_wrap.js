#!/usr/bin/env node
/* v18.0 한 번 쓰는 도구: src/js 의 코드 속 한국어 문구를 _t('원문', {변수})로 감싼다(코드 구조를 읽어 정확히 그 자리만 바꿈).
   node tools/i18n_wrap.js            # 바꿀 곳만 세어 보고하기
   node tools/i18n_wrap.js --apply    # 실제로 바꾸기
   @babel/parser·@babel/traverse 가 필요하다(NODE_PATH 로 찾음, 배포물에는 들어가지 않음).
   건너뛰는 것: 데이터 표(불러올 때 한 번 만들어지는 대문자 표 — applyLang 이 사전으로 덧씌움), 객체 열쇠, 비교(===·switch), 이미 t()인 것,
   오류 기록(diagNote)·console 글, includes·indexOf 같은 문자열 찾기의 인자. 건너뛴 것 가운데 사람이 볼 곳은 목록으로 알려 준다. */
const fs=require('fs'),path=require('path');
const parser=require('@babel/parser'),traverse=require('@babel/traverse').default;
const ROOT=path.resolve(__dirname,'..'),DIR=path.join(ROOT,'src','js');
const files=fs.readdirSync(DIR).filter(f=>f.endsWith('.js')).sort();
const HAN=/[가-힣]/;
const TABLES=new Set(['WD','TASKS','CHARS','EN','NPCS','TALES','PD','PETS','BSK','GUIDE','JOBTASK','FUSE','CALL','ANOM','BLESS','SKY','STORY','UPG','CARDS','STAGES','PATHS','TEMPER','DUO','TAVERN','DKB','ENDING','GIFTS','BOSS','KS','SEALS','ULT','CURSES','DKC','VARIANTS','QUESTS','TALE_RULES','TIER_BONUS','HELP_TABS','AWK','DIFFS','MODES','TIER_NAME','FLOWERS','GRADES','JMON','JDAY','GAN0','JI0']);
const SKIP_CALLS=new Set(['_t','diagNote','fillT']);const FIND_METHODS=new Set(['includes','indexOf','startsWith','endsWith','split','replace','replaceAll','match','test','lastIndexOf']);
const apply=process.argv.includes('--apply');
let src='',ranges=[];for(const f of files){const s=fs.readFileSync(path.join(DIR,f),'utf8');ranges.push({f,start:src.length,end:src.length+s.length});src+=s;}
const ast=parser.parse(src,{sourceType:'script',errorRecovery:false,ranges:false});
const targets=[],report={table:0,key:0,compare:0,skipcall:0,find:0,loadOther:[],member:0,concat:0};
const topNames=new Map();
const fileOf=pos=>ranges.find(r=>pos>=r.start&&pos<r.end);
const srcLine=pos=>{const a=src.lastIndexOf('\n',pos)+1,b=src.indexOf('\n',pos);return src.slice(a,b<0?src.length:b);};
const lineOf=pos=>{const r=fileOf(pos);return r.f+':'+(src.slice(r.start,pos).split('\n').length);};
function hasHan(n){if(n.type==='StringLiteral')return HAN.test(n.value);if(n.type==='TemplateLiteral')return n.quasis.some(q=>HAN.test(q.value.cooked));return false;}
traverse(ast,{'StringLiteral|TemplateLiteral'(p){const n=p.node;if(!hasHan(n))return;const par=p.parent;
 if(srcLine(n.start).includes('//i18n-skip'))return;
 if(p.parentPath.isTaggedTemplateExpression())return;
 if((par.type==='ObjectProperty'||par.type==='ObjectMethod')&&par.key===n&&!par.computed){report.key++;return;}
 if(par.type==='BinaryExpression'&&['===','!==','==','!='].includes(par.operator)){report.compare++;return;}
 if(par.type==='SwitchCase'&&par.test===n){report.compare++;return;}
 if(par.type==='MemberExpression'&&par.property===n){report.member++;return;}
 if(par.type==='CallExpression'&&par.arguments.includes(n)){const c=par.callee;
  const nm=c.type==='Identifier'?c.name:c.type==='MemberExpression'&&!c.computed?c.property.name:'';
  if(SKIP_CALLS.has(nm)||(c.type==='MemberExpression'&&c.object.type==='Identifier'&&c.object.name==='console')){report.skipcall++;return;}
  if(c.type==='MemberExpression'&&FIND_METHODS.has(nm)){report.find++;return;}}
 const fn=p.getFunctionParent();
 if(!fn){let q=p,top=null;while(q&&q.parentPath){if(q.parentPath.isProgram()){top=q.node;break;}q=q.parentPath;}
  let names=[];if(top&&top.type==='VariableDeclaration')names=top.declarations.map(d=>d.id.name);
  if(!names.length&&top){if(!topNames.has(top)){const ids=[];const walk=o=>{if(!o||typeof o!=='object')return;if(Array.isArray(o)){o.forEach(walk);return;}if(o.type==='Identifier'&&TABLES.has(o.name))ids.push(o.name);for(const k in o)if(k!=='loc'&&o[k]&&typeof o[k]==='object')walk(o[k]);};walk(top);topNames.set(top,ids);}names=topNames.get(top);}   // CHARS.x=… · TASKS.push(…) · for(…)WD[…]=… 처럼 표를 채우는 문장
  if(names.some(x=>TABLES.has(x))){report.table++;return;}
  report.loadOther.push(lineOf(n.start)+' '+(n.type==='StringLiteral'?n.value:n.quasis.map(q=>q.value.cooked).join('…')).slice(0,60));return;}
 if(par.type==='BinaryExpression'&&par.operator==='+')report.concat++;
 targets.push(n);}});
targets.sort((a,b)=>a.start-b.start||b.end-a.end);
// 바깥 대상 안에 든 대상은 바깥 대상을 만들 때 함께 바꾼다
function within(s,e){const out=[];let last=-1;for(const n of targets){if(n.start>=s&&n.end<=e&&!(n.start===s&&n.end===e)){if(n.start<last)continue;out.push(n);last=n.end;}}return out;}
function renderRange(s,e){let o='',pos=s;for(const n of within(s,e)){o+=src.slice(pos,n.start)+transform(n);pos=n.end;}return o+src.slice(pos,e);}
function nameFor(ex,used){let b='';if(ex.type==='Identifier')b=ex.name;else if(ex.type==='MemberExpression'&&!ex.computed)b=ex.property.name;
 if(!/^[A-Za-z_]\w*$/.test(b)||b.length>16)b='p';let k=b,i=2;while(used.has(k))k=b+(i++);used.add(k);return k;}
function transform(n){if(n.type==='StringLiteral')return '_t('+JSON.stringify(n.value)+')';
 let key='',vars=[],used=new Set();
 n.quasis.forEach((q,i)=>{if(/[{}]/.test(q.value.cooked))throw new Error('원문에 { } 가 있어 끼워 넣기와 헷갈립니다: '+lineOf(n.start));key+=q.value.cooked;if(i<n.expressions.length){let ex=n.expressions[i],jo='';
   if(ex.type==='CallExpression'&&ex.callee.type==='Identifier'&&(ex.callee.name==='eul'||ex.callee.name==='euro')&&ex.arguments.length===1){jo=ex.callee.name==='eul'?':을':':으로';ex=ex.arguments[0];}
   const k=nameFor(ex,used);key+='{'+k+jo+'}';vars.push(k+':'+renderRange(ex.start,ex.end));}});
 return '_t('+JSON.stringify(key)+(vars.length?',{'+vars.join(',')+'}':'')+')';}
// 원문에 이미 { } 가 든 틀은 끼워 넣기와 헷갈리므로 알려 준다
const brace=targets.filter(n=>(n.type==='StringLiteral'?n.value:n.quasis.map(q=>q.value.cooked).join('')).match(/\{\w+(:[^}]*)?\}/));
console.log(`감쌀 곳 ${targets.length} (틀 ${targets.filter(n=>n.type==='TemplateLiteral').length}) · 건너뜀: 데이터 표 ${report.table}, 열쇠 ${report.key}, 비교 ${report.compare}, 기록·콘솔 ${report.skipcall}, 찾기 인자 ${report.find}, 속성 이름 ${report.member} · 덧셈으로 잇는 조각 ${report.concat}`);
if(report.loadOther.length)console.log('불러올 때 한 번만 만들어지는 표 밖 문구(손으로 볼 것):\n  '+report.loadOther.join('\n  '));
if(brace.length)console.log('원문에 {이름} 꼴이 이미 있는 곳:\n  '+brace.map(n=>lineOf(n.start)).join('\n  '));
if(apply){const tops=within(0,src.length+1);let out='',pos=0;for(const n of tops){out+=src.slice(pos,n.start)+transform(n);pos=n.end;}out+=src.slice(pos);
 // 파일별로 다시 나눈다: 바뀐 곳이 파일 경계를 넘지 않으므로 경계마다 늘어난 길이를 더해 자른다
 let shift=0,cur=0;const bounds=ranges.map(r=>{let d=0;for(const n of tops)if(n.start>=r.start&&n.end<=r.end)d+=transform(n).length-(n.end-n.start);const s=r.start+shift;shift+=d;return {f:r.f,s,e:r.end+shift};});
 for(const bnd of bounds)fs.writeFileSync(path.join(DIR,bnd.f),out.slice(bnd.s,bnd.e));
 console.log('적용함:',bounds.length,'개 파일');}
