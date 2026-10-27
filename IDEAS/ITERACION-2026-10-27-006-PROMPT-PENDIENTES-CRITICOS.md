# Iteración 006 — Prompt de corrección de riesgos críticos pendientes

**Fecha:** 27-10-2026  
**Tipo:** Prompt operativo para Z.AI  
**Base:** Segunda revisión de la exportación publicada después de integrar la corrección anterior.  
**Objetivo:** Corregir los riesgos residuales comprobados, incorporar regresiones automatizadas y entregar evidencia reproducible sin exponer datos reales.

## Contexto comprobado

La última revisión encontró mejoras ya integradas (la ruta estática de administración no se exporta, se retiraron ciertas imágenes del export público, los contadores decorativos dejaron de simular datos reales, mejoró la jerarquía de títulos y el manejo de estados de RSVP). Sin embargo, quedan pendientes: valores de perfil/evento aparentemente incluidos en bundles JavaScript públicos; contrastes de texto insuficientes en tonos dorados; datos personales de RSVP enviados en parámetros de una solicitud GET; tests no ejecutados en CI; y páginas HTML de exportación muy grandes.

No repitas las correcciones ya resueltas ni las des por suficientes sin volver a probarlas. Inspecciona el estado actual de `main`, los workflows, la configuración de Next.js y el export estático antes de editar. Los hallazgos de abajo se deben comprobar otra vez sobre el código actual, no asumir que todo sigue idéntico.

---

# PROMPT PARA Z.AI — COPIAR DESDE AQUÍ

Actúa como ingeniero/a senior de frontend, seguridad de aplicaciones, accesibilidad WCAG, privacidad y rendimiento web. Trabaja directamente sobre el repositorio **Sebasm2kuy/Miluaistudio**, una aplicación Next.js/React/TypeScript exportada estáticamente y publicada en GitHub Pages bajo `/Miluaistudio/`.

## Reglas de trabajo obligatorias

1. **Inspecciona primero; luego implementa.** Verifica la rama, últimos commits, scripts de `package.json`, configuración de Next.js, `src/data/config.ts`, `src/data/demo-config.ts`, el personalizador, RSVP, el contrato Apps Script, scripts de exportación, tests y workflows. Haz un plan corto basado en el estado real.
2. Trabaja en una **rama nueva** y prepara un PR descriptivo contra `main`. No hagas push directo a `main`, no fusiones el PR, no publiques ni fuerces despliegues sin aprobación explícita del propietario.
3. No alteres el precio vigente, identidad de marca, textos comerciales, estructura funcional de las invitaciones o integraciones productivas salvo lo necesario para resolver un riesgo demostrado. No inventes integraciones ni digas que un servicio externo está probado si no lo probaste.
4. **Nunca escribas ni pegues valores reales de configuración de eventos, nombres, fechas, ubicaciones, teléfonos, enlaces privados, datos bancarios, credenciales o tokens** en PR, logs, capturas, tests, documentos o comentarios. Si un test falla, reporta solo el nombre del campo/ruta y el tipo de hallazgo; enmascara los valores. No copies valores sensibles al reporte ni a nuevos archivos.
5. Diferencia claramente entre `COMPROBADO`, `NO COMPROBADO` y `BLOQUEADO POR SERVICIO EXTERNO`. No declares éxito por el mero hecho de que compile.
6. No uses `no-cors`, respuestas opacas ni mensajes optimistas para aparentar que un envío fue aceptado. No elimines una función sin implementar un fallback transparente y usable.
7. Mantén compatibilidad con GitHub Pages: `basePath: "/Miluaistudio"`, `trailingSlash: true` y `output: "export"` si continúan siendo los ajustes reales del proyecto. Evita soluciones que dependan de un servidor Next.js permanente, API routes dinámicas o secretos disponibles solo en el navegador.
8. Conserva el historial de decisiones. No sobrescribas iteraciones existentes en `IDEAS/`.

## P0 — Evitar que datos operativos se filtren en JavaScript público

