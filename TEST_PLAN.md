# Plan de pruebas — Romantic Journey

Checklist manual por fase. Marca cada ítem al validarlo en local (`npm run dev` → http://localhost:3000).

---

## Fase 0 — Scaffold

| # | Prueba | Resultado esperado |
|---|--------|--------------------|
| 0.1 | `npm run dev` arranca sin error | Servidor en `:3000` |
| 0.2 | Abrir `/` | Hub con título Romantic Journey + 2 enlaces |
| 0.3 | Clic en Player Experience | Navega a `/play` |
| 0.4 | Clic en Admin Editor | Navega a `/admin` |
| 0.5 | `npm run test` | Vitest pasa |
| 0.6 | `npm run build` | Build OK |

---

## Fase 1 — Experience Engine

| # | Prueba | Resultado esperado |
|---|--------|--------------------|
| 1.1 | Abrir `/play` | Mapa con 3 niveles; solo el 0 disponible |
| 1.2 | Intentar nivel bloqueado | Botón deshabilitado / no entra |
| 1.3 | Entrar en Level 0 | Primera escena visible + barra de escenas |
| 1.4 | Continuar / Atrás | Avanza y retrocede entre escenas con transición |
| 1.5 | Completar Level 0 | Vuelve al mapa; Level 1 desbloqueado; progreso ~33% |
| 1.6 | Completar Level 1 y 2 | Pantalla de recorrido demo completado |
| 1.7 | Refrescar tras completar un nivel | Progreso persistido (LocalStorage) |
| 1.8 | Reiniciar progreso | Todo vuelve a locked salvo Level 0 |
| 1.9 | `npm run test` | Incluye tests del engine |

**Datos de prueba:** `content/experiences/demo.json` (3 niveles, solo texto).

---

## Fase 2 — Visual System

| # | Prueba | Resultado esperado |
|---|--------|--------------------|
| 2.1 | `/` y `/play` usan tipografía del sistema visual | No stack por defecto genérico; display + body definidos |
| 2.2 | Tokens CSS (colores, spacing, radios) aplicados | Tema coherente en hub, mapa y player |
| 2.3 | Botones primarios / secundarios / ghost | Estilos consistentes y estados hover/disabled |
| 2.4 | Fondos con atmósfera | Gradiente/patrón sutil, no flat único |
| 2.5 | Cambiar tema en config demo (si aplica) | UI refleja el tema sin tocar componentes |
| 2.6 | Mobile (~375px) y desktop | Layout legible; player mobile-first |
| 2.7 | Transiciones de escena | Motion suave, sin saltos bruscos |

---

## Fase 3 — First Experience (niveles)

| # | Prueba | Resultado esperado |
|---|--------|--------------------|
| 3.1 | Mapa muestra 9 niveles | Solo el 0 disponible al inicio |
| 3.2 | Level 0 story | 3 escenas de intro + completar desbloquea L1 |
| 3.3 | Memory | Revelar las 4 memorias → CTA activo |
| 3.4 | Quiz | Responder 3 preguntas con feedback; fallos no bloquean |
| 3.5 | Sorting | Reordenar → comprobar → timeline → continuar |
| 3.6 | Compatibility | Analyzing… luego barras animadas |
| 3.7 | Connection (story) | Escenas emocionales más lentas |
| 3.8 | Dance interactive | 8 toques con partículas → continuar |
| 3.9 | Future choice | Elegir opción → reply personalizado |
| 3.10 | Final question | Pausas → pregunta; No mueve/mensajes; Sí → celebración |
| 3.11 | Celebration | Mensaje + achievement + recompensa |
| 3.12 | Reiniciar progreso | Vuelve al estado inicial |

---

## Fase 4 — Admin Editor

| # | Prueba | Resultado esperado |
|---|--------|--------------------|
| 4.1 | `/admin` lista / crea experiencia | CRUD básico local |
| 4.2 | Editor de nivel + escenas | Reordenar, tipos, textos |
| 4.3 | Asset manager | Subir/asociar (o mock local) |
| 4.4 | Preview | Misma experiencia que `/play` |
| 4.5 | Draft vs Publish | Draft no afecta published |
| 4.6 | Desktop layout | Sidebar niveles + panel editor |

---

## Fase 5 — Polish

| # | Prueba | Resultado esperado |
|---|--------|--------------------|
| 5.1 | Sonido on/off | Respeta preferencia |
| 5.2 | Partículas / microinteracciones | Sin bajar de ~60fps en móvil medio |
| 5.3 | Accesibilidad básica | Focus visible, contraste, labels |
| 5.4 | Responsive completo | Sin overflow horizontal |
| 5.5 | E2E Playwright smoke | `npm run test:e2e` verde |
| 5.6 | Lighthouse / LCP razonable | Sin regresiones graves |

---

## Regresión rápida (cada fase)

1. Hub `/` sigue enlazando bien  
2. `/play` no rompe progreso guardado  
3. `npm run test` + `npm run build` OK  

## Notas

- Limpiar progreso: en `/play` → “Reiniciar progreso”, o borrar keys `rj:player:progress:*` en LocalStorage.  
- Playwright browsers: `npx playwright install` antes de E2E.
