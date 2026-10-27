# Iteración 011 — Auditoría de los últimos cambios funcionales

**Fecha de auditoría:** 27-10-2026 (Montevideo)  
**Alcance:** PR #15 fusionado en `main`, workflows de validación/despliegue y archivos publicados en `gh-pages`.  
**Exclusiones respetadas:** no se realiza una auditoría general de privacidad, no se evalúa ni modifica el historial Git, y no se trabaja en almacenamiento privado o rotación de credenciales.

## Fuentes verificadas

- PR #15: https://github.com/Sebasm2kuy/Miluaistudio/pull/15
- Commit de merge: `ca03fabcc4384602f133da7cd44523c6c482c5db`
- Validación en `main`: https://github.com/Sebasm2kuy/Miluaistudio/actions/runs/40570651926
- Despliegue de GitHub Pages: https://github.com/Sebasm2kuy/Miluaistudio/actions/runs/40570651849
- Publicación de Pages: https://github.com/Sebasm2kuy/Miluaistudio/actions/runs/40570759266
- Iteración funcional del equipo: `IDEAS/ITERACION-2026-10-28-010-MEJORAS-FUNCIONALES-PUBLICACION.md`
- Código revisado: ruta `src/app/i/[slug]/page.tsx`, colección `src/lib/invitaciones-publicadas.ts`, representación `src/data/invitacion-publicada.ts`, uploader `src/lib/github-deploy.ts` / `src/lib/activos-editor.ts`, panel local y cliente RSVP.

Esta revisión confirma código, CI y artefactos estáticos. No se ejecutó una sesión manual completa del panel con token real, una subida real de imagen ni una confirmación contra el Web App productivo de Apps Script. Tampoco se ejecutó una revisión visual completa en navegador móvil/escritorio.

## Resultado ejecutivo

**La mayor parte de la iteración funcional está implementada y desplegada.** Se verificaron dos páginas de invitación de ejemplo en la rama publicada, y la automatización terminó con éxito: 93 tests aprobados, lint aprobado, build/export aprobado, deploy y publicación de Pages exitosos.

Quedan **dos ajustes funcionales recomendados** antes de considerar el flujo completamente listo para uso cotidiano: el botón antiguo `Deploy` sigue pareciendo un publicador válido aunque no crea una URL de invitación; y el uploader permite validar solo por extensión/MIME si falla la lectura de los bytes iniciales. Además, la publicación real desde el panel y el Apps Script real siguen pendientes de prueba manual.

## Estado por área

| Área | Resultado | Evidencia / limitación |
|---|---|---|
| Invitaciones con URL propia | **Implementado; páginas de ejemplo publicadas** | `/i/ejemplo-quince/` y `/i/ejemplo-boda/` existen en `gh-pages`; el build registra ambas rutas estáticas. |
| Coexistencia de invitaciones | **Verificado por tests y build** | Cada slug tiene JSON propio; ambas páginas aparecen en el export sin sobrescribir la otra. |
| BasePath y metadata | **Verificado en HTML exportado** | Canonical absoluto bajo `/Miluaistudio/i/<slug>/`, título por evento y `noindex, follow`. |
| Vista previa local | **Implementada; inspección estática** | `/previsualizar/` usa el componente de invitación existente y configuración del navegador, con fallback sintético. No se completó una sesión manual en navegador. |
| Assets del editor | **Código y tests simulados aprobados** | Carpeta destino diferenciada `public/assets-invitaciones/`, URL con basePath, validación de formato/tamaño/firma y pruebas de fetch simulado. No se hizo una subida real desde el panel. |
| Fotos de invitados | **Flujo existente preservado** | `public/uploads/` sigue sin imágenes en el export; el build lo verifica. |
| RSVP | **Tests simulados aprobados; backend real pendiente** | Cliente POST y estados honestos; `docs/PRUEBA-MANUAL-RSVP.md` sigue marcando la prueba externa como pendiente. |
| CI | **Aprobado** | Run de validación: 93 tests, 93 pass, 0 fail; Lint y build/export exitosos. |
| Despliegue | **Aprobado** | Workflow de deploy y publicación de Pages terminaron en éxito. |
| Publicación manual desde panel | **Pendiente** | El PR no hizo una publicación real con el token del propietario. Debe confirmarse después de desplegar. |

