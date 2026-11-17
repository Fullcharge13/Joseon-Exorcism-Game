/* 조선퇴마록 오프라인 캐시: 게임 파일은 네트워크를 먼저 보고(새 판 반영), 안 되면 저장본으로. 글꼴은 저장본을 먼저. */
const CACHE='joseon-v21.1';
const CORE=['./','./index.html','./manifest.webmanifest','./docs/app/icon-180.png','./docs/app/icon-192.png','./docs/app/icon-512.png','./docs/app/icon-maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
const BGM_CACHE='jtm-bgm'; // v21.0 배경음은 판 번호와 따로(새 판이 나와도 다시 받지 않음 · 파일 이름의 지문이 바뀐 곡만 새로)
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==BGM_CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
    e.respondWith(caches.open(CACHE).then(c=>c.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok||res.type==='opaque')c.put(r,res.clone());return res;}).catch(()=>hit))));return;}
  if(u.origin!==location.origin)return;
  if(u.pathname.includes('/docs/assets/'))return; // v20.8 에셋 도감은 오프라인 캐시에 넣지 않음(수백 장이 캐시를 불리지 않게)
  if(u.pathname.includes('/audio/')&&u.pathname.endsWith('.mp3')){ // v21.0 배경음: 저장본 먼저, 없고 인터넷도 없으면 404(게임 화면을 돌려주지 않음)
    e.respondWith(caches.open(BGM_CACHE).then(c=>c.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res;}).catch(()=>new Response('',{status:404})))));return;}
  e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));}return res;}).catch(()=>caches.match(r).then(hit=>hit||caches.match('./index.html'))));});
