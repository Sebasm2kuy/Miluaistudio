# ITERACIÓN 035 — Google activado: Client ID integrado + fix de renderizado del widget

**Fecha:** 2026-11-02 · **Estado:** desplegada en producción

## Qué pidió el cliente

El Client ID de Google Cloud para activar el botón «Continuar con Google»
creado en la iteración 034. Con el ID en mano, la promesa era: integrarlo,
dejar probado el flujo y desplegar.

## Qué se hizo

1. **Integración del Client ID** en `src/data/acceso-google.ts`
   (`118004981247-ah0r221q93h627lrocr6utiiocphhh2j.apps.googleusercontent.com`).
   - Es un identificador público (viaja en el JS de la página), no un secreto.
   - El «secreto del cliente» que Google Cloud muestra junto al ID **no se
     usa** en este flujo (GSI no lo necesita en el navegador) y **no se guardó
     en el repositorio**. Recomendación: si se compartió por un canal no
     seguro, regenerarlo en Google Cloud (Credenciales → Restablecer secreto).

2. **Fix de un bug latente de 034** (`src/app/acceso/page.tsx`), descubierto
   recién al integrar el ID real:
   - El contenedor con `ref={contenedorGoogle}` estaba DENTRO del condicional
     `{GOOGLE_CLIENT_ID && googleListo && …}`, pero `googleListo` solo pasa a
     `true` después de llamar `renderButton(contenedorGoogle.current, …)`.
     Como arranca en `false`, el ref siempre era `null` → el botón nunca se
     dibujaba (bloqueo mutuo).
   - Solución: el contenedor se monta siempre que haya Client ID (oculto con
     `h-0 overflow-hidden` hasta que el widget renderiza) y se muestra al
     confirmar `renderButton`. Nuevo estado `googleFallado`: si el script de
     Google no carga o el widget falla, el bloque se retira por completo y
     queda solo la vía contraseña (degradación elegante como en 034).

3. **Documentación** (`docs/ACCESO-GOOGLE.md`): estado ACTIVADO, Client ID
   activo, recordatorio del requisito de orígenes autorizados en Google Cloud
   (`https://lumengala.site` exacto, sin `/` final) y aclaración del secreto.

## Verificación (las 4 pruebas obligatorias + navegador)

| Prueba | Resultado |
|---|---|
| Lint (`eslint .`) | sin errores |
| Tipos (`tsc --noEmit`) | sin errores |
| Tests unitarios | **212/212** (203 + 9 de Google) |
| Build + export + verificación export/privacidad | sin fugas; Client ID solo en el chunk que carga `/acceso/` (aislamiento correcto); secreto ausente de los 401 archivos |

**Navegador (desktop + móvil, export servido en local):**

- El script `accounts.google.com/gsi/client` se inyecta solo en `/acceso/`.
- El widget renderiza: iframe `gsi/button` con `theme=filled_black`,
  `shape=pill`, `text=continue_with`, `hl=es-419`, `client_id=` el del estudio.
- El formulario de contraseña queda intacto y el E2E con cuenta mock pasa:
  login → `/dashboard/` → «Hola, Cliente de Prueba E2E» → Salir → sesión
  limpia y vuelta a `/acceso/`.
- Capturas desktop (1280) y móvil (390): botón integrado sobre el divisor
  «o con tu contraseña», sin desbordes.

**Nota de idioma:** el navegador headless del entorno de pruebas mostró el
botón en chino (cookie/locale propia del sandbox). El parámetro `hl=es-419`
viaja correctamente en la URL del iframe; el idioma final lo decide Google
considerando también el navegador y la cuenta del visitante. En navegadores
en español se muestra en español.

**Límite del entorno:** el clic completo (selector de cuentas de Google →
id_token → entrada al panel) exige un navegador con una sesión real de Google
y el origen `https://lumengala.site` autorizado en Google Cloud; la lógica del
callback está cubierta por los 9 tests unitarios de `tests/auth-google.test.ts`.

**Nota adicional (consola de Google):** GSI puede registrar en consola
«initialize() is called multiple times» aunque el sitio lo llame UNA sola vez:
se reprodujo en una página mínima sin React con una única llamada, por lo que
es un aviso interno del propio script de Google (sin efecto: solo hay una
instancia). Aun así, la iteración añade un guardia a nivel de módulo
(`widgetGoogleYaIniciado`) para que las re-ejecuciones del efecto (useRouter()
cambia de identidad tras hidratar) nunca dupliquen la inicialización.

## Para el estudio (única verificación manual restante)

Abrir `https://lumengala.site/acceso/`, hacer clic en «Continuar con Google»:
debe abrir el selector de cuentas de Google. Si Google muestra un error de
origen, revisar en Google Cloud → Credenciales → el Client ID → «Orígenes
autorizados de JavaScript» = `https://lumengala.site` (exacto, sin `/`).
