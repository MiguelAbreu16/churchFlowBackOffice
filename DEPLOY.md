# Desplegar BackOffice y obtener link de prueba

## Opción A — Local (más rápido, ~2 min)

### 1. Base de datos

```bash
docker compose up -d postgres
```

Asegúrate en `backend/.env` que `DB_PORT=5434` (puerto del compose).

### 2. Variables backend (`backend/.env`)

```env
PLATFORM_JWT_SECRET=dev-platform-secret-minimum-32-characters
PLATFORM_ADMIN_EMAIL=admin@churchops.local
PLATFORM_ADMIN_PASSWORD=Admin123!
PLATFORM_ADMIN_NAME=Platform Admin
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173,http://localhost:5175
```

### 3. Arrancar

```bash
# Terminal 1
npm run backend

# Terminal 2 (primera vez)
npm run seed:platform --workspace=backend

# Terminal 3 — crea backoffice/.env:
# VITE_PLATFORM_API_URL=http://localhost:4000/platform/graphql
npm run backoffice
```

### Link local

**http://localhost:5175/login**

| Campo | Valor |
|-------|--------|
| Email | `admin@churchops.local` |
| Password | `Admin123!` |

---

## Opción B — Vercel (link público HTTPS)

### Requisito

La API debe ser **pública** (Railway, Render, o túnel). El backoffice en el navegador no puede llamar a `localhost:4000` desde otro dispositivo.

### 1. Desplegar API (ej. Railway)

- Root: `backend`
- Start: `npm run start` o `ts-node src/index.ts`
- Variables: `DB_*`, `JWT_SECRET`, `PLATFORM_*`, `CORS_ORIGIN` (incluye URL de Vercel)

### 2. Desplegar BackOffice en Vercel

En [vercel.com](https://vercel.com) → Import repo → **Root Directory: `backoffice`**

Variables de entorno en Vercel:

| Variable | Ejemplo |
|----------|---------|
| `VITE_PLATFORM_API_URL` | `https://tu-api.railway.app/platform/graphql` |

O desde CLI (en la raíz del repo):

```bash
cd backoffice
npx vercel --prod
```

### 3. CORS

En el backend, añade la URL de Vercel a `CORS_ORIGIN`:

```env
CORS_ORIGIN=https://tu-backoffice.vercel.app,http://localhost:5175
```

---

## Opción C — Demo pública con túnel (API local + BO en Vercel)

Si la API sigue en tu PC:

```bash
npx localtunnel --port 4000
```

Usa la URL HTTPS que devuelve (ej. `https://xyz.loca.lt`) en Vercel:

```env
VITE_PLATFORM_API_URL=https://xyz.loca.lt/platform/graphql
```

Y en `backend/.env`:

```env
CORS_ORIGIN=https://tu-backoffice.vercel.app,https://xyz.loca.lt
```

---

## Health check público

```bash
curl http://localhost:4000/health
```
