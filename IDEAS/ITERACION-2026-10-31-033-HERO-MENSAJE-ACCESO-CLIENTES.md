# Iteración 033 — Nuevo texto principal + acceso a clientes visible

**Fecha:** 31-10-2026  
**Sitio:** https://lumengala.site/  
**Repositorio:** https://github.com/Sebasm2kuy/Miluaistudio  
**Objetivo:** mejorar el mensaje del héroe de la portada y hacer visible el acceso de clientes desde el encabezado inicial, sin alterar el login/panel ya implementado ni duplicar funcionalidades.

## Diagnóstico previo confirmado en el código

- `src/app/page.tsx` todavía contiene el H1 anterior: «Invitaciones web de alta gama para 15s y bodas, en un solo enlace.» y un párrafo que vuelve a enumerar funciones.
- `src/components/store-nav.tsx` es el encabezado compartido, pero actualmente no tiene un enlace a `/acceso/`.
- La portada ya enlaza a `/acceso/` desde el pie, demasiado abajo para que un cliente lo encuentre fácilmente.
- Las páginas `/acceso/`, `/dashboard/`, `/dashboard/editar/` y `/dashboard/confirmaciones/` ya existen. No hay que crear un login paralelo; hay que conectar el encabezado con el que existe.
- El login no ofrece registro automático: si alguien no tiene cuenta, el flujo vigente le indica que consulte por WhatsApp. Conservar este comportamiento.
- El sitio es exportación estática de Next.js. El panel y su guardia son client-side; no afirmar ni introducir una falsa promesa de autenticación de servidor.

## Prompt listo para Z.AI

Actúa como desarrollador senior de Next.js App Router, React, TypeScript, Tailwind, UX responsive y accesibilidad. Trabaja sobre el código vigente del repositorio y realiza esta iteración completa. No te limites a sugerencias: implementa, prueba e informa los resultados.

### Reglas de trabajo

1. Inspecciona el estado actual antes de modificar nada. Los archivos relevantes pueden haber cambiado desde esta nota; respeta cualquier mejora ya aplicada.
2. No reescribas ni dupliques componentes si una modificación localizada alcanza.
3. Conserva la identidad Lumen Gala Studio: elegante, cálida, editorial y premium, con las invitaciones como protagonistas.
4. Mantén la arquitectura actual de exportación estática con GitHub Pages, el dominio raíz `lumengala.site`, rutas absolutas y los tests/validadores existentes.
5. No introduzcas Cloudflare, un backend nuevo, otra solución de autenticación ni una segunda página de login.
6. No incorpores precios, importes, «pago único», botones/enlaces de compra por Mercado Libre ni mensajes que prometan tarifas. El propietario los quitó de toda la web; no deben reaparecer.
7. No elimines el enlace «Acceso clientes» del pie: puede permanecer como acceso adicional, pero no debe ser la única forma de encontrar el login.

### A. Cambiar el título principal de la portada

En `src/app/page.tsx`, reemplaza el H1 principal por este texto exacto:

**«Invitaciones web elegantes y personalizadas para fiestas de 15 y bodas.»**

Usa un texto de apoyo inmediatamente debajo del H1, sustituyendo el párrafo actual por:

**«Cada detalle de tu celebración, en un solo enlace: música, galería de fotos, cuenta regresiva, ubicación y confirmación de asistencia. Todo listo para compartir por WhatsApp.»**

Objetivos de comunicación:
- Que la persona entienda rápidamente qué servicio ofrece Lumen Gala.
- Transmitir elegancia, personalización y sencillez sin frases genéricas.
- Usar «fiestas de 15» en lugar de «15s».
- Explicar el beneficio concreto de tener los detalles del evento en un solo enlace.
- Mantener un español natural para Uruguay.
- No repetir innecesariamente el mismo mensaje en las etiquetas próximas al H1. Si la insignia verde actual repite «Se comparte por WhatsApp, sin instalar nada», reformúlala para aportar una ventaja distinta o reducir la redundancia, sin eliminar la información útil de que no hace falta instalar una aplicación.

Mantén el H1 como el encabezado semántico principal de la página, con lectura cómoda y líneas bien equilibradas en móviles y escritorio. No bajes su contraste ni reduzcas excesivamente el tamaño para forzarlo a caber.

### B. Alinear el texto del pie y los metadatos sin perjudicar SEO

- Actualiza el texto del pie que actualmente repite «Invitaciones web de alta gama para 15s y bodas» para que quede alineado con la nueva propuesta. Texto sugerido: «Invitaciones web elegantes y personalizadas para fiestas de 15 y bodas · Montevideo, Uruguay».
- Revisa title, meta description, Open Graph y Twitter metadata. Deben describir el mismo servicio y la marca Lumen Gala Studio, sin competir con el nuevo H1 ni recuperar el texto «15s».
- Mantén las palabras clave útiles para búsquedas como invitaciones web, invitaciones digitales, fiestas de 15, bodas, Montevideo y Uruguay, pero escribe títulos/descripciones naturales, no una lista de palabras clave.
- No cambies canonical, robots, sitemap, favicon ni otros metadatos que no requieran cambios para esta tarea.
- Conserva la descripción clara de las funciones reales y no prometas servicios «Próximamente» como si ya estuvieran disponibles.

### C. Hacer visible «Acceso clientes» en el encabezado inicial

Actualmente el link a `/acceso/` está en el pie de la portada, mientras que el header compartido `src/components/store-nav.tsx` no ofrece esa opción. El visitante no debería tener que recorrer toda la página para iniciar sesión.