En la revisión anterior, varios literales de la configuración base de evento/perfil aparecieron como coincidencias exactas dentro de los bundles JavaScript públicos descargables. No imprimas esos literales ni los vuelques a logs. Determina mediante inspección de dependencias cómo pueden llegar al código cliente.

- Revisa `src/data/config.ts`, `src/data/demo-config.ts`, `src/lib` y los imports transitivos del personalizador y de cualquier componente cliente.
- Separa claramente la configuración sintética usada para la demo pública de toda configuración operativa o privada. La demo debe construirse con valores ficticios, autocontenidos y seguros; no debe importar `defaultConfig` si este contiene datos reales o no autorizados para publicación.
- El código destinado al navegador no debe importar, clonar, serializar ni empaquetar configuración operativa por el mero hecho de sobrescribirla posteriormente en tiempo de ejecución. No basta con cambiar valores después de importar el módulo.
- Identifica qué campos están diseñados para ser públicos como parte de una invitación publicada. Usa una lista explícita y mínima de campos permitidos cuando sea necesario. Trata como no publicables los valores cuya autorización no pueda acreditarse; no los reproduzcas ni los muestres.
- No confundas privacidad de configuración con privacidad de una invitación que el propietario decidió publicar: documenta la frontera de datos y deja solo los campos públicos necesarios en el cliente.
- Agrega una regresión automatizada que compile/exporte y revise los artefactos servidos al navegador. Usa **canarios sintéticos únicos** en pruebas, nunca datos reales, y verifica que la configuración operativa no pueda aparecer en bundles del personalizador ni en archivos exportados de demo. Los fallos no deben imprimir el valor que coincidió.
- Revisa el HTML exportado, JS, mapas de fuente si los hubiera, JSON, metadatos, archivos `public/` y manifest/cache de exportación. La prueba debe cubrir los archivos públicos que realmente se despliegan, no solo el código fuente.
- Si detectas secretos verdaderos previamente publicados, no los incluyas en el informe. Recomienda rotarlos/revocarlos cuando corresponda y explica que borrarlos del último commit no elimina necesariamente copias del historial Git.

**Criterio de aceptación P0:** el build de demo/export público no contiene los canarios privados de prueba ni importa el módulo operativo sensible al grafo cliente; los tests confirman la separación y explican el fallo sin revelar datos.

## P0 — Corregir privacidad del RSVP

Actualmente el componente RSVP construye una solicitud GET incluyendo datos del invitado (incluidos nombre y teléfono) en parámetros de URL. Esos datos pueden quedar registrados en historiales, logs o capas intermedias. Corrige el flujo con una decisión basada en el contrato real del backend.

- Sigue el dato desde el formulario hasta el envío. Evita incluir nombres, teléfonos u otros datos personales en URL/query string.
- Inspecciona el Apps Script y cualquier backend activo para establecer qué métodos, cabeceras, formato y respuestas soporta realmente. **No asumas que el código editado en el repo ya está desplegado en Google Apps Script.**
- Si es viable y verificable, cambia a un método/cuerpo que no incluya PII en la URL, con validación de respuesta y un contrato compatible con el backend desplegado. Maneja redirecciones/CORS de Apps Script de forma realista.
- Si el contrato productivo no puede verificarse o el navegador no puede confirmar la aceptación de forma fiable, no finjas éxito: muestra un estado claro de pendiente/no confirmado y ofrece un fallback explícito —por ejemplo, abrir WhatsApp con un mensaje preparado solo después de que la persona lo elija— sin enviar silenciosamente los datos a un endpoint no verificado.
- No guardes PII en localStorage/sessionStorage ni en analítica, consola, logs de cliente, URL, fragmentos o mensajes de error.
- Minimiza los campos transmitidos y valida formatos. No añadas nuevas categorías de información personal.
- Conserva distinción accesible entre enviado/confirmado, pendiente/no confirmado y error; anuncia cambios de estado con semántica apropiada (`aria-live` donde corresponda).
- Actualiza las pruebas del contrato y documenta los pasos manuales necesarios para verificar el despliegue del Apps Script. No afirmes haber probado el backend real si no tienes acceso.

