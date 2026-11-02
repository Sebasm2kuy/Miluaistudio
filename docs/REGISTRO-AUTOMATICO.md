# Registro automático de clientes con Google — guía del estudio

Desde la iteración 036, si el estudio lo activa, **cualquier persona que entre
con Google a `/acceso/` obtiene su panel sin aprobación manual**: si su email
todavía no tiene cuenta, el backend la crea sola en `content/clientes.json`
con un slug de invitación propio y el usuario entra a `/dashboard/`.

> ✅ **Estado actual: ACTIVADO (2026-11-02, iteración 037).** La constante
> `ENDPOINT_REGISTRO` (en `src/data/registro-auto.ts`) apunta al Web App
> vigente del estudio, verificado en vivo antes de activar: doGet →
> `{"ok":true,"message":"RSVP backend activo"}` y POST `registro_cliente`
> con credencial inválida → `{"success":false,"error":"Credencial de Google
> inválida."}` (fail-closed, sin crear nada). Para desactivar: vaciar la
> constante (volver a `''`) y pushear — sección 3.

## 1. Cómo funciona

```
navegador del cliente            backend Apps Script                GitHub
─────────────────────            ───────────────────                ──────
1. «Continuar con Google»
   (widget oficial de Google
   → id_token)
2. El email NO está en
   content/clientes.json
3. POST {tipo: registro_cliente,
   credential: id_token}  ────►  4. Verifica el id_token CON GOOGLE
                                    (tokeninfo: audiencia ==
                                    GOOGLE_CLIENT_ID, sin expirar,
                                    email verificado)
                                 5. Topes anti-abuso (por hora
                                    global y por email)
                                 6. Lee clientes.json,
                                    dedupe, slug único  ────►  7. Commit de la
                                                               cuenta nueva
                                                                 [skip ci]
8. Sesión abierta (8 h)  ◄─────  {success:true, email, nombre, slug}
   → /dashboard/
```

Decisiones de diseño importantes:

- **El token de GitHub NUNCA viaja en el sitio.** La web es 100% estática y
  pública: un token embebido en el bundle podría extraerlo cualquiera y
  escribir en todo el repositorio. El único que escribe es el backend de
  Apps Script, después de verificar la identidad con Google.
- **No sirve inventar credenciales:** el backend valida el id_token contra
  `oauth2.googleapis.com/tokeninfo` (audiencia, vigencia, email verificado).
  Un POST con JSON fabricado es rechazado.
- **Idempotente:** si el email ya tiene cuenta, responde éxito sin escribir
  nada (útil si el usuario reintenta o hay dos peticiones simultáneas).
- **Cuenta solo-Google:** el hash guardado representa una contraseña
  aleatoria descartada — nadie puede entrar a esa cuenta por contraseña,
  solo por Google (mismo criterio que `scripts/alta-cliente.mjs --solo-google`).
- **El commit lleva `[skip ci]`:** no reconstruye el sitio (el login lee
  cuentas en vivo por la API de GitHub).
- **La invitación arranca «Sin publicar»:** la cuenta nueva referencia un
  slug propio (`partedelmail-xxxxxx`) que todavía no tiene invitación. El
  panel del cliente lo muestra como borrador; se publica desde el editor
  (conexión del estudio) o pidiéndolo por WhatsApp.

## 2. Activación (una sola vez, ~10-15 min)

1. Abrí el proyecto de Google Apps Script del estudio (el mismo del backend
   de RSVPs): <https://script.google.com> → «Miluaistudio - RSVP».
2. Reemplazá TODO el código por la versión actual de
   `google-apps-script/gallery-server.gs` (este repo). Ahora maneja RSVPs
   **y** registro de clientes.
3. Configuración del proyecto ⚙️ → **Propiedades del script** → agregá:
   - `GITHUB_TOKEN`: token *fine-grained* de GitHub con acceso **solo a este
     repositorio** y permiso **Contents: Read and write** (el mismo tipo de
     token que usa el espejo de RSVPs; si ya lo tenés cargado, no hace falta
     tocarlo).
   - `GOOGLE_CLIENT_ID`: `118004981247-ah0r221q93h627lrocr6utiiocphhh2j.apps.googleusercontent.com`
     (el mismo Client ID de `src/data/acceso-google.ts`).
4. **Implementar → Nueva implementación → Aplicación web** → Ejecutar como
   «Yo», Quién tiene acceso: «Cualquier persona» → Implementar.
5. Copiá la **URL del Web App** (formato
   `https://script.google.com/macros/s/…/exec`).
6. Pegala en `src/data/registro-auto.ts`:

   ```ts
   export const ENDPOINT_REGISTRO = 'https://script.google.com/macros/s/…/exec';
   ```

7. Commit + push. Cuando se despliegue, el registro automático queda ACTIVO:
   la leyenda de `/acceso/` cambia sola a «Con Google entrás siempre: si es
   tu primera vez, tu panel se crea automáticamente.»

> Editar el `.gs` NO actualiza el Web App ya desplegado: hay que crear una
> **nueva implementación** (o gestionar implementaciones de prueba) y usar
> la URL de la versión nueva.

## 3. Desactivación y ajustes

- **Desactivar el registro:** vaciá `ENDPOINT_REGISTRO` (dejar `''`) y
  pusheá. El sitio vuelve al comportamiento de 034 en el próximo despliegue.
- **Bajar los topes anti-abuso:** en el `.gs`, `REGISTRO_MAX_POR_HORA` (10
  altas/hora globales) y `REGISTRO_MAX_POR_EMAIL_HORA` (2 intentos/hora por
  email). Recordar crear una nueva implementación tras cambiarlo.
- **Quitar un cliente auto-registrado:** borrá su entrada de
  `content/clientes.json` (commit + push). Su sesión abierta expira sola
  (máximo 8 h) y su slug queda libre si querés reutilizarlo.
- **Darle contraseña a una cuenta solo-Google:** reemplazá su `hash` por uno
  generado con `node scripts/alta-cliente.mjs --email … --nombre … --slug …
  --password "…" --escribir` (actualiza la entrada existente por email).

## 4. Riesgos y límites, con honestidad

- **Alta libre = commits libres:** cada primera vez de un email de Google
  nuevo genera un commit en `content/clientes.json`. Los topes por hora
  limitan el volumen, pero si alguien se dedica a crear cuentas con emails
  de Google distintos, el archivo va a crecer y el historial va a acumular
  commits. Es el costo directo de la política «no bloquear a nadie».
- **El límite anti-abuso es de servidor y liviano** (CacheService, ventana
  de 1 hora). No reemplaza una cola de moderación: si algún día molesta,
  se desactiva el endpoint en 1 minuto (sección 3) y se vuelve a 034.
- **Los datos de la cuenta son el perfil de Google** (nombre mostrable,
  saneado, recortado a 60 caracteres). El email viaja al repositorio público
  igual que las cuentas creadas por el estudio.
- **El slug deriva del email + 6 caracteres aleatorios:** la URL de la
  invitación futura no es adivinable desde el email solo.
- **El panel del cliente sigue sin poder publicar solo** la invitación
  (necesita la conexión del estudio): el registro automático da ACCESO al
  panel, no publica contenido.
