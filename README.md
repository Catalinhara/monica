# Romantic Journey

Experiencia web interactiva romántica (player + admin editor) construida con Next.js.

## Stack

| Área | Tecnología |
|------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript, Tailwind CSS 4 |
| Animación | Framer Motion, GSAP |
| Estado | Zustand |
| Persistencia V1 | LocalStorage / JSON (`content/`) |
| Tests | Vitest + Testing Library, Playwright |

## Estructura

```
src/
  app/           # Rutas: / (hub), /play, /admin
  engine/        # Experience Engine (Fase 1+)
  types/         # Modelos Level, Experience, Scene…
  stores/        # Zustand (progreso, etc.)
  lib/           # Utilidades (storage…)
  components/    # UI compartida / player / admin
content/
  experiences/   # Configuración JSON de experiencias
e2e/             # Playwright
```

## Scripts

```bash
npm run dev          # desarrollo (Webpack; Turbopack bloqueado en este entorno Windows)
npm run build        # producción
npm run test         # Vitest
npm run test:e2e     # Playwright (requiere: npx playwright install)
npm run lint
```

## Fases

0. Scaffold — hecho
1. Experience Engine — hecho
2. Visual System — hecho
3. First Experience — hecho
4. Admin Editor — draft/publish/preview + CMS local
5. Polish

Ver checklist manual: [TEST_PLAN.md](./TEST_PLAN.md)

## Documentación de origen

Los requisitos y la arquitectura viven junto a este proyecto:

- `../Romantic Journey — Especificación funcional.pdf`
- `../mind-project-54b7d8c8-export.json`
