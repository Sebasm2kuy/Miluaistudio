# ITERACIÓN 034 — Acceso de clientes con Google

Fecha: 2026-10-31 · Autor: agente Z.ai · Estado: implementada y probada

## Pedido del propietario

«Para facilitar, hay que dejar que se registren por la web con una cuenta de Google.»

Decisiones confirmadas con el propietario (AskUserQuestion):
- Las cuentas existentes también entran con Google si usan el mismo email.
- Se aplicaron los valores recomendados: acceso Google para clientes
  aprobados por el estudio (sin backend nuevo), convivencia con la vía
  contraseña, Client ID como constante configurable (aún sin valor).

## Decisión de arquitectura

El panel gestiona una invitación con slug asignado, que solo el estudio
puede crear; y el sitio es un export estático (sin servidor). Por eso el
acceso con Google NO es autorregistro libre: es el login de un clic para
quien ya tiene cuenta. El email de Google debe coincidir con una cuenta de
`content/clientes.json`. Sin cuenta → aviso + WhatsApp prellenado (el alta
sigue siendo del estudio). Evitamos un segundo sistema de cuentas (Sheets)
porque duplicaría la fuente de verdad con la misma obligación de asignación.

## Cambios

- `src/data/acceso-google.ts` (NUEVO): `GOOGLE_CLIENT_ID = ''`. Vacío = botón
  oculto y cero peticiones a Google. Guía en `docs/ACCESO-GOOGLE.md`.
- `src/lib/auth-cliente.ts`: `iniciarSesionGoogle()` (email verificado +
  cuenta existente → misma sesión de 8 h; limpia bloqueos de contraseña) y
  `decodificarPayloadJwt()` (base64url + TextDecoder UTF-8: los nombres con
  acentos se leen bien — el test lo detectó y se corrigió).
- `src/app/acceso/page.tsx`: bloque «Continuar con Google» (widget oficial
  GSI, tema filled_black, es-419) sobre el formulario con divisor «o con tu
  contraseña»; estados de carga y error comprensibles; aviso sin-cuenta con
  WhatsApp prellenado; degradación elegante sin Client ID o sin red.
- `scripts/alta-cliente.mjs`: `--solo-google` (hash de contraseña aleatoria
  descartada — esquema 1 y validación fail-closed intactos).
- `tests/auth-google.test.ts` (NUEVO): 9 pruebas de la lógica Google.
- `docs/ACCESO-GOOGLE.md` (NUEVO): guía del Client ID + alta + seguridad.

## Verificación

- 212/212 tests (203 previos + 9 nuevos) · lint · typecheck · build + export
  + privacidad: sin errores.
- Navegador, estado sin Client ID (producción hoy): página idéntica a la
  anterior, sin script de Google, sin errores de consola.
- Navegador, estado con Client ID provisional: el widget carga, la página
  no se rompe, el formulario sigue operativo. El clic real del botón exige
  el Client ID válido del estudio (paso único del propietario).
- El flujo completo callback → sesión → dashboard está cubierto por las
  pruebas unitarias con la lógica de producción; el widget visual requiere
  Client ID real.

## Pendiente del propietario

1. Crear el OAuth Client ID (docs/ACCESO-GOOGLE.md §1, ~10 min).
2. Pegarlo en `src/data/acceso-google.ts` + push.
3. (Opcional) re-alta de clientes con `--solo-google`.
