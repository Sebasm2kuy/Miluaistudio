# Iteración 004 — Nueva revisión posterior al prompt de corrección (27-10-2026)

## Alcance y estado de la versión

Se volvió a revisar la publicación estática en la rama `gh-pages`, el código en `main`, los assets JavaScript que carga el personalizador y los commits/workflows recientes.

- El último despliegue de GitHub Pages inspeccionado terminó con éxito: [workflow 40528227450](https://github.com/Sebasm2kuy/Miluaistudio/actions/runs/40528227450).
- La validación del commit de documentación también terminó correctamente: [workflow 40528072478](https://github.com/Sebasm2kuy/Miluaistudio/actions/runs/40528072478).
- La comparación desde el último commit de código revisado hasta el commit actual muestra únicamente cuatro rutas cambiadas y todas son documentación: iteración 002, iteración 003, prompt Z.AI nuevo e índice IDEAS. No hay cambios funcionales en la aplicación en esa secuencia.
- Se intentó acceder a la web con las herramientas de navegación disponibles, pero no se pudo abrir la URL en una sesión de navegador desde este entorno. La revisión se basó en la salida estática exportada en `gh-pages` y el código fuente. No se ejecutó interacción real en dispositivos ni Lighthouse/PageSpeed.

**Conclusión central:** se volvió a publicar la web, pero los problemas de aplicación identificados en la auditoría 002 no fueron corregidos por estos commits; se agregaron y organizaron documentación y prompts.

## Hallazgos actuales

### P0 — Valores del perfil de evento presentes en JavaScript público

**Comprobación nueva:** se inspeccionaron los diez bundles JavaScript referenciados por la página estática del personalizador y se compararon, sin reproducirlos en el informe, con valores de distintos campos de `src/data/config.ts`. Hay cadenas coincidentes correspondientes a campos del perfil del evento y contenidos asociados (por ejemplo, nombre/apodo, fecha, lugar/ubicación, hashtag, URL de mapa, texto de dedicatoria y enlaces de música).

Los bundles están en la carpeta pública `gh-pages/_next/static/chunks/`, por lo que cualquier visitante puede descargarlos. El hecho de que `createDemoConfig` reemplace visualmente esos campos no basta si la configuración base con sus valores sigue siendo importada por un módulo que termina en el bundle cliente.

**Impacto:** si esos valores de `config.ts` corresponden a un evento real o a datos que no deben redistribuirse, no están aislados del cliente. No se reproducen aquí los valores ni se afirma que cada uno sea sensible por sí mismo; el propietario debe confirmar si los campos son ficticios o pertenecen a un evento real.

**Corrección requerida:**
1. No importar el objeto de configuración del evento real en código cliente ni en módulos necesarios para renderizar el personalizador público.
2. Crear una configuración por defecto estrictamente sintética para las demostraciones y el personalizador, con endpoints externos vacíos.
3. Si hace falta conservar configuración operativa real para administrar una invitación, mantenerla fuera de bundles/archivos públicos y fuera de Git cuando contenga datos privados.
4. Comprobar la exportación completa y los chunks después del cambio. Escanearlos de forma segura sin imprimir los valores encontrados.
5. Si se confirma que el perfil real fue publicado y no tenía autorización, revisar el alcance de la exposición histórica y considerar la limpieza/rotación que corresponda con aprobación humana.

**Aceptación:** ninguna cadena de perfil que deba ser privada aparece en HTML o JavaScript público; el personalizador continúa funcionando con datos ficticios. Debe verificarse sobre los archivos efectivamente generados en `out/`, no solo sobre el código fuente.

### P0 — El panel administrativo sigue publicado

La rama `gh-pages` continúa conteniendo `admin/index.html` (alrededor de 36 KB). El archivo incluye el “Panel de Configuración” y su metadata es `noindex, nofollow`; el archivo existe igualmente en la publicación estática. La metadata no es autenticación.

**Corrección requerida:** excluir la ruta del artefacto desplegado o trasladar la administración a un entorno privado con autenticación real. Conservar una manera segura y documentada de gestionar el sitio. No se corrigió con los commits de documentación.

### P0 — Imágenes subidas y captura siguen en el sitio público

En `main/public/uploads/` y en la publicación se siguen encontrando tres archivos JPG con nombres generados. La raíz publicada también incluye una captura PNG de aproximadamente 1,24 MB. Se puede confirmar que los archivos son públicos, pero no determinar su autorización con sus nombres.

**Corrección requerida:** inspección humana de titularidad, contenido y consentimiento. Los recursos sin autorización o innecesarios deben excluirse del despliegue mediante cambios revisables. No borrar a ciegas ni asumir que moverlos a otra carpeta pública los vuelve privados.

### P1 — Contraste insuficiente: sin corrección visible en esta versión

Los pares de color detectados en la versión anterior siguen reflejándose en los estilos de las páginas comerciales:

| Combinación inspeccionada | Contraste calculado | Estado para texto normal |
|---|---:|---|
| Gris cálido `#716a63` sobre marfil `#faf8f4` | 5,02:1 | Cumple AA |
| Gris auxiliar `#8f867c` sobre marfil | 3,37:1 | No cumple 4,5:1 |
| Placeholder `#a39a8e` sobre blanco | 2,77:1 | No cumple 4,5:1 |
| Blanco sobre verde WhatsApp `#25d366` | 1,98:1 | No cumple |
| Blanco sobre champagne `#b58c5a` | 3,06:1 | No cumple para texto normal |

Cambiar el color del texto a un tono oscuro de contraste suficiente o ajustar los fondos, conservando la identidad. Recalcular cada estado y variante tras editar.

### P1 — El contador fijo sigue apareciendo en las miniaturas

El HTML de la portada y el catálogo sigue incluyendo los mismos valores visuales del contador para múltiples diseños, aunque las fechas ficticias son distintas. El código de `mini-invitation.tsx` contiene la constante de contador.

**Corrección requerida:** quitar esa cuenta regresiva de las miniaturas, mostrar una vista sin segundos o calcularla a partir de la fecha ficticia de ese diseño. No modificar el contador funcional de las demos sin probarlo.

### P1 — El título del personalizador sigue duplicado

El HTML publicado actualmente conserva el título:
`Personalizá tu invitación | Miluaistudio | Miluaistudio`.

**Corrección requerida:** revisar `src/app/layout.tsx` y `src/app/personalizar/page.tsx` para añadir la marca una sola vez.

### P1 — Jerarquía de encabezados de portada

En el HTML de portada el H1 comercial aparece después de varios encabezados H3 que pertenecen a nombres decorativos de las maquetas. Debe preservarse el diseño, pero el texto decorativo no debería desordenar el árbol de encabezados. Usar elementos no heading o excluir la maqueta completa de la semántica cuando corresponda.

### P2 — Tamaño del HTML: prácticamente sin variación

Los archivos generados consultados siguen cerca de los tamaños anteriores:

| Página publicada | Longitud del HTML |
|---|---:|
| Inicio | ~904 KB |
| Catálogo | ~280 KB |
| Personalizador | ~194 KB |
| Demo individual | ~77 KB |
| Admin | ~36 KB |

Estos valores son longitudes de HTML generado, no peso descargado/comprimido ni una puntuación Lighthouse. No hay indicios de una optimización de la aplicación entre la auditoría anterior y esta revisión, porque en ese período solo cambiaron documentos.

**Corrección requerida:** reducir instancias repetidas de maquetas en la portada, usar miniaturas optimizadas donde no se necesita interactividad, optimizar las imágenes grandes y cargar diferidamente recursos no críticos. Comparar artefactos antes/después y no inventar métricas de rendimiento.

### P2 — SEO y canonical

El título duplicado sigue presente. La portada y el catálogo conservan canonical y descripción; las demos tienen `noindex, follow` y canonical hacia el catálogo. Esto puede ser intencional si las demos no deben indexarse, pero conviene documentarlo y mantener la política consistente. El sitemap consultado sigue conteniendo solo inicio, catálogo y personalizador.

### P2 — Integraciones no confirmadas en producción

La configuración por defecto observada mantiene vacíos el endpoint de RSVP y el de carga de fotos. Esto es apropiado para una plantilla/demo si se mantiene así. No pude ejecutar una prueba end-to-end contra los servicios desplegados de Apps Script, ni confirmar desde este entorno la disponibilidad actual de Mercado Libre.

La revisión del código anterior indicó que el RSVP distingue guardado/pending/error y que el script de fotos separado implementa moderación. Esas propiedades del código no sustituyen una prueba de los servicios reales. Antes de dar un evento por listo, configurar y probar los endpoints controlados y verificar registros reales de prueba.

## Estado resumido frente a la auditoría 002

| Hallazgo | Estado en esta revisión |
|---|---|
| Panel `/admin/` en publicación | Sigue presente |
| Valores de perfil en bundles cliente | Se confirmó coincidencia de varias cadenas de campos de configuración en JS público; revisar si son datos reales |
| JPG en `public/uploads/` y captura PNG | Siguen presentes; falta revisión de consentimiento |
| Contrastes bajos | Siguen en los estilos inspeccionados |
| Contador fijo en maquetas | Sigue presente |
| Título duplicado de personalizador | Sigue presente |
| H3 decorativos antes del H1 comercial | Sigue presente |
| HTML inicial voluminoso/repetitivo | Sin mejora funcional en commits posteriores |
| Tests/build y deploy | Workflows de documentación finalizaron correctamente; no prueban por sí mismos la UI ni integraciones |

## Plan recomendado

1. Resolver primero la presencia de datos de evento en bundles y la publicación de `/admin/`.
2. Revisar y retirar de la exportación los recursos no autorizados después de confirmación humana.
3. Corregir contraste, contador fijo, título duplicado y jerarquía de encabezados.
4. Reducir el HTML repetido y optimizar assets; medir rendimiento real después.
5. Ejecutar lint, typecheck, build y pruebas de rutas/assets sobre la rama candidata.
6. Confirmar manualmente el permiso de publicar imágenes y realizar pruebas controladas de RSVP, fotos, precio y enlaces antes de fusionar/publicar.

## Lo que no se modificó

Esta iteración es una auditoría y un registro. No modifica código funcional. La comparación de commits confirma que los cambios recientes en `main` fueron solo documentación. Tampoco se ejecutó limpieza de historial, eliminación irreversible de imágenes ni cambios de producción.

## Enlaces útiles

- Sitio publicado: https://sebasm2kuy.github.io/Miluaistudio/
- Repositorio: https://github.com/Sebasm2kuy/Miluaistudio
- Prompt de corrección para Z.AI: [PROMPT-ZAI-CORRECCION-FINAL.md](./PROMPT-ZAI-CORRECCION-FINAL.md)
- Auditoría previa: [ITERACION-2026-10-27-002-AUDITORIA-WEB.md](./ITERACION-2026-10-27-002-AUDITORIA-WEB.md)
