# TropelCare Control Room

Hackathon frontend para **TropelCare Control Room** — consola operativa en React + TypeScript para gestionar una colonia de criaturas digitales (Tropeles).

## Integrantes

- Jean Piere Milan Arana Chiong
- Itta Zhair Saavedra Clavijo
- Enrique Torres Chafloque

## Instalación

```bash
npm install
```

## Variables de entorno

| Variable               | Descripción                    |
|------------------------|--------------------------------|
| `VITE_API_BASE_URL`    | URL base de la API (con /api/v1) |
| `VITE_TEAM_CODE`       | Código del equipo (ej. TEAM-001) |
| `VITE_EMAIL`           | Email del operador             |
| `VITE_PASSWORD`        | Contraseña del equipo          |

Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_API_BASE_URL=https://<backend-url>/api/v1
VITE_TEAM_CODE=TEAM-0XX
VITE_EMAIL=operator@tuckersoft.com
VITE_PASSWORD=<password>
```

## Comandos

| Comando               | Acción                       |
|-----------------------|------------------------------|
| `npm run dev`         | Iniciar servidor de desarrollo |
| `npm run build`       | Compilar para producción      |
| `npm run typecheck`   | Verificar tipos de TypeScript |

## Deploy

[![Vercel](https://img.shields.io/badge/deploy-vercel-blue)](https://hackaton-2-template.vercel.app)

La aplicación está desplegada en Vercel: [https://hackaton-2-template.vercel.app](https://hackaton-2-template.vercel.app)

## Decisiones técnicas

- **Stack:** React 19 + TypeScript 6 + Vite 8 + React Router 7 + Axios + Tailwind CSS 4
- **Autenticación:** JWT almacenado en `sessionStorage`, restauración con `/auth/me`
- **Paginación de Tropeles:** Server-side con filtros sincronizados en URL. Protección contra respuestas obsoletas con flag `cancelled`
- **Feed de Señales:** Cursor-based con `IntersectionObserver` para carga automática. Deduplicación por ID. Posición preservada en `sessionStorage` al navegar al detalle
- **Actualización de estado:** Cache del feed sincronizado vía `sessionStorage` para reflejar cambios al volver
- **Sector Story:** Scroll-driven animations CSS (`animation-timeline: scroll()`) con fallback basado en `IntersectionObserver`. View Transition API con fallback a navegación normal. Navegación por teclado con flechas. Soporte `prefers-reduced-motion`
- **No se usan:** Material UI, React Query, TanStack Query, librerías de infinite scroll, `any` en respuestas de API
