import json, time, os, re, sys, glob, subprocess
"""Ringzeit build.
1. Assembles the readable app: src/index.html (markup + CSS) with, in place of its /*@@APP@@*/ line, the core
   modules bundled by esbuild (src/modules.js: src/core, src/catalog, src/sports -> one global `RZ`) followed by
   the ordered app parts src/app/*.js.  ->  build/ringzeit.html (readable; the tests run exactly this file)
2. Turns it into the installable app in pwa/ (index.html with app meta tags, manifest, service worker sw.js;
   CSS/JS minified with esbuild).
App id and name come from APP_ID / APP_NAME in the app source, so storage key, cache names, manifest and title
stay separate from the stable Ringzeit app on the same origin.
Usage: python3 tools/build_pwa.py              ->  upload pwa/index.html, pwa/sw.js, pwa/manifest.webmanifest
       python3 tools/build_pwa.py --readable   ->  only build/ringzeit.html"""
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
ESB=next((p for p in [os.path.join(ROOT,'node_modules','.bin','esbuild'),os.path.join(ROOT,'tools','fmt','node_modules','.bin','esbuild')] if os.path.exists(p)),'')
MARK='/*@@APP@@*/\n'
def esbuild(args,code=None):
    if not ESB: raise SystemExit('esbuild missing: run "npm install" in the repository folder')
    r=subprocess.run([ESB,*args],input=code,capture_output=True,text=True)
    if r.returncode: raise SystemExit(r.stderr)
    return r.stdout
def assemble():
    shell=open('src/index.html').read()
    if shell.count(MARK)!=1: raise SystemExit('src/index.html needs exactly one '+MARK.strip()+' line')
    core=''
    if os.path.exists('src/modules.js'):
        core=esbuild(['src/modules.js','--bundle','--format=iife','--global-name=RZ','--target=safari15','--charset=utf8','--legal-comments=none'])
    app=''.join(open(f).read() for f in sorted(glob.glob('src/app/*.js')))
    out=shell.replace(MARK,core+app)
    os.makedirs('build',exist_ok=True)
    open('build/ringzeit.html','w').write(out)
    return out
src=assemble()
if '--readable' in sys.argv:
    print('assembled build/ringzeit.html'); sys.exit(0)
SRC='build/ringzeit.html'
def const(name):
    m=re.search(r'const '+name+r' = "([^"]+)";',src)
    if not m: raise SystemExit(name+' not found in '+SRC)
    return m.group(1)
APP_ID=const('APP_ID'); APP_NAME=const('APP_NAME')
if not re.fullmatch(r'[a-z0-9-]+',APP_ID): raise SystemExit('APP_ID must be lowercase letters, digits and dashes')
DESC='Trainingsplaner für Kickboxen, Boxen und Taekwondo'
ver=time.strftime('%Y%m%d%H%M')
body=src.replace('const APP_VER = "dev";', 'const APP_VER = "'+time.strftime('%d.%m.%Y %H:%M')+'";').replace('<title>'+APP_NAME+'</title>\n','').replace('<meta name="claude:viewport-fit-sides" content="cover" />\n','')
head=f'''<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
<title>{APP_NAME}</title>
<meta name="description" content="{DESC}" />
<meta name="theme-color" content="#0b0c0f" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="{APP_NAME}" />
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
def mini(code,loader):
    return esbuild(['--minify','--loader='+loader,'--target=safari15'],code).strip()
if ESB:
    cs=body.index('<style>')+7; ce=body.index('</style>')
    body=body[:cs]+mini(body[cs:ce],'css')+body[ce:]
    js_s=body.rindex('<script>')+8; js_e=body.rindex('</script>')
    body=body[:js_s]+mini(body[js_s:js_e],'js')+body[js_e:]
os.makedirs('pwa',exist_ok=True)
open('pwa/index.html','w').write(head+body+tail)
man={"id":"./","name":APP_NAME,"short_name":APP_NAME,"description":DESC,"lang":"de","start_url":"./","scope":"./","display":"standalone","orientation":"portrait","background_color":"#0b0c0f","theme_color":"#0b0c0f",
 "icons":[{"src":"icon-192.png","sizes":"192x192","type":"image/png"},{"src":"icon-512.png","sizes":"512x512","type":"image/png"},{"src":"icon-maskable-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}]}
open('pwa/manifest.webmanifest','w').write(json.dumps(man,ensure_ascii=False,indent=2))
sw=f'''/* {APP_NAME} service worker: the app works offline; updates are fetched in the background and used on the next start.
   Only caches with this app's own prefix are touched: the stable Ringzeit app shares the origin and keeps its own caches. */
const PREFIX = "{APP_ID}-";
const CACHE = PREFIX + "{ver}";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png"];
self.addEventListener("install", (e) => {{
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
}});
self.addEventListener("activate", (e) => {{
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith(PREFIX) && k !== CACHE && !(PREFIX === "ringzeit-" && k.startsWith("ringzeit-dev-"))).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
}});
self.addEventListener("fetch", (e) => {{
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  // the app page itself ("./" or index.html): network first (so an update shows on the next start), the cached copy
  // offline or after 3 s. Other pages (e.g. installieren.html) are not the app and must never replace it in the cache.
  const path = new URL(e.request.url).pathname,
    appShell = path === new URL("./", location.href).pathname || path.endsWith("/index.html");
  if (e.request.mode === "navigate" && !appShell) {{
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request, {{ ignoreSearch: true }})));
    return;
  }}
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
