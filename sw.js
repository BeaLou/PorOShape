// Service worker: guarda os arquivos do app para abrir offline.
// Estratégia: tenta a rede primeiro (para receber atualizações) e cai no cache se estiver sem internet.
const VERSION='por-o-shape-v1';
const ASSETS=['./','./index.html','./css/styles.css','./js/app.js','./js/util.js','./js/plan.js','./js/store.js','./js/charts.js','./manifest.webmanifest','./icons/icon.svg','./icons/icon-192.png','./icons/icon-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(VERSION).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('por-o-shape-')&&k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith(
    fetch(r).then(res=>{
      if(res.ok){const copy=res.clone();caches.open(VERSION).then(c=>c.put(r,copy))}
      return res;
    }).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html')))
  );
});
