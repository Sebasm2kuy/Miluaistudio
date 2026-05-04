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

const FOLDER_NAME = 'MilagrosXV_Galeria';
const SPREADSHEET_NAME = 'MilagrosXV_Galeria_DB';
const SHEET_NAME = 'Fotos';
const MAX_FILE_SIZE_KB = 500; // Máximo 500KB por foto

/**
 * GET handler — procesa getPhotos y upload (via parámetros URL)
 */
function doGet(e) {
  try {
    const action = e.parameter.action;

    if (action === 'getPhotos') {
      return handleGetPhotos();
    }

    if (action === 'upload') {
      return handleUpload(e);
    }

    return jsonResponse({ error: 'Accion no valida' });
  } catch (error) {
    return jsonResponse({ error: error.message });
  }
}

/**
 * POST handler — fallback, redirige a doGet
 */
function doPost(e) {
  return doGet(e);
}

/**
 * Obtener todas las fotos guardadas en la hoja de cálculo
 */
function handleGetPhotos() {
  try {
    const sheet = getSheet();
    if (!sheet) {
      return jsonResponse({ photos: [] });
    }

    const data = sheet.getDataRange().getValues();

    // La primera fila son los headers (Fecha, URL, ID Archivo, Nombre)
    if (data.length <= 1) {
      return jsonResponse({ photos: [] });
    }

    const photos = [];
    // Leer de abajo hacia arriba para mostrar las más recientes primero
    for (let i = data.length - 1; i >= 1; i--) {
      const row = data[i];
      const url = row[1]; // Columna B = URL
      if (url && typeof url === 'string' && url.trim() !== '') {
        photos.push(url.trim());
      }
    }

    return jsonResponse({ photos: photos });
  } catch (error) {
    console.error('Error en getPhotos: ' + error.message);
    return jsonResponse({ photos: [] });
  }
}

/**
 * Subir una foto: decodificar base64 → guardar en Drive → registrar en Sheet
 */
function handleUpload(e) {
  try {
    const imageData = e.parameter.imageData;
    const mimeType = e.parameter.mimeType || 'image/jpeg';

    if (!imageData) {
      return jsonResponse({ error: 'No se recibio imagen', success: false });
    }

    // Remover prefix data:image/...;base64, si existe
    const base64Data = imageData.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

    // Validar tamaño
    const byteSize = Math.ceil(base64Data.length * 3 / 4 / 1024);
    if (byteSize > MAX_FILE_SIZE_KB) {
      return jsonResponse({
        error: 'Imagen muy grande. Maximo ' + MAX_FILE_SIZE_KB + 'KB.',
        success: false
      });
    }

    // Decodificar base64 y crear blob
    const decodedBytes = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(decodedBytes, mimeType, 'foto_' + Date.now() + '.jpg');

    // Guardar en Google Drive
    const folder = getOrCreateFolder();
    const file = folder.createFile(blob);

    // Hacer público para que se pueda ver desde la web
    file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);

    // Obtener URL pública de la imagen
    const fileId = file.getId();
    const imageUrl = 'https://lh3.googleusercontent.com/d/' + fileId;

    // Registrar en la hoja de cálculo
    const sheet = getOrCreateSheet();
    sheet.appendRow([
      new Date().toISOString(),  // Columna A: Fecha
      imageUrl,                   // Columna B: URL pública
      fileId,                     // Columna C: ID del archivo en Drive
      'Foto de invitado'          // Columna D: Descripción
    ]);

    return jsonResponse({
      success: true,
      url: imageUrl,
      fileId: fileId
    });

  } catch (error) {
    console.error('Error en upload: ' + error.message);
    return jsonResponse({
      error: 'Error al subir: ' + error.message,
      success: false
    });
  }
}

/**
 * Obtener o crear la hoja de cálculo
 */
function getOrCreateSheet() {
  const props = PropertiesService.getScriptProperties();
  let ssId = props.getProperty('SPREADSHEET_ID');

  if (!ssId) {
    // Crear nueva hoja de cálculo
    const ss = SpreadsheetApp.create(SPREADSHEET_NAME);
    ssId = ss.getId();
    props.setProperty('SPREADSHEET_ID', ssId);

    // Crear la hoja "Fotos" con headers
    const sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Fecha', 'URL', 'ID Archivo', 'Descripcion']);

    // Eliminar la hoja por defecto "Hoja 1"
    try {
      const defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('Hoja 1');
      if (defaultSheet && defaultSheet.getSheetId() !== sheet.getSheetId()) {
        ss.deleteSheet(defaultSheet);
      }
    } catch (e) {
      // Ignorar si no se puede eliminar
    }
  }

  return SpreadsheetApp.openById(ssId).getSheetByName(SHEET_NAME);
}

/**
 * Obtener la hoja existente (sin crear)
 */
function getSheet() {
  const props = PropertiesService.getScriptProperties();
  const ssId = props.getProperty('SPREADSHEET_ID');
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
  const folders = DriveApp.getFoldersByName(FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(FOLDER_NAME);
}

/**
 * Devolver respuesta JSON con CORS headers
 */
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
