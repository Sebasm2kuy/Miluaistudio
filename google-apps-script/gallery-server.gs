/**
 * ============================================
 * Google Apps Script — Backend de RSVP
 * Miluaistudio
 * ============================================
 *
 * ⚠️ ESTE SCRIPT SOLO MANEJA RSVP (confirmaciones de asistencia).
 *
 * La subida de fotos de la galería vive en un script SEPARADO con moderación:
 * google-apps-script/photo-server.gs (carpetas Pendientes/Aprobadas, estado
 * "pendiente" hasta que los organizadores aprueben). Antes, este script
 * duplicaba endpoints de fotos con publicación automática y sin moderación;
 * eso se retiró para que no pueda desplegarse por accidente un backend que
 * publique fotos de invitados sin revisión.
 *
 * INSTRUCCIONES DE CONFIGURACIÓN:
 *
 * 1. Ir a https://script.google.com/
 * 2. Crear un nuevo proyecto (o reutilizar el existente de RSVP)
 * 3. Pegar TODO este código en Code.gs (borrar lo que haya)
 * 4. Guardar (Ctrl+S) — nombrarlo "Miluaistudio - RSVP"
 * 5. Ir a Implementar → Nueva implementación
 * 6. Tipo: "Aplicación web"
 * 7. Ejecutar como: "Yo"
 * 8. Quién tiene acceso: "Cualquier persona"
 * 9. Clic en Implementar y autorizar los permisos
 * 10. Copiar la URL de la app web
 * 11. Pegarla en /admin → sección RSVP → campo "Google Sheet URL"
 *     (o directamente en config.ts como rsvp.googleSheetUrl)
 *
 * El script crea automáticamente:
 * - Una hoja de cálculo "MilagrosXV_Galeria_DB" con la pestaña "RSVP"
 *
 * CONTRATO CON EL FRONTEND (src/components/rsvp.tsx → src/lib/rsvp-client.ts):
 *  - POST JSON { tipo: "rsvp_grupo", codigo, cantidad, invitados, telefono, fecha, slug? }
 *    ← contrato ACTIVO: el frontend envía los datos solo en el cuerpo, nunca
 *      en la query string (privacidad: los datos personales no deben quedar
 *      en URLs, historiales ni logs intermedios). Se envía con Content-Type
 *      text/plain (solicitud "simple", sin preflight CORS).
 *    El campo OPCIONAL `slug` llega en las invitaciones publicadas
 *    (rsvp.slugInvitacion) y habilita el ESPEJO a GitHub (abajo).
 *  - GET  ?action=rsvp&...  ← LEGADO: se conserva por compatibilidad con
 *    versiones anteriores del frontend, pero el frontend actual NO lo usa.
 *  - Respuesta SIEMPRE JSON: { success: true, ... } o { success: false, error }
 *    El frontend distingue guardado (success true), error (success false)
 *    y pendiente (respuesta ilegible / bloqueada por CORS) — nunca afirma un
 *    guardado que no pudo verificar.
 *
 * ⚠️ RECORDATORIO DE DESPLIEGUE: editar este archivo NO actualiza el Web App
 * ya desplegado en Google. Tras cambiar el código hay que crear una NUEVA
 * implementación (o gestionar "Nueva implementación → Probar
 * implementaciones") y verificar con una prueba controlada que la URL
 * productiva responde al contrato POST.
 *
 * ESPEJO OPCIONAL A GITHUB (content/rsvps/<slug>.json):
 *  - Si definís la propiedad de script GITHUB_TOKEN (Configuración del
 *    proyecto → Propiedades del script), cada RSVP confirmado se agrega
 *    TAMBIÉN a content/rsvps/<slug>.json del repositorio con un commit
 *    automático [skip ci] (no reconstruye el sitio). Es lo que alimenta
 *    el panel de cliente (/dashboard/confirmaciones).
 *  - Sin GITHUB_TOKEN el script funciona EXACTAMENTE igual que siempre
 *    (solo hoja de cálculo): el espejo está desactivado por defecto.
 *  - El archivo del repo NUNCA guarda teléfonos (privacidad: quedan solo
 *    en la hoja). El token recomendado es fine-grained, Contents R/W, solo
 *    este repo; se puede revocar cuando quieras sin afectar la hoja.
 *
 * ============================================
 */

var SPREADSHEET_NAME = 'MilagrosXV_Galeria_DB';
var RSVP_SHEET_NAME = 'RSVP';

