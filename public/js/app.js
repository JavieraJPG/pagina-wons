const $ = (id) => document.getElementById(id);
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
const definido = (v) => v && v !== 'POR DEFINIR';
document.documentElement.classList.add('js');

const fmtFecha = new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
const listaEs = new Intl.ListFormat('es', { type: 'conjunction' });
const ALTOS = ['38svh', '30svh', '44svh', '27svh', '40svh', '33svh', '42svh']; // planillas de distinta altura, como papeles sueltos

let ev;

async function cargarEvento() {
  ev = await (await fetch('/evento.json')).json();
  document.title = `${ev.nombre} ${ev.anio}`;
  $('anio').textContent = ev.anio;
  $('lema').textContent = ev.lema;
  $('orgs').textContent = listaEs.format(ev.organizadores);
  $('n-equipos').textContent = ev.equipos.length;
  $('n-pruebas').textContent = ev.pruebas.length;
  $('fixture').replaceChildren(...ev.equipos.map((e) => el('li', '', e.nombre)));
  if (definido(ev.lugar)) $('lugar').textContent = ev.lugar;
  const fecha = ev.fecha ? new Date(ev.fecha) : null;
  if (fecha && !isNaN(fecha)) { $('fecha').textContent = fmtFecha.format(fecha); cuentaAtras(fecha); }

  const barras = $('lista-pruebas'); barras.replaceChildren();
  ev.pruebas.forEach((p, i) => {
    const d = el('details', 'entra'); d.style.setProperty('--i', i); if (i === 0) d.open = true;
    d.append(el('summary', '', p.nombre));
    const dl = el('dl');
    for (const [k, v] of [['Horario', p.horario], ['Formato', p.formato], ['Puntos', p.puntos]]) {
      if (v == null) continue;
      const fila = el('div'); fila.append(el('dt', '', k));
      fila.append(definido(v) ? el('dd', '', v) : el('dd', 'pend', 'Por confirmar'));
      dl.append(fila);
    }
    d.append(dl); barras.append(d);
  });

  const ul = $('planillas'); ul.replaceChildren();
  ev.equipos.forEach((e, i) => {
    const li = el('li', 'planilla entra'); li.id = 'planilla-' + e.id;
    li.style.setProperty('--c', e.color); li.style.setProperty('--alto', ALTOS[i % ALTOS.length]); li.style.setProperty('--i', i);
    li.append(el('h3', '', e.nombre), el('p', 'corte', '- '.repeat(40)));
    li.append(el('p', 'gente', e.integrantes.length ? listaEs.format(e.integrantes) : 'Integrantes por confirmar'));
    const pts = el('ul');
    for (const p of ev.pruebas) { const r = el('li'); r.append(el('span', '', p.nombre), el('b', '', '0')); r.dataset.prueba = p.id; pts.append(r); }
    li.append(pts); ul.append(li);
  });
  observar();
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
      filas.forEach((f) => {
        const li = el('li'); li.style.setProperty('--c', f.color);
        if (f.id in antes && antes[f.id] !== f.total) li.classList.add('sube');
        const nom = el('span', 'nombre'); const b = el('b'); b.translate = false; b.append(el('i'), f.nombre);
        nom.append(b, `${f.posicion}.º lugar · ${f.total === 1 ? '1 punto' : f.total + ' puntos'}`);
        li.append(el('span', 'cifra', String(f.total)), el('span'), nom);
        ol.append(li);
        const pl = document.getElementById('planilla-' + f.id);
        if (pl) for (const r of pl.querySelectorAll('li[data-prueba]')) r.querySelector('b').textContent = f.pruebas[r.dataset.prueba] || 0;
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
document.querySelectorAll('.gigante, .lamina, .texto h2, .texto p, .encabezado > *, .tarjeta > *').forEach((n) => {
  n.classList.add('entra'); n.style.setProperty('--i', [...n.parentElement.children].indexOf(n));
});
observar();

cargarEvento().then(tabla).catch(() => { $('lista-pruebas').replaceChildren(el('p', 'nota', 'No se pudieron cargar las pruebas. Recarga la página.')); });
setInterval(() => { if (!document.hidden) tabla(); }, 15000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) tabla(); });
