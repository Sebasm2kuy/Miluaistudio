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
 * CONTRATO CON EL FRONTEND (src/components/rsvp.tsx):
 *  - GET  ?action=rsvp&codigo=&cantidad=&invitados=[JSON]&telefono=&fecha=
 *  - POST JSON { tipo: "rsvp_grupo", codigo, cantidad, invitados, telefono, fecha }
 *  - Respuesta SIEMPRE JSON: { success: true, ... } o { success: false, error }
 *    El frontend distingue guardado (success true), error (success false)
 *    y pendiente (respuesta ilegible / bloqueada por CORS) — nunca afirma un
 *    guardado que no pudo verificar.
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