Agrega el acceso al encabezado compartido de forma elegante, clara y accesible.

**En escritorio:**
- Mostrar una opción textual «Acceso clientes» en el header visible desde el primer pantallazo.
- Debe ser secundaria respecto del botón «Personalizar»; no competir visualmente con la acción principal.
- Puede usar un icono discreto de usuario/inicio de sesión de Lucide, siempre acompañado de texto visible.

**En móvil:**
- El acceso debe estar visible desde la primera pantalla, sin tener que desplazarse hasta el pie y sin depender exclusivamente de abrir el menú hamburguesa.
- Por espacio, se puede usar un botón compacto con icono en el header y etiqueta accesible `aria-label="Acceso clientes"`; desde anchos mayores se puede mostrar también el texto.
- Asegura que logo, WhatsApp, acceso clientes y menú hamburguesa no se amontonen ni causen overflow horizontal a 320, 360, 390 y 430 px.
- El elemento debe tener tamaño táctil cómodo, foco visible, contraste suficiente y un nombre accesible. No uses un icono sin etiqueta accesible.
- No ocultes el acceso en breakpoints pequeños. Si el ancho es muy estrecho, prioriza la distribución responsive sin quitar la forma de llegar directamente al login.

**Navegación:**
- El enlace debe apuntar a la ruta que ya existe: `/acceso/`.
- No crear rutas como `/login`, `/clientes` u otra variante.
- No crear un formulario adicional en la portada.
- Mantén un solo enlace directo de encabezado que funcione en todos los tamaños de pantalla.
- La opción puede repetirse en el pie como acceso secundario, pero evita duplicarla dentro del header y de forma innecesaria dentro del menú móvil si ya es visible allí.

### D. Verificar el login y su conexión con el panel existente

No des por terminado el trabajo con agregar el enlace visual. Verifica que el enlace lleva al login real y que el flujo funciona.

Inspecciona estos archivos según existan en el código actual:
- `src/app/acceso/page.tsx`
- `src/app/acceso/layout.tsx`
- `src/app/dashboard/layout.tsx`
- `src/app/dashboard/guardia.tsx`
- `src/app/dashboard/page.tsx`
- `src/lib/auth-cliente.ts`
- `src/data/clientes-esquema.ts`
- `content/clientes.json`

Comprobaciones:
1. Abrir el enlace «Acceso clientes» desde el header en escritorio y en móvil.
2. Confirmar que aparece el formulario de email y contraseña existente, con estados de carga y errores comprensibles.
3. Verificar que las credenciales de una cuenta válida llevan a `/dashboard/`.
4. Verificar que sin una sesión válida el guardia redirige a `/acceso/`.
5. Confirmar que el dashboard conserva sus enlaces a resumen, edición de la invitación y confirmaciones.
6. Comprobar que una persona sin cuenta conserva el flujo «No tengo cuenta — escribinos por WhatsApp».
7. No mostrar contraseñas, hashes, tokens ni errores internos al visitante.
8. No insertar cuentas de clientes, contraseñas o tokens en HTML público, metadatos o logs.
9. Mantener la zona del panel marcada como noindex y fuera del sitemap comercial.
10. Si detectas un defecto real en el login o su navegación, corrígelo de manera localizada y añade un test de regresión.

Importante: la arquitectura es una exportación estática y la guardia del dashboard es del lado cliente. No afirmes que esto equivale a autenticación de servidor. No introduzcas una nueva arquitectura de seguridad dentro de esta iteración; documenta cualquier limitación real que detectes en vez de ocultarla.

### E. Pruebas de interfaz y regresión

Ejecuta:
- `npm test`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

El build debe ejecutar las verificaciones actuales de exportación y privacidad. No desactives tests ni ignores errores para obtener un resultado verde.

Verifica el artefacto final en:
- Escritorio: 1280×800.
- Móvil: 320×700, 360×800, 390×844 y 430×900.

Criterios de aceptación:
- El H1 contiene el nuevo texto exacto y el párrafo de apoyo es el indicado.
- La portada sigue viéndose elegante; ningún texto se corta ni se monta sobre otro.
- «Acceso clientes» se ve en el header inicial en escritorio y móvil.
- El enlace abre `/acceso/` y no una ruta inventada.
- El menú móvil existente sigue abriendo/cerrando correctamente.
- El acceso directo no desplaza ni sustituye los CTA de Personalizar, Catálogo o WhatsApp.
- No hay overflow horizontal ni errores nuevos de consola.
- No se han reintroducido precios, importes o enlaces de compra por Mercado Libre.
- Title/description/Open Graph siguen siendo coherentes con la marca y el nuevo posicionamiento.
- Las rutas internas del panel siguen fuera del sitemap indexable.
- No se rompieron el personalizador, el catálogo, las demos, el editor móvil ni la publicación de invitaciones.

No afirmes que la prueba se hizo en un teléfono físico si solo usaste emulación.

### F. Informe final

Al terminar, informa de forma breve y verificable:
1. Qué cambiaste y en qué archivos.
2. Cómo quedó la portada y el enlace visible de acceso a clientes.
3. Resultado real de cada comando de pruebas, indicando tests aprobados/fallidos.
4. Qué verificaste en escritorio y móvil.
5. Problemas no resueltos o pruebas que aún requieran un dispositivo real.
6. Commit, rama y estado de publicación real. No digas que ya está en producción si solo compilaste localmente.

Primero inspecciona el código vigente. Después realiza e implementa los cambios, ejecuta las pruebas y entrega el informe. No te detengas en una propuesta: completa la iteración dentro del alcance definido.