## Hallazgo F-01 — El botón antiguo «Deploy» puede confundir al propietario

**Prioridad: P1 — claridad funcional**

### Evidencia

- En `src/app/admin/page.tsx`, el botón del encabezado sigue llamando a `handleDeploy`.
- `handleDeploy` llama a `deployToGitHub()` de `src/lib/github-deploy.ts`.
- Esa función escribe `src/data/config.ts` en la rama `main` y devuelve un mensaje indicando que el deploy se activará automáticamente.
- El nuevo flujo real está separado en la tarjeta «Publicar invitación (enlace propio /i/slug/)» y utiliza `publicarInvitacionEnGitHub()` para crear/actualizar `content/invitaciones/<slug>.json`.
- La propia implementación indica que ningún componente consume el archivo `src/data/config.ts` desde el desacople anterior.

### Impacto funcional

La persona puede pulsar el botón superior «Deploy», ver un mensaje de éxito y esperar una invitación pública que en realidad no se ha creado. El panel ahora tiene el publicador correcto, pero mantener dos acciones con nombres parecidos crea un camino muerto.

### Corrección recomendada

- Cambiar el botón superior a «Guardar» o «Vista previa», o retirarlo del flujo normal.
- Si se conserva como herramienta heredada, etiquetarlo claramente como legado/no publica invitaciones y no mostrar «deploy listo» como si fuese la publicación final.
- Dejar una sola acción destacada para crear/actualizar el enlace de invitación.
- Añadir un test o una comprobación de UI que garantice que la acción principal de publicación invoca `publicarInvitacionEnGitHub`, no `deployToGitHub`.

No se cambió en esta auditoría; se registra como próximo arreglo.

## Hallazgo F-02 — La validación de firma del uploader tiene una ruta de fallback permisiva

**Prioridad: P2 — robustez funcional de la carga**

### Evidencia

- `uploadToGitHub()` intenta leer los primeros 16 bytes con `file.slice(0, 16).arrayBuffer()`.
- Si esa lectura lanza una excepción, asigna `bytes = undefined` y continúa.
- `validarArchivoImagen()` permite que `bytes` sea opcional y, cuando no están disponibles, solo comprueba nombre/extensión, tamaño y MIME informado.
- Los tests comprueban correctamente que un ejecutable disfrazado se rechaza **cuando se suministran bytes**, pero no prueban el caso en que el uploader no consigue leer esos bytes.

### Impacto funcional

En el camino normal de navegador la lectura debería funcionar, pero ante un error de lectura la promesa de «firma real obligatoria» deja de cumplirse y un archivo con extensión/MIME convincente puede pasar la validación previa.

### Corrección recomendada

- En el flujo real de subida, tratar un error al leer bytes como rechazo explícito y pedir que se vuelva a seleccionar el archivo.
- Mantener opcional el argumento `bytes` solo para validaciones preliminares de UI si se necesita, pero exigir firma válida dentro de `uploadToGitHub()`.
- Añadir test del uploader con un objeto File simulado cuya lectura de `slice().arrayBuffer()` falle y verificar que no se llame a la API de GitHub.

No se cambió en esta auditoría; se registra como siguiente ajuste.

## Hallazgo F-03 — La integración externa RSVP todavía no está verificada en producción

**Prioridad: P1 — prueba manual necesaria**

