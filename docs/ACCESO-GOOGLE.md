# Acceso de clientes con Google — guía del estudio

Desde la iteración 034 el panel de cliente (`/acceso/` → `/dashboard/`) tiene
dos vías de ingreso:

| Vía | Para quién | Qué necesita |
|---|---|---|
| **«Continuar con Google»** | El cliente, en un clic | Un OAuth Client ID de Google Cloud (lo crea el estudio, 10 min, una sola vez) |
| **Email + contraseña** | Alternativa de siempre | Cuenta con hash en `content/clientes.json` (como hasta ahora) |

Ambas vías abren la MISMA sesión (8 h) y llevan al MISMO panel. La autorización
no cambia: **solo entra quien ya tiene cuenta** — el email de Google debe
coincidir con una cuenta creada por el estudio. Nadie sin cuenta puede entrar,
ni siquiera con Google.

---

## 1. Crear el Client ID de Google (una sola vez)

1. Entrá a <https://console.cloud.google.com> con la cuenta de Google del
   estudio y creá (o elegí) un proyecto, por ejemplo `lumen-gala-studio`.
2. Menú → **APIs y servicios → Pantalla de consentimiento OAuth**:
   - Tipo **Externo** → Crear.
   - Nombre de la app: `Lumen Gala Studio`.
   - Email de asistencia y de contacto: `lumengala.studio@gmail.com`.
   - Alcances: no hace falta agregar ninguno (usamos solo email/perfil básico).
   - Usuarios de prueba: podés dejarlo vacío; el modo «En producción» no es
     obligatorio para el botón de inicio de sesión.
3. Menú → **APIs y servicios → Credenciales → Crear credenciales →
   ID de cliente de OAuth** → Tipo de aplicación: **Aplicación web**.
4. En **Orígenes autorizados de JavaScript** agregá EXACTOS (sin `/` final):
   - `https://lumengala.site`
   - `http://localhost:3000` (solo si vas a probar el sitio en local)
5. Copiá el **ID de cliente** (termina en `.apps.googleusercontent.com`).

> El Client ID es un identificador **público**: viaja en el HTML de la página
> y no es un secreto. No confundirlo con la «clave secreta de cliente», que
> este flujo NO usa.

## 2. Activar el botón

Abrí `src/data/acceso-google.ts` y pegá el ID entre las comillas:

```ts
export const GOOGLE_CLIENT_ID = '1234567890-abc123.apps.googleusercontent.com';
```

Commit + push a `main`. En el próximo despliegue el botón aparece solo.
Mientras la constante esté vacía, `/acceso/` funciona exactamente como antes
(formulario de contraseña, cero peticiones a Google).

## 3. Dar acceso a un cliente

El alta sigue siendo del estudio (la web nunca escribe las cuentas):

```bash
# Cliente que va a entrar con Google (recomendado: sin contraseña que comunicar):
node scripts/alta-cliente.mjs --email cliente@gmail.com --nombre "Familia Pérez" \
     --slug ejemplo-quince --solo-google --escribir

# Alternativa con contraseña (igual que siempre):
node scripts/alta-cliente.mjs --email cliente@correo.com --nombre "Familia Pérez" \
     --slug ejemplo-quince --password "ContraseñaSegura1" --escribir
```

Después: `git add content/clientes.json && git commit -m "alta cliente <email>" && git push`.

- Cuentas **solo-Google**: el hash guardado corresponde a una contraseña
  aleatoria descartada (nadie la conoce); el ingreso es por Google.
- Cuentas **con contraseña**: también pueden entrar con Google si usan el
  mismo email (política decidida por el propietario).
- **Quitar acceso**: borrá la entrada de la cuenta en `content/clientes.json`
  (commit + push). La sesión abierta expira sola (8 h máximo).

## 4. Qué pasa si el email de Google no tiene cuenta

La página muestra un aviso con el email que intentó entrar y un botón de
WhatsApp con el mensaje prellenado («quiero activar mi panel»). El estudio lo
agrega con el paso 3 y listo: la próxima vez entra con un clic.

## 5. Seguridad, con honestidad

- La identidad la emite el widget oficial de Google (id_token recibido en el
  navegador); el sitio lee email, nombre y si el email está verificado.
- La sesión sigue siendo **client-side** (sessionStorage, 8 h), igual que la
  vía con contraseña: el sitio es estático y no hay middleware de servidor.
  La superficie de riesgo no cambia: toda escritura real del panel exige el
  token de GitHub de la conexión del panel.
- El bloqueo por intentos fallidos aplica a la vía contraseña; con Google no
  hay secreto que fuerza bruta contra el repositorio.
- Si Google está caído o bloqueado (red, extensiones), el botón se oculta y
  el formulario de contraseña sigue funcionando.

## 6. Pruebas recomendadas al activar

1. Entrar con una cuenta del estudio que exista en `content/clientes.json` →
   debe abrir `/dashboard/`.
2. Entrar con un email de Google ajeno → aviso de «sin panel asignado» + WhatsApp.
3. Probar la vía contraseña con la cuenta demo → sigue funcionando.
4. Cerrar sesión → reingresar → sin errores en consola.