**Criterio de aceptación RSVP:** ningún dato personal se envía en query string; nunca se anuncia éxito sin evidencia verificable del contrato de respuesta; el fallback funciona y está explicado cuando no puede verificarse el backend real.

## P1 — WCAG: contraste real de texto y estados

Hay usos de `#9a7440` y `#b58c5a` sobre blanco/crema y texto blanco encima de fondos dorados que no alcanzan 4.5:1 para texto normal. Revisa el código actual de catálogo, personalizador, tienda, botones, etiquetas, textos auxiliares, selección y foco.

- Recorre la interfaz completa, no solo las ocurrencias mencionadas. Calcula y reporta las razones de contraste con una fórmula WCAG contrast ratio, no por intuición.
- Para texto normal, exige al menos **4.5:1**; para texto grande conforme a WCAG, al menos **3:1**. Para componentes gráficos, límites y estados necesarios para identificar controles, aplica al menos **3:1** frente a colores adyacentes cuando corresponda.
- Ajusta los tokens/variables compartidos con una paleta accesible y coherente con la marca. Prefiere oscurecer el color de texto o ajustar el fondo con criterio visual, no quitar todos los detalles dorados. Revisa en hover, active, disabled, seleccionado, foco y errores.
- Comprueba especialmente texto blanco sobre fondos dorados y texto dorado sobre superficies blancas/crema. Mantén indicadores de foco visibles y no dependas solo del color para comunicar estado.
- Añade tests automatizados de contraste para los tokens críticos y anota los pares evaluados y su ratio. No uses una excepción de iconos para justificar texto pequeño.

**Criterio de aceptación accesibilidad:** todas las combinaciones de texto normales que modifiques cumplen 4.5:1, texto grande cumple 3:1, los estados interactivos tienen contraste suficiente y los tests detectan una regresión.

## P1 — Ejecutar tests en CI de verdad

La validación previa corría `npm ci`, lint y build, pero no `npm test`. Revisa el workflow actual y agrega la suite de tests al pipeline, respetando los scripts que existan.

- Orden recomendado: instalar dependencias, `npm test`, lint, build y verificación explícita del export. Si `npm run build` ya ejecuta la verificación, evita duplicarla sin necesidad, pero hazla visible en el workflow o explica la relación.
- Comprueba que `npm test` funciona en el entorno limpio de GitHub Actions, sin depender de artefactos locales previos.
- Incluye tests para separación de configuración, contrato RSVP, validación de export y accesibilidad. No afirmes que los tests pasan basándote solo en revisar el YAML.
- Si no puedes ejecutar el workflow remoto, declara claramente esa limitación. No fabriques resultados.
- Conserva `npm run lint` y el build de exportación existentes; no los debilites para hacer pasar CI.

**Criterio de aceptación CI:** el workflow invoca efectivamente la suite de tests y marca el trabajo como fallido ante un test fallido; en el PR se enlazan los resultados reales de Actions.

## P1 — Rendimiento del export estático

La auditoría anterior observó HTML de exportación muy voluminoso (la home rondaba 905 KB como longitud del HTML en bytes/caracteres de archivo en la extracción anterior; catálogo y personalizador también eran grandes). Esos números no son una medición de peso comprimido ni un score de rendimiento; vuelve a medirlo.

- Inspecciona por qué se repite tanto marcado pesado de mini-invitaciones en inicio y catálogo. Cuando una tarjeta sea solo una vista previa, considera una miniatura estática optimizada en lugar de montar toda la invitación interactiva, siempre que visualmente sea aceptable y no cambie el producto.
- Separa de forma clara las previsualizaciones del catálogo de las demos interactivas completas. Mantén accesibles los nombres y acciones de cada diseño.
- Revisa imágenes, tamaños, formatos, dimensiones, `width/height`, carga diferida debajo del pliegue, scripts cliente innecesarios y duplicación de CSS/JS. No agregues dependencias grandes sin necesidad.
- Compara antes/después con el mismo método: bytes de HTML exportado, bytes de JS/CSS relevantes y cantidad de nodos/componentes repetidos, indicando claramente qué se midió. Si Lighthouse/PageSpeed no está disponible, no inventes score ni Core Web Vitals.
- No hagas rediseños amplios ni elimines animaciones/funciones sin evidencia. Conserva la identidad visual y las funciones de las invitaciones.