// Límites anti-abuso del endpoint público de RSVP
var RSVP_MAX_INVITADOS = 12;
var RSVP_MAX_NOMBRE = 60;
var RSVP_MAX_CODIGO = 20;
var RSVP_RL_POR_HORA = 5; // confirmaciones por teléfono por hora

/**
 * GET handler — solo action=rsvp
 */
function doGet(e) {
  try {
    var action = e.parameter.action;

    if (action === 'rsvp') {
      return handleRsvp(normalizarRsvpGet(e.parameter));
    }

    return jsonResponse({ ok: true, message: 'RSVP backend activo' });
  } catch (error) {
    return jsonResponse({ success: false, error: error.message });
  }
}

/**
 * POST handler — RSVP como JSON en el body
 */
function doPost(e) {
  try {
    var body = null;
    try { body = JSON.parse(e.postData.contents); } catch (err) { body = null; }

    if (body && body.tipo === 'rsvp_grupo') {
      return handleRsvp(body);
    }

    // Fallback al doGet si no es RSVP (permite ?action=rsvp por POST también)
    return doGet(e);
  } catch (error) {
    return jsonResponse({ success: false, error: error.message });
  }
}

/**
 * Devolver respuesta JSON
 */
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ============================================
 * RSVP — Confirmaciones de asistencia agrupadas
 * ============================================
 *
 * El frontend envía un JSON con esta estructura:
 * {
 *   "tipo": "rsvp_grupo",
 *   "codigo": "MIL-1234",
 *   "cantidad": 3,
 *   "invitados": ["María González", "Pedro Pérez", "Lucía Fernández"],
 *   "telefono": "099123456",
 *   "fecha": "2026-07-14T15:30:00.000Z"
 * }
 *
 * El script guarda una fila por invitado, con el mismo código de grupo
 * para que puedan filtrarse/agruparse en la hoja de cálculo.
 */

var RSVP_HEADERS = ['Fecha Registro', 'Código Grupo', 'Índice', 'Cantidad Total', 'Nombre y Apellido', 'Teléfono'];

/**
 * Convierte los parámetros de un GET action=rsvp al mismo formato del POST JSON.
 * El frontend envía: action, codigo, cantidad, invitados (JSON), telefono, fecha.
 */
function normalizarRsvpGet(p) {
  var invitados = [];
  try { invitados = JSON.parse(p.invitados || '[]'); } catch (err) { invitados = []; }
  if (typeof invitados === 'string') invitados = [invitados];
  if (!Array.isArray(invitados)) invitados = [];
  return {
    tipo: 'rsvp_grupo',
    codigo: p.codigo || '',
    cantidad: parseInt(p.cantidad, 10) || 0,
    invitados: invitados,
    telefono: p.telefono || '',
    fecha: p.fecha || ''
  };
}

/**
 * Valida y registra un RSVP de grupo (GET normalizado o POST JSON).
 * Devuelve siempre { success: true/false, ... } para que el frontend pueda
 * distinguir guardado real de error.
 */
