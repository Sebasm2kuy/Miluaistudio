# Prompt para Z.AI — Corrección final de errores de Miluaistudio

> **Objetivo:** implementar las correcciones reales detectadas en la auditoría de la web publicada. No entregar solamente recomendaciones. Trabajar de forma revisable, probar los cambios y dejar claro qué quedó resuelto y qué requiere validación humana.

## 1. Proyecto y contexto

- Sitio publicado: https://sebasm2kuy.github.io/Miluaistudio/
- Repositorio: https://github.com/Sebasm2kuy/Miluaistudio
- Rama principal conocida: `main`
- Stack: Next.js App Router, React, TypeScript, Tailwind CSS y exportación estática para GitHub Pages.
- Idioma de interfaz: español de Uruguay (`es-UY`).
- Ruta base obligatoria: `/Miluaistudio`.
- Configuración conocida: `output: "export"`, `basePath: "/Miluaistudio"`, `trailingSlash: true`.
- Registro de auditoría: `IDEAS/ITERACION-2026-10-27-002-AUDITORIA-WEB.md`.
- Prompt previo de producto/diseño: `IDEAS/PROMPT-ZAI-AUDITORIA-REDISENO.md`.

Antes de cambiar archivos, leé esos documentos, inspeccioná el estado actual de `main`, revisá los cambios recientes y confirmá qué hallazgos siguen presentes. No asumas que el código quedó igual desde la auditoría.

## 2. Forma de trabajo obligatoria

1. **Implementá correcciones**, no te limites a generar una lista de sugerencias.
2. Si podés crear ramas y Pull Requests, trabajá en una rama dedicada, por ejemplo `fix/auditoria-final-web`. No hagas push directo a `main`, no fusiones el PR y no publiques a producción sin aprobación humana.
3. Cambios pequeños, coherentes y revisables. No rehagas la web de cero ni elimines funciones útiles sin analizar dependencias.
4. Conservá rutas, diseños, catálogo, personalizador y funcionalidades comerciales que funcionen, salvo en los casos de seguridad detallados abajo.
5. No cambies el nombre de marca, el precio comercial, los mensajes comerciales aprobados ni las condiciones de venta sin autorización.
6. No inventes resultados de pruebas. Ejecutá los comandos disponibles y registrá su salida/resumen; si una prueba no puede ejecutarse, decilo.
7. Nunca copies a informes, commits, logs ni respuestas tokens, contraseñas, valores bancarios, teléfonos personales, URLs privadas completas ni datos identificables de un evento. Usá nombres de archivo y descripciones generales al documentar.
8. No publiques capturas de pantalla, imágenes, testimonios ni datos de celebraciones reales sin confirmar autorización.
9. No reescribas el historial Git ni borres recursos irreversiblemente sin explicar el motivo y contar con aprobación. Si una decisión depende del consentimiento o titularidad de una imagen, dejala señalada como bloqueo para revisión humana.
10. Si una corrección requiere servicios, credenciales o permisos externos que no tenés, finalizá todo lo demás y documentá el bloqueo con exactitud. Nunca simules que una integración quedó probada.

## 3. P0 — Quitar la superficie administrativa insegura del sitio público

### Hallazgo a resolver
La ruta estática `/admin/` queda incluida en la publicación de GitHub Pages. El panel actual puede realizar cambios en GitHub usando un token introducido en el navegador. Una página marcada `noindex` no queda protegida, y GitHub Pages no tiene autenticación de servidor para proteger una ruta privada.

### Trabajo solicitado
- Verificá si `/admin/` y sus artefactos se siguen exportando a `out/` y publicando en `gh-pages`.
- No consideres suficiente quitar un enlace, renombrar el botón, agregar `noindex`, usar una URL poco conocida o pedir una contraseña sólo con JavaScript.
- Como GitHub Pages es estático, **no implementes autenticación falsa ni afirmes que un panel client-side está protegido**.
- Sacá el panel de administración del artefacto público y verificá que no se genere una página navegable `/admin/` en `out/`. Preservá el código y el flujo de trabajo de manera revisable; si hace falta, trasladá la herramienta a un entorno de administración local/privado o dejá una guía clara de gestión mediante GitHub y Pull Requests.
- No publiques un token dentro del código, HTML, JavaScript estático, archivos de configuración ni variables `NEXT_PUBLIC_*`.
- Revisá el manejo legado de tokens en `localStorage`/`sessionStorage`. Eliminá cualquier almacenamiento persistente de credenciales que no sea necesario y no registres valores. Aunque `sessionStorage` dure menos que `localStorage`, un token utilizado desde la página sigue expuesto a riesgos del navegador.
- Buscá con cuidado si hay secretos reales en los archivos que se publican. No muestres sus valores. Si hay evidencia de exposición de un token, no copies el token: reportá el tipo de archivo y recomendá su revocación/rotación. Borrar un archivo en el último commit no elimina sus copias históricas.
- Conservá un camino seguro y documentado para modificar la configuración y republicar las invitaciones.
- Añadí una prueba automática que falle si la exportación vuelve a incluir `out/admin/index.html` o equivalente, salvo que posteriormente exista una solución de administración privada real fuera del sitio estático.

