# Wonslimpiadas 2027

Sitio sin framework ni compilación + servidor Node sin dependencias (Node 18+) que guarda los puntos de la tabla en vivo.

- `public/index.html`: portada (la ficha del campeonato), pruebas, equipos y tabla en vivo.
- `public/admin.html` (`/admin`): panel para cargar y deshacer puntos. La contraseña la valida el servidor.
- `data/evento.json`: fecha, lugar, pruebas y equipos. Se edita en el repo (`fecha` en ISO, p. ej. `2027-03-20T10:00:00-03:00`; con fecha aparece la cuenta regresiva).
- `data/puntos.json`: lo escribe el servidor; no se versiona.
- `data/creditos-fotos.json`: origen y licencia de cada foto de `public/img/` (todas de archivo, ninguna es de los equipos).
- `server.mjs`: estáticos + `GET /api/clasificacion`, `GET|POST /api/puntos`, `DELETE /api/puntos/:id` (Bearer `ADMIN_PASSWORD`).

## Ejecutar en local
```bash
ADMIN_PASSWORD=clave node server.mjs   # http://127.0.0.1:8787 (PORT y HOST opcionales)
node --test
```

## Publicar en QA (192.168.1.170)
QA ya corre este servidor: el contenedor `wons-qa` (node:22-alpine) monta `/mnt/datos/wons/src` en `/app`, ejecuta `node server.mjs` y toma `ADMIN_PASSWORD` de `/mnt/datos/wons/secrets/qa.env`. Caddy publica `qa-wons.cinderlink.cl` (tras Authelia) hacia `127.0.0.1:3101`.

```bash
ssh nazdev@192.168.1.170
cd /mnt/datos/wons/src
git fetch origin && git checkout Nazdev-paginawons && git pull
systemctl --user restart wons-qa
```
`data/puntos.json` de QA no se toca: está fuera de git.

## Producción (pendiente)
`wons-prod` hoy es un Caddy estático sobre `/mnt/datos/wons/prod` (sitio anterior). La tabla en vivo necesita el servidor Node, así que producción debe pasar a la misma definición que `wons-qa` (otro puerto, `3102`, y su propio `secrets/prod.env`). Nunca subas la contraseña al repo.
