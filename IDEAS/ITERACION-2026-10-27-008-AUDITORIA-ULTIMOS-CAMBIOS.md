
# Iteración 008 — Auditoría posterior a los últimos cambios

**Fecha de auditoría:** 27-10-2026 (Montevideo)  
**Alcance:** rama main tras fusionar el PR #14, workflows de CI/despliegue y artefactos de gh-pages.  
**Conclusión:** las correcciones del PR #14 están integradas y el build publicado pasa sus verificaciones, pero todavía no recomendaría usar el flujo actual para publicar la configuración real de un evento. Hay dos riesgos P0 de privacidad y un bloqueo funcional en el flujo de publicación.

## Fuentes y evidencia revisada

- PR #14 fusionado: https://github.com/Sebasm2kuy/Miluaistudio/pull/14
- Merge commit: https://github.com/Sebasm2kuy/Miluaistudio/commit/a1ec78e608e31ed43b747cdfadbe821194e6c98e
- Validación de main exitosa: https://github.com/Sebasm2kuy/Miluaistudio/actions/runs/40556910993
- Workflow Deploy to GitHub Pages exitoso: https://github.com/Sebasm2kuy/Miluaistudio/actions/runs/40556911064
- Publicación Pages posterior exitosa: https://github.com/Sebasm2kuy/Miluaistudio/actions/runs/40557097407
- Estado de despliegue: rama gh-pages en 032928aa6b5b5df86cac8c47bbdf9db9241166be.
- Repositorio confirmado como **público** por los metadatos de GitHub.
- Inspección del HTML y de los archivos JS/CSS enlazados en la portada y personalizador, además de lectura de los scripts de verificación, configuración, panel de administración, cliente RSVP y páginas de demostración.

Esta auditoría es de código, workflow y artefactos estáticos publicados. No se realizó una prueba visual manual completa en navegador/dispositivos ni una confirmación de RSVP contra el Web App real de Google Apps Script.

## Estado general

| Área | Estado | Evidencia / límite |
|---|---|---|
| Configuración privada ausente del export actual | **Verificado en artefactos** | El workflow de main terminó con éxito y sus logs muestran verify-export y verify-privacy-export sin errores; los canarios sintéticos vigilados también están ausentes de los recursos JS/CSS enlazados revisados. |
| Datos operativos escritos en el repositorio público | **P0 abierto** | src/lib/github-deploy.ts hace PUT de la configuración serializada a src/data/config.ts en la rama pública main. La verificación actual protege out/, no el contenido del repositorio ni su historial. |
| Carga de imágenes del panel | **P0 abierto** | uploadToGitHub() escribe directamente mediante la API de Contents en public/uploads/. .gitignore no restringe una escritura efectuada directamente por API. El verificador rechaza imágenes dentro de out/uploads/, por lo que una carga puede quedar expuesta en el repo y a la vez hacer fallar el despliegue. |
| Publicar una invitación personalizada | **Bloqueo funcional** | El panel escribe config.ts, pero las rutas públicas encontradas son la portada, catálogo, demos pre-generadas y personalizador. Las demos de /catalogo/[designId]/ utilizan createDemoConfig; no se encontró una ruta pública de evento que consuma la configuración operativa. |
| RSVP | **Código mejorado; backend real pendiente** | Cliente POST en cuerpo, URL sin query de PII, respuesta verificable y fallback; no se comprobó el Web App productivo. |
| Contraste | **Automatizado y aprobado en CI** | El token oscuro está presente en los recursos exportados y la suite de contraste corre en npm test. Esto no sustituye una prueba visual completa de todos los estados/dispositivos. |
| Tests y build | **Aprobado** | La validación de main pasó Tests, Lint y Build; el deploy y publicación Pages también pasaron. |
| Peso de la portada | **Mejora confirmada por la medición del proyecto** | La Iteración 007 registró 907.429 → 652.391 bytes (−28,1 %) en index.html, usando el mismo script. Catálogo (~280 KB de HTML) y personalizador (~195 KB) siguen prácticamente sin reducción. No es un score Lighthouse ni una medición comprimida. |
| Historial Git y datos antiguos | **Pendiente de decisión del propietario** | El informe 007 documenta configuración operativa previa en el historial público. Quitar el dato de la punta de la rama no elimina commits anteriores; no se reescribió el historial. |

