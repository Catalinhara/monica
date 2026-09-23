# Despliegue — www.enigmademonica.es

Stack: **Docker** (Next.js) + **Caddy de Artizanale** (`artizanale-caddy`) como reverse proxy HTTPS.  
Mismo patrón que `charad.dev`: el contenedor se une a la red `artizanale_default`.

## 1. DNS (IONOS)

| Tipo | Nombre | Valor           |
|------|--------|-----------------|
| A    | `@`    | `77.37.121.113` |
| A    | `www`  | `77.37.121.113` |

Servidores DNS de IONOS. SSL de IONOS no hace falta (Caddy / Let’s Encrypt).

## 2. Clonar / actualizar

```bash
cd /opt
git clone https://github.com/Catalinhara/monica.git romantic-journey
# o:
cd /opt/romantic-journey && git pull
```

## 3. Arrancar

```bash
cd /opt/romantic-journey
docker compose up -d --build
docker compose ps
curl -sI http://127.0.0.1:3847/monica
```

`docker-compose.yml` une `enigmademonica` a `artizanale_default` automáticamente.

## 4. Caddy (solo la primera vez)

Añade al **final** de `/opt/artizanale/deploy/Caddyfile` el contenido de [`Caddyfile.snippet`](./Caddyfile.snippet) (sin tocar artizanale/charad), luego:

```bash
docker exec artizanale-caddy caddy validate --config /etc/caddy/Caddyfile
docker exec artizanale-caddy caddy reload --config /etc/caddy/Caddyfile
```

## 5. Comprobar

- https://www.enigmademonica.es → `/monica`
- https://enigmademonica.es → redirect a `www`

## Actualizar (después de cada push)

```bash
cd /opt/romantic-journey
git pull
docker compose up -d --build
```

Si ves **502** / “lookup enigmademonica”, el contenedor no está en la red de Caddy:

```bash
docker network connect artizanale_default enigmademonica
```

(Con el compose actual no debería hacer falta tras cada rebuild.)

## Qué no hacer

- No bind `0.0.0.0:3847`
- No instalar Nginx en 80/443
- No editar los site blocks de artizanale/charad
