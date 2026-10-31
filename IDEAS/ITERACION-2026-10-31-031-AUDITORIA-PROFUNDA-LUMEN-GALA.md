# Iteración 031 — Auditoría profunda de Lumen Gala Studio

**Fecha:** 31-10-2026  
**Sitio:** https://lumengala.site/  
**Repositorio:** https://github.com/Sebasm2kuy/Miluaistudio  
**Tipo:** auditoría del artefacto exportado, código de `main` y despliegue; no se modificó el código de la web.

## Alcance y límite de la revisión

La navegación externa disponible en esta sesión no permitió abrir visualmente `lumengala.site` en vivo. Para evitar inventar una revisión visual, se inspeccionaron el HTML exportado en la rama `gh-pages`, los componentes de la versión `main`, los metadatos publicados, los archivos de configuración, el contenido del catálogo y los resultados recientes de GitHub Actions.

El último ciclo consultado terminó correctamente el 30-10-2026: despliegue de Pages con conclusión `success` y validación de `main` con conclusión `success`. Esto confirma que el build, las pruebas y la publicación automatizada pasaron; no equivale a una prueba interactiva en un teléfono físico. La lista `docs/PRUEBA-MANUAL-EDITOR-MOVIL.md` sigue siendo el mecanismo para comprobarlo en dispositivo real.

## Resumen ejecutivo

La web ya tiene una identidad de marca coherente, una oferta principal entendible y una estructura comercial más madura que una simple galería. El recorrido principal se entiende: conocer Lumen Gala, explorar diseños, ver demostraciones y personalizar o consultar por WhatsApp. El SEO técnico básico y el flujo automatizado de publicación están bien trabajados.

Los principales pendientes no requieren rehacer el sitio: son correcciones de cierre y conversión. El hallazgo técnico más claro es el favicon publicado, que no corresponde al nuevo archivo LGS previsto. También conviene aligerar el carrusel, revisar el primer pantallazo móvil y decidir si el acceso al editor debe estar visible a cualquier visitante.

## Lo que quedó bien

1. **Posicionamiento claro.** El H1 publicado es «Invitaciones web de alta gama para 15s y bodas, en un solo enlace». La descripción refuerza que es un servicio personalizado para eventos en Uruguay y menciona Montevideo.
2. **Identidad consistente en los principales metadatos.** El HTML exportado ya muestra el título «Lumen Gala Studio | Invitaciones Web de Alta Gama en Montevideo», canonical a `https://lumengala.site/`, descripción, idioma `es-UY`, Open Graph y Twitter Cards con la identidad LGS.
3. **Buen camino de conversión.** La portada ofrece tres vías comprensibles: personalizar, explorar el catálogo y consultar por WhatsApp. Las páginas principales enlazan a rutas raíz, sin el antiguo prefijo `/Miluaistudio/`.
4. **Catálogo útil.** Se exponen 29 diseños y una demostración por diseño; hay una explicación de cómo funciona el servicio y CTAs hacia personalización y contacto.
5. **SEO técnico básico presente.** El sitio publica `robots.txt` y `sitemap.xml`; el sitemap incluye la portada, el catálogo y el personalizador. La portada declara datos estructurados de negocio y servicio.
6. **Honestidad en los testimonios de muestra.** Las reseñas no verificadas están marcadas como «Ejemplo de referencia» y se aclara que son textos de muestra, no comentarios reales. Mantener esa transparencia es positivo.
7. **Despliegue verificable.** Los workflows recientes de validación y despliegue terminaron con éxito. El artefacto de `gh-pages` contiene el CNAME `lumengala.site` y HTML con canonical a la raíz del dominio.

## Hallazgos priorizados

### P1 — El favicon publicado parece ser el anterior, no el nuevo icono LGS

**Evidencia:** en `main` existen ambos archivos `src/app/favicon.ico` y `public/favicon.ico`. El publicado como `gh-pages/favicon.ico` tiene el mismo SHA de blob que `src/app/favicon.ico` (`664744f999564940ff66115b51e0e408a1b75cf4`) y pesa aproximadamente 184,5 KB. El archivo nuevo de `public/favicon.ico` tiene otro SHA (`b4e98b66f0d8e427d5a9a27d5707cf7162826500`? no: revisar el SHA exacto actual en el repositorio) y es mucho más pequeño (~15 KB). El contenido del favicon publicado se ve como el sello rojo anterior, no como el monograma LGS dorado previsto.