function handleRsvp(data) {
  try {
    // ===== Validación server-side =====
    if (!data || !data.invitados || !Array.isArray(data.invitados) || data.invitados.length === 0) {
      return jsonResponse({ success: false, error: 'Faltan invitados en el grupo' });
    }
    if (!data.codigo) {
      return jsonResponse({ success: false, error: 'Falta el código de grupo' });
    }

    var codigoGrupo = String(data.codigo).trim().slice(0, RSVP_MAX_CODIGO);
    if (!codigoGrupo) {
      return jsonResponse({ success: false, error: 'Código de grupo inválido' });
    }

    var telefono = String(data.telefono || '').replace(/[^0-9]/g, '').slice(0, 15);
    if (telefono.length < 6) {
      return jsonResponse({ success: false, error: 'Teléfono inválido' });
    }

    var nombres = [];
    for (var i = 0; i < data.invitados.length && nombres.length < RSVP_MAX_INVITADOS; i++) {
      var nombre = String(data.invitados[i] || '').trim().slice(0, RSVP_MAX_NOMBRE);
      if (nombre.length >= 2) nombres.push(nombre);
    }
    if (nombres.length === 0) {
      return jsonResponse({ success: false, error: 'Nombres de invitados inválidos' });
    }

    var cantidad = parseInt(data.cantidad, 10) || nombres.length;
    if (cantidad < 1 || cantidad > RSVP_MAX_INVITADOS) {
      return jsonResponse({ success: false, error: 'Cantidad de invitados fuera de rango' });
    }

    var fechaRegistro = String(data.fecha || '');
    if (!/^\d{4}-\d{2}-\d{2}T/.test(fechaRegistro)) fechaRegistro = new Date().toISOString();

    // ===== Anti-abuso: límite por teléfono (CacheService, ventana de 1 hora) =====
    var cache = CacheService.getScriptCache();
    var rlKey = 'rsvp_rl_' + telefono;
    var previos = cache.get(rlKey);
    var usados = previos ? parseInt(previos, 10) : 0;
    if (usados >= RSVP_RL_POR_HORA) {
      return jsonResponse({ success: false, error: 'Demasiadas confirmaciones desde este teléfono. Probá de nuevo más tarde.' });
    }

    var sheet = getOrCreateRsvpSheet();

    // ===== Anti-duplicados: mismo código + teléfono ya registrado =====
    var datos = sheet.getDataRange().getValues();
    for (var f = 1; f < datos.length; f++) {
      if (String(datos[f][1]) === codigoGrupo && String(datos[f][5]) === telefono) {
        cache.put(rlKey, String(usados + 1), 3600);
        return jsonResponse({
          success: true,
          codigo: codigoGrupo,
          duplicado: true,
          registrados: parseInt(datos[f][3], 10) || nombres.length,
          message: 'Este grupo ya estaba registrado'
        });
      }
    }

    // Una fila por cada invitado, todas con el mismo código de grupo
    var filas = nombres.map(function(nombre, i) {
      return [
        fechaRegistro,
        codigoGrupo,
        i + 1,
        Math.min(cantidad, RSVP_MAX_INVITADOS),
        nombre,
        telefono
      ];
    });

    // Insertar todas las filas de una vez (atómico)
    if (filas.length > 1) {
      sheet.getRange(sheet.getLastRow() + 1, 1, filas.length, filas[0].length).setValues(filas);
    } else {
      sheet.appendRow(filas[0]);
    }

    cache.put(rlKey, String(usados + 1), 3600);

    // Espejo opcional a GitHub (content/rsvps/<slug>.json): nunca rompe el RSVP.
    // Sin teléfono (privacidad) — los nombres viajan solo dentro del JSON del repo.
    mirarRsvpAGitHub({
      slug: String(data.slug || '').trim(),
      codigo: codigoGrupo,
      fecha: fechaRegistro,
      cantidad: Math.min(cantidad, RSVP_MAX_INVITADOS),
      invitados: nombres,
    });

    return jsonResponse({
      success: true,
      codigo: codigoGrupo,
      cantidad: Math.min(cantidad, RSVP_MAX_INVITADOS),
      registrados: filas.length
    });
  } catch (error) {
    return jsonResponse({ success: false, error: 'Error al registrar RSVP: ' + error.message });
  }
}

/**
 * Obtener o crear la hoja de RSVP dentro del mismo spreadsheet
 */
function getOrCreateRsvpSheet() {
  var props = PropertiesService.getScriptProperties();
  var ssId = props.getProperty('SPREADSHEET_ID');

  var ss;
  if (!ssId) {
    // Si el spreadsheet no existe, lo creamos
    ss = SpreadsheetApp.create(SPREADSHEET_NAME);
    ssId = ss.getId();
    props.setProperty('SPREADSHEET_ID', ssId);
  } else {
    ss = SpreadsheetApp.openById(ssId);
  }

  var sheet = ss.getSheetByName(RSVP_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(RSVP_SHEET_NAME);
    sheet.appendRow(RSVP_HEADERS);

    // Formatear encabezados
    var headerRange = sheet.getRange(1, 1, 1, RSVP_HEADERS.length);
    headerRange.setFontWeight('bold').setBackground('#f4e4bc');

    // Congelar la primera fila
    sheet.setFrozenRows(1);

    // Ajustar ancho de columnas
    sheet.setColumnWidth(1, 180);  // Fecha
    sheet.setColumnWidth(2, 140);  // Código Grupo
    sheet.setColumnWidth(3, 80);   // Índice
    sheet.setColumnWidth(4, 100);  // Cantidad Total
    sheet.setColumnWidth(5, 280);  // Nombre y Apellido
    sheet.setColumnWidth(6, 140);  // Teléfono
  }

  return sheet;
}

