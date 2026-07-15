/**
 * ============================================
 * Google Apps Script — Galería de Fotos con Moderación
 * Milagros XV Años - Miluaistudio
 * ============================================
 *
 * SCRIPT SEPARADO del de RSVP. No tocar el de RSVP.
 *
 * INSTRUCCIONES DE CONFIGURACIÓN:
 *
 * 1. Ir a https://script.google.com/
 * 2. Crear un NUEVO proyecto (separado del de RSVP)
 * 3. Pegar TODO este código (borrar lo que haya)
 * 4. Guardar (Ctrl+S) — nombrarlo "Miluaistudio - Fotos"
 * 5. Implementar → Nueva implementación → Aplicación web
 * 6. Ejecutar como: "Yo"
 * 7. Quién tiene acceso: "Cualquier persona"
 * 8. Implementar → autorizar permisos (Drive + Sheets)
 * 9. Copiar la URL nueva
 * 10. Pegarla en /admin → sección Galeria → campo "Photo Upload URL"
 *     (o directamente en config.ts como galeria.photoUploadUrl)
 *
 * El script crea automáticamente:
 * - Carpeta "MilagrosXV_Fotos_Pendientes" en Drive (fotos recién subidas)
 * - Carpeta "MilagrosXV_Fotos_Aprobadas" en Drive (fotos visibles en galería)
 * - Spreadsheet "MilagrosXV_Fotos_DB" con hoja "Fotos" para moderación
 *
 * FLUJO DE MODERACIÓN:
 * - El invitado sube una foto → va a "Pendientes" + fila en sheet con estado "pendiente"
 * - Vos abrís el sheet → cambias "pendiente" → "aprobada" (o usás el menú custom)
 * - Al aprobar: la foto se mueve a "Aprobadas", se hace pública, y aparece en la galería
 * - Para rechazar: cambias a "rechazada" y se borra del Drive automáticamente
 *
 * ============================================
 */

var FOLDER_PENDIENTES = 'MilagrosXV_Fotos_Pendientes';
var FOLDER_APROBADAS = 'MilagrosXV_Fotos_Aprobadas';
var SPREADSHEET_NAME = 'MilagrosXV_Fotos_DB';
var SHEET_NAME = 'Fotos';
var MAX_FILE_SIZE_KB = 500;

var PHOTO_HEADERS = ['Fecha', 'URL Pública', 'URL Pendiente', 'ID Archivo', 'Estado', 'Thumbnail'];

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

    return jsonResponse({ ok: true, message: 'Photo backend activo' });
  } catch (error) {
    return jsonResponse({ error: error.message });
  }
}

/**
 * POST handler — fallback al doGet
 */
function doPost(e) {
  return doGet(e);
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

    cache.put('chunk_' + uid + '_' + chunkIndex, data, 300);
    cache.put('meta_' + uid, String(totalChunks), 300);

    return jsonResponse({ ok: true, chunk: chunkIndex });
  } catch (error) {
    return jsonResponse({ error: error.message });
  }
}

/**
 * Ensamblar todos los chunks, decodificar y guardar en Drive (carpeta Pendientes)
 */