**Aceptación:** el build de producción no incluye el panel en ninguna ruta pública; el trabajo de administración sigue documentado; no hay tokens incrustados en los assets públicos.

## 4. P0 — Revisar datos y recursos que se publican

### Configuración de evento
Inspeccioná `src/data/config.ts`, `src/data/demo-config.ts`, los archivos que los importan y los artefactos exportados. La auditoría detectó campos de evento ya completados en la configuración base, pese a que se describe como plantilla neutra. No imprimas ni reproduzcas sus valores.

- Identificá si los valores pueden ser datos personales o de una celebración real.
- Si una configuración real está versionada o exportada y no debe ser pública, separala de los defaults públicos sin destruirla a ciegas: prepará un default sintético, genérico y seguro; conserva los datos necesarios sólo en un mecanismo local/privado no versionado. Añadí un ejemplo de cómo configurar una invitación nueva sin incluir datos privados.
- Primero comprobá los usos de la configuración para no romper demos ni invitaciones ya creadas.
- Las demos deben usar perfiles, fechas, lugares, hashtags, mapas, música y galerías ficticios. No deben apuntar al RSVP, a la galería ni a cuentas de un evento real.
- Mantené vacíos/desactivados los endpoints de escritura en demos públicas. No uses `.env` o un archivo ignorado como excusa para insertar secretos en la exportación estática.

### Imágenes y archivos públicos
- Revisá visualmente (si las herramientas disponibles lo permiten) cada archivo de `public/uploads/` y la captura PNG de `public/` que no parezca ser parte del sitio comercial. Identificá si tiene personas, documentos, datos de eventos o material que requiere consentimiento.
- Comprobá referencias/usos antes de decidir. No elimines una imagen útil automáticamente sólo por tener un nombre aleatorio.
- Los archivos bajo `public/` quedan disponibles públicamente; moverlos a otra carpeta del mismo repositorio público tampoco los vuelve privados.
- Si un recurso no está autorizado para publicación o claramente no se necesita, sacalo del conjunto público con un cambio revisable y documentá la consecuencia. Si no se puede determinar consentimiento o titularidad, no declares el trabajo de privacidad completamente resuelto: dejá el archivo fuera del despliegue de la rama candidata y marcá la revisión humana como condición antes de fusionar.
- No hagas `git push --force`, no reescribas historial y no copies fotos al informe. Si se confirma que había material sensible en el historial, explicá el plan requerido para limpiar historial/rotar secretos y solicitá aprobación antes de ejecutar acciones destructivas.

**Aceptación:** la exportación de la rama candidata no incluye datos de eventos ni imágenes sensibles no autorizadas; las demos son sintéticas y no envían información a servicios reales; toda duda pendiente está identificada de manera explícita.

## 5. P1 — Accesibilidad y contraste

La auditoría calculó ratios bajos para algunos tonos de texto auxiliar y botones de la tienda. Verificá los colores actuales antes de editarlos; la implementación pudo haber cambiado.

- Cumplí WCAG 2.2 AA para texto normal cuando corresponda: contraste mínimo 4,5:1; para texto grande, 3:1. Para componentes e indicadores visuales, revisá criterios pertinentes y no confundas esos umbrales con los de texto.
- Prestá atención a `#8f867c` sobre marfil, `#a39a8e` sobre blanco y blanco sobre los verdes/champagne usados en botones. No te limites a copiar los valores de la auditoría: volvé a calcular el contraste de cada combinación real.
- Ajustá textos secundarios, placeholders, badges, leyendas, iconos informativos y estados deshabilitados manteniendo la estética cálida.
- Para botones de WhatsApp podés conservar el verde de marca si usás texto oscuro con contraste suficiente o un fondo apropiado; no sacrifiques legibilidad por fidelidad de color.
- Comprueba foco visible, teclado, etiquetas, nombre accesible, mensajes de validación, orden de lectura, foco al abrir/cerrar modales y `prefers-reduced-motion`.
- No quites colores/adornos de los diseños de invitación sin medir los estados claro y oscuro.

