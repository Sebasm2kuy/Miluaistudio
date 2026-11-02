// ============================================================
// REGISTRO AUTOMÁTICO DE CLIENTES CON GOOGLE — endpoint del backend
// ------------------------------------------------------------
// Qué hace cuando está activo: si un usuario entra con Google y su
// email todavía no tiene cuenta en content/clientes.json, /acceso/
// llama a este endpoint y la cuenta se crea sola (sin aprobación
// manual del estudio), con un slug de invitación propio. Después
// abre el panel como cualquier cliente.
//
// Por qué un endpoint y no el token directo: el sitio es 100% estático
// y público — un token de escritura de GitHub embebido en el bundle
// podría extraerlo cualquiera y escribir en TODO el repositorio. El
// token vive solo en el backend de Apps Script (GITHUB_TOKEN en
// Propiedades del script), que además verifica la credencial con
// Google (tokeninfo: audiencia, vigencia, email verificado) y aplica
// topes anti-abuso. Es el mismo patrón del espejo de RSVPs.
//
// CÓMO ACTIVARLO (10-15 min, guía completa en docs/REGISTRO-AUTOMATICO.md):
//  1. En el proyecto de Apps Script del estudio (el del RSVP), pegar la
//     versión actualizada de google-apps-script/gallery-server.gs.
//  2. Propiedades del script: GITHUB_TOKEN (fine-grained, Contents R/W,
//     solo este repo) y GOOGLE_CLIENT_ID (el mismo de acceso-google.ts).
//  3. Implementar → Nueva implementación → Aplicación web → Ejecutar
//     como «Yo», acceso «Cualquier persona». Copiar la URL del Web App.
//  4. Pegar la URL acá abajo. Commit + push: el registro automático
//     queda activo.
//
// Mientras la constante esté vacía, /acceso/ mantiene el comportamiento
// de siempre: email de Google ajeno → aviso «sin panel asignado» +
// WhatsApp. Cero peticiones al endpoint.
//
// Estado ACTIVO desde 2026-11-02 (iteración 037): Web App verificado en
// vivo — doGet → {"ok":true,"message":"RSVP backend activo"} y POST
// registro_cliente con credencial inválida → {"success":false,"error":
// "Credencial de Google inválida."} (fail-closed, sin crear nada). Para
// DESACTIVAR: vaciar la constante (volver a '') y pushear.
// ============================================================

export const ENDPOINT_REGISTRO = 'https://script.google.com/macros/s/AKfycbyplrOmZ3wXj7e_Fk9vkhidzAj3F-MZUgooNJBwnUNsRLDB2V5IxB1Cur-dDdA6uZVh1A/exec';
