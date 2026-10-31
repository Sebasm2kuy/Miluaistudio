# Iteración 032 — Prompt definitivo de correcciones tras auditoría de Lumen Gala

**Fecha:** 31-10-2026  
**Sitio:** https://lumengala.site/  
**Repositorio:** https://github.com/Sebasm2kuy/Miluaistudio  
**Propósito:** implementar los hallazgos de la Iteración 031 sin rediseñar ni romper lo que ya funciona.

## Prompt para Z.AI

Actúa como desarrollador senior full-stack, especialista en Next.js, React, TypeScript, UX móvil, accesibilidad y rendimiento web. Trabaja directamente sobre el código actual de Lumen Gala Studio y realiza las correcciones descritas abajo. No te limites a proponer ideas: inspecciona, implementa, prueba y entrega un informe claro.

### Contexto del proyecto y límites

- Proyecto: Lumen Gala Studio (LGS), servicio de invitaciones web personalizadas para fiestas de 15, bodas y eventos en Uruguay.
- Stack actual: Next.js App Router, React, TypeScript, Tailwind y exportación estática para GitHub Pages con dominio propio `https://lumengala.site/`.
- Conserva la identidad visual de LGS: elegante, editorial, marfil, dorado, tonos cálidos, tipografías actuales e invitaciones como protagonistas.
- Prioridad real: la experiencia móvil, porque gran parte de los visitantes y compradores usan el celular.
- Mantén las rutas absolutas desde la raíz del dominio. No vuelvas a introducir `basePath: "/Miluaistudio"`, rutas relativas que fallen dentro de páginas anidadas, Cloudflare, backend nuevo ni una arquitectura diferente.
- Conserva el flujo vigente de personalización, las invitaciones, el catálogo, demos, RSVP, música, galerías, WhatsApp, editor móvil y publicación de invitaciones. No reemplaces componentes completos si una corrección localizada basta.
- Antes de modificar archivos, inspecciona la rama, el estado actual y los cambios ya hechos. No reviertas ni sobrescribas trabajo del propietario.
- **Decisión comercial cerrada:** el propietario ya quitó los precios de toda la web. No añadas ni restaures precios, importes, «pago único», precios tachados, mensajes que prometan un precio o botones/enlaces de compra por Mercado Libre. Verifica las páginas, tarjetas, vistas rápidas/modales, FAQ, textos compartidos, datos usados por la UI y metadatos. Si encuentras restos visibles o referencias activas de Mercado Libre, elimínalos del flujo público respetando la decisión actual. No reintroduzcas el precio para «completar» una tarjeta. Mantén WhatsApp como vía de consulta. No borres referencias antiguas de documentación histórica solo por contener un precio si no forman parte de la web publicada.
- No inventes ventas, testimonios, puntuaciones, funcionalidades disponibles ni resultados de pruebas. No ocultes errores de TypeScript ni debilitеs validaciones para lograr un build verde.

## 1. Corregir definitivamente el favicon y los iconos de marca

En la auditoría se detectó un conflicto entre `src/app/favicon.ico` (icono de estilo antiguo, pesado y distinto de LGS) y `public/favicon.ico` (icono nuevo de LGS). Next.js puede dar prioridad a su archivo especial de `src/app`.

1. Inspecciona visualmente y compara ambos recursos antes de tocarlos. Usa un único icono oficial coherente con Lumen Gala/LGS, no el sello rojo antiguo.
2. Resuelve el conflicto correctamente: actualiza el favicon especial de Next para que contenga el icono oficial o elimínalo de forma segura si corresponde. No elimines el favicon correcto de `public` ni dejes rutas rotas.
3. Comprueba también `apple-touch-icon.png`, los metadatos `icons`, el favicon de la raíz y el artefacto final `out/`.
4. Verifica que el HTML publicado y los archivos generados muestran/sirven el recurso correcto, sin duplicados contradictorios ni un favicon antiguo cacheable bajo la misma ruta.
5. Conserva `lgs-preview.jpg` y los metadatos Open Graph/Twitter que se cambiaron para la identidad LGS, salvo que detectes un error concreto.

## 2. Mejorar el primer pantallazo móvil de la portada

En el código actual, el bloque visual del héroe aparece antes del H1 y los botones en móvil y usa un área alta con relación aproximada 4:5. La imagen debe conservar impacto, pero la propuesta comercial no debe quedar escondida.

1. Revisa la composición a anchos de 320, 360, 375, 390 y 430 px, así como escritorio.
2. En móviles pequeños, compacta la maqueta o cambia el orden responsive para que el visitante entienda enseguida qué ofrece LGS y encuentre la acción principal «Personalizar mi invitación» sin tener que atravesar una imagen demasiado alta.
3. Conserva una imagen potente del producto y el carácter premium. No conviertas la portada en una pantalla de texto ni elimines el collage si puede adaptarse con elegancia.
4. Mantén visibles y utilizables las acciones de catálogo y WhatsApp, sin que compitan visualmente con la acción principal.
5. Evita saltos de layout durante la carga, contenido cortado, texto superpuesto o desplazamiento horizontal.

