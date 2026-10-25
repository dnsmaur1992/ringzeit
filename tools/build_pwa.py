import json, time, os, re
"""Ringzeit build: turns the readable source (src/ringzeit.html) into the installable app in pwa/
(index.html with app meta tags, manifest, service worker sw.js; CSS/JS minified when esbuild is available).
Usage: python3 tools/build_pwa.py [path/to/ringzeit.html]  ->  upload pwa/index.html and pwa/sw.js"""
import sys
SRC=next(p for p in (sys.argv[1:]+['src/ringzeit.html','/home/claude/ringzeit.html']) if os.path.exists(p))
src=open(SRC).read()
ver=time.strftime('%Y%m%d%H%M')
body=src.replace('const APP_VER = "dev";', 'const APP_VER = "'+time.strftime('%d.%m.%Y %H:%M')+'";').replace('<title>Ringzeit</title>\n','').replace('<meta name="claude:viewport-fit-sides" content="cover" />\n','')
head=f'''<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
<title>Ringzeit</title>
<meta name="description" content="Trainingsplaner für Kickboxen nach WAKO-Regeln" />
<meta name="theme-color" content="#0b0c0f" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Ringzeit" />
<link rel="manifest" href="manifest.webmanifest" />
<link rel="apple-touch-icon" href="icon-180.png" />
<link rel="icon" type="image/png" sizes="192x192" href="icon-192.png" />
<style>html,body{{margin:0;background:#0b0c0f}}[hidden]{{display:none!important}}</style>
</head>
<body>
'''
tail=f'''
<script>
  /* Offline use and local data: service worker caches the app; persistent storage keeps the data on this device */
  if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {{}}));
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {{}});
</script>
</body>
</html>
'''
# minify the app's CSS and JS for a smaller, faster download (the source stays readable)
import subprocess
ESB=next((p for p in [os.path.join(os.path.dirname(os.path.abspath(__file__)),'fmt','node_modules','.bin','esbuild'),'node_modules/.bin/esbuild'] if os.path.exists(p)),'')
def mini(code,loader):
    r=subprocess.run([ESB,'--minify','--loader='+loader,'--target=safari15'],input=code,capture_output=True,text=True)
    if r.returncode: raise SystemExit(r.stderr)
    return r.stdout.strip()
if ESB:
    cs=body.index('<style>')+7; ce=body.index('</style>')
    body=body[:cs]+mini(body[cs:ce],'css')+body[ce:]
    js_s=body.rindex('<script>')+8; js_e=body.rindex('</script>')
    body=body[:js_s]+mini(body[js_s:js_e],'js')+body[js_e:]
os.makedirs('pwa',exist_ok=True)
open('pwa/index.html','w').write(head+body+tail)
man={"name":"Ringzeit","short_name":"Ringzeit","description":"Trainingsplaner für Kickboxen nach WAKO-Regeln","lang":"de","start_url":"./","scope":"./","display":"standalone","orientation":"portrait","background_color":"#0b0c0f","theme_color":"#0b0c0f",
 "icons":[{"src":"icon-192.png","sizes":"192x192","type":"image/png"},{"src":"icon-512.png","sizes":"512x512","type":"image/png"},{"src":"icon-maskable-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}]}
open('pwa/manifest.webmanifest','w').write(json.dumps(man,ensure_ascii=False,indent=2))
sw=f'''/* Ringzeit service worker: the app works offline; updates are fetched in the background and used on the next start */
const CACHE = "ringzeit-{ver}";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png"];
self.addEventListener("install", (e) => {{
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
}});
self.addEventListener("activate", (e) => {{
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
}});
self.addEventListener("fetch", (e) => {{
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  // the app page itself: network first (so an update shows on the next start), the cached copy offline or after 3 s
  if (e.request.mode === "navigate") {{
    e.respondWith(
      caches.open(CACHE).then((c) => {{
        const net = fetch(e.request).then((r) => {{
          if (r && r.ok) c.put("index.html", r.clone());
          return r;
        }});
        const slow = new Promise((res) => setTimeout(res, 3000));
        return Promise.race([net, slow.then(() => c.match("index.html"))])
          .then((r) => r || net)
          .catch(() => c.match("index.html", {{ ignoreSearch: true }}));
      }}),
    );
    return;
  }}
  e.respondWith(
    caches.open(CACHE).then((c) =>
      c.match(e.request, {{ ignoreSearch: true }}).then((hit) => {{
        const net = fetch(e.request)
          .then((r) => {{
            if (r && r.ok) c.put(e.request, r.clone());
            return r;
          }})
          .catch(() => hit);
        return hit || net;
      }}),
    ),
  );
}});
'''
open('pwa/sw.js','w').write(sw)
print('built',ver,os.listdir('pwa'))
