const $ = (id) => document.getElementById(id);
let clave = sessionStorage.getItem('wons-clave') || '';
let ev;
const msg = (t, err) => { $('msg').textContent = t; $('msg').className = 'msg' + (err ? ' err' : ''); };
const api = (url, opts = {}) => fetch(url, { ...opts, headers: { Authorization: 'Bearer ' + clave, 'Content-Type': 'application/json' } });
const nombre = (lista, id) => (lista.find((x) => x.id === id) || { nombre: id }).nombre;

async function historial() {
  const r = await api('/api/puntos');
  if (r.status === 401) { clave = ''; sessionStorage.removeItem('wons-clave'); $('panel').hidden = true; $('login').hidden = false; msg('Contraseña incorrecta.', true); return false; }
  const { puntos } = await r.json();
  const ul = $('hist'); ul.replaceChildren();
  for (const p of puntos.slice(-15).reverse()) {
    const li = document.createElement('li');
    const t = document.createElement('span');
    t.textContent = `${nombre(ev.equipos, p.equipo)} · ${nombre(ev.pruebas, p.prueba)} · ${p.puntos > 0 ? '+' : ''}${p.puntos}`;
    const b = document.createElement('button'); b.className = 'sec'; b.type = 'button'; b.textContent = 'Deshacer';
    b.onclick = async () => {
      b.disabled = true;
      const d = await api('/api/puntos/' + p.id, { method: 'DELETE' }).catch(() => null);
      msg(d?.ok ? 'Carga deshecha.' : 'No se pudo deshacer. Revisa la conexión e inténtalo de nuevo.', !d?.ok); historial().catch(() => {});
    };
    li.append(t, b); ul.append(li);
  }
  return true;
}

async function entrar() {
  if (!ev) {
    ev = await (await fetch('/evento.json')).json();
    for (const [id, lista] of [['prueba', ev.pruebas], ['equipo', ev.equipos]])
      for (const x of lista) { const o = document.createElement('option'); o.value = x.id; o.textContent = x.nombre; $(id).append(o); }
  }
  if (await historial()) { $('login').hidden = true; $('panel').hidden = false; msg(''); }
}

$('login').onsubmit = (e) => { e.preventDefault(); clave = $('clave').value; sessionStorage.setItem('wons-clave', clave); entrar().catch(sinRed); };
$('form').onsubmit = async (e) => {
  e.preventDefault();
  const boton = $('form').querySelector('button'); boton.disabled = true; // evita cargar dos veces con doble clic
  try {
    const r = await api('/api/puntos', { method: 'POST', body: JSON.stringify({ prueba: $('prueba').value, equipo: $('equipo').value, puntos: Number($('puntos').value) }) });
    if (r.ok) { msg('Puntos cargados.'); $('puntos').value = ''; historial(); }
    else msg((await r.json().catch(() => ({}))).error || 'No se pudo cargar. Inténtalo de nuevo.', true);
  } catch { sinRed(); } finally { boton.disabled = false; }
};
$('salir').onclick = () => { sessionStorage.removeItem('wons-clave'); location.reload(); };
const sinRed = () => msg('Sin conexión con el servidor. Revisa la red y vuelve a intentarlo.', true);
if (clave) entrar().catch(sinRed);
