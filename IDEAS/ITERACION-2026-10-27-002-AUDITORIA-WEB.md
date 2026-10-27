# Iteración 002 — Auditoría profunda de la web publicada (27-10-2026)

## Alcance y método

Se revisó la versión exportada en `gh-pages` y el código de `main` para la portada, catálogo, personalizador, una demo y el panel administrativo. También se consultaron los últimos workflows de validación y publicación de GitHub Actions.

**Límite importante:** no se ejecutó una sesión real de navegador en distintos dispositivos, Lighthouse/PageSpeed ni un envío a los servicios reales de Google Apps Script. Los tamaños indicados son longitudes de los archivos HTML generados según GitHub, no medidas de transferencia comprimida ni Core Web Vitals. Los riesgos que dependen de los endpoints activos quedan pendientes de prueba.

## Resumen ejecutivo

La web tiene una base comercial clara y una identidad visual coherente. El ciclo reciente de validación y despliegue terminó con éxito. También hay mejoras de confianza y privacidad que conviene conservar: las reseñas están marcadas como ejemplos, las demos usan perfiles ficticios y el RSVP de muestra no debería enviar datos reales; el flujo actual diferencia un guardado confirmado de uno pendiente.

Los siguientes pasos no deberían ser un rediseño total. La prioridad es cerrar riesgos de administración/datos públicos, ajustar accesibilidad y después reducir el HTML repetido y pulir SEO y previsualizaciones.

## Qué está bien y conviene conservar

- La propuesta de valor es comprensible: invitación web, personalización y funciones del evento en un enlace.
- Hay varios caminos visibles para continuar: personalizador, catálogo, WhatsApp y publicación externa.
- Los diez diseños tienen páginas de demostración estáticas generadas en el build.
- La metadata básica de inicio y catálogo incluye títulos, descripción, canonical y Open Graph.
- El sitemap incluye inicio, catálogo y personalizador. Las demos están marcadas `noindex`, y el panel también lo está; eso ayuda al SEO, aunque **no constituye autenticación ni privacidad**.
- Las reseñas actuales están rotuladas “Ejemplo de referencia”, y se aclara que las reseñas reales se publicarán con autorización. Mantenerlo así hasta validar opiniones reales.
- El personalizador construye la vista previa en vivo. La demo pública sustituye los datos del evento y deja vacíos los campos externos de RSVP y subida de fotos.
- El envío de RSVP actual devuelve “guardado” solo ante una respuesta verificable; cuando no puede leer la respuesta termina como “pendiente”, no como éxito confirmado.
- El flujo de fotos separado tiene un paso de moderación: la recepción no equivale a publicación y la interfaz lo comunica.

## Hallazgos por prioridad

### P1 — El panel administrativo se publica junto a la web

**Evidencia:** existe una ruta estática `/admin/` en la carpeta publicada. Incluye controles de configuración y una operación de publicación que llama a la API de GitHub desde el navegador con un token introducido por el usuario. La metadata `noindex, nofollow` no impide que alguien entre directamente ni protege los archivos o controles.

**Riesgo:** el panel expone una superficie innecesaria en producción y, si alguien consigue introducir o capturar un token, podría tener capacidad para modificar archivos del repositorio conforme a los permisos de ese token.

**Recomendación:** quitar el panel de la publicación pública o migrarlo a un servicio con autenticación real. No confiar en una URL difícil de adivinar ni en `noindex`. Evitar usar un token de GitHub desde una página pública; preferir un flujo privado de despliegue, por ejemplo cambios revisados mediante Git/PR. El token actual usa `sessionStorage` y se limpia una copia heredada de `localStorage`, una mejora frente al almacenamiento persistente, pero no elimina el problema de seguridad del token en el navegador.

### P1 — Verificar la configuración que parece ser de un evento real

**Evidencia:** aunque el comentario de `src/data/config.ts` la presenta como plantilla neutra, la configuración base conserva varios campos de evento cargados (perfil, fecha, lugar, mapa, hashtag y enlaces de música). Los campos de RSVP, teléfono anfitrión, datos de regalos y endpoint de subida aparecen vacíos en la configuración examinada. No se reproducen aquí los valores concretos.

