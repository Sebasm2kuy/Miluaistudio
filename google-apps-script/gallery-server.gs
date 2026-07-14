/**
 * ============================================
 * Google Apps Script — Galería de Fotos
 * Milagros XV Años - Miluaistudio
 * ============================================
 *
 * INSTRUCCIONES DE CONFIGURACIÓN:
 *
 * 1. Ir a https://script.google.com/
 * 2. Crear un nuevo proyecto
 * 3. Pegar TODO este código en Code.gs (borrar lo que haya)
 * 4. Guardar (Ctrl+S)
 * 5. Ir a Implementar → Nueva implementación
 * 6. Tipo: "Aplicación web"
 * 7. Ejecutar como: "Yo"
 * 8. Quién tiene acceso: "Cualquier persona"
 * 9. Clic en Implementar
 * 10. Autorizar los permisos cuando se soliciten (Avanzado → Ir a proyecto)
 * 11. Copiar la URL de la app web
 * 12. Pegar esa URL en gallery.tsx como PHOTO_UPLOAD_URL
 * 13. Hacer build y deploy
 *
 * El script crea automáticamente:
 * - Una carpeta "MilagrosXV_Galeria" en tu Google Drive
 * - Una hoja de cálculo "MilagrosXV_Galeria_DB" con los registros
 *
 * ============================================
 */

var FOLDER_NAME = 'MilagrosXV_Galeria';
var SPREADSHEET_NAME = 'MilagrosXV_Galeria_DB';
var SHEET_NAME = 'Fotos';
var RSVP_SHEET_NAME = 'RSVP';
var MAX_FILE_SIZE_KB = 500;

/**
 * GET handler — procesa getPhotos, chunk y assemble
 */
function doGet(e) {
  try {
    var action = e.parameter.action;

    if (action === 'getPhotos') {
      return handleGetPhotos();
    }

    if (action === 'chunk') {
      return handleChunk(e);
    }

    if (action === 'assemble') {
      return handleAssemble(e);
    }

    return jsonResponse({ error: 'Accion no valida' });
  } catch (error) {
    return jsonResponse({ error: error.message });
  }
}

/**
 * POST handler — procesa rsvp y otros
 */
function doPost(e) {
  try {
    var action = e.parameter.action;

    // RSVP no usa ?action=, llega como JSON en el body. Lo detectamos por el contenido.
    var body = null;
    try { body = JSON.parse(e.postData.contents); } catch (err) { body = null; }

    if (body && body.tipo === 'rsvp_grupo') {
      return handleRsvp(body);
    }

    // Fallback al doGet si no es RSVP
    return doGet(e);
  } catch (error) {
    return jsonResponse({ error: error.message });
  }
}

/**
 * Recibir un chunk de imagen (base64url)
 * Se guarda en CacheService con expiración de 5 minutos
 */
function handleChunk(e) {
  try {
    var uid = e.parameter.uid;
    var chunkIndex = e.parameter.i;
    var totalChunks = e.parameter.t;
    var data = e.parameter.d;

    if (!uid || data === undefined) {
      return jsonResponse({ error: 'Parametros faltantes' });
    }

    var cache = CacheService.getScriptCache();

    // Guardar el chunk
    cache.put('chunk_' + uid + '_' + chunkIndex, data, 300);

    // Guardar metadata (total de chunks)
    cache.put('meta_' + uid, String(totalChunks), 300);

    return jsonResponse({ ok: true, chunk: chunkIndex });
  } catch (error) {
    return jsonResponse({ error: error.message });
  }
}

/**
 * Ensamblar todos los chunks, decodificar y guardar en Drive
 */
function handleAssemble(e) {
  try {
    var uid = e.parameter.uid;
    if (!uid) {
      return jsonResponse({ error: 'UID faltante', success: false });
    }

    var cache = CacheService.getScriptCache();

    // Leer metadata
    var totalChunksStr = cache.get('meta_' + uid);
    if (!totalChunksStr) {
      return jsonResponse({ error: 'Upload expirado. Intenta de nuevo.', success: false });
    }

    var totalChunks = parseInt(totalChunksStr);

    // Ensamblar todos los chunks en orden
    var base64url = '';
    for (var i = 0; i < totalChunks; i++) {
      var chunk = cache.get('chunk_' + uid + '_' + i);
      if (!chunk) {
        return jsonResponse({ error: 'Chunk ' + i + ' faltante. Intenta de nuevo.', success: false });
      }
      base64url += chunk;
    }

    // Convertir base64url → base64 estándar
    var base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    // Restaurar padding
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }

    // Validar tamaño
    var byteSize = Math.ceil(base64.length * 3 / 4 / 1024);
    if (byteSize > MAX_FILE_SIZE_KB) {
      cleanupChunks(cache, uid, totalChunks);
      return jsonResponse({ error: 'Imagen muy grande. Maximo ' + MAX_FILE_SIZE_KB + 'KB.', success: false });
    }

    // Decodificar base64 y crear blob
    var decodedBytes = Utilities.base64Decode(base64);
    var blob = Utilities.newBlob(decodedBytes, 'image/jpeg', 'foto_' + Date.now() + '.jpg');

    // Guardar en Google Drive
    var folder = getOrCreateFolder();
    var file = folder.createFile(blob);

    // Hacer público
    file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);

    // Obtener URL pública
    var fileId = file.getId();
    var imageUrl = 'https://lh3.googleusercontent.com/d/' + fileId;

    // Registrar en la hoja de cálculo
    var sheet = getOrCreateSheet();
    sheet.appendRow([
      new Date().toISOString(),
      imageUrl,
      fileId,
      'Foto de invitado'
    ]);

    // Limpiar chunks del cache
    cleanupChunks(cache, uid, totalChunks);

    return jsonResponse({
      success: true,
      url: imageUrl,
      fileId: fileId
    });

  } catch (error) {
    return jsonResponse({ error: 'Error al ensamblar: ' + error.message, success: false });
  }
}

