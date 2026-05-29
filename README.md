# ChurchFlow BackOffice

Panel de administración de plataforma para ChurchOps: clientes (tenants), membresías, pagos, soporte, salud del sistema y auditoría.

## Requisitos

- Node.js 18+
- API ChurchOps con endpoint `/platform/graphql` desplegado y accesible

## Configuración

Copia `.env.example` a `.env`:

```env
VITE_PLATFORM_API_URL=http://localhost:4000/platform/graphql
```

## Desarrollo

```bash
npm install
npm run dev
```

Abre http://localhost:5175 — credenciales definidas en el backend (`PLATFORM_ADMIN_*`).

## Build

```bash
npm run build
```

## Deploy (Vercel)

1. Importa este repositorio en [Vercel](https://vercel.com).
2. Framework: **Vite**, Output: `dist`.
3. Variable de entorno: `VITE_PLATFORM_API_URL` = URL pública de tu API + `/platform/graphql`.
4. En el backend, añade la URL de Vercel a `CORS_ORIGIN`.

Ver [DEPLOY.md](./DEPLOY.md) para más detalle.

## Estructura

- `src/pages/` — Dashboard, clientes, pagos, soporte, sistema, auditoría
- `src/graphql/` — Operaciones Apollo contra la API de plataforma
