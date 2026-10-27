# Prompt maestro para Z.AI — Auditoría y evolución de Miluaistudio

Usá este prompt sobre el repositorio existente. El objetivo es implementar mejoras reales con cuidado, no producir sólo recomendaciones ni rehacer el proyecto desde cero.

## Contexto

- Sitio publicado: https://sebasm2kuy.github.io/Miluaistudio/
- Repositorio: https://github.com/Sebasm2kuy/Miluaistudio
- Tecnología observada: Next.js App Router, React, TypeScript, Tailwind CSS y exportación estática desplegada en GitHub Pages.
- Idioma: español de Uruguay (es-UY). Zona horaria de los eventos: America/Montevideo.
- Visión de producto: evolucionar desde invitaciones digitales hacia una plataforma más amplia de creación, organización, recursos confiables y recuerdos de celebraciones.
- No cambies todavía el nombre de marca: se está explorando un nombre neutral que no use el nombre de ninguna hija del fundador.

## Reglas de trabajo

1. Inspeccioná primero la arquitectura, rutas, componentes, activos, dependencias, servicios externos y workflows.
2. Separá hechos confirmados, riesgos detectados en el código e hipótesis que requieren prueba externa.
3. Conservá funcionalidades reales, diseños, rutas y compatibilidad con GitHub Pages, salvo que exista una razón técnica documentada para cambiar algo.
4. Trabajá en una rama o propuesta revisable si el entorno lo permite. No hagas cambios destructivos a datos, historial Git o producción sin aprobación.
5. No inventes testimonios, métricas, precios, plazos ni características comerciales.
6. No reproduzcas ni registres secretos, tokens, contraseñas, datos bancarios o datos privados en logs o informes.
7. No marques como exitosa una operación que no haya sido verificada.
8. No elimines componentes heredados hasta comprobar si se utilizan.
9. No añadas dependencias o infraestructura sin justificar el costo y la necesidad.
10. Al finalizar, enumerá archivos cambiados, comandos realmente ejecutados, pruebas superadas/fallidas y asuntos que requieran acceso o aprobación humana.

## Fase 1 — Arquitectura, rutas y despliegue

Revisá next.config.ts, package.json, tsconfig.json, src/app, public y .github/workflows.

Comprobá:
- Compatibilidad real con output: export y GitHub Pages.
- basePath /Miluaistudio, trailingSlash, rutas directas, enlaces internos, recursos e imágenes.
- Todas las páginas principales: inicio, catálogo, demos, personalizador y administración.
- Las diez demos publicadas y los parámetros que se pasan a cada una.
- Dependencias utilizadas y componentes obsoletos.
- Cualquier uso real de Prisma, base SQLite y src/lib/db.ts.

GitHub Pages sirve archivos estáticos y no ejecuta un servidor Next.js persistente. No implementes API routes ni lógica privada que dependa de un servidor ausente. Si una función necesita backend, utiliza un servicio externo compatible o documenta la infraestructura necesaria.

Corrigí los errores genuinos de TypeScript y después eliminá typescript.ignoreBuildErrors: true. Corrigí la configuración de lint para que los errores no queden ocultos con continue-on-error. Ejecutá instalación reproducible, typecheck, lint y build cuando sea posible.

## Fase 2 — Diseño visual claro

Convertí las páginas comerciales y herramientas en una experiencia luminosa, ordenada, cálida y profesional. La portada comercial ya usa tonos marfil, mientras que estilos globales conservan un fondo oscuro y excepciones adicionales. Unificá el sistema visual mediante variables reutilizables, no acumulando más overrides.

Paleta de referencia:
- Marfil: #FAF8F4
- Blanco: #FFFFFF
- Carbón: #292522
- Gris cálido: #716A63
- Champagne: #B58C5A
- Borde suave: #E8E0D7
- Rosa empolvado y verde salvia como acentos secundarios medidos.

Principios:
- Espacio en blanco, jerarquía visual clara y tipografía muy legible.
- Una o dos familias tipográficas principales en el sitio comercial.
- Tarjetas sencillas, bordes finos, sombras discretas.
- Una acción primaria coherente y acciones secundarias claramente diferenciadas.
- Animaciones sutiles; evitar decoraciones excesivas.
- Unificar estilos, colores, focus states y estados de carga.
- Reducir fuentes externas, variantes y recursos que no sean necesarios.