**Riesgo:** si alguno de los campos prellenados corresponde a una celebración real, puede quedar incluido en el repositorio público o en los assets estáticos generados, también en el panel público.

**Recomendación:** confirmar expresamente que todos los valores prellenados sean ficticios y seguros para publicación. Mantener un archivo de demo con datos sintéticos, sin direcciones personales, enlaces identificables, fotografías privadas ni datos bancarios. Antes de hacer público cualquier archivo o despliegue, revisar el contenido generado, no solo el código fuente.

### P1 — Revisar los archivos de imágenes subidos al repositorio público

**Evidencia:** `public/uploads/` contiene tres JPG añadidos al repositorio con nombres no descriptivos. Además, hay una captura PNG de aproximadamente 1,24 MB en `public/` que no aparece referenciada por nombre en el código que se buscó.

**Riesgo:** todo recurso que termina dentro de `public` en GitHub Pages queda disponible para visitantes. El nombre aleatorio no convierte una fotografía en privada, y eliminar un archivo de la última versión no borra necesariamente sus copias históricas de Git.

**Recomendación:** revisar manualmente cada imagen para confirmar titularidad, consentimiento y necesidad de publicarla. Retirar las que no deban ser públicas; para fotos enviadas por invitados, preferir almacenamiento con reglas de acceso/moderación fuera del repositorio y evitar versionarlas en Git. Si ya se publicó material privado, valorar además la limpieza del historial y la rotación de cualquier secreto asociado.

### P1 — Corregir contraste de textos y botones

Ratios calculados a partir de los colores CSS presentes en las páginas comerciales:

| Combinación | Contraste calculado | Evaluación para texto normal |
|---|---:|---|
| `#716a63` sobre `#faf8f4` | 5,02:1 | Pasa AA |
| `#8f867c` sobre `#faf8f4` | 3,37:1 | No pasa 4,5:1 |
| `#a39a8e` sobre blanco | 2,77:1 | No pasa 4,5:1 |
| Blanco sobre verde WhatsApp `#25d366` | 1,98:1 | No pasa |
| Blanco sobre verde hover `#1db957` | 2,58:1 | No pasa |
| Blanco sobre champagne `#b58c5a` | 3,06:1 | No pasa para texto normal |

**Recomendación:** oscurecer los textos secundarios y placeholders; en botones verdes y champagne usar texto suficientemente oscuro o ajustar los fondos hasta cumplir. Volver a medir estados normal, hover, foco, deshabilitado y modo oscuro. Esto es una comprobación dirigida de colores, no una auditoría WCAG completa de todos los componentes.

### P2 — El HTML inicial es pesado y repite muchas maquetas

Tamaño de los HTML generados inspeccionados (longitud del archivo, no peso de red comprimido):

| Página | Tamaño del HTML |
|---|---:|
| Inicio | ~904 KB |
| Catálogo | ~280 KB |
| Personalizador | ~194 KB |
| Una demo | ~77 KB |
| Admin | ~36 KB |

La portada repite el contenido de maquetas de invitaciones en varios bloques. En las tarjetas y el catálogo hay elementos visuales complejos que pueden generarse una y otra vez en el HTML.

**Recomendación:** reducir instancias de `MiniInvitation` en la portada, usar thumbnails optimizadas estáticas donde no haya interacción, diferir contenido inferior al primer pantallazo y revisar qué módulos deben hidratarse en el cliente. Convertir PNG grandes a WebP/AVIF cuando corresponda. Después medir rendimiento real con Lighthouse/PageSpeed y Core Web Vitals, en vez de deducir puntuaciones solo por el tamaño del HTML.

### P2 — Corregir metadatos y jerarquía de encabezados

- El título generado del personalizador repite la marca: “Personalizá tu invitación | Miluaistudio | Miluaistudio”. La metadata local ya añade el nombre de marca y la plantilla global vuelve a añadirlo.
- En la portada aparecen encabezados `h3` procedentes de los mockups de nombres antes del H1 comercial. Son elementos ilustrativos, pero forman parte de la jerarquía semántica.
- Las demos tienen `noindex` y canonical apuntando a la página general del catálogo. Como esas páginas se excluyen del índice intencionalmente, no parece el problema SEO más urgente, pero conviene definir y mantener una política coherente de canonical/noindex por tipo de página.

