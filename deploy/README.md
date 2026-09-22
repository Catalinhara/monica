# Despliegue — www.enigmademonica.es

Stack: **Docker** (Next.js en `127.0.0.1:3847`) + **Caddy** (HTTPS / reverse proxy).  
No usa Nginx; no toca los otros sitios de la misma VPS.

## 1. DNS (Hostinger)

Apunta a la IP pública de la VPS:

| Tipo | Nombre | Valor        |
|------|--------|--------------|
| A    | `@`    | IP de la VPS |
| A    | `www`  | IP de la VPS |

Espera a que propaguen (a veces minutos, a veces horas).

## 2. Subir el proyecto

Ejemplo:

```bash
# En la VPS
sudo mkdir -p /opt/romantic-journey
# Desde tu PC (ajusta usuario/host):
rsync -avz --exclude node_modules --exclude .next ./ user@VPS_IP:/opt/romantic-journey/
```

O clona el repo si está en git.

## 3. Arrancar Docker

Requisitos: Docker Engine + plugin Compose.

```bash
cd /opt/romantic-journey
docker compose up -d --build
docker compose ps
curl -sI http://127.0.0.1:3847/monica
```

Deberías ver una respuesta HTTP (200/307/308). El puerto **3847 solo escucha en localhost**.

## 4. Caddy (sin tocar otros proyectos)

1. Abre el Caddyfile que ya usas (p. ej. `/etc/caddy/Caddyfile`).
2. **Al final**, pega el contenido de [`Caddyfile.snippet`](./Caddyfile.snippet).
3. Valida y recarga:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
# o: sudo caddy reload --config /etc/caddy/Caddyfile
```

Caddy pedirá el certificado Let’s Encrypt solo para `enigmademonica.es` / `www`.

## 5. Comprobar

- https://www.enigmademonica.es → debería ir a `/monica`
- https://enigmademonica.es → redirect 301 a `www`
- https://www.enigmademonica.es/admin → editor (proteger después si hace falta)

## Actualizar

```bash
cd /opt/romantic-journey
# rsync / git pull
docker compose up -d --build
```

Los volúmenes (`content/`, `public/assets`, etc.) conservan `monica.json` y media entre rebuilds.

## Qué no hacer

- No bind `0.0.0.0:3847`
- No añadir rutas `/monica` dentro de otro dominio de Caddy
- No instalar Nginx en 80/443
- No editar los site blocks de los otros dos proyectos
