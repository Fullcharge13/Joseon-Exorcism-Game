/* ======================= pixel sprite toolkit ======================= */
const PAL={k:'#1a1418',w:'#efe6d2',s:'#e8b98f',r:'#c23b2a',R:'#7a2018',g:'#3f9a5a',G:'#1d4d42',b:'#3a5f9e',B:'#1a2b4a',y:'#e0b048',o:'#b0702e',n:'#4a3a30',x:'#8a8494',X:'#4a4552',c:'#8fd3ff',p:'#b07fd0'};
function mk(rows,pal=PAL){const h=rows.length,w=Math.max(...rows.map(r=>r.length));const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');rows.forEach((r,j)=>{for(let i=0;i<r.length;i++){const ch=r[i];if(ch!=='.'&&pal[ch]){x.fillStyle=pal[ch];x.fillRect(i,j,1,1);}}});return c;}
function variants(c){const f=document.createElement('canvas');f.width=c.width;f.height=c.height;const fx=f.getContext('2d');fx.translate(c.width,0);fx.scale(-1,1);fx.drawImage(c,0,0);
  const wh=c2=>{const h=document.createElement('canvas');h.width=c.width;h.height=c.height;const hx=h.getContext('2d');hx.drawImage(c2,0,0);hx.globalCompositeOperation='source-atop';hx.fillStyle='#fff';hx.fillRect(0,0,c.width,c.height);return h;};
  return {n:c,f,h:wh(c),hf:wh(f),w:c.width,hgt:c.height};}
function big(c,s){const o=document.createElement('canvas');o.width=c.width*s;o.height=c.height*s;const x=o.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(c,0,0,o.width,o.height);return o.toDataURL();}

/* --- character composer: hat + face + robe + held item, so every class tier has its own look --- */
const HATS={
 gat:['...HHHH...','...HHHH...','HHHHHHHHHH'], samo:['...HHHH...','hH.HHHH.Hh','...HHHH...'],
 jeongja:['..H.H.H...','..HHHHH...','..HHHHHH..'], tang:['..........','...HHHH...','...HHHH...'],
 flower:['..hHHHHh..','.HHHHHHHH.','..........'], gokkal:['....H.....','...HHH....','..HHHHH...'],
 jeonrip:['....hh....','..HHHHHH..','HHHHHHHHHH'], helm:['....hh....','...HHHH...','..HHHHHH..'],
 crown:['.h.h.h.h..','.HHHHHHHH.','..........'], hood:['..HHHHHH..','.HHHHHHHH.','.HH....HH.'],
 gache:['.HHHHHHHH.','HHhHHHHhHH','.HH....HH.'], hwagwan:['.hrhrhrh..','.HHHHHHHH.','..H....H..'], jokduri:['...hhh....','..hHhHh...','.HHHHHHHH.'],
 paraengi:['...HHHH...','h.HHHHHH.h','HHHHHHHHHH']};
const FACE=['...ssss...','...sksk...','...ssss...'];
const BODY=['..AAAAAA..','.AAATTAAA.','.sAAAAAAs.','..ALLLLA..','..AAAAAA..','..AA..AA..','..kk..kk..'];
const col=(x,y0,y1,c)=>{const a=[];for(let y=y0;y<=y1;y++)a.push([x,y,c]);return a;};
const ITEMS={
 brush:[[10,6,'k'],[10,7,'n'],[10,8,'n'],[10,9,'n']], book:[[10,8,'b'],[11,8,'b'],[10,9,'w'],[11,9,'b']],
 bag:[[10,9,'o'],[11,9,'o'],[10,10,'o'],[11,10,'n']], fan:[[10,6,'y'],[11,6,'y'],[10,7,'y'],[11,7,'r'],[10,8,'n']],
 bell:[[10,8,'n'],[10,9,'y'],[11,9,'y'],[10,10,'y'],[11,10,'y']],
 sword:[...col(11,2,7,'x'),[10,8,'y'],[11,8,'y'],[11,9,'n']],
 bow:[[10,3,'o'],...col(11,4,9,'o'),[10,10,'o'],...col(10,4,9,'w')],
 spear:[[11,0,'x'],[11,1,'x'],[11,2,'r'],...col(11,3,12,'n')], mapae:[[10,8,'y'],[11,8,'y'],[10,9,'y'],[11,9,'o']],
 staff:[[11,0,'y'],...col(11,1,12,'o')], gourd:[[10,7,'n'],[10,8,'p'],[10,9,'p'],[11,9,'p'],[10,10,'p'],[11,10,'p']],
 cloth:[...col(11,3,12,'w'),...col(10,4,8,'w')], gayageum:[[10,7,'o'],[11,7,'o'],[10,8,'o'],[11,8,'w'],[10,9,'o'],[11,9,'w'],[10,10,'n']], flag:[...col(10,0,12,'n'),[11,0,'r'],[11,1,'r'],[11,2,'y'],[11,3,'r']],
 abacus:[[10,7,'o'],[11,7,'o'],[10,8,'y'],[11,8,'k'],[10,9,'k'],[11,9,'y'],[10,10,'o'],[11,10,'o']],
 pouch:[[10,8,'n'],[10,9,'y'],[11,9,'y'],[10,10,'o'],[11,10,'y']],
 jige:[...col(11,2,11,'o'),[10,4,'o'],[10,8,'o'],[11,12,'o']],
 mulmi:[...col(11,0,11,'n'),[11,12,'x']]};
const charCache={};
function charSpr(L){const key=JSON.stringify(L);if(charCache[key])return charCache[key];
 const pal={...PAL,H:L.H||'#1a1418',h:L.h||'#e0b048',A:L.A,T:L.T||L.A,L:L.L||'#1a1418',C:L.C||L.A};
 const g=[...HATS[L.hat],...FACE,...BODY].map(r=>('.'+r+'.').split(''));
 if(L.C)for(let j=7;j<=10;j++){g[j][1]='C';g[j][10]='C';}
 for(const [x,y,c] of (ITEMS[L.item]||[]))g[y][x]=c;
 return charCache[key]=variants(mk(g.map(r=>r.join('')),pal));}

/* --- monster templates (A = main colour, B = secondary) --- */
const TPL={
 wisp:['...A...','..AAA..','.ABABA.','.AAABA.','ABAwABA','ABwwwBA','.AwwwA.','..AAA..'],
 blob:['..AAAA..','.AAAAAA.','AAwAAwAA','AArAArAA','AAAAAAAA','.AAAAAA.','A.A..A.A'],
 goblin:['....y.....','...AAA....','..AAAAAB..','..AwAwAB..','..AAAAA.B.','..ArrrA.B.','.AAAAAAA..','.A.AAA.A..','...AAA....','...A.A....','..kk.kk...'],
 ghost:['..kkkk..','.kkkkkk.','.kAkkAk.','.kAAAAk.','.krAArk.','.kAAAAk.','.BBBBBB.','BBBBBBBB','.BBBBBB.','.BBBBBB.','..B.BB.B','.B..B...'],
 ghostHat:['..kkkk..','..kkkk..','kkkkkkkk','..AAAA..','..ArAr..','..AAAA..','.BBBBBB.','BBBBBBBB','.BBBBBB.','.BBBBBB.','..B.BB.B','.B..B...'],
 egg:['..AAAA..','.AAAAAA.','.AAAAAA.','.AAAAAA.','..AAAA..','.BBBBBB.','BBBBBBBB','sBBBBBBs','.BB..BB.','.kk..kk.'],
 fox:['.A.A........','.AAA......ww','AAkAA....wAw','AAAAAAAAAAA.','.AAAAAAAAA..','.AwwAAAAAA..','..A.A..A.A..','..k.k..k.k..'],
 fox9:['.A.A......ww','.AAA.....wAw','AAkAA...wwAw','AAAAAAAAAAAw','.AAAAAAAAAww','.AwwAAAAAA..','..A.A..A.A..','..k.k..k.k..'],
 dog:['.A........','AAA.......','AkAA...A..','AAAAAAAAA.','.AAAAAAAAA','.ABAAAAAA.','.A.A..A.A.','.k.k..k.k.'],
 dog3:['.A........','AAA.......','rkrA...A..','AAAAAAAAA.','.AAAAAAAAA','.ABAAAAAA.','.A.A..A.A.','.k.k..k.k.'],
 tiger:['.A.A........','.AAA.....AA.','AkAkA...A...','AAwAAAAAA...','.AAAAAAAAA..','.ABABABABA..','.AAAAAAAAA..','.A.A...A.A..','.k.k...k.k..'],
 rat:['.A.A.....','AAAA.....','AkAAAAA..','AAAAAAAAB','.k.k.k...'],
 fishman:['..AAAA..','.AkAAkA.','.AAAAAA.','..AwwA..','.BBBBBB.','BABBBBAB','.BBBBBB.','..BBBB..','..B..B..','.B....B.','BB....BB'],
 fish:['....B.....','.AAAAAA..B','AkAAAAAABB','AAAAAAAAAB','.AwwwAA..B','....B.....'],
 bird:['A........A','AA......AA','AAA.ss.AAA','.AAsssAAA.','..AskksA..','...ArrA...','...A..A...','..k....k..'],
 worm:['..A..A..','.AAAAAA.','AkABABAA','AAAAAAA.','.A.A.A..'],
 worm4:['A.A..A.A','AAAAAAAA','kAkAAkAk','AAAAAAAA','.ABABAB.','..AAAA..'],
 yaksha:['.y......y.','.yAAAAAAy.','..AwAAwA..','..AAAAAA..','..ArrrrA..','.AAAAAAAA.','AABBBBBBAA','A.BBBBBB.A','A.BBBBBB.A','..BBBBBB..','..AA..AA..','..AA..AA..','..kk..kk..'],
 giant:['..AAAAAA..','.AAAAAAAA.','..AwAAwA..','..AAAAAA..','..ArrrrA..','.AAAAAAAA.','AABBBBBBAA','A.BBBBBB.A','A.BBBBBB.A','..BBBBBB..','..AA..AA..','..AA..AA..','..kk..kk..'],
 pig:['.A........A.','AAAAAAAAAAA.','AkAAAAAAAAAA','AwwAAAAAAAAA','AAAAAAAAAAA.','.AAAAAAAAA..','.A.A...A.A..','.k.k...k.k..'],
 beast:['..B......B..','.BAB....BAB.','.AAAAAAAAAA.','AArAAAAAArAA','AAAAAAAAAAAA','AwkwkwkwkwkA','AAAAAAAAAAAA','ABABABABABAA','AAAAAAAAAAAA','.AA.AAAA.AA.','.kk.k..k.kk.'],
 reaper:['..kkkkkk..','.kkkkkkkk.','kkkkkkkkkk','...wwww...','...wrwr...','...wwww...','..kkkkkk..','.kkkkkkkk.','.wkkkkkkw.','..kkkkkk..','..kkkkkk..','..kkkkkk..','..kk..kk..'],
 mask:['..AAAAAA..','.AAAAAAAA.','AAwkAAkwAA','AAAAAAAAAA','AAArrrrAAA','.AAAAAAAA.','..BBBBBB..','.BBBBBBBB.','BBBBBBBBBB','.BB....BB.','.kk....kk.'],
 tall:['..kk..','.kkkk.','.kAAk.','.krrk.','.kkkk.','.BBBB.','BBBBBB','.BBBB.','.BBBB.','.BBBB.','.BBBB.','.BBBB.','.BBBB.','.B..B.','.B..B.','.k..k.'],
 child:['.kkkk.','kAAAAk','kArrAk','kAAAAk','.BBBB.','BBBBBB','.BBBB.','.B..B.'],
 heads3:['.y..y..y..y.','AAA.AAA.AAA.','AwA.AwA.AwA.','AAA.AAA.AAA.','.AAAAAAAAA..','AAABBBBBAAA.','A.BBBBBBB.A.','A.BBBBBBB.A.','..BBBBBBB...','..AA...AA...','..kk...kk...'],
 eagle3:['A..A..A.....','Ay.Ay.Ay....','AAAAAAAA....','.AAAAAAAAA.A','..AAAAAAAAAA','...AAAAAA..A','.....AA.....','.....y......','....yyy.....'],
 shadow:['..AAAA..','.AAAAAA.','.ArAArA.','.AAAAAA.','AAAAAAAA','AAAAAAAA','AAAAAAAA','AAAAAAAA','AAAAAAAA','.A.AA.A.'],
 bear:['.AA.......','AAAA......','AkAAA.....','AAAwAAAAA.','.AAAAAAAAA','.ABBBAAAAA','.AAAAAAAAA','.AA.AA.AA.','.kk.kk.kk.'],
 serpent:['..AAAA....','.AwAAwA...','AAAAAAAA..','.ArrA.AA..','......AA..','.....AA...','....AA....','...AAAA...'],
};
const LEFT_FACING=new Set(['fox','fox9','dog','dog3','tiger','rat','fish','pig','bear']);

const IR={
 meok:['.....kk.','....kyk.','...kyk..','..kkk...','.kkkk...','kkkk....','.kk..ww.','.....ww.'],
 chim:['.x.x.x..','.x.x.x..','.x.x.x..','.x.x.x..','.x.x.x..','.x.x.x..','.w.w.w..','.y.y.y..'],
 bujeok:['.yyyyyy.','.yrrrry.','.yyryyy.','.yrrrry.','.yyryyy.','.yrryry.','.yyyyyy.','...yy...'],
 hwando:['.......w','......wx','.....wx.','....wx..','.y.wx...','..yx....','.nyy....','n..y....'],
 bangul:['...nn...','..yyyy..','.yyyyyy.','.yyyyyy.','yyyyyyyy','yyyyyyyy','...kk...','........'],
 hwasal:['.......x','......xx','.....x..','....x...','.w.x....','.wx.....','www.....','........'],
 singijeon:['......rr','.....rrr','....nrr.','...nn...','..nn....','.yn.....','yyo.....','.o......'],
 yaktang:['..oooo..','.o....o.','.gggggg.','ogwggwgo','oggggggo','oggggggo','.oooooo.','........'],
 byeoru:['........','.kkkkkk.','kXXXXXXk','kXkkkkXk','kXkbbkXk','kXkkkkXk','kXXXXXXk','.kkkkkk.'],
 buchae:['y.y.y.y.','.yyyyyy.','.ywywyw.','..yyyy..','..ywyw..','...yy...','...nn...','...nn...'],
 seochal:['........','wwwwwwww','wkwwwwkw','wwkwwkww','wwwkkwww','wwwwwwww','wwwwrrww','........'],
 buhang:['........','..xxxx..','.x....x.','.x....x.','.xrrrrx.','.xrrrrx.','..xxxx..','........'],
 jakdu:['xxxxxxx.','xwwwwwx.','.xxxxxxn','......nn','.....nn.','....nn..','........','........'],
 hwanyak:['........','..nnnn..','.nooonn.','nooyoonn','noooooon','.nooonn.','..nnnn..','........'],
 singal:['......xw','.....xw.','....xw..','...xw...','.rrx....','.rr.....','y.r.....','........'],
 bara:['..yyyy..','.yyyyyy.','yyynnyyy','yyynnyyy','.yyyyyy.','..yyyy..','...rr...','..r..r..'],
 myeongdu:['..yyyy..','.yccccy.','ycwcccyy','ycccccyy','yccccccy','.yccccy.','..yyyy..','........'],
 pyeongon:['.......n','......n.','.....n..','....n...','...x....','..xxx...','.xxxxx..','..xxx...'],
 deungpae:['..oooo..','.oyyyyo.','oyyrryyo','oyrkkryo','oyyrryyo','.oyyyyo.','..oooo..','........'],
 jincheon:['....y...','...y....','..kk....','.kXXkk..','kXXXXXk.','kXXXXXk.','.kXXXk..','..kkk...'],
 insam:['...gg...','..g..g..','...oo...','..oooo..','..oooo..','.o.oo.o.','o..oo..o','..o..o..'],
 jipsin:['........','..yyyy..','.yoyoyy.','yoyoyoyy','yyyyyyyy','.oooooo.','........','........'],
 gat:['..kkkk..','..kkkk..','..kkkk..','kkkkkkkk','.k....k.','........','........','........'],
 yundo:['.oooooo.','oyyyyyyo','oyyryyyo','oyrrryyo','oyyrkyyo','oyyyyyyo','oyyyyyyo','.oooooo.'],
 seochaek:['bbbbbbb.','bwwwwwb.','bwkkkwb.','bwwwwwb.','bwkkwwb.','bwwwwwb.','bbbbbbb.','........'],
 gapot:['.r....r.','rrrrrrrr','ryryryry','rrrrrrrr','ryryryry','rrrrrrrr','.rrrrrr.','........'],
 hwayak:['...kk...','..nkkn..','.nnnnnn.','nnnnnnnn','nnrrnnnn','nnnnnnnn','.nnnnnn.','........'],
 horibyeong:['...n....','...oo...','..oyyo..','..oyyo..','.oyyyyo.','oyyyyyyo','oyyyyyyo','.oooooo.'],
 yeonjeok:['...gg...','..gGGg..','.gGGGGg.','gGGGGGGg','gGGGGGGg','.gGGGGg.','..gggg..','........'],
 hongpae:['rrrrrrrr','rwwwwwwr','rwkkkkwr','rwwwwwwr','rwkkkwwr','rwwwwwwr','rrrrrrrr','........'],
 nakgwan:['..nnnn..','..nnnn..','...nn...','..rrrr..','.rrwwrr.','.rwrrwr.','.rrrrrr.','........'],
 gamcho:['.....g..','....gg..','...oo...','..oo....','.oo.....','oo......','o.......','........'],
 nogyong:['o..o..o.','o..o..o.','.o.o.o..','..ooo...','...o....','...o....','..oo....','........'],
 sahyang:['...kk...','..pkkp..','.pppppp.','pppwpppp','pppppppp','.pppppp.','..pppp..','........'],
 myeongtae:['........','x.....xx','xx..xxxx','xxxxxxkx','xxxxxxxx','xx..xxxx','x.....xx','........'],
 osaek:['rrrrrrrr','yyyyyyyy','gggggggg','bbbbbbbb','wwwwwwww','rrrrrrrr','.y.g.b..','........'],
 jeonghwasu:['........','........','cccccccc','wwwwwwww','.wwwwww.','..wwww..','...ww...','........'],
 tugu:['...rr...','...rr...','..xxxx..','.xxxxxx.','xxXXXXxx','x......x','........','........'],
 gunryeong:['n.......','nrrrrrr.','nryyyrr.','nrryrrr.','nrrrrrr.','n.......','n.......','n.......'],
 jeonma:['......oo','.....ooo','oooooooo','ooooooo.','.oooooo.','.o.o.o.o','.o.o.o.o','........'],
 gayageum:['.......o','......oo','.....owo','....owo.','...owo..','..owo...','.owo....','oo......'],
 geommu:['w.....w.','.x...x..','..x.x...','...x....','..x.x...','.y...y..','r.....r.','........'],
 buchaechum:['p.p.p.p.','.pppppp.','.pwpwpw.','..pppp..','..pwpw..','...pp...','...nn...','...nn...'],
 janggu:['rrr..rrr','rwr..rwr','rwrrrrwr','rwr..rwr','rrr..rrr','.n....n.','........','........'],
 norigae:['...yy...','..yrry..','...yy...','...rr...','..rrrr..','..rrrr..','..r.r.r.','.r..r..r'],
 binyeo:['......yy','.....yry','....yy..','...yy...','..yy....','.yy.....','yy......','........'],
 tuho:['.......x','......x.','..ooox..','.oyyyxo.','.oyyyyo.','.oyrryo.','.oyyyyo.','..oooo..'],
 yut:['.w..w...','.wo.wo..','.wo.wo.w','.wo.wo.w','.wo.wowo','.wo.wowo','.w..wowo','......w.'],
 yeon:['.wwwwww.','wbwwwwbw','wwbwwbww','wwwrrwww','wwbwwbww','wbwwwwbw','.wwwwww.','...nn...'],
 jegi:['..r.p...','..rbp...','...rp.g.','...rgg..','..yyy...','..ykky..','..yyyy..','........'],
 jupan:['oooooooo','o.y.k.yo','oooooooo','oy.k.y.o','oooooooo','o.k.y.ko','oooooooo','........'],
 yeopjeon:['..yyyy..','.yykkyy.','.yk..ky.','.yykkyy.','..yyyy..','...rr...','..r..r..','........'],
 jige:['o......o','o......o','oooooooo','o..nn..o','o.nnnn.o','oooooooo','o......o','o......o'],
 doe:['........','.oooooo.','.owwwwo.','.owwwwo.','.oooooo.','..oooo..','........','........'],
 jangbu:['bbbbbbb.','bwwwwwb.','bwkkkwb.','bwwwwwb.','bwkwkwb.','bwwwwwb.','bbbbbbb.','.y.y.y..'],
 jeondae:['........','.rrrrrr.','rryyyyrr','ryykkyyr','rryyyyrr','.rrrrrr.','..r..r..','........'],
 jeoul:['...n....','.xxnxx..','.x.n.x..','xx.n.xx.','...n....','...n....','.nnnnn..','........'],
 hwagwan:['.r.p.r..','rprprpr.','yyyyyyy.','y.....y.','........','........','........','........'],
 tteok:['........','..wwww..','.wwwwww.','wwgwwgww','wwwwwwww','.wwwwww.','........','........'],
 coin:['..yyyy..','.yyyyyy.','yyykkyyy','yyk..kyy','yyk..kyy','yyykkyyy','.yyyyyy.','..yyyy..'],
 chest:['.yyyyyy.','yrrrrrry','yrrrrrry','yyyyyyyy','yrryyrry','yrrrrrry','yrrrrrry','yyyyyyyy'],
 pouch:['...yy...','..rrrr..','.rrrrrr.','rrryyrrr','rryrryrr','rrrrrrrr','.rrrrrr.','........'],
 pot:['..nnnn..','.noooon.','noooooon','nonoonon','noooooon','noooooon','.noooon.','..nnnn..'],
 gukbap:['........','.wwwwww.','yywwwwyy','oooooooo','.oooooo.','..oooo..','........','........'],
 makgeolli:['...nn...','..oooo..','.oooooo.','owwwwwwo','owwwwwwo','oooooooo','.oooooo.','........'],
 santong:['..y.y...','..y.y.y.','.nnnnnn.','.nooooon','.nooooon','.nooooon','.nnnnnn.','........'],
 bottari:['...yy...','..b..b..','.bbbbbb.','bbwbbwbb','bbbbbbbb','bbbbbbbb','.bbbbbb.','........'],
};
const ICS={},ICON={};
for(const k in IR){ICS[k]=mk(IR[k]);ICON[k]=big(ICS[k],4);}

