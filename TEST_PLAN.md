# Plan de pruebas — Romantic Journey

Checklist manual por fase. Marca cada ítem al validarlo en local (`npm run dev` → http://localhost:3000).

---

## Sesión rápida local (empezar aquí)

### Preparación

```bash
cd romantic-journey
npm run dev
```

Abre http://localhost:3000  
Chrome DevTools → modo móvil (~375px) para el player.

### Ruta A — Player (~15 min)

| # | Qué hacer | OK si… |
|---|-----------|--------|
| A1 | `/` → **Empezar el viaje** | Entras a `/play` con mapa de 9 niveles |
| A2 | Solo Level 0 habilitado | El resto aparecen bloqueados |
| A3 | Completa Level 0 (escenas) | Vuelves al mapa; Level 1 desbloqueado |
| A4 | Memory → revela las 4 | CTA se activa y avanza |
| A5 | Quiz → responde (incluso mal) | Feedback y puedes seguir |
| A6 | Sorting → ordena y comprueba | Timeline → continuar |
| A7 | Compatibility | Barras tras “Analyzing…” |
| A8 | Connection + Dance (8 toques) + Future | Mecánicas distintas funcionan |
| A9 | Final: pulsa **No** varias veces | Mensajes + botón se mueve |
| A10 | Pulsa **Sí** | Celebración → recompensa |
| A11 | Refresca `/play` a mitad de viaje | Progreso sigue guardado |
| A12 | **Reiniciar progreso** | Solo Level 0 disponible |
| A13 | Toggle **Sonido on/off** | Preferencia se mantiene al refrescar |

### Ruta B — Admin (~10 min)

| # | Qué hacer | OK si… |
|---|-----------|--------|
| B1 | Abre `/admin` | Panel **Experiencia** + Save / Publish / Preview |
| B2 | Cambia título o nombre destinataria | Aparece “Cambios sin guardar” |
| B3 | **Save draft** → **Preview** | `/play?preview=1` con banner PREVIEW |
| B4 | En preview, el nombre/título refleja el draft | Borrador visible sin publicar |
| B5 | Vuelve a `/admin`, edita un nivel (JSON/título) | Se guarda en draft |
| B6 | **Publish** | Mensaje de versión |
| B7 | Abre `/play` (sin preview) | Ves la versión publicada |
| B8 | Panel Final: cambia un mensaje del No | Se refleja en preview/play tras save/publish |
| B9 | Versiones → Restaurar (si hay snapshot) | Borrador vuelve al snapshot |

### Smoke automático (opcional)

```bash
npm run test        # unitarios
npm run test:e2e    # 6 smoke Playwright
```

### Notas

- Si el progreso o el admin se “contaminan”, en DevTools → Application → Local Storage → borra keys `rj:*`, o usa **Reiniciar progreso** / Reset seed en Versiones.
- Cierra otros `npm run dev` viejos antes de E2E.

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
| 4.1 | Abrir `/admin` (desktop) | Sidebar + toolbar Save/Publish/Preview |
| 4.2 | Editar título / destinataria / tema | Dirty state; Save draft persiste |
| 4.3 | Seleccionar nivel | Editor de metadatos + JSON de content |
| 4.4 | Add / duplicate / reorder / delete nivel | Lista lateral se actualiza |
| 4.5 | Preview | `/play?preview=1` muestra borrador con banner |
| 4.6 | Publish | Mensaje de versión; `/play` sin preview usa published |
| 4.7 | Restaurar versión | Borrador vuelve al snapshot |
| 4.8 | Pregunta final / No messages | Editable desde panel Final |
| 4.9 | Assets panel | Stub visible (placeholders) |

---

## Fase 5 — Polish

| # | Prueba | Resultado esperado |
|---|--------|--------------------|
| 5.1 | Toggle Sonido on/off en mapa | Preferencia persiste al refrescar |
| 5.2 | Avanzar escenas / completar | Cues de audio suaves (si sonido on) |
| 5.3 | Celebración | Partículas + cue celebrate; respeta reduced-motion |
| 5.4 | Tab / focus visible | Outline accent en controles |
| 5.5 | Skip link | “Saltar al contenido” al enfocar con Tab |
| 5.6 | Mobile ~375px | Player usable; admin usable (lista compacta) |
| 5.7 | `npm run test` | Unit tests verdes |
| 5.8 | `npx playwright install` + `npm run test:e2e` | Smoke home/play/admin |
| 5.9 | `npm run build` | Build OK |

---

## Regresión rápida (cada fase)

1. Hub `/` sigue enlazando bien  
2. `/play` no rompe progreso guardado  
3. `npm run test` + `npm run build` OK  

## Notas

- Limpiar progreso: en `/play` → “Reiniciar progreso”, o borrar keys `rj:player:progress:*` en LocalStorage.  
- Playwright browsers: `npx playwright install` antes de E2E.
