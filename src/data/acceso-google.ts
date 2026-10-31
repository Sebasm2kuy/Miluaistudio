// ============================================================
// ACCESO CON GOOGLE — Client ID de Google Identity Services
// ------------------------------------------------------------
// El botón «Continuar con Google» de /acceso/ necesita un OAuth
// Client ID de Google Cloud. Es un identificador PÚBLICO (viaja
// en el HTML de la página, no es un secreto).
//
// CÓMO CREARLO (10 minutos, guía completa en docs/ACCESO-GOOGLE.md):
//  1. https://console.cloud.google.com → crear/seleccionar proyecto.
//  2. Pantalla de consentimiento OAuth: tipo Externo, nombre
//     «Lumen Gala Studio», email de soporte del estudio.
//  3. Credenciales → Crear credenciales → ID de cliente OAuth →
//     Tipo «Aplicación web».
//  4. Orígenes autorizados de JavaScript (EXACTOS, sin / final):
//       https://lumengala.site
//       http://localhost:3000        (solo para desarrollo)
//  5. Copiar el Client ID (termina en .apps.googleusercontent.com)
//     y pegarlo acá abajo. Commit + push: el botón aparece solo.
//
// Mientras la constante esté vacía, /acceso/ muestra únicamente el
// formulario de email + contraseña (estado actual): cero errores de
// consola, cero peticiones a Google.
// ============================================================

export const GOOGLE_CLIENT_ID = '';