function handleAssemble(e) {
  try {
    var uid = e.parameter.uid;
    if (!uid) {
      return jsonResponse({ error: 'UID faltante', success: false });
    }

    var cache = CacheService.getScriptCache();
    var totalChunksStr = cache.get('meta_' + uid);
    if (!totalChunksStr) {
      return jsonResponse({ error: 'Upload expirado. Intenta de nuevo.', success: false });
    }

    var totalChunks = parseInt(totalChunksStr);
    var base64url = '';
    for (var i = 0; i < totalChunks; i++) {
      var chunk = cache.get('chunk_' + uid + '_' + i);
      if (!chunk) {
        return jsonResponse({ error: 'Chunk ' + i + ' faltante. Intenta de nuevo.', success: false });
      }
      base64url += chunk;
    }

    var base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }

    var byteSize = Math.ceil(base64.length * 3 / 4 / 1024);
    if (byteSize > MAX_FILE_SIZE_KB) {
      cleanupChunks(cache, uid, totalChunks);
      return jsonResponse({ error: 'Imagen muy grande. Maximo ' + MAX_FILE_SIZE_KB + 'KB.', success: false });
    }

    var decodedBytes = Utilities.base64Decode(base64);
    var blob = Utilities.newBlob(decodedBytes, 'image/jpeg', 'foto_' + Date.now() + '.jpg');

    // Guardar en carpeta Pendientes (NO pública todavía)
    var folder = getOrCreateFolder(FOLDER_PENDIENTES);
    var file = folder.createFile(blob);

    // Pendiente: ANYONE_WITH_LINK puede ver (para que el moderador la previsualice)
    // pero NO aparece en búsqueda pública. Solo cuando se aprueba se hace ANYONE.
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var fileId = file.getId();
    // URL para previsualización del moderador (mientras esté pendiente)
    var pendingUrl = 'https://lh3.googleusercontent.com/d/' + fileId;

    // Registrar en la hoja con estado "pendiente"
    var sheet = getOrCreateSheet();
    sheet.appendRow([
      new Date().toISOString(),
      '',              // URL pública — se llena al aprobar
      pendingUrl,      // URL pendiente (para preview del moderador)
      fileId,
      'pendiente',
      '=IMAGE("' + pendingUrl + '=s120")'  // Thumbnail en el sheet
    ]);

    cleanupChunks(cache, uid, totalChunks);

    return jsonResponse({
      success: true,
      pendingUrl: pendingUrl,
      fileId: fileId,
      message: 'Foto recibida. Va a estar visible en la galería pronto.'
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
 * Obtener todas las fotos APROBADAS (las que ven los invitados en la galería)
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
    // Recorrer de la más reciente a la más vieja
    for (var i = data.length - 1; i >= 1; i--) {
      var estado = String(data[i][4] || '').trim().toLowerCase();
      var urlPublica = String(data[i][1] || '').trim();
      if (estado === 'aprobada' && urlPublica) {
        photos.push(urlPublica);
      }
    }

    return jsonResponse({ photos: photos });
  } catch (error) {
    return jsonResponse({ photos: [] });
  }
}

/**
 * Obtener o crear la hoja de cálculo de fotos
 */
function getOrCreateSheet() {
  var props = PropertiesService.getScriptProperties();
  var ssId = props.getProperty('PHOTO_SPREADSHEET_ID');

  if (!ssId) {
    var ss = SpreadsheetApp.create(SPREADSHEET_NAME);
    ssId = ss.getId();
    props.setProperty('PHOTO_SPREADSHEET_ID', ssId);

    var sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(PHOTO_HEADERS);

    // Formatear encabezados
    var headerRange = sheet.getRange(1, 1, 1, PHOTO_HEADERS.length);
    headerRange.setFontWeight('bold').setBackground('#f4e4bc');
    sheet.setFrozenRows(1);

    // Anchos de columna
    sheet.setColumnWidth(1, 180);  // Fecha
    sheet.setColumnWidth(2, 320);  // URL Pública
    sheet.setColumnWidth(3, 320);  // URL Pendiente
    sheet.setColumnWidth(4, 200);  // ID Archivo
    sheet.setColumnWidth(5, 100);  // Estado
    sheet.setColumnWidth(6, 140);  // Thumbnail

    // Crear menú custom al abrir
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
  var ssId = props.getProperty('PHOTO_SPREADSHEET_ID');
  if (!ssId) return null;

  try {
    return SpreadsheetApp.openById(ssId).getSheetByName(SHEET_NAME);
  } catch (e) {
    return null;
  }
}

/**
 * Obtener o crear carpeta en Google Drive
 */
function getOrCreateFolder(name) {
  var folders = DriveApp.getFoldersByName(name);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(name);
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
 * MENÚ CUSTOM DE MODERACIÓN
 * ============================================
 *
 * Estas funciones se ejecutan desde el menú "🎭 Moderación" que aparece
 * en el spreadsheet cuando lo abrís. No se llaman desde el frontend.
 *
 * Para que el menú aparezca: abrí el spreadsheet por primera vez,
 * después corré "crearMenuModeracion" manualmente desde el editor de
 * Apps Script (Run > crearMenuModeracion). El menú aparece la próxima
 * vez que abras el sheet.
 */

function crearMenuModeracion() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.addMenu('🎭 Moderación', [
    { name: '✅ Aprobar seleccionadas', functionName: 'aprobarSeleccionadas' },
    { name: '❌ Rechazar seleccionadas', functionName: 'rechazarSeleccionadas' },
    { name: '🔄 Sincronizar estados', functionName: 'sincronizarEstados' },
  ]);
}

/**
 * Aprobar las filas seleccionadas en el sheet
 * — Cambia estado a "aprobada"
 * — Mueve el archivo a la carpeta Aprobadas
 * — Cambia sharing a ANYONE (público)
 * — Llena la columna "URL Pública"
 */
function aprobarSeleccionadas() {
  var sheet = getSheet();
  if (!sheet) {
    SpreadsheetApp.getUi().alert('No se encontró la hoja de fotos.');
    return;
  }

  var selection = sheet.getActiveSelection();
  var row = selection.getRow();
  var numRows = selection.getNumRows();
  var data = selection.getValues();

  var aprobadas = 0;
  for (var i = 0; i < numRows; i++) {
    var currentRow = row + i;
    if (currentRow <= 1) continue;  // skip header

    var fileId = sheet.getRange(currentRow, 4).getValue();
    var estadoActual = String(sheet.getRange(currentRow, 5).getValue() || '').toLowerCase();

    if (!fileId || estadoActual === 'aprobada') continue;

    try {
      var file = DriveApp.getFileById(fileId);

      // Mover a carpeta Aprobadas
      var folderAprobadas = getOrCreateFolder(FOLDER_APROBADAS);
      var folderPendientes = getOrCreateFolder(FOLDER_PENDIENTES);
      file.moveTo(folderAprobadas);

      // Hacer completamente pública
      file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);

      // Actualizar fila
      var urlPublica = 'https://lh3.googleusercontent.com/d/' + fileId;
      sheet.getRange(currentRow, 2).setValue(urlPublica);  // URL Pública
      sheet.getRange(currentRow, 5).setValue('aprobada');  // Estado
      sheet.getRange(currentRow, 6).setValue('=IMAGE("' + urlPublica + '=s120")');  // Thumbnail

      aprobadas++;
    } catch (err) {
      // archivo borrado o inaccesible
      sheet.getRange(currentRow, 5).setValue('error: ' + err.message);
    }
  }

  SpreadsheetApp.getUi().alert('✅ ' + aprobadas + ' foto(s) aprobada(s) y visibles en la galería.');
}

/**
 * Rechazar las filas seleccionadas — borra el archivo del Drive
 */
function rechazarSeleccionadas() {
  var sheet = getSheet();
  if (!sheet) {
    SpreadsheetApp.getUi().alert('No se encontró la hoja de fotos.');
    return;
  }

  var selection = sheet.getActiveSelection();
  var row = selection.getRow();
  var numRows = selection.getNumRows();

  var rechazadas = 0;
  for (var i = 0; i < numRows; i++) {
    var currentRow = row + i;
    if (currentRow <= 1) continue;

    var fileId = sheet.getRange(currentRow, 4).getValue();
    var estadoActual = String(sheet.getRange(currentRow, 5).getValue() || '').toLowerCase();

    if (!fileId || estadoActual === 'rechazada') continue;

    try {
      // Borrar archivo del Drive
      DriveApp.getFileById(fileId).setTrashed(true);
    } catch (err) {
      // ya estaba borrado, no importa
    }

    // Actualizar fila
    sheet.getRange(currentRow, 5).setValue('rechazada');
    sheet.getRange(currentRow, 6).clearContent();  // borrar thumbnail
    rechazadas++;
  }

  SpreadsheetApp.getUi().alert('❌ ' + rechazadas + ' foto(s) rechazada(s) y eliminada(s).');
}

/**
 * Sincronizar estados — recorre todo el sheet y procesa cambios manuales
 * (por si cambiaste "pendiente" → "aprobada" a mano en la columna Estado)
 */
function sincronizarEstados() {
  var sheet = getSheet();
  if (!sheet) {
    SpreadsheetApp.getUi().alert('No se encontró la hoja de fotos.');
    return;
  }

  var data = sheet.getDataRange().getValues();
  var procesadas = 0;

  for (var i = 1; i < data.length; i++) {
    var fileId = data[i][3];
    var estado = String(data[i][4] || '').trim().toLowerCase();
    var urlPublica = data[i][1];

    if (!fileId) continue;

    // Si está marcado como aprobada pero no tiene URL pública, completarla
    if (estado === 'aprobada' && !urlPublica) {
      try {
        var file = DriveApp.getFileById(fileId);
        var folderAprobadas = getOrCreateFolder(FOLDER_APROBADAS);
        file.moveTo(folderAprobadas);
        file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);

        var url = 'https://lh3.googleusercontent.com/d/' + fileId;
        sheet.getRange(i + 1, 2).setValue(url);
        sheet.getRange(i + 1, 6).setValue('=IMAGE("' + url + '=s120")');
        procesadas++;
      } catch (err) {
        sheet.getRange(i + 1, 5).setValue('error: ' + err.message);
      }
    }

    // Si está marcado como rechazada y el archivo sigue vivo, borrarlo
    if (estado === 'rechazada') {
      try {
        DriveApp.getFileById(fileId).setTrashed(true);
      } catch (err) {}
    }
  }

  SpreadsheetApp.getUi().alert('🔄 ' + procesadas + ' foto(s) sincronizada(s).');
}
