# Iteración 001 — Auditoría del producto y visión de marca/plataforma

- **Fecha:** 2026-10-27
- **Proyecto actual:** Miluaistudio
- **Web publicada:** https://sebasm2kuy.github.io/Miluaistudio/
- **Repositorio:** https://github.com/Sebasm2kuy/Miluaistudio
- **Estado:** registro de ideas y hallazgos iniciales. No equivale a una auditoría completa de producción ni a una validación legal de marcas.

## 1. Objetivo de largo plazo

La visión dejó de ser únicamente vender invitaciones digitales. La oportunidad es evolucionar hacia una plataforma que acompañe a las familias durante todo el ciclo de una celebración: desde crear piezas digitales hasta organizar el evento, encontrar recursos y proveedores confiables, y conservar los recuerdos.

La propuesta de valor en exploración:

> Un lugar para crear, organizar, encontrar recursos confiables y recordar cada celebración.

Territorios de marca posibles:
- **Crear:** invitaciones interactivas, tarjetas virtuales, páginas web/minisitios para eventos, avisos de fecha, álbumes y mensajes.
- **Organizar:** presupuesto, lista de invitados, RSVP, acompañantes, cronograma, checklist, recordatorios, mesas, menús y coordinación.
- **Encontrar:** directorio y recursos de proveedores, con criterios transparentes de revisión.
- **Recordar:** galerías, álbumes compartidos, dedicatorias y páginas de recuerdos.

Esto es una dirección estratégica propuesta, no una descripción de funciones que ya existan.

## 2. Decisión sobre el nombre de marca

**Restricción confirmada por el usuario:** la marca futura no debe usar el nombre de ninguna de sus tres hijas ni quedar asociada exclusivamente a un miembro de la familia. Tiene que ser una marca independiente, amplia y escalable.

Por ese motivo, se descarta **Miluai** como nombre de la plataforma futura, aunque Miluaistudio siga siendo el nombre del producto y del sitio actual mientras se evalúa una transición. No cambiar el nombre del sitio o los archivos por decisión automática.

Características deseables del nuevo nombre:
- Neutro respecto a nombres familiares.
- Amplio: que pueda cubrir software, creatividad, organización, proveedores y servicios.
- Fácil de pronunciar, escribir y recordar en español, empezando por Uruguay y con posibilidades de expansión.
- Distintivo, con una identidad verbal y visual propia.
- Con dominios y nombres de usuario razonablemente accesibles.
- Con antecedentes de marca revisados antes de invertir en la identidad.

### Nombres exploratorios — NO aprobados ni verificados

1. **A Punto** — cercano y orientado a la preparación de una celebración; posible dificultad de diferenciación por ser expresión común.
2. **Confluya** — conecta personas, ideas, herramientas y proveedores; puede ser menos inmediato al escucharlo.
3. **Vemora** — nombre inventado y potencialmente adaptable a productos digitales; necesitaría una explicación de categoría y validación de distintividad.

En conversaciones previas también se exploraron nombres como Momentia, Celebria, Eventia, Planora, Celeva, Quedamos y Ocasia. No deben considerarse candidatos libres: aparecieron indicios de uso o semejanza con servicios existentes y necesitan una investigación independiente. Evitar adoptar cualquier nombre sólo porque suena bien.

### Próximo proceso de naming
- Generar una lista más amplia y diversa de nombres neutros.
- Evaluar pronunciación, ortografía, recuerdo, significado y escalabilidad.
- Buscar usos comerciales y dominios/redes.
- Consultar antecedentes fonéticos y de marcas en Uruguay (DNPI), además de otros mercados objetivo si corresponde.
- Seleccionar una shortlist antes de diseñar logo o migrar la marca.
- No afirmar disponibilidad legal sin consulta específica.

## 3. Arquitectura de marca y navegación propuestas

Una marca principal independiente podría organizar la plataforma en cuatro áreas:

- **Crear**
- **Organizar**
- **Encontrar** (proveedores y recursos)
- **Recordar**

La navegación futura puede evolucionar hacia: Crear · Organizar · Proveedores · Guías · Mis eventos.

Una división de diseño personalizado podría continuar existiendo como un servicio, pero no debe obligar a que la marca general se llame Studio.

## 4. Modelo de producto y diferenciación