**Recomendación:** quitar el sufijo duplicado del título y hacer que las maquetas decorativas no introduzcan encabezados en la estructura accesible (por ejemplo, usar spans/divs o marcar el bloque completo como decorativo cuando corresponda). Comprobar el árbol de accesibilidad tras el cambio.

### P2 — La cuenta regresiva de las miniaturas parece un dato fijo

**Evidencia:** las tarjetas de los diez modelos muestran la misma cuenta regresiva (120 días, 14 horas, 32 minutos y 05 segundos), aunque representan fechas diferentes. El componente de miniatura define esos números como constantes; la cuenta regresiva completa de la demo sí usa la fecha de evento.

**Riesgo:** parece un contador real y puede restar credibilidad si un visitante lo compara entre diseños.

**Recomendación:** usar una miniatura neutral sin segundos, calcular el contador a partir de cada fecha ficticia o etiquetarlo claramente como elemento ilustrativo. No cambiar la cuenta regresiva funcional de las demos sin pruebas de zonas horarias.

### P2 — Confirmar precio y destino comercial antes de comprar

La web muestra **$ 1.200 UYU, pago único** y enlaza a Mercado Libre. Conviene abrir el enlace exacto desde la web publicada y confirmar que la publicación siga activa, que el importe visible coincida y que la descripción cubra exactamente lo ofrecido (personalización, publicación final y funciones incluidas). No se verificó el proceso de compra ni el contenido actual de la publicación enlazada.

### P2 — Probar las integraciones en un evento real antes de entregar

**Evidencia:** en la configuración base revisada, el endpoint de RSVP y el endpoint de carga de fotos están vacíos. En la demo es intencional que el envío no ocurra; para un evento contratado, en cambio, hay que configurar los endpoints y probarlos.

**Recomendación:** checklist de salida por invitación: RSVP registra una respuesta y puede consultarse en Sheets; el estado pendiente nunca se comunica como guardado; subida de foto termina en “pendiente”, requiere aprobación y solo aparece después de aprobar; enlaces de mapas, calendario, Spotify y WhatsApp corresponden al evento correcto. No se pudo confirmar la disponibilidad actual de las aplicaciones desplegadas de Apps Script.

## Plan recomendado de corrección

1. **Primero:** cerrar/eliminar `/admin/` de la publicación pública y confirmar que la plantilla y los assets no contienen datos privados ni imágenes no autorizadas.
2. Ajustar los contrastes de texto y botones y corregir el título duplicado/estructura H1–H3.
3. Hacer que las miniaturas no aparenten contadores reales; reducir el HTML repetido y optimizar imágenes/audio.
4. Verificar precio, publicación externa y realizar pruebas completas de RSVP y carga/moderación de fotos con datos de prueba controlados.
5. Añadir una prueba automática mínima para comprobar rutas de salida estática, enlaces internos, metadata esperada y que el panel de administración no se publique si se decide retirarlo.

## Qué no se debe concluir todavía

- El éxito de GitHub Actions indica que el lint/build y el despliegue terminaron, no que las interacciones estén probadas de punta a punta.
- No se midieron puntuaciones Lighthouse, velocidad real en móvil, Core Web Vitals ni accesibilidad completa.
- No se verificó en vivo la URL actual de Apps Script ni se mandaron datos de invitados.
- La presencia de archivos en `public/uploads/` confirma que son publicables, pero no permite afirmar desde el nombre si las personas fotografiadas dieron consentimiento; eso requiere revisión humana.

## Referencias de trabajo

- Código fuente: https://github.com/Sebasm2kuy/Miluaistudio
- Versión publicada: https://sebasm2kuy.github.io/Miluaistudio/
- Panel estático encontrado: https://sebasm2kuy.github.io/Miluaistudio/admin/
- Catálogo: https://sebasm2kuy.github.io/Miluaistudio/catalogo/
- Personalizador: https://sebasm2kuy.github.io/Miluaistudio/personalizar/
