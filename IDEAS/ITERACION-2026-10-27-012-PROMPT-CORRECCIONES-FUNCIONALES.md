# Iteración 012 — Prompt para Z.AI: correcciones funcionales posteriores a la auditoría

**Fecha:** 27-10-2026  
**Repositorio:** https://github.com/Sebasm2kuy/Miluaistudio  
**Base:** auditoría de Iteración 011 y PR #15 ya fusionado.  
**Objetivo:** corregir dos problemas funcionales concretos y dejar preparada una aceptación manual de publicación/RSVP.  
**Exclusión expresa:** no realizar una auditoría general de privacidad ni ampliar el alcance a tareas de privacidad. No cambiar ni publicar producción directamente.

## Prompt para copiar en Z.AI

Trabaja sobre el repositorio existente `Sebasm2kuy/Miluaistudio`. Antes de modificar, inspecciona el estado actual de `main`, lee `IDEAS/ITERACION-2026-10-27-011-AUDITORIA-ULTIMOS-CAMBIOS-FUNCIONALES.md`, las pruebas existentes y las funciones citadas abajo. No des por hecho que el código sigue exactamente igual: confirma los hallazgos contra el código actual.

### Objetivo A — Eliminar la confusión del botón antiguo «Deploy» (P1)

Hallazgo a corregir: en el panel de administración, el botón superior «Deploy» llama a `handleDeploy`/`deployToGitHub()`, que escribe `src/data/config.ts`; esa acción no crea ni actualiza la invitación pública bajo `content/invitaciones/<slug>.json`. El flujo correcto de invitaciones personalizadas utiliza `publicarInvitacionEnGitHub()`.

Requisitos:
1. Inspecciona `src/app/admin/page.tsx`, `src/lib/github-deploy.ts` y el flujo de publicación actual.
2. Quita la ambigüedad: elimina del camino normal el botón antiguo, o conviértelo en una acción claramente nombrada y funcional que no sugiera que publica una invitación. Preferencia: dejar una única acción principal claramente identificada como «Publicar invitación» que use el flujo por slug existente.
3. No dupliques lógica de publicación ni rompas la vista previa, guardado de configuración o el flujo de invitaciones existentes.
4. Los estados de carga, error y éxito deben corresponder a la acción real completada. No mostrar éxito de publicación si solo se escribió un archivo de configuración que la página pública no consume.
5. Añade o actualiza tests para demostrar que la acción principal de publicación llama a `publicarInvitacionEnGitHub()` y no depende de `deployToGitHub()`. Si la arquitectura actual dificulta probar el componente, extrae una unidad pequeña testeable sin sobrediseñar.
6. Si `deployToGitHub()` sigue teniendo usos legítimos, no lo elimines a ciegas: conserva esos usos y deja la interfaz explícita sobre qué hace y qué no hace.

### Objetivo B — Fallar de forma segura si no se pueden leer los bytes de una imagen (P2)

Hallazgo a corregir: el flujo real de `uploadToGitHub()` intenta leer los primeros bytes de `file.slice(0, 16).arrayBuffer()`, pero si la lectura falla continúa con `bytes = undefined`; la validación puede entonces apoyarse solo en extensión/MIME/tamaño.

Requisitos:
1. Inspecciona `uploadToGitHub()`, `validarArchivoImagen()` y las pruebas de carga existentes antes de cambiar el contrato.
2. En la ruta real de subida, si no se pueden leer los bytes necesarios para comprobar la firma del archivo, detener la subida con un error entendible y recuperable que invite a seleccionar el archivo otra vez. No llamar a la API de GitHub en ese caso.
3. Exigir firma válida en la subida real. Si el validador permite `bytes` opcionales por razones de UI/prevalidación, conservar esa flexibilidad solo donde sea seguro, sin permitir que el uploader real omita la comprobación.
4. Añadir una prueba que simule un archivo cuya lectura de `slice().arrayBuffer()` falla y compruebe que la subida se rechaza y que el cliente/API de GitHub no es llamado.
5. Mantener las pruebas existentes de extensiones, MIME, tamaño y firmas válidas/invalidas. No relajar validaciones para hacer pasar la nueva prueba.
6. Mostrar un mensaje comprensible al usuario, sin volcar errores internos ni datos sensibles.

### Objetivo C — Verificación y documentación para aceptación manual