**Criterio de aceptación rendimiento:** hay una reducción medible en al menos una métrica relevante del export o se documenta por qué una optimización segura no es viable; se confirma visualmente que el catálogo y las demos siguen funcionando.

## P2 — Comprobaciones de regresión y documentación

- Reconfirma que `out/admin` no se publica en el export estático y que las rutas públicas esperadas funcionan con `basePath: "/Miluaistudio/"`.
- Reconfirma que no se incluyen archivos de imagen personales no autorizados en el export y que `public/uploads` no contiene imágenes reales. No publiques imágenes de prueba ni datos personales.
- Revisa metadatos, títulos duplicados, canonical, robots/noindex de demos y jerarquía H1/H2. No cambies la política de indexación sin motivo.
- Confirma que los formularios de galería/fotos mantienen moderación, estados pendientes/publicados/error y no muestran falso éxito.
- Evalúa qué significa retirar archivos del último árbol frente a mantenerlos en el historial. No reescribas historia ni elimines artefactos remotos sin autorización explícita; si hay riesgo de exposición, presenta la opción y sus consecuencias.
- Actualiza documentación técnica relevante sin revelar valores reales de configuración. Añade una nueva nota de iteración en `IDEAS/` con hallazgos, decisiones, pruebas ejecutadas, limitaciones y próximos pasos; actualiza `IDEAS/README.md`. No sobrescribas iteraciones anteriores.

## Validación mínima obligatoria antes de pedir revisión

Ejecuta y registra los resultados reales de:

1. `npm ci`
2. `npm test`
3. `npm run lint`
4. `npm run build`
5. Revisión automatizada de los artefactos en `out/` usando `scripts/verify-export.mjs` o la verificación equivalente integrada en build.
6. Tests de ausencia de configuración privada sintética en HTML/JS público.
7. Tests de contraste WCAG de los pares de color críticos.
8. Prueba del flujo RSVP con respuestas simuladas para éxito válido, respuesta inválida, red/timeout y backend no verificable; nunca uses datos personales reales.
9. Comparación del tamaño del export antes/después con metodología consistente.
10. Revisión del diff: confirmar que no se cambiaron precios, datos personales, enlaces productivos, servicios externos o comportamiento comercial fuera del alcance autorizado.

No afirmes que una prueba manual real o el servicio Apps Script se verificó a menos que de verdad se haya hecho. Separa pruebas automatizadas y pruebas manuales pendientes.

## Entrega y reporte

Abre un PR contra `main` y no lo fusiones ni despliegues sin aprobación. En la descripción incluye:

- Resumen breve de cambios.
- Tabla de hallazgos: `resuelto`, `parcial`, `pendiente` o `bloqueado externamente`.
- Rutas de archivos modificados, sin mostrar valores sensibles.
- Comandos ejecutados y resultados reales, enlaces a los runs de Actions y SHA del commit cuando existan.
- Evidencia de que los canarios de privacidad no aparecen en los archivos públicos.
- Ratios WCAG antes/después para los pares corregidos.
- Métricas de tamaño antes/después y método de medición.
- Limitaciones y tareas que requieren intervención manual, especialmente publicación/verificación del Apps Script.
- Confirmación explícita de que no se hizo merge ni despliegue.

Si un criterio de aceptación no se cumple, no lo marques como terminado ni ocultes el bloqueo. Prioriza primero P0 (filtración de configuración y RSVP), luego accesibilidad/CI, después rendimiento y documentación.

**Fin del prompt.**
