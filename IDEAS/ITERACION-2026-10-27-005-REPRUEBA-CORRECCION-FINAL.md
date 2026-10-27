# Iteración 005 — Reprueba de la corrección final (27-10-2026)

## Alcance y versión comprobada

Esta revisión se rehizo sobre los commits funcionales recientes de la rama `main`, no sobre la versión anterior a la corrección.

- Merge del PR #13: `0fa36357` — [ver commit](https://github.com/Sebasm2kuy/Miluaistudio/commit/0fa363571c9685a967b93f21586fd27579299d53).
- Validación CI: [workflow 40533320857](https://github.com/Sebasm2kuy/Miluaistudio/actions/runs/40533320857), resultado **success**.
- Despliegue actual: [workflow 40533425623](https://github.com/Sebasm2kuy/Miluaistudio/actions/runs/40533425623), resultado **success**.
- Se inspeccionaron los HTML publicados en `gh-pages`, los bundles JS referenciados por el personalizador, el código del PR y el log de verificación post-build.

**Limitación:** el entorno no permitió una sesión interactiva del sitio en navegador; la URL directa produjo un error de acceso de la herramienta. Por eso esta es una validación de commit, exportación y código publicado, no una prueba manual de todos los controles en celulares o una medición Lighthouse.

## Correcciones confirmadas

### 1. La ruta administrativa ya no se exporta

- En la rama publicada no existe `admin/index.html`.
- El build ejecuta `scripts/prune-export.mjs` y `scripts/verify-export.mjs`.
- El log de CI confirma `out/admin/` ausente y la verificación de exportación sin errores.
- El código del panel sigue existiendo en `src/app/admin/page.tsx`, por lo que su propósito queda como herramienta de administración/local según la documentación; no debe publicarse de nuevo en GitHub Pages.

### 2. Se retiraron imágenes de la exportación pública actual

- La captura PNG retirada y los tres JPG retirados ya no están en el árbol publicado `gh-pages`.
- `uploads/` queda con `.gitkeep`, sin imágenes.
- El log de `verify-export` confirma los cuatro assets ausentes y la carpeta sin imágenes.

**Límite importante:** se eliminaron del estado actual, pero las versiones anteriores pueden seguir presentes en el historial Git público. Si se confirma que alguna imagen no tenía autorización para publicarse, retirar el último archivo no es una eliminación completa de ese historial. La limpieza del historial es una acción destructiva que debe evaluarse y aprobarse por separado.

### 3. Las miniaturas ya no muestran una cuenta regresiva falsa

El HTML publicado ya no contiene la secuencia fija anterior; las maquetas usan guiones como marcadores neutros. La cuenta regresiva funcional de cada demo sigue siendo un componente separado y no se debe dar por probada con esta revisión estática.

### 4. SEO básico y jerarquía de encabezados mejoraron

- La portada publicada empieza con su H1 comercial, ya no con los H3 decorativos de las maquetas.
- El catálogo presenta su H1 y los nombres de diseños como H2.
- El título del personalizador ahora es `Personalizá tu invitación | Miluaistudio`, sin duplicar la marca.
- La metadata principal y canonical de inicio, catálogo y personalizador están presentes.
- Las demos siguen marcadas `noindex, follow`, con canonical a catálogo. Es coherente si se desea que las demos no se indexen, aunque conviene documentar esa decisión.

### 5. Los botones de WhatsApp tienen mejor contraste

Se usa texto oscuro sobre el verde en los botones de la portada y catálogo. Los ratios calculados son:
- `#0b3d1e` sobre `#25d366`: **6,23:1**.
- `#0b3d1e` sobre el hover `#1db957`: **4,78:1**.

La primera combinación pasa AA para texto normal y la segunda también, aunque más cerca del límite.

### 6. Mejoró el manejo de estados de RSVP y fotos

- El código distingue resultado verificable, pendiente y error; ya no debe comunicar guardado confirmado cuando no pudo leer una respuesta.
- El script de código fuente `gallery-server.gs` está separado del servidor de fotos y documenta que es solo RSVP.
- El servidor de fotos de código fuente conserva el paso de moderación antes de hacer visible una imagen.
- Hay pruebas contractuales con datos sintéticos en `tests/contrato-backend.test.ts`.
- El build incorpora verificaciones para que vuelva a fallar si el panel se exporta o reaparecen los assets retirados.

**No se comprobó el servicio de Google Apps Script en producción.** Los cambios en el archivo `.gs` del repositorio no actualizan por sí solos una implementación web ya desplegada en Google; debe confirmarse la versión/URL activa con una prueba controlada.

## Hallazgos que siguen abiertos

### P0 — Datos del perfil base siguen apareciendo en bundles públicos

Volví a inspeccionar los bundles JavaScript que carga `/personalizar/` en la versión actual y comparé sus cadenas con campos de `src/data/config.ts`. Siguen apareciendo coincidencias exactas para varios valores del perfil configurado, pertenecientes a categorías como nombre del evento, fecha, lugar/ubicación, hashtag, URL de mapa, texto de dedicatoria y enlaces de música. No se reproducen esos valores en este informe.

**Qué significa:** parte del perfil base sigue formando parte de archivos descargables por cualquier visitante. Aunque `createDemoConfig` reemplace esos campos al construir una demo, el módulo también se importa en el flujo del personalizador cliente y la configuración base queda incluida en bundles. Si esos valores no deben ser públicos, todavía existe una exposición real en la exportación actual.

**Corrección recomendada:**
1. Crear una configuración base para demostraciones con datos 100% sintéticos, separada de la configuración operativa.
2. Cambiar `src/data/demo-config.ts` para no importar `defaultConfig` desde `src/data/config.ts` en un módulo compartido con el personalizador cliente.
3. Mantener los datos específicos de eventos fuera de los bundles públicos; si necesitan persistir para administración, usar un mecanismo privado/no versionado compatible con el entorno.
4. Añadir una prueba automática que falle si campos configurados que se deben mantener privados aparecen en los chunks de `out/`. El escaneo de secretos actual detecta ciertos patrones de tokens/keys, pero no detecta valores de perfil del evento.
5. Volver a generar el sitio y comprobar los bundles exportados, no solo el HTML.

Si el dueño confirma que todos los valores son deliberadamente públicos, la severidad baja, pero la arquitectura sigue acoplando una configuración operativa con código cliente y conviene desacoplarla.

### P1 — Contraste AA todavía incompleto en la tienda y el personalizador

La mejora es parcial. Persisten colores de texto que no alcanzan 4,5:1 en texto normal:

| Combinación actual | Contraste calculado | Evaluación |
|---|---:|---|
| `#9a7440` sobre blanco | 4,25:1 | No llega a AA para texto normal |
| `#9a7440` sobre marfil `#faf8f4` | aprox. 3,99:1 | No llega a AA |
| `#b58c5a` sobre blanco | 3,06:1 | No llega a AA |
| `#b58c5a` sobre marfil | 2,88:1 | No llega a AA |

Se encontraron usos de `#b58c5a` en etiquetas/leyendas del catálogo y en textos pequeños del personalizador; también hay indicadores con texto blanco sobre ese fondo. Los iconos decorativos tienen umbrales distintos, pero no justifican usar el mismo color para texto pequeño.

**Corrección recomendada:** reservar el champagne claro para adornos/bordes o texto grande; para texto normal usar un tono más oscuro que supere 4,5:1 en el fondo real. Recalcular los estados normales, hover, seleccionado y deshabilitado, y revisar también el personalizador, no solo la portada.

### P1 — Los nombres y teléfonos del RSVP siguen viajando en la URL GET

El código actual crea `URLSearchParams` con los invitados y el teléfono y luego los manda en un GET a la URL de Apps Script. Aunque los estados de respuesta mejoraron, los datos personales pueden terminar en URLs, historiales o logs intermedios.

**Corrección recomendada:** evaluar una llamada POST compatible con el Apps Script activo y comprobar si la respuesta puede leerse desde el navegador. No reemplazarla por un `no-cors` opaco y después afirmar éxito. Si CORS impide confirmar la escritura, mostrar claramente que queda pendiente y ofrecer la confirmación por WhatsApp hasta que exista un contrato verificable que no exponga los datos en la URL.

### P1 — Las pruebas automáticas de contrato no están ejecutándose en CI

El proyecto ahora define `npm test` y tiene `tests/contrato-backend.test.ts`, pero el workflow `.github/workflows/validate-catalog.yml` que ejecutó GitHub Actions contiene solo:
- `npm ci`
- `npm run lint`
- `npm run build`

El comando `npm test` no aparece en ese flujo, por lo que el check verde no garantiza que las pruebas de contrato sigan pasando en cada commit. Intenté clonar el repositorio para ejecutar las pruebas directamente desde este entorno, pero el contenedor no pudo resolver `github.com`; no afirmo haberlas ejecutado localmente.

**Corrección recomendada:** agregar `npm test` al workflow después de instalar dependencias, revisar su resultado y mantener estas pruebas como requisito de cada PR. Las pruebas actuales son en buena parte de contrato/código estático; no sustituyen una comprobación de Apps Script desplegado real.

### P2 — El HTML inicial sigue siendo voluminoso

Mediciones del tamaño de los archivos HTML generados, no del peso comprimido de red:
- Portada: **905.469 caracteres**.
- Catálogo: **280.262 caracteres**.
- Personalizador: **194.691 caracteres**.
- Demo individual: **77.115 caracteres**.

Los tamaños de portada/catálogo/personalizador siguen cerca de las medidas de la revisión anterior; no se implementó una reducción significativa del HTML repetido. No se midieron Core Web Vitals, Lighthouse ni velocidad real en móvil.

**Corrección recomendada:** reducir instancias de miniaturas complejas repetidas, usar imágenes optimizadas estáticas donde no se requiera interacción y diferir contenido no crítico. Medir antes y después con las mismas condiciones.

### P2 — Enlaces comerciales e integraciones externas todavía sin prueba real

No se pudo probar de punta a punta en esta revisión:
- La URL/versión desplegada del Apps Script para RSVP.
- La recepción, aprobación y publicación de fotografías en el backend real.
- La publicación de Mercado Libre y sus condiciones vigentes.
- El comportamiento completo por teclado/móvil y las interacciones visuales reales.

El build estático y los tests de contrato no bastan para afirmar que esos servicios externos están activos.

## Estado final por problema

| Problema de la auditoría previa | Estado ahora |
|---|---|
| `/admin/` se exportaba públicamente | **Corregido en la exportación actual** |
| Captura y tres JPG estaban en el árbol público | **Corregido en la exportación actual**; revisar historial Git si hace falta limpieza completa |
| Contador fijo en miniaturas | **Corregido** |
| Encabezados decorativos antes del H1 | **Corregido en portada y catálogo** |
| Título duplicado en personalizador | **Corregido** |
| Botón verde de WhatsApp con contraste bajo | **Corregido para las combinaciones medidas** |
| Todos los textos cumplen contraste AA | **Parcial; aún quedan usos champagne insuficientes** |
| Datos base aislados de los bundles | **No corregido; quedan coincidencias en JS público** |
| RSVP no declara éxito sin verificar | **Mejorado en código**; falta prueba del servicio real y evitar datos en GET |
| Contrato backend probado automáticamente | **Tests añadidos, pero no integrados al workflow CI** |
| Rendimiento/HTML repetido | **Pendiente** |

## Próximos pasos sugeridos

1. Corregir el acoplamiento de `demo-config.ts` con `config.ts` y comprobar que los valores operativos ya no aparecen en los bundles.
2. Terminar los contrastes de texto pequeño en catálogo y personalizador.
3. Reducir exposición de nombres/teléfonos en las solicitudes RSVP, manteniendo un estado de resultado verificable.
4. Ejecutar `npm test` automáticamente en CI.
5. Confirmar con prueba manual controlada las implementaciones reales de Google Apps Script y el comportamiento en móvil.
6. Si los JPG anteriores requerían privacidad, decidir con el dueño si corresponde limpiar historial Git; no hacerlo automáticamente ni sin aprobación.

## Referencias

- Web publicada: https://sebasm2kuy.github.io/Miluaistudio/
- Repositorio: https://github.com/Sebasm2kuy/Miluaistudio
- [Merge de correcciones del PR #13](https://github.com/Sebasm2kuy/Miluaistudio/commit/0fa363571c9685a967b93f21586fd27579299d53)
- [Validación CI](https://github.com/Sebasm2kuy/Miluaistudio/actions/runs/40533320857)
- [Despliegue GitHub Pages](https://github.com/Sebasm2kuy/Miluaistudio/actions/runs/40533425623)

Esta iteración registra la nueva revisión; no realiza cambios funcionales adicionales.