**Aceptación:** ratios medidos para las combinaciones principales y ninguna violación de contraste conocida en textos normales de la tienda; documentá cualquier excepción pendiente.

## 6. P1 — Miniaturas, cuenta regresiva y semántica de encabezados

### Contador fijo
La auditoría observó que las miniaturas comerciales repiten el contador fijo `120 / 14 / 32 / 05` aunque las fechas de muestra son distintas.

- Revisá `src/components/mini-invitation.tsx` y `src/components/catalog-scene.tsx`.
- Eliminá el contador fijo que aparenta ser real. Preferí una miniatura estática centrada en el diseño, una leyenda visual claramente ilustrativa o un contador derivado de la fecha ficticia real, sólo si se mantiene correcto y barato de renderizar.
- No alteres el contador funcional de una invitación completa sin probar fechas futuras, eventos en curso, fechas pasadas y zona horaria `America/Montevideo`.

### Encabezados y títulos
- Evitá que los nombres decorativos incrustados en miniaturas se conviertan en encabezados `h3` antes del H1 comercial.
- Conservá la misma apariencia visual usando elementos semánticos apropiados (`div`, `span` o texto alternativo).
- Corregí el título duplicado del personalizador: `Personalizá tu invitación | Miluaistudio | Miluaistudio`. Revisá `src/app/layout.tsx` y los metadatos de `src/app/personalizar/page.tsx` para aplicar la marca una sola vez.
- Revisá canonical, `noindex`, Open Graph y sitemap para inicio, catálogo, personalizador y demos. Conservá una estrategia deliberada: demos noindex si esa es la decisión comercial actual; no añadas URLs inventadas ni cambies el canonical a ciegas.

**Aceptación:** sin contador falso en miniaturas; H1 de la página comercial correctamente jerarquizado; título de personalización sin marca duplicada; metadatos coherentes y sin canibalización accidental.

## 7. P1 — RSVP y galería: no afirmar éxitos sin confirmación

Inspeccioná:
- `src/components/rsvp.tsx`
- `src/components/gallery.tsx`
- `google-apps-script/gallery-server.gs`
- `google-apps-script/photo-server.gs`
- Configuración de los endpoints en `src/data/config.ts` y configuración de demos.

### RSVP
- El cliente actual debe distinguir `guardado`, `pendiente` y `error`. Preservá esa garantía.
- Alineá el contrato cliente/servidor (GET, POST, parámetros, formato JSON y respuestas); no supongas que el script del repositorio coincide con la implementación en Google Apps Script que está en producción.
- No cambies el protocolo de producción sin prueba o sin describir los pasos de despliegue necesarios.
- Validá del lado del servidor cantidad de invitados, longitud de nombres, teléfono, código, duplicados y frecuencia. Evitá nombres/teléfonos en URLs cuando el entorno permita POST fiable.
- Cuando el navegador no pueda comprobar el resultado, mostrale al usuario que está pendiente, sin afirmar que quedó guardado.
- Nunca uses registros de invitados reales como fixture de prueba. Creá datos sintéticos y una prueba para el contrato.

### Fotos
- Conservá la moderación: recepción de una foto y aprobación para hacerla visible son estados diferentes.
- La interfaz no debe mostrar “¡Foto publicada!” hasta verificar que hay una URL pública aprobada; ante respuesta ilegible o incierta, reportá pendiente/error.
- Verificá cada respuesta de subida por fragmentos y la respuesta final de ensamblado; no asumas que un fetch que no lanzó excepción significa que la operación se guardó bien.
- Validá tamaño, MIME real y firma de imagen del lado servidor; el atributo `accept` no es seguridad.
- No hagas pública una foto por el mero hecho de recibirla. Mantener mensajes entendibles para el usuario.

**Aceptación:** pruebas automatizadas o con mocks para éxito verificable, pendiente, error, límite de invitados, respuesta inválida y foto pendiente; las demos nunca hacen escrituras externas.

**Limitación:** si no hay acceso a la URL real de Apps Script, indicá que el contrato de código está alineado pero el servicio de producción no fue probado. No inventes una respuesta.

## 8. P2 — Rendimiento sin romper el diseño

La auditoría encontró HTML inicial grande, especialmente la portada (aprox. 904 KB de longitud de archivo), que repite varias maquetas; el catálogo ronda 280 KB y el personalizador 194 KB. Son longitudes de HTML no medidas de transferencia comprimida.