La portada, catálogo, personalizador y administrador deben compartir una interfaz limpia. No fuerces las invitaciones individuales a compartir la misma paleta: cada diseño debe conservar su propia personalidad.

Garantizá funcionamiento responsive desde 320 px hasta escritorio, sin scroll horizontal involuntario. Mejorá accesibilidad: contraste AA cuando sea viable, navegación por teclado, etiquetas de formulario, foco visible, nombres accesibles y respeto a prefers-reduced-motion.

## Fase 3 — Propuesta comercial y conversión

La acción principal de la portada debe ser “Personalizar mi invitación”; explorar diseños debe ser una alternativa secundaria. WhatsApp y Mercado Libre siguen disponibles, sin competir todos con igual peso.

En el catálogo, cada tarjeta debe tener miniatura, nombre, categoría, descripción breve, precio vigente y acciones inequívocas para ver la demo, personalizar y consultar. Verificá que filtros, búsqueda, vistas rápidas y botones sean funcionales, no decorativos.

Centralizá el precio en una sola fuente de datos para portada, catálogo, personalizador y FAQ. No cambies el precio sin autorización ni inventes condiciones. Explicá con claridad lo que incluye el servicio, los pasos de entrega y las condiciones que estén confirmadas.

Revisá src/data/testimonios.ts. Sólo presentá testimonios como reales si son auténticos, verificables y autorizados. Si no pueden confirmarse, dejalos pendientes o reemplazalos por ejemplos claramente identificados como demostraciones.

## Fase 4 — Personalizador

Reorganizá src/components/personalizador-app.tsx en pasos claros:
1. Elegir diseño.
2. Completar datos.
3. Ajustar estilo y opciones.
4. Revisar la vista previa.
5. Enviar la configuración.

Mostrá progreso, validaciones y errores junto a cada campo. En móvil, priorizá controles cómodos y acciones visibles. Conservá todas las capacidades y evitá perder datos al cambiar de diseño o volver a un paso anterior.

Validá fechas, horas, nombres y URLs de Spotify, Instagram, mapas e imágenes. El mensaje de WhatsApp debe contener las elecciones del usuario ordenadas y correctamente codificadas. No afirmes que la compra, publicación o envío terminó si sólo se abrió WhatsApp o se generó el mensaje.

Si añadís guardado local de borradores, explicá qué se guarda y ofrecé borrarlo. No almacenes información personal innecesaria.

## Fase 5 — RSVP y Google Apps Script (prioridad crítica)

Inspeccioná src/components/rsvp.tsx y todos los scripts de Google Apps Script relacionados. Hay que investigar un posible desajuste: el frontend observado envía action=rsvp por GET con mode: no-cors, mientras que uno de los scripts documenta un contrato POST con JSON para el registro de grupos.

No asumas que el script observado es el que está desplegado. Verificá la URL real configurada y el contrato activo.

Alineá cliente y servicio; validá datos en servidor; usá un contrato claro con estados de espera, éxito verificable y error recuperable; evitá transmitir nombres y teléfonos en URLs cuando pueda usarse POST; limitá tamaño, campos y cantidad de invitados; prevení abuso y duplicados; registrá errores sin exponer datos personales.

No muestres “asistencia registrada” si no existe confirmación verificable del registro. Si no se puede verificar la escritura, informá que la confirmación está pendiente o que debe completarse mediante WhatsApp. Las demos públicas deben seguir aisladas y nunca registrar datos en producción.

Si faltan permisos para probar Google Apps Script en producción, documentá la prueba pendiente con precisión.

## Fase 6 — Galería, imágenes, audio y eventos

Inspeccioná google-apps-script/gallery-server.gs, google-apps-script/photo-server.gs y la URL de galería configurada. La documentación de moderación debe coincidir con el comportamiento real. Determiná si las imágenes quedan pendientes, aprobadas o públicas y hacé transparente esa política.

Validá tipo de archivo real, extensión, tamaño y dimensiones tanto del lado cliente como del servidor. El atributo accept del input no es una medida de seguridad. No publiques fotografías sin consentimiento claro; ofrecé una política de revisión/eliminación y estados de envío comprensibles.

Optimiza imágenes, fija dimensiones, usa formatos modernos cuando convenga, textos alternativos útiles y lazy loading para recursos no críticos. No precargues música sin necesidad; usá una política equivalente a preload=none y reproducción tras interacción del usuario.