La diferenciación no debería ser simplemente tener muchas herramientas. La oportunidad es combinar:
1. Creación digital fácil.
2. Organización práctica en un mismo proyecto de evento.
3. Recursos y proveedores con procesos de confianza claros.

Ejemplo de recorrido de un usuario:
- Elegir un diseño y crear invitación/tarjeta/minisitio.
- Reunir datos del evento y lista de invitados.
- Gestionar confirmaciones, presupuesto y tareas.
- Consultar guías y encontrar proveedores por ubicación, categoría y presupuesto.
- Compartir fotos y recuerdos después del evento.

### “Proveedores confiables” debe significar algo verificable

No prometer verificación si no hay un proceso real. Definir criterios transparentes, por ejemplo:
- Identidad comercial revisada cuando proceda.
- Portfolio con permiso para publicar.
- Reseñas auténticas y contextualizadas.
- Fecha y alcance de la revisión visibles.
- Anuncios pagados identificados claramente.
- Mecanismo para reportar información incorrecta.

Contenido editorial potencial: preguntas para hacer antes de reservar un salón, listas de tareas según el evento, guía de presupuesto, cronogramas, cálculo de invitados, contratos y señales de alerta.

## 5. Desarrollo por etapas recomendado

### Etapa 1 — Estabilizar y mejorar lo actual
- Corregir problemas funcionales/privacidad.
- Diseño claro y coherente en áreas comerciales.
- Mejorar catálogo, personalizador y experiencia móvil.
- Validar conversiones y consultas.

### Etapa 2 — Herramientas creativas adicionales
- Crear tarjetas virtuales como extensión natural del personalizador.
- Explorar miniwebs por ocasión/evento.
- Reutilizar componentes, temas y contenido, sin duplicar la lógica.

### Etapa 3 — Organizador de eventos
- Proyectos guardados por celebración.
- Checklist, presupuesto, tareas, invitados, RSVP y cronograma.
- Determinar almacenamiento seguro, cuentas y privacidad antes de aceptar datos personales.

### Etapa 4 — Directorio y contenidos
- Empezar con categorías y zona geográfica acotadas.
- Validar calidad de los proveedores y demanda.
- Medir consultas y resultados antes de escalar el marketplace.

### Etapa 5 — Ecosistema completo
- Cuentas, recordatorios, álbumes, perfiles de proveedores y monetización.
- Evaluar suscripciones, servicios premium o publicaciones patrocinadas de forma transparente.
- Añadir sólo lo que responda a demanda demostrada.

## 6. Auditoría inicial del sitio y repositorio

Se revisó el código público de Sebasm2kuy/Miluaistudio, no sólo el contenido visual del sitio. El repositorio utiliza Next.js App Router, React, TypeScript, Tailwind CSS, exportación estática (output: export), basePath: /Miluaistudio y un workflow de GitHub Actions que publica el directorio out en GitHub Pages.

GitHub Pages puede servir el frontend estático, pero no ejecuta un servidor Next.js persistente. Las funciones que necesitan un backend deben usar integraciones externas o infraestructura adecuada.

### Riesgos y hallazgos a verificar

1. **RSVP — estado de éxito no verificable.** En src/components/rsvp.tsx, el envío utiliza fetch con mode: no-cors y el flujo continúa hacia el estado de éxito aunque no pueda verificarse la escritura. El frontend envía action=rsvp por GET, mientras que uno de los archivos de Google Apps Script revisados describe un contrato de POST JSON para RSVP de grupo. Hay que comprobar qué URL está configurada y qué script está en producción antes de declarar una incompatibilidad de producción confirmada.

2. **Archivos en el repositorio público.** El árbol público incluye .env y db/custom.db. Su contenido sensible no fue auditado completamente; debe comprobarse de forma segura y evitar publicar secretos o registros personales. Borrar un archivo en un nuevo commit no elimina sus copias del historial.

3. **Panel de administración.** src/app/admin/page.tsx guarda un GitHub Personal Access Token en localStorage y lo utiliza en llamadas desde el navegador. Esto merece una solución más segura; la ruta /admin/ o el noindex no equivalen a autenticación.

4. **Galería de fotos.** Los scripts de Google Apps Script describen flujos de moderación distintos; uno incluye una ruta que hace públicas automáticamente las imágenes ensambladas. Confirmar qué script se usa en producción, unificar la política y explicar la privacidad al usuario.