- Inspeccioná `src/app/page.tsx`, `src/app/catalogo/page.tsx`, `src/components/catalog-scene.tsx` y `src/components/mini-invitation.tsx`.
- Evitá renderizar muchas copias de la maqueta completa si alcanza con una miniatura optimizada estática. Conservá la demostración interactiva al abrir un diseño.
- Revisá imágenes grandes (incluidos PNG), formatos, dimensiones explícitas, carga diferida fuera del primer pantallazo y recursos duplicados.
- Revisá la carga de audio y evitá precargar música innecesariamente; la reproducción de música debe responder a la interacción del usuario.
- No agregues dependencias pesadas sólo para optimizar. No hagas cambios de rendimiento que rompan el diseño, el contraste o las páginas de demostración.
- Si no hay herramientas de navegador/Lighthouse disponibles, reportá sólo mediciones que realmente hayas obtenido. No inventes puntuaciones Lighthouse ni Core Web Vitals.

**Aceptación:** HTML generado más pequeño en las páginas afectadas, comparado con el mismo comando antes/después; sin romper la apariencia, enlaces o navegación. Adjuntá las mediciones disponibles.

## 9. P2 — Enlaces comerciales y precio

- Conservá el precio aprobado en la fuente central existente (`src/data/precio.ts`) salvo nueva instrucción explícita.
- Comprobá que portada, catálogo, personalizador y preguntas frecuentes reflejen la misma fuente.
- Verificá el enlace de Mercado Libre sólo si disponés de una herramienta de navegación real. Si no, dejalo como comprobación pendiente. No afirmes que el enlace sigue activo ni que las condiciones coinciden si no lo verificaste.
- Los botones que abren WhatsApp deben abrir con mensajes bien codificados y con el diseño elegido cuando corresponda. No digas que una compra o envío terminó si sólo se abrió una URL.

## 10. Compatibilidad de build y pruebas obligatorias

No cambies la arquitectura a SSR ni agregues endpoints de servidor incompatibles con GitHub Pages. Mantené:
- `output: "export"`
- `basePath: "/Miluaistudio"`
- `trailingSlash: true`
- enlaces internos y recursos con la ruta base correcta.

Ejecutá, cuando el entorno lo permita:
1. `npm ci`
2. `npm run lint`
3. Verificación de TypeScript con el comando adecuado para este repo (agregá `typecheck` si falta, sin ocultar errores).
4. `npm run build`
5. Verificación posterior del directorio `out/`: inicio, catálogo, personalizador y las diez demos existen; base paths, iconos, estilos y recursos están correctos; `admin` no se incluye en la publicación pública tras la corrección.
6. Prueba de enlaces internos y metadata exportada.
7. Contrastes principales y pruebas automatizadas/mocks de RSVP y fotos.
8. Comparación objetiva de tamaños HTML antes/después si existe el artefacto base disponible.

Si hay errores de TypeScript o lint, corregilos realmente; no uses `ignoreBuildErrors`, `continue-on-error` ni omisiones para esconderlos. No reduzcas la cobertura de tests para que la validación pase.

## 11. Entregable final que tenés que producir

Al terminar, devolvé un reporte breve y verificable con estas secciones:

### A. Corregido
Para cada corrección: problema, causa real, archivos cambiados y cómo se comprobó.

### B. Pruebas ejecutadas
Lista los comandos exactos, resultado real y, cuando aplique, las rutas HTML/artefactos inspeccionados. No inventes tests.

### C. Pendiente de validación humana/externa
Sólo bloqueos reales: consentimiento de imágenes, datos de evento que el propietario deba confirmar, credenciales/permisos de Apps Script, verificación de Mercado Libre o prueba en dispositivos que el entorno no permita.

### D. Riesgos y decisiones
Indica qué se movió o retiró de la exportación pública y cómo se sigue administrando de manera segura. No imprimas datos privados.

### E. Entrega
Enlace a la rama y Pull Request; resumen de cada commit. **No fusiones ni despliegues producción sin aprobación humana.**

## Criterio de finalización

No declares el trabajo completo sólo porque `npm run build` termina sin errores. El trabajo se considera listo para revisión cuando la página administrativa insegura no se publica, las dudas de privacidad están resueltas o bloqueadas explícitamente, las mejoras de contraste/metadata/miniaturas están implementadas, las rutas comerciales siguen funcionando, y build/lint/typecheck junto con las pruebas disponibles tienen resultados documentados.

Empezá inspeccionando el repositorio y estos documentos. Después implementá los cambios que sean seguros y verificables, en el orden de prioridad indicado.