## Hallazgo P0-1 — La configuración operativa puede acabar en el código fuente público

### Hechos observados

- El repositorio es público.
- src/lib/github-deploy.ts construye el contenido de src/data/config.ts serializando todo el objeto de configuración recibido desde el panel y lo escribe vía GitHub Contents API sobre main.
- src/app/admin/page.tsx llama a esa función al publicar desde el panel.
- La validación nueva escanea los artefactos estáticos out/ y bloquea ciertos imports al grafo cliente. Eso resuelve la fuga comprobada en bundles, pero no hace privado un archivo que se escribe en un repositorio público.
- El README técnico de administración afirma que ningún dato de evento real se versiona, lo que contradice el flujo de publicación actual.
- La iteración anterior ya documentó que existen datos operativos en versiones antiguas del historial público. No se volvieron a extraer ni se reproducen aquí.

### Impacto

Aunque los campos no aparezcan en la web estática, cualquier valor que el panel escriba en config.ts puede leerse directamente en GitHub y queda en el historial de commits. Esto puede incluir datos de contacto, ubicaciones, enlaces de integración y datos de regalos/cuentas, según lo que el propietario cargue.

**No usar el botón actual de publicar con datos reales hasta corregir la arquitectura.**

### Acción requerida

- No guardar la configuración operativa completa en la rama de un repositorio público.
- Separar la configuración operativa de la proyección pública explícitamente autorizada. Usar almacenamiento privado/backend o un flujo privado controlado; no asumir que hacer el archivo no importable por el frontend protege el archivo en GitHub.
- Publicar solamente los campos que el propietario haya decidido hacer visibles en la invitación y que sean necesarios para sus funciones.
- Actualizar docs/ADMINISTRACION.md para describir una arquitectura real y coherente.
- Evaluar la exposición histórica con el propietario. La limpieza del historial es destructiva y no se realizó. Revocar/rotar credenciales externas si alguna estuvo expuesta en versiones anteriores, según corresponda.

## Hallazgo P0-2 — El cargador de fotos elude .gitignore y contradice el verificador

### Hechos observados