/**
 * Limpiar chunks del cache
 */
function cleanupChunks(cache, uid, totalChunks) {
  for (var i = 0; i < totalChunks; i++) {
    cache.remove('chunk_' + uid + '_' + i);
  }
  cache.remove('meta_' + uid);
}

/**
 * Obtener todas las fotos guardadas
 */
function handleGetPhotos() {
  try {
    var sheet = getSheet();
    if (!sheet) {
      return jsonResponse({ photos: [] });
    }

    var data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return jsonResponse({ photos: [] });
    }

    var photos = [];
    for (var i = data.length - 1; i >= 1; i--) {
      var url = data[i][1];
      if (url && typeof url === 'string' && url.trim() !== '') {
        photos.push(url.trim());
      }
    }

    return jsonResponse({ photos: photos });
  } catch (error) {
    return jsonResponse({ photos: [] });
  }
}

/**
 * Obtener o crear la hoja de cálculo
 */
function getOrCreateSheet() {
  var props = PropertiesService.getScriptProperties();
  var ssId = props.getProperty('SPREADSHEET_ID');

  if (!ssId) {
    var ss = SpreadsheetApp.create(SPREADSHEET_NAME);
    ssId = ss.getId();
    props.setProperty('SPREADSHEET_ID', ssId);

    var sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Fecha', 'URL', 'ID Archivo', 'Descripcion']);

    try {
      var defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('Hoja 1');
      if (defaultSheet && defaultSheet.getSheetId() !== sheet.getSheetId()) {
        ss.deleteSheet(defaultSheet);
      }
    } catch (e) {}
  }

  return SpreadsheetApp.openById(ssId).getSheetByName(SHEET_NAME);
}

/**
 * Obtener la hoja existente (sin crear)
 */
function getSheet() {
  var props = PropertiesService.getScriptProperties();
  var ssId = props.getProperty('SPREADSHEET_ID');
  if (!ssId) return null;

  try {
    return SpreadsheetApp.openById(ssId).getSheetByName(SHEET_NAME);
  } catch (e) {
    return null;
  }
}

/**
 * Obtener o crear la carpeta en Google Drive
 */
function getOrCreateFolder() {
  var folders = DriveApp.getFoldersByName(FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(FOLDER_NAME);
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

function handleRsvp(data) {
  try {
    // Validar
    if (!data || !data.invitados || !Array.isArray(data.invitados) || data.invitados.length === 0) {
      return jsonResponse({ success: false, error: 'Faltan invitados en el grupo' });
    }
    if (!data.codigo) {
      return jsonResponse({ success: false, error: 'Falta el código de grupo' });
    }

    var sheet = getOrCreateRsvpSheet();
    var codigoGrupo = String(data.codigo);
    var cantidad = data.cantidad || data.invitados.length;
    var telefono = String(data.telefono || '');
    var fechaRegistro = data.fecha || new Date().toISOString();

    // Una fila por cada invitado, todas con el mismo código de grupo
    var filas = data.invitados.map(function(nombre, i) {
      return [
        fechaRegistro,
        codigoGrupo,
        i + 1,
        cantidad,
        String(nombre || '').trim(),
        telefono
      ];
    });

    // Insertar todas las filas de una vez (atómico)
    if (filas.length > 1) {
      sheet.getRange(sheet.getLastRow() + 1, 1, filas.length, filas[0].length).setValues(filas);
    } else {
      sheet.appendRow(filas[0]);
    }

    return jsonResponse({
      success: true,
      codigo: codigoGrupo,
      cantidad: cantidad,
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
    // Si el spreadsheet no existe, lo creamos (igual que getOrCreateSheet)
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
