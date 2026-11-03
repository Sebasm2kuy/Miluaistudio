# Panel del estudio — métricas y administración (`/estudio/`)

Desde la iteración 042, el sitio tiene un **panel de administración de métricas y
clientes** en `https://lumengala.site/estudio/`. Es la herramienta «de oficina» del
estudio, distinta del panel de cliente (`/dashboard/`) y de la herramienta local
`/admin` (que sigue existiendo solo en `npm run dev` y nunca se publica).

- URL: **`https://lumengala.site/estudio/`** (noindex, sin enlaces desde la web:
  usala por URL directa y guardala en marcadores).
- Acceso: **exclusivo de `sebacabrera1982@gmail.com`** con Google. Cualquier otra
  cuenta ve «Acceso restringido» y ningún dato.
- La ruta está publicada por diseño: no contiene secretos ni botones de escritura,
  y los datos de tráfico no viven en el repo sino en la hoja privada de Google del
  backend, que solo los entrega a esa cuenta (ver «Control de acceso»).

## Qué muestra

| Sección | Datos | Fuente |
|---|---|---|
| Visitas, únicas (sesiones por día), nuevos visitantes, tendencia diaria | Tráfico real de la web pública | Backend de Apps Script (pestaña «Metricas») |
| Personas online | Pestañas con la web abierta en los últimos 5 min (latidos) | Backend de Apps Script |
| Nuevas cuentas, confirmaciones, conversión y su serie diaria | `content/clientes.json` y `content/rsvps/*.json` | Lectura pública del repo (la misma que usa `/acceso/`) |
| Tabla de clientes (nombre, email, slug, alta, estado de invitación, confirmaciones) con buscador y filtro | Igual que arriba | Lectura pública del repo |

Períodos: **Hoy · Últimos 7 días · Último mes · Personalizado** (desde/hasta,
sin fechas futuras, hora de Montevideo).

## Privacidad de las métricas (por diseño)

- **Sin cookies, sin IP, sin user agents, sin fingerprinting.**
- Cada pestaña genera un identificador **aleatorio** en `sessionStorage` (muere con
  la pestaña) y el navegador guarda dos banderas sin datos personales en
  `localStorage`: «ya visitó hoy» y «ya visitó alguna vez».
- Las rutas operativas (`/dashboard/`, `/editar/`, `/estudio/`, `/previsualizar/`,
  `/acceso/`) **no se miden**: el tráfico del propio estudio no infla las cifras.
- Las filas guardan: instante, clase (visita/latido), día, pathname (sin query
  string) y el identificador aleatorio.

## Control de acceso (dos capas, fail-closed)

1. **Frontend** (`src/lib/admin-auth.ts`): el widget oficial de Google entrega un
   `id_token`; se exige audiencia == Client ID del sitio, emisor de Google,
   vigencia, email verificado y email exacto `sebacabrera1982@gmail.com`. La
   sesión vive en `sessionStorage` y **dura lo mismo que el token de Google
   (≈1 h)**: vencida, vuelve a pedir ingreso.
2. **Backend** (`google-apps-script/gallery-server.gs`, acción `metricas_admin`):
   re-verifica la credencial con Google (tokeninfo: firma, audiencia, vigencia,
   email verificado) y **solo si el email es el del estudio** devuelve las filas.
   El error es explícito y sin datos. Los datos de tráfico NO están en el repo:
   sin pasar por el backend no existen por vía pública.

## ACTIVAR el backend de métricas (≈10 min, una sola vez)

El Web App actual (registro automático) todavía no tiene las acciones de
métricas: mientras no lo actualices, el panel abre, la lista de clientes funciona,
y la sección de tráfico muestra honestamente que el backend no está actualizado.
El resto del sitio sigue funcionando igual (el envío de visitas es
fire-and-forget y un backend viejo lo ignora sin errores).

1. Abrir el proyecto de Apps Script del estudio (el del RSVP/registro):
   <https://script.google.com/home/my>.
2. Abrir el archivo `Code.gs` del proyecto y **reemplazar TODO el contenido** por
   la versión vigente de **`google-apps-script/gallery-server.gs`** de este repo.
   Las acciones nuevas son aditivas: RSVP y registro automático quedan idénticos.
3. Verificar en ⚙️ **Propiedades del proyecto → Propiedades del script** que
   siguen existiendo `GITHUB_TOKEN` y `GOOGLE_CLIENT_ID` (no se tocan; las
   métricas además funcionan aunque faltara el token de GitHub).
4. **Implementar → Gestionar implementaciones → ✏️ Editar → Versión: Nueva →
   Implementar**. Elegir «Nueva versión» sobre la MISMA implementación conserva
   la URL del Web App: no hay que cambiar nada en el sitio.
5. Probar (cambio de URL no hace falta):
   ```bash
   curl -s "https://script.google.com/macros/s/…/exec?action=metricas"
   # → {"ok":true,"message":"Metricas backend activo"}
   ```
6. Entrar a `https://lumengala.site/estudio/` con la cuenta del estudio: la
   sección de tráfico pasa de «no disponible» a los contadores reales a medida
   que lleguen visitas (los días previos a la activación no tienen datos).

### Desactivar las métricas

En el repo, vaciar `ENDPOINT_REGISTRO` en `src/data/registro-auto.ts` desactiva
métricas **y** registro automático juntos (mismo Web App). Para dejar solo las
métricas apagadas, actualizar el Web App con una versión del script sin la
sección «MÉTRICAS DEL SITIO».

## Cómo funciona por dentro (resumen técnico)

- **Escritura**: `src/components/registro-visitas.tsx` (montado en el layout
  raíz) envía un `POST` `text/plain` (solicitud simple, sin preflight CORS) con
  `{ tipo: 'registrar_visita', clase, dia, pagina, sesion, nuevaSesionDia,
  nuevoVisitante }` al Web App; un latido cada 60 s solo mientras la pestaña está
  visible. Nunca bloquea el render y nunca lanza: si el backend falla, la web
  sigue igual.
- **Lectura**: el panel llama a `metricas_admin` con la credencial de la sesión y
  agrega las filas con funciones puras (`src/lib/admin-metricas.ts`, probadas en
  la suite) — rangos, series diarias con ceros reales, sesiones únicas por día,
  online por ventana de 5 minutos y conversión (null si no hay visitas: nunca se
  inventa un porcentaje).
- **Anti-abuso** (backend): validación estricta de forma + tope por sesión con
  `CacheService` (excedido → responde `success:true` sin grabar). La pestaña
  «Metricas» purga filas de más de 90 días en cada consulta del admin y entrega
  como máximo 45 días / 20.000 filas.

## Qué NO es este panel

- No reemplaza a Google Analytics ni mide fuentes, geografía o dispositivos.
- No tiene escrituras: publicar invitaciones sigue en `/editar/` (teléfono) y en
  el panel local `/admin` (escritorio), y las confirmaciones entran por el
  formulario de la invitación.
- La lista de clientes ya era legible públicamente desde el repo (la usa
  `/acceso/` para validar logins): el panel no publica nada que no existiera.