La auditoría confirma CI y páginas estáticas de ejemplo, pero no una sesión real del panel con credenciales ni una prueba contra el Apps Script productivo. No simules ni inventes esas verificaciones.

1. Revisa `docs/PRUEBA-MANUAL-RSVP.md` y `docs/ADMINISTRACION.md`. Actualiza la documentación solo si es necesario para que los pasos de aceptación sean claros, reproducibles y utilicen datos 100 % ficticios.
2. Asegúrate de que la lista manual cubra:
   - abrir el panel local y previsualizar un evento ficticio;
   - publicar una invitación con un slug de prueba y abrir la URL devuelta después del despliegue;
   - actualizar el mismo slug y confirmar que la URL se conserva;
   - publicar un segundo slug y comprobar que la primera invitación sigue disponible;
   - subir una imagen de prueba y verificar que su URL funciona en la invitación publicada;
   - enviar RSVP ficticio válido y verificarlo en la hoja/pestaña esperada;
   - comprobar que un RSVP inválido muestra error y que la interfaz no afirma falsamente que se guardó.
3. No marques estas comprobaciones manuales como completadas si no se han ejecutado realmente con el panel, el despliegue y el endpoint externo.
4. Si no tienes acceso a las credenciales o al servicio real, deja un checklist pendiente con instrucciones exactas para que el propietario lo ejecute; no intentes usar datos reales de invitados.

### Requisitos de calidad y límites

- Mantén Next.js App Router, TypeScript, Tailwind, exportación estática, `basePath: "/Miluaistudio"` y compatibilidad con GitHub Pages.
- Conserva el modelo actual de invitaciones públicas por slug y no rompas las dos invitaciones de ejemplo existentes.
- No cambies contratos externos del RSVP salvo que encuentres una incompatibilidad demostrada y puedas cubrirla con tests.
- No introduzcas dependencias innecesarias ni cambios de diseño ajenos a estos hallazgos.
- No incluyas secretos, tokens, credenciales ni datos personales en archivos, tests, logs o capturas.
- No realices auditoría general de privacidad en esta iteración: queda expresamente pospuesta.
- No hagas merge a `main`, no publiques directamente y no actualices la rama de Pages. Trabaja en una rama revisable y abre un Pull Request hacia `main`.

### Validaciones obligatorias

Ejecuta las comprobaciones definidas por el proyecto, como mínimo:
- tests completos (`npm test` o el comando equivalente definido en `package.json`);
- lint;
- comprobación de tipos, si está configurada;
- build/export estático;
- verificación del export y de las rutas por slug;
- pruebas específicas nuevas para los dos hallazgos.

Si un comando no existe, identifica el comando correcto del repositorio en vez de afirmar que se ejecutó. Informa los comandos ejecutados y sus resultados reales.

### Entrega solicitada

Al terminar, devuelve:
1. resumen de cada corrección y archivos afectados;
2. explicación de cómo se evita ahora la falsa impresión de publicación;
3. evidencia del test de lectura de bytes fallida y confirmación de que no se llamó a GitHub;
4. resultados reales de tests, lint, tipos, build/export y verificación de rutas;
5. pasos manuales que todavía dependan del propietario o de servicios externos;
6. enlace al Pull Request abierto contra `main`;
7. limitaciones conocidas y cualquier punto que no hayas podido verificar.

No declares la tarea completa si las validaciones fallan. No fusiones el PR ni despliegues sin aprobación del propietario.

## Criterios de aceptación para revisar el PR

- [ ] La interfaz no presenta la acción heredada como si publicara una invitación por slug.
- [ ] La publicación principal utiliza el flujo correcto y tiene pruebas.
- [ ] Si falla la lectura de bytes de la imagen, se rechaza la subida antes de llamar a GitHub.
- [ ] Los tests existentes y nuevos pasan.
- [ ] Lint, tipos, build/export y verificación de rutas pasan.
- [ ] No se ha afirmado que el RSVP real o la publicación real desde el panel fueron verificados sin haberlo hecho.
- [ ] Se abrió un PR revisable; no se hizo merge ni despliegue directo.
- [ ] No se amplió el alcance a auditoría general de privacidad.

## Registro de contexto

Esta iteración deriva de los hallazgos F-01 a F-04 de la Iteración 011. La automatización anterior informó 93 tests aprobados y workflows de despliegue exitosos, pero la aceptación manual desde el panel y la verificación del Apps Script real quedaron pendientes. Esos estados deben seguir distinguiéndose claramente.
