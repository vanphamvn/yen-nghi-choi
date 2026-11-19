// Local-only test fixture server. Not a deployment or application server.
// Mirrors static-host behavior used by Netlify: /dir/ -> /dir/index.html, /dir -> 301 /dir/, misses -> 404.html (status 404).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const rootPrefix = root.endsWith(sep) ? root : root + sep;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.json': 'application/json' };
const send = (res, status, target, body) => res.writeHead(status, { 'Content-Type': types[extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store' }).end(body);
createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    const name = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    let target = resolve(root, name);
    if (target !== root.replace(/[\\/]$/, '') && !target.startsWith(rootPrefix)) { res.writeHead(403).end(); return; }
    if ((await stat(target)).isDirectory()) {
      if (!url.pathname.endsWith('/')) { res.writeHead(301, { Location: '/' + name.replace(/^\/+/, '').replace(/\/+$/, '') + '/' + url.search }).end(); return; }
      target = resolve(target, 'index.html');
    }
    send(res, 200, target, await readFile(target));
  } catch {
    try { send(res, 404, '404.html', await readFile(resolve(root, '404.html'))); }
    catch { res.writeHead(404).end('Not found'); }
  }
}).listen(Number(process.env.LAB_UX_PORT || 4189), '127.0.0.1');
