// 장소 안내인(v17.5): 세 장소마다 나타날 때·가까이·머무는 동안·끝(샛길은 꺼져 갈 때) 각 한 번만 말하고, 문구는 표 안에서만 나온다
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
const setup=()=>{newGame('seonbi','gilil',0,'normal');G.queue.length=0;show(null);god();G.mods.eCnt=0;G.enemies=[];G.shrineN=2;G.anomAt=undefined;G.dkAt=undefined;G.guideLog=[];};
const logOf=(k,m)=>G.guideLog.filter(e=>e.kind===k&&e.m===m);
const inList=(k,m)=>logOf(k,m).every(e=>GUIDE[k].lines[m].some(t=>e.txt===t.replace('{n}',e.n||'')));
const walkTo=(o,d)=>{G.P.x=o.x-d;G.P.y=o.y;};
for(const kind of ['shrine','anom','dk']){
 setup();
 if(kind==='shrine')spawnShrine();else if(kind==='anom')spawnAnom();else spawnDk();
 const o=kind==='shrine'?G.shrine:kind==='anom'?G.anom:G.dk;ok(o,kind+' 생김');if(!o)continue;
 ok(logOf(kind,'appear').length===1,kind+' 나타날 때 1번 ('+logOf(kind,'appear').length+')');
 ok(!!o.say!==!!o.edgeSay||(o.say&&o.edgeSay),kind+' 나타날 때 말이 말풍선이나 표지 쪽에 있음');
 step(1,{pick:false});ok(logOf(kind,'appear').length===1,kind+' 나타날 때 다시 말하지 않음');
 walkTo(o,50);step(0.2,{pick:false});ok(logOf(kind,'near').length===1,kind+' 가까이 1번');
 step(0.5,{pick:false});ok(logOf(kind,'near').length===1,kind+' 가까이 다시 말하지 않음');
 if(kind==='dk'){o.life=11.9;step(0.1,{pick:false});ok(logOf(kind,'hurry').length===1,'dk 꺼져 갈 때 1번');step(0.3,{pick:false});ok(logOf(kind,'hurry').length===1,'dk 꺼져 갈 때 다시 말하지 않음');o.life=30;}
 walkTo(o,0);step(o.need*0.5,{pick:false});ok(logOf(kind,'stay').length===1,kind+' 머무는 동안 1번');
 step(o.need,{pick:false});
 if(kind!=='dk'){ok(logOf(kind,'done').length===1,kind+' 끝났을 때 1번');ok(G.gfx.some(g=>g.kind===kind&&g.txt),kind+' 끝난 뒤 남는 그림과 말');}
 else ok(modal==='pick','dk 들어가면 도깨비 창 ('+modal+')');
 for(const m of ['appear','near','stay','done','hurry'])if(GUIDE[kind].lines[m])ok(inList(kind,m),kind+' '+m+' 문구가 표 안');
 ok(G.guideLog.filter(e=>e.kind===kind).length<=4,kind+' 한 장소에서 많아야 4번 ('+G.guideLog.filter(e=>e.kind===kind).length+')');
}
// 괴이 이름 넣기: 「저기 거꾸로 선 것이 있소!」
setup();spawnAnom();G.anom.id='flip';let hit=false;for(let i=0;i<30&&!hit;i++){G.anom.said={appear:true};G.guideLog=[];walkTo(G.anom,50);step(0.1,{pick:false});const e=logOf('anom','near')[0];if(e&&e.txt.includes('거꾸로 선 것이'))hit=true;G.P.x-=200;step(0.1,{pick:false});}
ok(hit,'괴이 가까이 문구에 괴이 이름이 들어감');
// 화면 밖에서 생기면 표지 쪽 말
setup();G.P.x=0;G.P.y=0;G.dk=null;G.dk={x:2000,y:0,prog:0,need:1.2,life:45};guideSay('dk',G.dk,'appear');ok(G.dk.edgeSay&&!G.dk.say,'화면 밖이면 표지 옆에 말');
if(fails.length){console.log('FAIL guide_say ('+fails.length+')\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS guide_say');
