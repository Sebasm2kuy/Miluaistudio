# Iteración 009 — Prompt de mejoras funcionales sin abordar privacidad

**Fecha:** 27-10-2026  
**Propósito:** siguiente prompt operativo para Z.AI, basado en la auditoría de la iteración 008.  
**Alcance elegido:** cerrar el flujo funcional de personalización/publicación, corregir la carga de recursos de invitación, validar RSVP con pruebas reproducibles y mantener la calidad del export estático.  
**Fuera de alcance por decisión del propietario:** auditoría general de privacidad, estrategia de almacenamiento privado, limpieza del historial Git y rotación de credenciales. Esos temas quedan para una etapa posterior y no deben expandirse en este PR.

## Estado de partida verificado

- El PR #14 ya está fusionado y sus verificaciones de Tests, Lint, Build y despliegue a GitHub Pages pasaron.
- El sitio se publica como export estático Next.js para GitHub Pages bajo /Miluaistudio/.
- Las rutas públicas actuales corresponden a inicio, catálogo, demostraciones por diseño y personalizador. No se encontró una ruta pública funcional que represente una invitación personalizada generada desde el panel.
- El panel local está en src/app/admin/page.tsx. La función de publicación vive en src/lib/github-deploy.ts.
- La función de carga de imágenes del panel escribe actualmente bajo public/uploads/, mientras scripts/verify-export.mjs falla si el export contiene imágenes en esa carpeta.
- El cliente RSVP usa POST con el cuerpo de la solicitud y estados verificables. No se ha validado en vivo el Web App productivo de Apps Script.
- La portada ya recibió una optimización de marcado; catálogo y personalizador no se optimizan más en esta iteración salvo que la implementación funcional lo requiera.

---

# PROMPT PARA Z.AI — COPIAR DESDE AQUÍ

Actúa como ingeniero/a senior de Next.js, React, TypeScript y GitHub Pages, con foco en flujos de producto completos, publicación de invitaciones, fiabilidad de integraciones y pruebas automáticas. Trabaja sobre el repositorio Sebasm2kuy/Miluaistudio.

## A. Alcance y reglas de esta iteración

Esta tarea se limita a **mejoras funcionales del producto**. El propietario decidió posponer el trabajo general de privacidad para otra etapa.

- No realices una auditoría de privacidad en esta iteración.
- No limpies ni reescribas el historial Git, no gestiones rotación de credenciales y no diseñes ahora una infraestructura de almacenamiento privado.
- No amplíes estos temas ni conviertas el PR en una nueva auditoría general. Deja esos trabajos fuera del alcance para una futura etapa.
- No desactives, elimines ni debilites las verificaciones y tests actuales de exportación o privacidad para hacer pasar el build. Conserva su comportamiento actual.
- No vuelvas a importar la configuración operativa como valor desde componentes cliente para evitar un bloqueo. Resuelve el flujo funcional con una representación explícita de la invitación publicada.
- No cambies el precio vigente, la marca, los diseños, los textos comerciales o las funcionalidades existentes salvo cuando sea estrictamente necesario para completar el flujo.
- No uses datos reales en tests ni documentos. Usa fixtures sintéticos.
- Trabaja en una rama nueva y prepara un PR contra main. No hagas push directo a main, no fusiones el PR ni despliegues por tu cuenta.
- Primero inspecciona el estado actual del repo; no asumas que el código sigue igual a la descripción.

## B. P0 — Hacer que una invitación personalizada se publique y tenga un enlace real

El personalizador permite armar una invitación, pero en el estado actual no se encontró una ruta pública que consuma la configuración generada por el panel. Las demostraciones del catálogo usan createDemoConfig y deben seguir siendo demos ficticias.

Implementa un flujo mínimo completo compatible con el export estático:

1. El anfitrión edita la invitación desde el panel local y puede obtener una vista previa fiel antes de publicarla.
2. Al publicar, se genera una representación de la invitación que la página pública puede consumir durante el build estático. Debe contener los campos que la invitación necesita mostrar y sus opciones funcionales, no funciones, objetos internos del editor ni tokens del panel.
3. Cada invitación publicada debe tener un slug estable y una URL propia. Preferencia: una ruta como /i/[slug]/ compatible con generateStaticParams y output: export. No uses un servidor Next.js dinámico porque el destino es GitHub Pages.
4. Las invitaciones publicadas deben poder coexistir: publicar una nueva no debe sobrescribir la invitación anterior ni cambiarle el enlace. Si el estado actual del MVP no permite esto sin una decisión de producto, explica el límite, pero prioriza un modelo estático con colección de invitaciones publicadas.
5. La ruta nueva debe cargar la configuración publicada y renderizar la experiencia completa de invitación usando los componentes existentes (por ejemplo InvitationExperience y ConfigProvider) en lugar de duplicar la implementación visual.
6. Las rutas de demos actuales del catálogo deben seguir usando su configuración sintética, no la configuración de una invitación publicada.
7. El botón de publicar debe generar un resultado claro: slug, URL de invitación y estado real de publicación. No mostrar “publicada” solo por guardar datos en localStorage ni solo por iniciar un PUT.
8. Respetar las rutas base absolutas: los enlaces y recursos deben funcionar bajo /Miluaistudio/ en GitHub Pages. Mantener output: export, basePath y trailingSlash conforme a la configuración vigente.
9. En caso de una respuesta incompleta o un error al guardar, mostrar el error útil y no perder silenciosamente la configuración local.
10. Añadir tests con datos sintéticos para creación de slug, actualización sin duplicar, coexistencia de dos invitaciones, serialización de la configuración publicada, construcción de enlaces, ausencia de datos de panel en el objeto de publicación y generación de rutas estáticas.

Puedes implementar una estructura como una colección de archivos JSON por slug o una solución equivalente, siempre que sea mantenible, tipada y compatible con el proceso de build. El publicador debe guardar la representación publicada y el build debe producir la página HTML correspondiente.

**Criterios de aceptación:**
- Con un fixture de prueba se genera una invitación personalizada que se abre desde su URL.
- Dos slugs de prueba generan dos páginas distintas en el export estático.
- Actualizar una invitación existente conserva su slug; publicar otra no sobrescribe la anterior.
- Las demos del catálogo siguen siendo independientes.
- El build verifica las rutas generadas y respeta /Miluaistudio/.
- No se afirma que se probó una publicación real desde el panel si no se ejecutó realmente contra GitHub.

## C. P0 — Arreglar el flujo de carga de imágenes del panel para que sea funcional

La carga de imágenes del editor usa actualmente public/uploads/, pero el verificador del export falla si encuentra imágenes dentro de esa carpeta. Es necesario resolver esa incompatibilidad funcional en esta iteración.

- Inspecciona ImageCard, uploadToGitHub, cómo se guarda la URL en la galería y cómo el fondo usa las imágenes.
- Separa los recursos que el propietario decide incorporar a la invitación de los envíos de fotos de invitados. Las fotos que llegan de invitados deben seguir usando el flujo existente del backend de fotos con moderación; no las redirijas al uploader del panel.
- Para recursos cargados intencionalmente desde el editor y destinados a mostrarse en la invitación, usa una ruta de assets consistente que el export incluya y que no choque con la carpeta bloqueada por verify-export. Por ejemplo, una carpeta de assets de invitación diferenciada, o una solución equivalente bien documentada.
- La URL que devuelve el uploader debe coincidir exactamente con la ruta publicada, incluyendo /Miluaistudio/.
- Valida tipo de archivo real y extensión permitida, límite razonable de tamaño y errores de red antes de marcar la carga como exitosa. No dependas solo del atributo HTML accept.
- Usa nombres de archivo saneados y únicos para evitar colisiones.
- Si el usuario cancela la carga o falla la API, conserva el estado anterior, permite reintentar y muestra un mensaje accionable.
- Verifica que las referencias de galería y fondo sigan sincronizadas como espera el editor.
- Mantén activos los scripts de verificación existentes. No elimines la validación de imágenes ni la regla de out/uploads/ para hacer pasar el build.
- Añade pruebas para URL generada, nombre de archivo, extensión/tipo permitido, tamaño excedido, respuesta HTTP fallida y sincronización con galería/fondo. Simula las llamadas a la API; no subas archivos reales en CI.

**Criterios de aceptación:**
- Una imagen de prueba sintética cargada por el flujo simulado produce una URL consistente con el directorio de assets elegido.
- La imagen puede referenciarse desde la invitación publicada y aparecer en el export.
- El build no falla por el propio flujo normal de carga de recursos.
- La carpeta out/uploads permanece sin imágenes.
- El flujo de fotos que suben los invitados conserva su backend y estados de moderación.

## D. P1 — Completar la integración RSVP sin fingir una prueba externa