Revisá src/components/countdown.tsx. Unificá las fechas y el evento de calendario con una estrategia coherente para America/Montevideo; probá fecha futura, fecha pasada, cambio de día y zona horaria del dispositivo. Las fechas de ejemplo no deben confundirse con datos reales. Un evento pasado no debe mostrar contador incorrecto ni números negativos.

## Fase 7 — Privacidad y seguridad

El repositorio público incluye archivos llamados .env y db/custom.db. Revisá de forma segura si contienen secretos o datos personales; no imprimas sus contenidos ni los copies a reportes. Evitá que archivos locales o privados nuevos se agreguen a futuros commits. Recordá que borrarlos en un nuevo commit no elimina copias históricas. No reescribas historial sin autorización.

Revisá src/app/admin/page.tsx: el panel guarda un GitHub Personal Access Token en localStorage y realiza llamadas al API desde el navegador. /admin y noindex no son autenticación.

Como mínimo, dejá de persistir tokens de forma predeterminada, ofrecé borrado de credenciales, limita permisos y documentá los riesgos del uso en dispositivos compartidos. La solución robusta para operaciones administrativas persistentes es un backend autenticado o flujo externo seguro. No insertes secretos de servidor en el frontend estático.

Separá datos de celebración real, configuración central y demos. No expongas detalles privados en plantillas públicas. Revisá los endpoints públicos de Drive y Sheets para limitar abuso.

## Fase 8 — SEO, rendimiento y accesibilidad

Revisá títulos, descripciones, canonical, Open Graph, Twitter cards, favicon, robots.txt, sitemap, indexación y enlaces internos. Validá rutas con el prefijo /Miluaistudio. No indexes páginas duplicadas automáticamente; revisá por separado si corresponde indexar cada demo.

Medí con herramientas reales cuando estén disponibles. No inventes scores Lighthouse. Objetivos de referencia de Core Web Vitals:
- LCP <= 2,5 s
- INP <= 200 ms
- CLS <= 0,1

Reducí JavaScript, fuentes y recursos externos innecesarios. Probá 320, 375, 768 y 1024 px, además de escritorio; revisá consola, imágenes rotas, teclado, foco, contraste, formularios y reduced motion.

## Fase 9 — Preparar una evolución de producto sin construir todo a la vez

La visión futura es una plataforma neutral y escalable que pueda incluir:
- Crear: invitaciones, tarjetas virtuales y miniwebs.
- Organizar: presupuesto, tareas, invitados, RSVP y cronogramas.
- Encontrar: proveedores y recursos que tengan criterios transparentes de confianza.
- Recordar: galerías y álbumes según permisos y privacidad.

No implementes todo simultáneamente. Priorizá la estabilidad del producto actual; luego una herramienta de tarjeta virtual; después un organizador básico; más adelante un directorio validado por categorías y zona. Diseñá para reutilizar componentes, pero no afirmes que existen funciones que aún no fueron construidas.

La marca definitiva sigue pendiente. No uses el nombre de ninguna hija del fundador. No asumas que cualquier candidato está libre hasta revisar dominios, redes y antecedentes de marca.

## Fase 10 — Criterios de aceptación

Antes de terminar, comprobá cuando el entorno lo permita:
- Las rutas y recursos funcionan con basePath.
- El catálogo, demos, personalizador y administración cargan sin errores.
- Las funciones críticas funcionan, no sólo se ven bien.
- Las demos no escriben datos de producción.
- El RSVP sólo comunica éxito después de verificar el registro.
- La política de fotos y la privacidad son coherentes.
- La interfaz comercial tiene un tema claro y consistente.
- TypeScript, lint y build no ocultan fallos.
- No se añadieron datos sensibles ni secretos.
- El sitio sigue siendo compatible con GitHub Pages.

## Entrega final

Respondé en español e informá:
1. Cambios implementados y razón de cada cambio.
2. Archivos modificados.
3. Problemas confirmados corregidos y riesgos pendientes.
4. Comandos y pruebas que efectivamente se ejecutaron; distingue de las no ejecutadas.
5. Instrucciones para publicar y probar GitHub Pages.
6. Cualquier paso que necesite autorización, credenciales o acceso a servicios externos.

Empezá inspeccionando el código y el flujo de despliegue reales. Trabajá por prioridad. No te limites a hacer un informe: implementá los cambios seguros y verificables sin romper funcionalidades existentes.
