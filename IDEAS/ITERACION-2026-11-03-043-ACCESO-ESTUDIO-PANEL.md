# Iteración 043 — Acceso directo «Panel del estudio» desde el panel de cliente

**Fecha:** 2026-11-03 · **Estado:** publicado en producción (PR #51 + fixes #52/#53/#54) y verificado con E2E en producción.

## Pedido

En la barra del panel de cliente (`/dashboard/`), un botón o enlace «Panel del estudio» (o «Ir al estudio») que se muestre **únicamente** si el usuario autenticado tiene el correo exacto `sebacabrera1982@gmail.com` — para cualquier otro, completamente oculto — y que al hacer clic lleve a `/estudio/` manteniendo la sesión de administrador activa.

## Ideas exploradas y decisión

1. **Menú desplegable del usuario** (nombre → opciones) → descartado por ahora: agrega un segundo nivel de navegación para un solo destino; la barra ya tiene el patrón de píldoras y el usuario pidió «botón o enlace».
2. **Pestaña nueva dentro de las tabs del panel** → descartado: mezclaría navegación de cliente con navegación de estudio; el estudio es otra superficie con su propia puerta.
3. **DECIDIDO: píldora secundaria en la barra superior**, entre «Volver a la web» (primario, 041) y el nombre de la sesión, con icono Sparkles y `aria-label="Ir al panel del estudio"`. Texto completo «Panel del estudio» desde `sm` (640px), «Estudio» en móviles.

## Decisiones tomadas

- Condición de visibilidad: `esEmailDelEstudio(email)` nueva función pura en `src/lib/admin-auth.ts` (junto a `EMAIL_ADMIN`, única fuente de verdad): recorte de espacios + minúsculas, exacta. El enlace **no se renderiza** para nadie más (verificado: no aparece ni siquiera en el DOM).
- La visibilidad es **UX, no seguridad**: `/estudio/` sigue protegida por su propia puerta fail-closed (042). El bundle ya contenía el email reservado desde la 042 por diseño aceptado; nada nuevo se expone.
- «Mantener la sesión»: el enlace es un `<Link>` común que **no toca sessionStorage**. La sesión de cliente sigue viva al ir y volver (verificado), y la sesión de administrador (≈1 h desde el ingreso Google, 042) se usa intacta si sigue vigente; si venció, `/estudio/` muestra la puerta Google, igual que entrando por URL directa. El enlace jamás fabrica una credencial: no hay forma honesta de «transferir» la sesión de cliente a la de administrador, y no debe haberla.

## Hallazgos del E2E (producción + build local)

- El enlace nuevo apretaba «Volver a la web» en móviles: a 390px la píldora primaria envolvía en 3 líneas (PR #52: `whitespace-nowrap` + 13px) y la fila completa desbordaba 12px (PR #53: padding/gaps compactos); medido a 5 anchos (360/390/520/640/1280) quedó el caso 360–519: el texto del logo (179px) no dejaba lugar → **PR #54**: texto del logo oculto bajo 520px (queda la marca visual), píldoras compactas en xs, branding completo desde 520px. Sin desborde en los 5 anchos.
- En producción la píldora seguía viéndose «vieja» tras el deploy: era el chunk cacheado; con cache-buster el build nuevo apareció (40px de alto, una línea). Verificar siempre con cache-buster.

## Pruebas

263/263 tests (7 nuevos en `tests/enlace-estudio-panel.test.ts`: exactitud del email reservado, normalización, parecidos que no pasan, vacío/nulos, y la decisión completa de visibilidad con la sesión real leída de un almacén en memoria), lint 0, typecheck 0, build + verify-export + verify-privacy OK. E2E en producción con navegador real: login demo REAL (PBKDF2) → en `/dashboard/` el enlace **no existe en el DOM**; con la sesión del estudio (misma forma que produce su login real) el enlace aparece bien posicionado; clic → `/estudio/` con su puerta Google (sin sesión admin vigente, honesto); regreso → sesión de cliente intacta y enlace persistente; barra sin desborde a 360/390/520/640/1280 en build local y 390/1280 en producción; 0 errores de consola. Lecturas mockeadas por rate-limit 403 del sandbox con contenido REAL de origin/main (mismo método que 038/040/041/042).

## Pendientes / próximos pasos

- La sección de tráfico de `/estudio/` sigue esperando la activación manual del Web App (docs/METRICAS-ADMIN.md) — sin cambios en esta iteración.
- Idea futura: mismo criterio de email para mostrar un atajo «Panel del estudio» en la nav pública cuando la sesión del estudio esté activa.