El cliente `src/lib/rsvp-client.ts` envía POST con `Content-Type: text/plain;charset=utf-8`, procesa la respuesta del Apps Script y devuelve `guardado`, `pendiente` o `error`. La suite automatizada cubre respuesta válida, wrapper HTML, respuesta de error, HTTP 500 ilegible, timeout, red caída, URL vacía y respuesta antigua `ok:true` sin `success:true`.

Esto **no demuestra** que el Web App actualmente desplegado en la cuenta de Google acepte el contrato nuevo o que escriba en la hoja esperada. El documento `docs/PRUEBA-MANUAL-RSVP.md` lista los pasos y sigue sin resultados registrados.

### Próximo paso

Ejecutar los pasos del documento con datos 100 % ficticios y anotar el resultado de:
1. POST válido.
2. Fila nueva en la pestaña RSVP correcta.
3. POST inválido que devuelve error.
4. Envío desde la invitación publicada con respuesta verificable o fallback visible.

No presentar el servicio externo como verificado hasta completar esa prueba.

## Hallazgo F-04 — Las invitaciones de ejemplo están desplegadas; la publicación real aún no se probó

**Prioridad: P1 — aceptación manual final**

### Confirmado

- `gh-pages/i/ejemplo-quince/index.html` existe y tiene título/canonical propios, `noindex` y contenido sintético del ejemplo.
- `gh-pages/i/ejemplo-boda/index.html` también existe con su propia página.
- Los logs del build registran `/i/ejemplo-boda` y `/i/ejemplo-quince` como rutas SSG y verifican sus HTML.
- `verify-export.mjs` comprueba que cada JSON publicado tenga página HTML y que los assets locales referenciados por esas invitaciones existan en el export.
- La carpeta de assets nuevos no existe todavía en el artefacto de Pages; los fixtures usan imágenes existentes del catálogo. Esto es compatible con no haber hecho aún una carga real desde el panel.

### Pendiente

La publicación de las dos fixtures durante el build demuestra que la ruta estática funciona. **No demuestra que el flujo de panel con token real funcione de punta a punta.**

El propietario debe:
1. Abrir el panel local según `docs/ADMINISTRACION.md`.
2. Configurar un evento de prueba ficticio.
3. Usar «Ver vista previa» y confirmar que coincide con la configuración editada.
4. Publicar con el slug de prueba.
5. Esperar a que termine el deploy y abrir el enlace absoluto devuelto.
6. Actualizar el mismo slug y confirmar que conserva la URL.
7. Publicar un segundo slug y confirmar que el primero sigue existiendo.
8. Subir una imagen de prueba y verificar su URL en la invitación publicada.

No usar datos de un evento real para esta prueba de aceptación.

## Tests y workflows

Runs verificados:

- [Validate Miluaistudio — success](https://github.com/Sebasm2kuy/Miluaistudio/actions/runs/40570651926)
- [Deploy to GitHub Pages — success](https://github.com/Sebasm2kuy/Miluaistudio/actions/runs/40570651849)
- [pages build and deployment — success](https://github.com/Sebasm2kuy/Miluaistudio/actions/runs/40570759266)

El log de validación contiene:
- `# tests 93`
- `# pass 93`
- `# fail 0`
- `Verificación de exportación: sin errores.`
- `Verificación de privacidad del export: sin fugas.`

La mención de la última línea solo registra el resultado automático del build, no amplía el alcance de esta auditoría hacia una revisión general de privacidad.

## Veredicto

**Estado: aprobado en CI y desplegado; aceptación manual de producto pendiente.**

El flujo estático de invitaciones personalizadas está implementado y hay dos páginas de ejemplo publicadas. Antes de dar por cerrada la iteración, recomiendo resolver el botón heredado que confunde «Deploy» con «Publicar invitación» y cerrar el fallback permisivo de validación de archivos. Después, el propietario debe confirmar una publicación real desde el panel y ejecutar la prueba manual del Apps Script.

La privacidad general sigue fuera de alcance por decisión del propietario y no se aborda en esta iteración.