/**
 * ============================================
 * ESPEJO A GITHUB — content/rsvps/<slug>.json (OPCIONAL)
 * ============================================
 *
 * Agrega la confirmación al archivo del repositorio vía Contents API con
 * un commit automático cuyo mensaje lleva [skip ci] (el deploy de Pages
 * solo escucha push a main y salta este commit: confirmar asistencia NO
 * reconstruye el sitio).
 *
 * Garantías:
 *  - Solo actúa si existe la propiedad de script GITHUB_TOKEN y el payload
 *    trae `slug` (invitaciones publicadas desde 2026-10-31).
 *  - Reintenta ante conflicto de SHA (dos confirmaciones simultáneas):
 *    re-lee el archivo y re-aplica el append (máx. 3 intentos).
 *  - Es fail-safe: cualquier error se registra en el log y el RSVP queda
 *    igualmente guardado en la hoja (respuesta al invitado intacta).
 *  - Sin teléfonos; dedup por código de grupo.
 */
var GITHUB_REPO = 'Sebasm2kuy/Miluaistudio';
var RSVP_MAX_EN_REPO = 2000;

function mirarRsvpAGitHub(entrada) {
  try {
    var token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
    if (!token || !entrada.slug) return;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(entrada.slug)) return; // slug normalizado o nada

    var ruta = 'content/rsvps/' + entrada.slug + '.json';
    var api = 'https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + ruta;
    var cabeceras = {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };

    for (var intento = 0; intento < 3; intento++) {
      if (intento > 0) Utilities.sleep(450 * intento);

      // 1. Leer colección existente (404 = primera confirmación de esta invitación)
      var coleccion = { esquema: 1, actualizadoEn: '', rsvps: [] };
      var sha = null;
      var get = UrlFetchApp.fetch(api, {
        headers: { Authorization: cabeceras.Authorization, Accept: cabeceras.Accept },
        muteHttpExceptions: true
      });
      if (get.getResponseCode() === 200) {
        var datos = JSON.parse(get.getContentText());
        sha = datos.sha;
        try {
          var previa = JSON.parse(Utilities.newBlob(Utilities.base64Decode(datos.content)).getDataAsString());
          if (previa && Array.isArray(previa.rsvps)) coleccion = previa;
        } catch (e) { coleccion = { esquema: 1, actualizadoEn: '', rsvps: [] }; }
      } else if (get.getResponseCode() !== 404) {
        console.warn('rsvp-espejo: lectura ' + get.getResponseCode());
        return;
      }

      // 2. Dedup por código + tope de seguridad
      for (var i = 0; i < coleccion.rsvps.length; i++) {
        if (coleccion.rsvps[i].codigo === entrada.codigo) return; // ya está
      }
      if (coleccion.rsvps.length >= RSVP_MAX_EN_REPO) return;
      coleccion.rsvps.push({
        codigo: entrada.codigo,
        fecha: entrada.fecha,
        cantidad: entrada.cantidad,
        invitados: entrada.invitados,
        asistencia: 'si',
        origen: 'formulario'
      });
      coleccion.esquema = 1;
      coleccion.actualizadoEn = new Date().toISOString();

      // 3. Commit automático ([skip ci]: no dispara rebuild)
      var cuerpo = {
        message: 'rsvp(' + entrada.slug + '): +1 confirmación (' + entrada.cantidad + ' personas) [skip ci]',
        content: Utilities.base64Encode(JSON.stringify(coleccion, null, 2) + '\n'),
        branch: 'main'
      };
      if (sha) cuerpo.sha = sha;
      var put = UrlFetchApp.fetch(api, {
        method: 'put',
        headers: cabeceras,
        payload: JSON.stringify(cuerpo),
        muteHttpExceptions: true
      });
      if (put.getResponseCode() < 300) return; // listo
      if (put.getResponseCode() !== 409 && put.getResponseCode() !== 422) {
        console.warn('rsvp-espejo: escritura ' + put.getResponseCode());
        return;
      }
      // 409/422 = SHA desactualizado: reintenta re-leyendo (loop)
    }
    console.warn('rsvp-espejo: conflicto persistente tras reintentos');
  } catch (e) {
    console.warn('rsvp-espejo: ' + e.message); // fail-safe: el RSVP ya está en la hoja
  }
}