## 3. Aligerar el carrusel de los 29 diseños

El componente del carrusel crea actualmente un componente de invitación `MiniInvitation` para cada uno de los diseños, incluidos los slides ocultos. Es innecesario renderizar 29 invitaciones completas simultáneamente.

1. Refactoriza el carrusel para renderizar solamente el diseño activo y, si hace falta para la transición, sus vecinos inmediatos. Para el resto usa una representación ligera o miniatura.
2. No pierdas los 29 diseños, el gesto de deslizar, las flechas, los puntos/indicadores cuando corresponda ni las acciones «Ver demostración» y «Personalizar el mío».
3. Asegura que los botones de flecha, las teclas izquierda/derecha, los puntos y los gestos táctiles registren la interacción y pausen el autoplay durante un intervalo razonable.
4. Evita que el carrusel cambie de diseño mientras una persona intenta inspeccionarlo después de pulsar una flecha o usar el teclado.
5. Respeta `prefers-reduced-motion`, pausa cuando la pestaña está oculta y cancela correctamente los intervalos al desmontar el componente. No introduzcas timers múltiples ni fugas de memoria.
6. Conserva la accesibilidad: nombres comprensibles, estado actual anunciado cuando corresponda, foco visible y navegación con teclado.
7. Revisa las imágenes de portada, catálogo y demos. Optimiza los recursos realmente pesados (formatos modernos cuando proceda, dimensiones acordes al uso, carga diferida por debajo del primer pantallazo y prioridad solo para los recursos críticos). No cambies imágenes sin comprobar que no se degrada el diseño y no borres assets que aún estén referenciados.
8. Mide el resultado con herramientas disponibles: tamaño del build, elementos renderizados, recursos iniciales y errores de consola. No afirmes una mejora de rendimiento que no se haya medido.

## 4. Quitar el acceso al editor interno de la navegación pública

La auditoría encontró el enlace «Editor de invitaciones» en el pie público. `/editar/` es una herramienta operativa, no una página comercial y actualmente necesita que el propietario proporcione un token de GitHub desde el navegador.

1. Quita el enlace del pie y de las navegaciones destinadas a clientes. No lo reemplaces por otro enlace público que cumpla la misma función.
2. Conserva la ruta directa `/editar/` para el propietario; no rompas su funcionamiento ni el camino al editor desde «Personalizar» donde sea necesario.
3. Mantén el editor y la vista previa local fuera del índice de buscadores y fuera del sitemap público. No presentes `noindex` como si fuera autenticación.
4. No implementes un sistema de cuentas o un backend nuevo dentro de esta iteración. Limítate a la corrección de navegación y a verificar que el token no queda hardcodeado, no aparece en URLs, logs, HTML ni datos guardados innecesariamente. Conserva el flujo funcional actual del editor.
5. Asegúrate de no filtrar ni imprimir tokens durante los tests o el manejo de errores. No cambies permisos ni pidas tokens al usuario.

## 5. Hacer honestas las reseñas y la puntuación visual

Los testimonios actuales están correctamente etiquetados como ejemplos de referencia, pero las tarjetas siguen dibujando cinco estrellas y tienen un aria-label de «Calificación: 5 de 5 estrellas».

1. Mientras `estado: 'muestra'`, no mostrar estrellas ni una puntuación que se pueda confundir con una valoración auténtica. Sustituye ese elemento por una etiqueta discreta «Ejemplo de referencia» o similar.
2. Solo mostrar estrellas/calificación cuando la reseña sea real, autorizada y marcada como verificada según el modelo actual.
3. Conserva el texto visible que explica que los comentarios son ejemplos y que las reseñas reales se publicarán una vez autorizadas. No inventes testimonios reales ni cambies un testimonio de muestra a verificado.

## 6. Reducir el protagonismo de servicios todavía no disponibles

Álbum digital, edición de video, video de historia y tráiler figuran como «Próximamente».

1. Conserva el concepto y las tarjetas informativas, pero asegúrate de que las invitaciones web sigan siendo claramente el producto principal.
2. Evita que servicios no disponibles dominen el encabezado, el primer pantallazo o los CTA principales. Es preferible que se entiendan como una expansión futura al recorrer la página.
3. Conserva etiquetas honestas de disponibilidad y los enlaces de WhatsApp para consultar/recibir novedades. No simules que un servicio futuro ya puede contratarse.
4. Mantén accesibles los elementos desplegables del menú móvil: el estado abierto/cerrado debe anunciarse, Escape debe cerrar cuando proceda, los enlaces deben cerrar el menú y no debe quedar un panel invisible interceptando toques.