- src/app/admin/page.tsx importa y utiliza uploadToGitHub() para cargar imágenes de las tarjetas de la galería de la configuración.
- src/lib/github-deploy.ts escribe directamente mediante la API de GitHub en public/uploads/ y muestra un estado de subida exitosa si el PUT es aceptado.
- .gitignore excluye public/uploads/*, pero esta regla solo filtra operaciones de Git local; no impide que la API escriba el archivo directamente en el repositorio.
- scripts/verify-export.mjs falla si el export contiene cualquier imagen en out/uploads/, no solo los nombres históricos conocidos.
- El uploader obtiene la extensión del nombre del archivo y se apoya en el filtro del navegador accept="image/*"; no se observó validación robusta del tipo/contenido, extensión permitida y tamaño antes de subir.
- La carga no se probó en vivo durante esta auditoría; el conflicto entre los dos caminos surge directamente del código.

### Impacto

Una carga puede confirmar “Subida” y crear un archivo público en el repositorio/historial; posteriormente el workflow puede fallar al verificar el export. La regla .gitignore no mitiga el riesgo. Las fotos de invitados deben seguir el backend separado de moderación, no este uploader.

### Acción requerida

- Desactivar o sustituir la carga directa a public/uploads/ desde el panel.
- Para fotos de invitados, utilizar exclusivamente el backend de moderación con estado pendiente/aprobada/rechazada.
- Si el propietario decide publicar una foto propia como parte de una invitación, debe existir un flujo de publicación explícita con validación, consentimiento, formatos permitidos, límites de tamaño y una ubicación de assets diseñada para ese uso; no usar el directorio que el verificador prohíbe.
- Añadir una prueba del contrato de carga y confirmar que el estado de éxito no precede a la aceptación y verificación que corresponden.

## Hallazgo P0-3 — No se encontró una ruta de invitación productiva que consuma el archivo publicado

### Hechos observados

- El listado actual de src/app contiene la portada, catálogo, /catalogo/[designId]/ y /personalizar/, además de la herramienta local /admin que se elimina del export.
- src/app/catalogo/[designId]/page.tsx genera parámetros estáticos para la colección y usa createDemoConfig(design).
- src/hooks/useConfig.tsx usa CONFIG_DEMO_BASE como fallback público; la configuración local persistida se lee del navegador.
- La protección de privacidad actual prohíbe imports de valor de src/data/config.ts desde src/, y verify-privacy-export.mjs confirma que el archivo operativo no vuelva al grafo cliente.
- La función deployToGitHub() sigue escribiendo config.ts, pero no se encontró una ruta pública de evento que lea esos valores o genere un enlace único de invitación con ellos.

### Impacto

En el estado del repositorio observado, editar/publicar config.ts no demuestra que cambie una invitación visible para los invitados. El flujo está tironeado entre dos requisitos: no incluir datos operativos en el cliente y, al mismo tiempo, necesitar una invitación publicada que muestre los campos públicos elegidos por el anfitrión.

### Acción requerida

Definir el producto de publicación antes de volver a usar esta función:

1. Una configuración privada para edición.
2. Una acción explícita de publicar que genere una **proyección de campos públicos** y una URL/versionado de invitación.
3. Una ruta de evento que consuma esa proyección, con los campos de RSVP/fotos conectados únicamente si los servicios están configurados y verificados.
4. Pruebas de que la URL de demo sigue siendo sintética y la invitación personalizada publicada muestra solo los campos autorizados.

No resolverlo reimportando config.ts completo en los bundles cliente; eso reintroduciría la fuga anterior.

## Hallazgos P1/P2 adicionales

### RSVP

La implementación actual usa POST, transporta los datos personales en el cuerpo y distingue guardado verificable de pendiente/error. Los recursos públicos revisados contienen el código del contrato nuevo y no se halló no-cors en los JS enlazados.

Sigue pendiente probar el **Web App de Apps Script que está realmente desplegado**. El script .gs de GitHub no actualiza automáticamente la implementación de Google. Hasta verificar una respuesta real del servicio, el estado “pendiente” y el fallback de WhatsApp son el comportamiento correcto.

### Contraste, CI y despliegue

El token de contraste #8a6534 aparece en recursos exportados. La corrida de validación posterior al merge pasó Tests, Lint y Build; el deploy a gh-pages y la publicación de Pages también terminaron en éxito. Los enlaces están al inicio de esta iteración.

### Rendimiento

La medición de la iteración anterior registra una reducción del HTML de la portada del 28,1 %. En esta auditoría los artefactos publicados siguen el patrón esperado: portada de unas 651 mil posiciones de texto extraído, catálogo de unas 280 mil y personalizador de unas 195 mil. El número del extractor no se debe confundir con peso comprimido de red. No se ejecutó Lighthouse ni Core Web Vitals.

### Historial público y fechas de documentación

- El historial Git público puede conservar datos que ya no aparecen en main ni en gh-pages; no se considera purgado.
- La iteración 007 tiene fecha 28-10-2026 en su nombre y encabezado, mientras que el merge y los workflows asociados aparecen fechados el 27-10-2026 UTC. Es una inconsistencia documental que conviene corregir en una edición futura sin reescribir la iteración anterior.

## Plan de corrección priorizado

1. **Bloquear el envío de datos operativos a main público** y decidir el almacenamiento privado/publicación.
2. **Eliminar o reemplazar la carga directa a public/uploads/**, que puede exponer archivos y hacer fallar el build.
3. Diseñar y probar el flujo real de publicación de una invitación personalizada con campos públicos explícitos, sin reintroducir config.ts en el grafo cliente.
4. Verificar manualmente el Web App de Apps Script actual para RSVP y fotos, sin usar datos personales reales en las pruebas.
5. Mantener Tests/Lint/Build y pruebas de privacidad de artefactos en CI; añadir tests para las rutas de publicación/carga cuando se implemente la solución.
6. Decidir expresamente si corresponde purgar el historial público y rotar credenciales expuestas. No hacerlo automáticamente por ser una operación destructiva.

## Veredicto

**El PR #14 corrigió y desplegó correctamente los defectos para los que se implementaron pruebas, pero no cierra el riesgo de privacidad del flujo de administración.** El chequeo del bundle público es necesario, no suficiente: hay que proteger también el repositorio fuente, las imágenes subidas y la generación real de una invitación personalizada. Mantener el estado actual como “correcciones de exportación aprobadas; publicación operativa no aprobada hasta resolver P0-1, P0-2 y P0-3”.
