import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { crearServidor } from '../server.mjs';

const dir = mkdtempSync(path.join(tmpdir(), 'wons-'));
// evento de prueba propio: el real puede no tener equipos ni pruebas todavía
writeFileSync(path.join(dir, 'evento.json'), JSON.stringify({
  pruebas: [{ id: 'penales' }, { id: 'cuerda' }],
  equipos: [{ id: 'loleros', nombre: 'Los Loleros' }, { id: 'callampa', nombre: 'Callampa FC' }],
}));
const srv = crearServidor({ dataDir: dir, adminPassword: 'secreto' });
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${srv.address().port}`;
test.after(() => srv.close());

const auth = { Authorization: 'Bearer secreto', 'Content-Type': 'application/json' };
const post = (b, h = auth) => fetch(base + '/api/puntos', { method: 'POST', headers: h, body: JSON.stringify(b) });

test('rechaza sin contraseña o con contraseña errónea', async () => {
  assert.equal((await post({ prueba: 'penales', equipo: 'loleros', puntos: 5 }, {})).status, 401);
  assert.equal((await post({ prueba: 'penales', equipo: 'loleros', puntos: 5 }, { Authorization: 'Bearer mala' })).status, 401);
});
test('rechaza equipo, prueba o puntos inválidos', async () => {
  assert.equal((await post({ prueba: 'penales', equipo: 'nadie', puntos: 5 })).status, 400);
  assert.equal((await post({ prueba: 'x', equipo: 'loleros', puntos: 5 })).status, 400);
  assert.equal((await post({ prueba: 'penales', equipo: 'loleros', puntos: 1.5 })).status, 400);
  assert.equal((await post({ prueba: 'penales', equipo: 'loleros', puntos: 99999 })).status, 400);
});
test('suma y ordena la clasificación; permite deshacer', async () => {
  await post({ prueba: 'penales', equipo: 'loleros', puntos: 5 });
  await post({ prueba: 'cuerda', equipo: 'loleros', puntos: 3 });
  const r = await post({ prueba: 'penales', equipo: 'callampa', puntos: 10 });
  const { id } = await r.json();
  let c = (await (await fetch(base + '/api/clasificacion')).json()).clasificacion;
  assert.deepEqual([c[0].id, c[0].total, c[1].id, c[1].total], ['callampa', 10, 'loleros', 8]);
  assert.equal((await fetch(`${base}/api/puntos/${id}`, { method: 'DELETE', headers: auth })).status, 200);
  c = (await (await fetch(base + '/api/clasificacion')).json()).clasificacion;
  assert.deepEqual([c[0].id, c[0].total], ['loleros', 8]);
  assert.equal((await fetch(`${base}/api/puntos/${id}`, { method: 'DELETE' })).status, 401);
});
test('bloquea ../ y sirve el índice', async () => {
  const net = await import('node:net');
  for (const p of ['/../server.mjs', '/%2e%2e/server.mjs', '/..%2fdata/puntos.json']) {
    const res = await new Promise((ok) => {
      const s = net.connect(srv.address().port, '127.0.0.1', () => s.write(`GET ${p} HTTP/1.1\r\nHost: x\r\nConnection: close\r\n\r\n`));
      let d = ''; s.on('data', (c) => (d += c)); s.on('end', () => ok(d));
    });
    assert.doesNotMatch(res, /createHash|"puntos"|^HTTP\/1.1 200/);
  }
  assert.equal((await fetch(base + '/')).status, 200);
});
