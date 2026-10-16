const $ = (id) => document.getElementById(id);
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
const definido = (v) => v && v !== 'POR DEFINIR';
document.documentElement.classList.add('js');

const fmtFecha = new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
const listaEs = new Intl.ListFormat('es', { type: 'conjunction' });
const iniciales = (n) => n.split(/\s+/).filter((w) => /^\p{Lu}/u.test(w)).map((w) => w[0]).join('').slice(0, 3);
// texto oscuro sobre colores claros, blanco sobre oscuros
const tintaSobre = (hex) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255); return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.5 ? 'var(--ink)' : '#fff'; };

let ev;

async function cargarEvento() {
  ev = await (await fetch('/evento.json')).json();
  document.title = `${ev.nombre} ${ev.anio}`;
  $('anio').textContent = ev.anio;
  $('lema').textContent = ev.lema;
  $('orgs').textContent = listaEs.format(ev.organizadores);
  if (definido(ev.juego)) $('juego').textContent = ev.juego;
  if (definido(ev.lugar)) $('lugar').textContent = ev.lugar;
  const fecha = ev.fecha ? new Date(ev.fecha) : null;
  if (fecha && !isNaN(fecha)) { $('fecha').textContent = fmtFecha.format(fecha); cuentaAtras(fecha); }

  const proxima = { anio: ev.anio, nombre: `${ev.nombre} ${ev.anio}`, juego: ev.juego, formato: definido(ev.jugadores) ? ev.jugadores : 'POR DEFINIR', proxima: true };
  const eds = [...(ev.ediciones || []), proxima];
  $('fixture').replaceChildren(...eds.map((e) => { const li = el('li'); li.append(el('b', '', String(e.anio)), ' ' + (e.proxima ? (definido(e.juego) ? e.juego : 'Por anunciar') : e.juego.replace(/ \(.*\)$/, ''))); return li; }));
  $('ediciones').replaceChildren(...eds.map(edicion));
  observar();
}

function edicion(e, i) {
  const li = el('li', 'edicion entra' + (e.proxima ? ' proxima' : '')); li.style.setProperty('--i', i % 2);
  const anio = el('time', 'anio', String(e.anio)); anio.dateTime = String(e.anio);
  const cuerpo = el('div', 'cuerpo');
  cuerpo.append(el('h3', '', e.nombre));
  const dl = el('dl', 'datos-ed');
  for (const [k, v] of [['Juego', e.juego], ['Formato', e.formato]]) {
    const fila = el('div'); fila.append(el('dt', '', k), definido(v) ? el('dd', '', v) : el('dd', 'pend', 'Por anunciar')); dl.append(fila);
  }
  cuerpo.append(dl);
  if (e.nota) cuerpo.append(el('p', 'nota-ed', e.nota));
  if ('ganador' in e) cuerpo.append(premio(e.foto, definido(e.ganador) ? `Campeón ${e.anio}: ${e.ganador}` : `Campeón ${e.anio}: por confirmar`));
  if (e.subcampeon) cuerpo.append(premio(e.subcampeon.foto, `Subcampeón ${e.anio}: ${e.subcampeon.nombre}`, 'sub'));
  if (e.partidos?.length) cuerpo.append(resultados(e));
  if (e.equipos?.length) cuerpo.append(draft(e));
  li.append(anio, cuerpo);
  return li;
}

function premio(foto, texto, extra = '') {
  const fig = el('figure', ('ganador ' + extra).trim());
  if (foto) {
    const img = el('img'); Object.assign(img, { src: foto.src, alt: foto.alt, width: foto.ancho, height: foto.alto, loading: 'lazy', decoding: 'async' });
    fig.classList.add(foto.ancho > foto.alto ? 'apaisada' : 'vertical'); fig.append(img);
  } else fig.append(el('div', 'hueco', 'Foto del campeón por subir'));
  fig.append(el('figcaption', '', texto));
  return fig;
}