5. **Fecha/contador.** src/components/countdown.tsx interpreta la fecha con un desplazamiento horario fijo y calcula el evento de calendario por otra ruta. Alinear las fechas con America/Montevideo, probar el calendario y manejar eventos pasados. Las configuraciones de demostración y los datos reales deben estar separados.

6. **Calidad de build.** next.config.ts tiene typescript.ignoreBuildErrors: true y el workflow de validación permite fallos de lint con continue-on-error: true. Corregir los errores genuinos antes de endurecer las comprobaciones.

7. **Consistencia de diseño.** La portada comercial usa una paleta marfil/clara, pero variables globales y reglas de globals.css mantienen un fondo oscuro y excepciones adicionales. Unificar el sistema de diseño sin aplanar la estética propia de cada invitación.

8. **Audio y recursos.** Revisar el uso de preload = auto para música, optimización de imágenes, variantes de fuentes, CLS y carga de recursos externos.

9. **Testimonios.** Revisar src/data/testimonios.ts y publicar como reales únicamente reseñas verdaderas, respaldadas y autorizadas.

10. **Precio y contenido comercial.** Evitar precios duplicados entre portada, catálogo y FAQ. Centralizar la fuente del precio, no cambiar importes sin autorización y no inventar condiciones.

Estos son riesgos vistos en el código o verificaciones pendientes, no una afirmación de que todos estén ocurriendo en producción.

## 7. Dirección de diseño visual

La web comercial debería adoptar un sistema luminoso, editorial, limpio y profesional:
- Marfil #FAF8F4, blanco #FFFFFF, carbón #292522, gris cálido #716A63, champagne #B58C5A y borde suave #E8E0D7.
- Espacio en blanco, lectura cómoda, pocas familias tipográficas, sombras discretas.
- Una acción principal clara y jerarquía coherente de botones.
- Diseño responsive y accesible (contraste, foco, teclado, etiquetas y reduced motion).
- Las invitaciones individuales conservan sus paletas y personalidad.
- Evitar acumular reglas !important para compensar temas contradictorios.

## 8. Plan solicitado a Z.AI

Se preparó un prompt maestro para que Z.AI:
- Inspeccione el código y el workflow reales.
- Corrija primero privacidad, RSVP y contratos de servicios.
- Revise administración, fotos, fechas y configuración.
- Rediseñe las áreas comerciales con un tema claro.
- Mejore el personalizador por pasos y la conversión.
- Revise SEO, rendimiento y accesibilidad.
- Ejecute TypeScript, lint, build y pruebas cuando el entorno lo permita.
- Distinga los cambios comprobados de los que requieren acceso externo.
- Evite cambios destructivos y no publique sin revisión.

Archivo generado durante la conversación: prompt_zai_miluaistudio.txt (en el entorno de chat). Si se decide conservar el prompt dentro del repositorio, crear una copia de la versión aprobada en IDEAS/ y actualizar el índice.

## 9. Decisiones y restricciones actuales

- No usar el nombre de ninguna de las tres hijas como marca principal.
- No elegir ni migrar a un nombre sin búsqueda de disponibilidad y antecedentes.
- No cambiar producción, historial Git, servicios externos ni datos de eventos sin revisar el impacto.
- La nueva plataforma debe separar datos de demostración, plantillas y eventos reales.
- El objetivo es una plataforma independiente que reúna creación, organización, recursos confiables y recuerdos, no sólo un catálogo de invitaciones.
- Empezar por estabilizar el producto actual y validar las ampliaciones gradualmente.

## 10. Próximos pasos

1. Registrar la siguiente iteración después de recibir y evaluar los cambios de Z.AI.
2. Revisar esta lista frente al diff y las pruebas reales; marcar cada punto como resuelto, pendiente o no aplicable.
3. Hacer un proceso de naming neutral con una shortlist y comprobaciones de dominio/marca.
4. Validar si una tarjeta virtual o un organizador básico resuelve primero la necesidad real de los usuarios.
5. Mantener el directorio IDEAS/ como bitácora acumulativa: cada nueva iteración agrega un documento y actualiza README.md, sin borrar las decisiones anteriores.