**Impacto:** el nombre de marca ya cambió en portada y metadatos, pero la pestaña del navegador puede seguir mostrando una identidad antigua y un recurso excesivamente grande.

**Acción recomendada:** eliminar o sustituir el duplicado `src/app/favicon.ico` para que no pise el icono de `public/favicon.ico`; luego reconstruir y desplegar. Verificar el contenido del archivo raíz `/favicon.ico` y el icono que el navegador elige en la pestaña y «Agregar a inicio». No alcanza con que el HTML enlace a `/favicon.ico`; hay que comprobar el recurso servido.

### P1/P2 — El editor interno está enlazado desde el pie público

**Evidencia:** el pie de la portada incluye «Editor de invitaciones» con enlace a `/editar/`. La ruta tiene `noindex, nofollow`, pero se exporta y es accesible públicamente; no tiene autenticación de servidor. El propio editor explica que cargar/publicar y subir fotos requiere un GitHub token que el dueño pega en la sesión del navegador. El token se almacena en `sessionStorage` y las operaciones van directamente a la API de GitHub.

**Impacto:** no significa que cualquiera pueda modificar el repositorio sin credenciales, pero sí presenta al visitante una herramienta de operación interna y deja claro que el control de escritura depende de un token usado en el cliente. `noindex` no es un mecanismo de acceso restringido.

**Acción recomendada:** si el enlace se necesita solo para el propietario, quitarlo del pie público y guardar `/editar/` como favorito en los dispositivos de uso. Usar exclusivamente un token fine-grained limitado al repositorio y al permiso mínimo necesario; nunca pegar un token de permisos amplios. Si se necesita un editor multiusuario más adelante, separar el acceso interno mediante autenticación real, no solo una URL no indexada.

### P2 — El primer pantallazo móvil prioriza la imagen y puede ocultar la propuesta/CTA

**Evidencia:** en la portada, la maqueta visual del héroe aparece antes del bloque de texto en el orden móvil y usa una proporción 4:5. El H1 y los tres botones están después de esa pieza visual.

**Impacto probable:** en teléfonos corrientes, gran parte de la primera pantalla puede quedar ocupada por la imagen; el usuario podría no ver inmediatamente qué vendés ni el botón «Personalizar mi invitación». La dirección visual es atractiva en el código, pero el orden reduce el espacio inicial disponible para convertir.

**Acción recomendada:** probar a 360×800 y 390×844. En pantallas pequeñas, valorar un héroe más compacto o mostrar antes el H1 y la CTA principal. Mantener el impacto visual sin exigir un desplazamiento antes de entender la oferta.

### P2 — El carrusel genera las 29 invitaciones en el DOM a la vez

**Evidencia:** `src/components/carrusel-modelos.tsx` recorre los 29 diseños y crea un `MiniInvitation` por diseño, aunque casi todos los slides estén ocultos por opacidad. El HTML exportado de portada pesa aproximadamente 687 KB sin comprimir y el HTML del catálogo unos 626 KB. La lista de recursos estáticos de Pages suma alrededor de 24 MB, principalmente imágenes y otros assets; ese total no significa que todo se descargue en cada visita, pero sí justifica revisar el peso de recursos y componentes.

**Impacto probable:** más DOM e hidratación al inicio y más trabajo para móviles modestos. Puede hacer que la portada y el catálogo se sientan pesados, aunque los tamaños de transferencia reales dependan de compresión y caché.

**Acción recomendada:** renderizar solo el slide activo y, como máximo, sus vecinos; usar miniaturas livianas pre-renderizadas para las tarjetas y cargar la demostración interactiva completa solo cuando se abre. Revisar qué assets grandes antiguos se siguen usando antes de borrarlos.

### P2 — El autoplay del carrusel no se pausa igual con todas las interacciones

**Evidencia:** las funciones `avanzar` y `retroceder` actualizan el índice, pero no actualizan `ultimaInteraccion`. Los botones de flechas y las teclas de cursor llaman a esas funciones. Los gestos táctiles y la navegación por puntos sí registran la interacción.

**Impacto:** el carrusel puede seguir avanzando automáticamente después de que el visitante use las flechas o el teclado, aunque el comentario del componente diga que la interacción pausa el avance automático.

**Acción recomendada:** centralizar la gestión de interacción para registrar el tiempo al usar flechas, teclado, puntos y gesto táctil; verificar que el carrusel no cambie mientras alguien intenta inspeccionar un diseño.