function resultados(e) {
  const wrap = el('div', 'resultados');
  wrap.append(el('h4', '', `Resultados ${e.anio}`));
  const ul = el('ul'); ul.translate = false;
  for (const p of e.partidos) {
    const li = el('li');
    const local = el('span', p.gl > p.gv ? 'gana' : '', p.local), visita = el('span', p.gv > p.gl ? 'gana' : '', p.visita);
    li.append(local, el('b', 'marcador', `${p.gl}–${p.gv}`), visita); ul.append(li);
  }
  wrap.append(ul);
  return wrap;
}

// Tablero de equipos al estilo de un draft: número, nombre y un panel del color del equipo con borde inclinado.
function draft(e) {
  const wrap = el('div', 'draft');
  wrap.append(el('h4', '', `Los ${e.equipos.length} equipos de ${e.anio}`));
  const ol = el('ol'); ol.translate = false;
  e.equipos.forEach((q, i) => {
    const li = el('li', 'entra'); li.style.setProperty('--c', q.color); li.style.setProperty('--t', tintaSobre(q.color)); li.style.setProperty('--i', i);
    const nom = el('span', 'nom'); nom.append(el('b', '', q.nombre), el('small', '', q.integrantes?.length ? listaEs.format(q.integrantes) : 'Integrantes por confirmar'));
    const panel = el('span', 'panel', iniciales(q.nombre)); panel.setAttribute('aria-hidden', 'true');
    li.append(el('span', 'pick', String(i + 1)), nom, panel); ol.append(li);
  });
  wrap.append(ol);
  return wrap;
}

function cuentaAtras(fecha) {
  const c = $('cuenta'); c.hidden = false;
  const tick = () => {
    const s = Math.max(0, Math.floor((fecha - Date.now()) / 1000));
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
    c.textContent = s ? `Faltan ${d} días, ${h} h y ${m} min` : '¡Ya empezó!';
  };
  tick(); setInterval(tick, 30000);
}

let firma = '';
async function tabla() {
  try {
    const r = await fetch('/api/clasificacion', { cache: 'no-store' });
    if (!r.ok) throw new Error(r.status);
    const { clasificacion: filas, actualizado } = await r.json();
    const nueva = JSON.stringify(filas.map((f) => [f.id, f.total, f.pruebas]));
    if (nueva !== firma) {
      const antes = Object.fromEntries((firma ? JSON.parse(firma) : []).map(([id, t]) => [id, t]));
      firma = nueva;
      const ol = $('posiciones'); ol.replaceChildren();
      if (!filas.length) ol.append(el('li', 'vacia', `La tabla se abre cuando se armen los equipos de ${ev?.anio ?? 2027}.`));
      filas.forEach((f) => {
        const li = el('li'); li.style.setProperty('--c', f.color);
        if (f.id in antes && antes[f.id] !== f.total) li.classList.add('sube');
        const nom = el('span', 'nombre'); const b = el('b'); b.translate = false; b.append(el('i'), f.nombre);
        nom.append(b, `${f.posicion}.º lugar · ${f.total === 1 ? '1 punto' : f.total + ' puntos'}`);
        li.append(el('span', 'cifra', String(f.total)), el('span'), nom);
        ol.append(li);
      });
    }
    $('actualizado').textContent = 'Se actualiza sola. Última consulta: ' + new Date(actualizado).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
    $('vivo').classList.remove('off');
  } catch {
    $('actualizado').textContent = 'Sin conexión con la tabla. Reintentando…';
    $('vivo').classList.add('off');
  }
}

function observar() {
  if (!('IntersectionObserver' in window)) { document.querySelectorAll('.entra').forEach((n) => n.classList.add('visto')); return; }
  const io = new IntersectionObserver((xs) => xs.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('visto'); io.unobserve(x.target); } }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.entra:not(.visto)').forEach((n) => io.observe(n));
}

// Las piezas fijas de cada sección también entran escalonadas.
document.querySelectorAll('.gigante, .encabezado > *, .tarjeta > *').forEach((n) => {
  n.classList.add('entra'); n.style.setProperty('--i', [...n.parentElement.children].indexOf(n));
});
observar();

cargarEvento().then(tabla).catch(() => { $('ediciones').replaceChildren(el('li', 'nota', 'No se pudo cargar la historia. Recarga la página.')); });
setInterval(() => { if (!document.hidden) tabla(); }, 15000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) tabla(); });
