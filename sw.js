// เก็บแอป + ข้อมูลชุดล่าสุดไว้ในมือถือ: Mac ปิดก็ยังเปิดดูได้ (ทำงานเฉพาะลิงก์ https ของ Tailscale)
const CACHE = 'mon-v9';
// data.js มีเฉพาะบน Mac · data.enc.json มีเฉพาะบน GitHub Pages → ไฟล์ไหนไม่มีก็ข้าม
const SHELL = ['./', 'index.html', 'manifest.json', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'splash.jpg', 'mon-cat.jpg', 'data.js', 'data.enc.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(SHELL.map(u => fetch(u).then(r => r.ok && c.put(u, r)).catch(() => {}))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// ลองโหลดใหม่จาก Mac ก่อน ถ้าไม่ได้ (Mac ปิด/ไม่มีเน็ต) ใช้ของที่เก็บไว้
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request, {ignoreSearch: true}))
  );
});