El cliente RSVP ya utiliza POST y tiene manejo de resultados verificables, pero el Web App real de Google Apps Script no se ha probado en vivo desde esta auditoría.

- Revisa el contrato actual en src/lib/rsvp-client.ts, src/lib/contrato-backend.ts y google-apps-script/gallery-server.gs.
- Conserva los estados confirmado/guardado, pendiente/no verificable y error; no conviertas un fallo CORS, timeout o respuesta ilegible en éxito.
- Añade o completa pruebas automatizadas simuladas para respuesta válida, error del backend, HTTP 500, JSON inválido, timeout, error de red, URL vacía y fallback elegido por el usuario.
- Comprueba que la invitación publicada pase al componente RSVP solo los campos que este necesita para funcionar y que la demo no envíe confirmaciones reales.
- Documenta una prueba manual controlada para el Web App que realmente esté desplegado: confirmar que la URL productiva usa el contrato POST actual, que la respuesta se puede interpretar y que una fila de prueba aparece en la hoja correcta. No uses datos de personas reales.
- No digas que el servicio externo quedó verificado si el entorno no tiene acceso para comprobarlo. Deja el punto como pendiente manual cuando corresponda.

**Criterios de aceptación:**
- Las pruebas simuladas cubren los estados posibles.
- El frontend conserva el fallback visible y los estados honestos.
- La integración del evento publicado está conectada al contrato existente.
- El reporte separa los resultados de tests simulados de la prueba real pendiente.

## E. P1 — Verificación visual y de navegación del producto

Realiza una revisión funcional de inicio, catálogo, personalizador, demos e invitación publicada, con énfasis en:

- Enlaces internos y basePath.
- CTA de personalizar, abrir demostración, volver al catálogo y compartir la invitación.
- Diseño móvil y escritorio, foco visible, navegación por teclado, etiquetas accesibles y errores de formularios.
- Metadatos correctos en las páginas nuevas, canonical consistente y noindex en las demos si la política existente lo requiere.
- Pantallas vacías, configuración incompleta, imagen faltante y errores al publicar.
- Estados de carga y mensajes que permitan entender qué acción terminó y cuál no.

No hagas un rediseño total ni cambies los diseños existentes por preferencia estética. Corrige bugs demostrables y cambios necesarios para el flujo funcional.

Si no tienes navegador de prueba, ejecuta las pruebas automatizables, inspecciona el HTML/CSS exportado y declara explícitamente que la prueba visual manual queda pendiente.

## F. CI, tests y exportación

Mantén los workflows actuales y confirma que se ejecutan las pruebas antes de compilar.

Ejecuta, cuando el entorno lo permita:

1. npm ci
2. npm test
3. npm run lint
4. npm run typecheck
5. npm run build
6. Medición del export usando scripts/mide-export.mjs, si sigue presente.
7. Inspección del export para comprobar que se generaron las rutas de las invitaciones sintéticas y que las rutas de los assets enlazados existen.

No rebajes las pruebas que ya existen. Si una prueba falla, corrige la causa real. No inventes resultados cuando el entorno no permita ejecutarla.

## G. Entrega

Entrega un PR contra main, sin fusionar ni desplegar.

La descripción del PR debe incluir:

- Resumen de las funciones completadas.
- Cómo se genera y publica una invitación, con un ejemplo completamente ficticio.
- Qué ruta tiene cada invitación y cómo se conserva al publicar otras.
- Cómo funciona la carga de assets del editor y cómo se mantiene separado el backend de fotos de invitados.
- Rutas de archivos modificados.
- Comandos ejecutados con resultados reales.
- Enlaces a los runs de GitHub Actions.
- Qué se probó en simulación, qué se probó manualmente y qué queda bloqueado por el Apps Script externo.
- Limitaciones del MVP y cualquier paso que el propietario deba completar.

Deja fuera de este PR la auditoría general de privacidad, la limpieza del historial Git, la rotación de credenciales y el diseño de almacenamiento privado: son trabajo futuro solicitado expresamente por el propietario. No elimines ni debilites las verificaciones actuales para ocultar resultados.

**Orden obligatorio:** primero invitación publicada y URL propia; segundo carga de assets compatible con el export; tercero integración RSVP y pruebas; cuarto revisión funcional, documentación y reporte.

Empieza inspeccionando el estado actual. Implementa el código y los tests; no entregues solo recomendaciones. Si algo no puede completarse, explica con precisión el bloqueo y entrega el máximo de trabajo funcional verificable sin fusionar el PR.

**Fin del prompt.**
