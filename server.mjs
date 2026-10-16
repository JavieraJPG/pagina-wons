// Servidor de Wonslimpiadas: estáticos + API de clasificación. Sin dependencias (Node 18+).
import http from 'node:http';
import { readFile, writeFile, rename } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { createHash, timingSafeEqual, randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(RAIZ, 'public');
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};
const MAX_PUNTOS = 1000;
const MAX_CUERPO = 4096;

export function crearServidor({ dataDir = path.join(RAIZ, 'data'), adminPassword = process.env.ADMIN_PASSWORD } = {}) {
  const archivoEvento = path.join(dataDir, 'evento.json');
  const archivoPuntos = path.join(dataDir, 'puntos.json');
  let evento = JSON.parse(readFileSync(archivoEvento, 'utf8'));
  let cola = Promise.resolve(); // serializa escrituras

  const cargarPuntos = async () => {
    try { return JSON.parse(await readFile(archivoPuntos, 'utf8')); }
    catch (e) { if (e.code === 'ENOENT') return []; throw e; }
  };
  const guardarPuntos = async (lista) => {
    const tmp = archivoPuntos + '.tmp';
    await writeFile(tmp, JSON.stringify(lista, null, 2));
    await rename(tmp, archivoPuntos);
  };
  const enCola = (fn) => (cola = cola.then(fn, fn));

  const json = (res, code, obj) => {
    res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(obj));
  };
  const hash = (s) => createHash('sha256').update(s).digest();
  const autorizado = (req) => {
    if (!adminPassword) return false;
    const m = /^Bearer (.+)$/.exec(req.headers.authorization || '');
    return !!m && timingSafeEqual(hash(m[1]), hash(adminPassword));
  };
  const leerCuerpo = (req) => new Promise((ok, fail) => {
    let n = 0; const partes = [];
    req.on('data', (c) => { n += c.length; if (n > MAX_CUERPO) { fail(new Error('grande')); req.destroy(); } else partes.push(c); });
    req.on('end', () => { try { ok(JSON.parse(Buffer.concat(partes).toString() || '{}')); } catch { fail(new Error('json')); } });
    req.on('error', fail);
  });

  async function clasificacion() {
    const puntos = await cargarPuntos();
    const filas = evento.equipos.map((e) => ({ id: e.id, nombre: e.nombre, color: e.color, total: 0, pruebas: {} }));
    const porId = Object.fromEntries(filas.map((f) => [f.id, f]));
    for (const p of puntos) {
      const f = porId[p.equipo]; if (!f) continue;
      f.total += p.puntos;
      f.pruebas[p.prueba] = (f.pruebas[p.prueba] || 0) + p.puntos;
    }
    filas.sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre, 'es'));
    let pos = 0, prev = null;
    filas.forEach((f, i) => { if (f.total !== prev) { pos = i + 1; prev = f.total; } f.posicion = pos; });
    return { actualizado: new Date().toISOString(), clasificacion: filas };
  }

  async function api(req, res, url) {
    if (req.method === 'GET' && url.pathname === '/api/clasificacion') return json(res, 200, await clasificacion());
    if (req.method === 'GET' && url.pathname === '/api/puntos') {
      if (!autorizado(req)) return json(res, 401, { error: 'No autorizado' });
      return json(res, 200, { puntos: await cargarPuntos() });
    }
    if (req.method === 'POST' && url.pathname === '/api/puntos') {
      if (!autorizado(req)) return json(res, 401, { error: 'No autorizado' });
      let b; try { b = await leerCuerpo(req); } catch { return json(res, 400, { error: 'Cuerpo inválido' }); }
      if (!evento.pruebas.some((p) => p.id === b.prueba)) return json(res, 400, { error: 'Prueba inexistente' });
      if (!evento.equipos.some((e) => e.id === b.equipo)) return json(res, 400, { error: 'Equipo inexistente' });
      if (!Number.isInteger(b.puntos) || Math.abs(b.puntos) > MAX_PUNTOS || b.puntos === 0) return json(res, 400, { error: 'Puntos inválidos' });
      const reg = { id: randomUUID(), prueba: b.prueba, equipo: b.equipo, puntos: b.puntos, fecha: new Date().toISOString() };
      await enCola(async () => { const l = await cargarPuntos(); l.push(reg); await guardarPuntos(l); });
      return json(res, 201, reg);
    }
    const del = /^\/api\/puntos\/([\w-]+)$/.exec(url.pathname);
    if (req.method === 'DELETE' && del) {
      if (!autorizado(req)) return json(res, 401, { error: 'No autorizado' });
      let hallado = false;
      await enCola(async () => {
        const l = await cargarPuntos(); const n = l.filter((p) => p.id !== del[1]);
        hallado = n.length !== l.length; if (hallado) await guardarPuntos(n);
      });
      return hallado ? json(res, 200, { ok: true }) : json(res, 404, { error: 'No existe' });
    }
    return json(res, 404, { error: 'No encontrado' });
  }

  async function estatico(req, res, url) {
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
    let ruta;
    try { ruta = decodeURIComponent(url.pathname); } catch { res.writeHead(400); return res.end(); }
    if (ruta.includes('\0')) { res.writeHead(400); return res.end(); }
    if (ruta === '/evento.json') ruta = '/__evento';
    if (ruta.endsWith('/')) ruta += 'index.html';
    if (ruta === '/admin') ruta = '/admin.html';
    let archivo;
    if (ruta === '/__evento') archivo = archivoEvento;
    else {
      archivo = path.join(PUBLIC, ruta);
      if (archivo !== PUBLIC && !archivo.startsWith(PUBLIC + path.sep)) { res.writeHead(403); return res.end('Prohibido'); }
    }
    try {
      const datos = await readFile(archivo);
      res.writeHead(200, {
        'Content-Type': TIPOS[path.extname(archivo)] || 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': archivo === archivoEvento ? 'no-cache' : 'public, max-age=300',
      });
      res.end(req.method === 'HEAD' ? undefined : datos);
    } catch { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('No encontrado'); }
  }

  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://x');
      if (url.pathname.startsWith('/api/')) await api(req, res, url);
      else await estatico(req, res, url);
    } catch (e) {
      console.error(e);
      if (!res.headersSent) json(res, 500, { error: 'Error interno' }); else res.end();
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (!process.env.ADMIN_PASSWORD) console.warn('ADMIN_PASSWORD no definida: el panel quedará bloqueado.');
  const puerto = Number(process.env.PORT) || 8787;
  crearServidor().listen(puerto, process.env.HOST || '127.0.0.1', () => console.log(`Wonslimpiadas en :${puerto}`));
}
