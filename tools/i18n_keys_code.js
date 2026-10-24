// 코드 속 _t('원문') 열쇠를 모은다(Babel). NODE_PATH 로 @babel/parser 를 찾는다.
const fs=require('fs'),path=require('path'),parser=require('@babel/parser'),traverse=require('@babel/traverse').default;
const DIR=path.resolve(__dirname,'..','src','js'),out={};
for(const f of fs.readdirSync(DIR).filter(f=>f.endsWith('.js')).sort()){const src=fs.readFileSync(path.join(DIR,f),'utf8');let ast;
 try{ast=parser.parse(src,{sourceType:'script',errorRecovery:true});}catch(e){console.error('parse',f,e.message);continue;}
 traverse(ast,{CallExpression(p){const c=p.node.callee;if(c.type==='Identifier'&&c.name==='_t'&&p.node.arguments[0]){const a=p.node.arguments[0];
  if(a.type==='StringLiteral'){if(!(a.value in out))out[a.value]=f+':'+a.loc.start.line;}else console.error('글자가 아닌 열쇠',f+':'+a.loc.start.line);}}});}
fs.writeFileSync(process.env.OUT,JSON.stringify(out));console.log('code',Object.keys(out).length);