## 7. Corregir canonical y metadatos de páginas internas

En el artefacto revisado, `/editar/` y `/previsualizar/` aparecen con `noindex, nofollow`, pero el canonical publicado apunta a la portada, aunque esas páginas no son equivalentes a ella. Las demos individuales tienen una política propia de noindex.

1. Revisa la metadata generada de `/editar/`, `/previsualizar/`, páginas de demos e invitaciones publicadas.
2. No asignes a una ruta interna un canonical a la portada solo por ser más fácil. En páginas deliberadamente `noindex`, elimina el canonical incorrecto o usa una política coherente con el propósito de la ruta.
3. Conserva canonical correcto en la portada, catálogo y personalizador.
4. Mantén las demostraciones de eventos ficticios y las invitaciones publicadas fuera del sitemap indexable según la política actual. No indexar por defecto datos de invitaciones de clientes.
5. Asegura que `robots.txt` apunta al sitemap y que las rutas comerciales indexables siguen incluidas.

## 8. Consistencia, accesibilidad y regresiones

1. Revisa textos, botones, enlaces internos, navegación, modales y cierre de modales, foco de teclado, contraste, textos alternativos relevantes, tamaños de toque y ausencia de overflow horizontal.
2. Conserva los CTA actuales que sí cumplen una función: personalizar, ver catálogo/demos y consultar por WhatsApp.
3. Busca restos en la UI de precios, condiciones de pago y enlaces de Mercado Libre: encabezado, tarjetas, modal/vista rápida, CTA final, FAQ, datos y componentes compartidos. No vuelvas a introducir esos elementos.
4. Conserva el nombre «Lumen Gala» en los elementos visibles principales. No cambies el nombre interno del repositorio ni los identificadores/rutas de API históricos que todavía son necesarios para publicar invitaciones.
5. Revisa enlaces rotos, imágenes faltantes, errores de consola y rutas raíz en el export final.
6. No reescribas estilos o componentes que no estén relacionados con los hallazgos; no hagas un rediseño total. Prioriza cambios pequeños, legibles, mantenibles y cubiertos por tests.

## 9. Pruebas obligatorias y criterios de aceptación

Antes de dar por terminado el trabajo:

- Ejecuta los scripts existentes: `npm test`, `npm run lint`, `npm run typecheck` y `npm run build` (el build debe incluir las verificaciones existentes de export y privacidad).
- Corrige errores reales surgidos de los cambios. No desactives tests, no agregues excepciones falsas y no ocultes errores de compilación.
- Comprueba en escritorio y emulación móvil, como mínimo a 360×800 y 390×844:
  - portada: propuesta y CTA principal localizables sin scroll excesivo;
  - navegación: todos los enlaces funcionan y el menú móvil abre/cierra correctamente;
  - carrusel: swipe, flechas, teclado, puntos, pausa del autoplay y reduced-motion funcionan;
  - catálogo/demos: los 29 diseños siguen accesibles y las demos abren;
  - personalizador: selección de diseño y navegación hacia el editor conservan los datos y el flujo actuales;
  - editor: no se muestra desde la navegación comercial, pero sigue disponible por su URL directa para el propietario;
  - favicon: recurso LGS correcto en el artefacto, sin sello antiguo;
  - precio/Mercado Libre: no quedan importes ni botones/enlaces de esos canales en las páginas publicadas;
  - testimonios: ningún ejemplo parece puntuación auténtica;
  - SEO: canonical, noindex, robots y sitemap coherentes;
  - no hay errores de consola, imágenes rotas, enlaces internos al antiguo subdirectorio ni scroll horizontal.
- No marques como «probado en teléfono físico» lo que solo se comprobó en emulación. Enumera las comprobaciones manuales que todavía requieran el teléfono real.
- No hagas afirmaciones genéricas del tipo «todo funciona» si no hay una prueba que las respalde.

## 10. Informe final que debes entregar

Al terminar, informa de manera breve pero concreta:

1. Qué cambiaste y por qué, separado por los puntos anteriores.
2. Archivos principales modificados.
3. Resultado real de cada comando de pruebas, con el número de tests aprobado/fallido si corresponde.
4. Qué se verificó en escritorio/emulación móvil y qué sigue pendiente de probar en un dispositivo físico.
5. Cualquier problema encontrado que no pudiste resolver, sin ocultarlo.
6. Estado del cambio: rama/commit/PR o despliegue, según el flujo real del repositorio. No digas que se publicó en producción si únicamente se compiló en local.

Empieza inspeccionando el código vigente y los cambios ya existentes. Después implementa, prueba y entrega el resultado. No te detengas tras presentar un plan: ejecuta las correcciones dentro del alcance de esta iteración.