### P2 — Precio y Mercado Libre están quitados de la portada, pero siguen en el catálogo

**Evidencia:** la portada publicada ya no muestra el precio ni botones de Mercado Libre. En `/catalogo/`, las tarjetas, la vista rápida y la llamada final todavía usan `PRECIO.texto` (`$ 1.200 UYU`) y enlaces a Mercado Libre; WhatsApp también está disponible.

**Impacto:** el recorrido cambia la estrategia comercial según la página. Puede ser intencional —portada centrada en la marca y catálogo con precio—, pero si la decisión era sacar esos elementos de toda la web, la limpieza no quedó global.

**Acción recomendada:** decidir y documentar una sola política: a) precio visible en catálogo y contratación por Mercado Libre/WhatsApp, o b) precio por consulta y sin enlaces de Mercado Libre. Si se conserva el precio, que el catálogo lo comunique claramente y que el visitante entienda qué se entrega por ese importe.

### P2 — Los servicios «Próximamente» ocupan un lugar muy visible

**Evidencia:** álbum digital, videos, historia de vida y tráiler aparecen en el menú y en accesos rápidos de portada, pero las tarjetas confirman que aún no están disponibles.

**Impacto comercial:** transmite una visión de futuro interesante, aunque también puede hacer que la oferta parezca parcialmente incompleta antes de que la persona entienda o contrate la invitación web.

**Acción recomendada:** mantener la invitación como propuesta principal. Dejar los extras más abajo y con lenguaje de «estamos preparando»; promoverlos en la cabecera solo cuando aporten contactos reales o ya se puedan contratar.

### P2 — Los testimonios de muestra tienen cinco estrellas visuales

**Evidencia:** las reseñas se etiquetan honestamente como ejemplos y existe una nota aclaratoria, pero las tarjetas muestran estrellas con aria-label «Calificación: 5 de 5 estrellas», aunque no hay reseñas reales verificadas.

**Impacto:** aunque no se intenta hacerlas pasar por reseñas reales, el símbolo de cinco estrellas puede ser leído rápidamente como una puntuación del negocio.

**Acción recomendada:** mientras sean muestras, quitar las estrellas de calificación o sustituirlas por un adorno que no parezca puntuación. Conservar las etiquetas de muestra; recién mostrar estrellas cuando correspondan a valoraciones reales, autorizadas y trazables.

### P3 — Alcance orgánico intencionalmente acotado

**Evidencia:** el sitemap declara solo portada, catálogo y personalizador. Las páginas de demostración por diseño están marcadas como `noindex` y no aparecen en el sitemap.

**Evaluación:** es razonable para no indexar invitaciones ficticias o demostraciones que parecen eventos reales. A cambio, las 29 páginas de diseño no aportan tráfico orgánico propio.

**Acción futura:** cuando las páginas de diseño tengan texto y contenido comercial únicos, evaluar indexar una selección estratégica. No indexar automáticamente las demos actuales solo para engordar el sitemap.

## Evaluación general

- **Marca y propuesta:** bien definidas y bastante consistentes en el código y los metadatos.
- **Conversión:** buen conjunto de CTAs, con una decisión pendiente sobre precio y canal de contratación.
- **Móvil:** existe un editor visual específico, pero todavía hay que verificarlo físicamente y mejorar el peso/orden inicial de la experiencia.
- **Calidad técnica:** buena disciplina de tests, controles del artefacto exportado y publicación automatizada; el conflicto del favicon muestra por qué la última verificación del artefacto importa.
- **Confianza:** buena honestidad al etiquetar reseñas de muestra. Revisar la exposición pública del editor y retirar la apariencia de calificación falsa.

## Orden de trabajo recomendado

1. Corregir el favicon duplicado y comprobar el recurso después del despliegue.
2. Ajustar el primer pantallazo móvil y reducir el número de invitaciones renderizadas a la vez.
3. Quitar el enlace público al editor si es una herramienta interna y revisar el alcance del token.
4. Corregir la pausa del autoplay del carrusel.
5. Alinear la política de precio/Mercado Libre y simplificar la presencia de servicios aún no disponibles.
6. Quitar estrellas de las reseñas de muestra y completar la prueba manual en un teléfono real.

**Importante:** no se hicieron cambios de código en esta auditoría; este documento conserva los hallazgos y el orden sugerido para la próxima iteración.
