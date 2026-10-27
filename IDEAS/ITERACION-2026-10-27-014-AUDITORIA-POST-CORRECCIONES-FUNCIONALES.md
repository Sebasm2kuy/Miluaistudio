# Iteración 014 — Auditoría posterior a las correcciones funcionales

**Fecha:** 27-10-2026  
**Repositorio:** https://github.com/Sebasm2kuy/Miluaistudio  
**Base revisada:** PR #16 fusionado en `main`, commit `793172752c93f45977873730278d31b9a866cd84`, con despliegue posterior a GitHub Pages.  
**Alcance:** correcciones de publicación por slug, validación de firma de imágenes, estado de CI/export y preparación de aceptación manual.  
**Exclusiones respetadas:** no se realiza auditoría general de privacidad ni revisión del historial Git, rotación de credenciales o almacenamiento privado.

## Veredicto ejecutivo

**Resultado: correcciones de código verificadas por CI y desplegadas; aceptación funcional de punta a punta todavía pendiente.**

La Iteración 011 detectó dos problemas concretos. El PR #16 los corrigió y fue fusionado:
- El botón heredado «Deploy» ya no aparece en el flujo normal del panel; la publicación principal pasa por `publicarInvitacionDesdePanel()` y `publicarInvitacionEnGitHub()`.
- El uploader rechaza la subida si no puede leer los bytes para comprobar la firma, antes de hacer una llamada a GitHub.
- Se añadieron pruebas específicas para proteger ambas correcciones.
- Se documentaron siete pruebas manuales de publicación/imagen y pasos de RSVP, todos aún pendientes de ejecución humana.

Los workflows de validación, deploy y GitHub Pages figuran como **success**. La automatización no equivale a haber publicado una invitación real con un token del propietario ni a haber confirmado el Web App de Apps Script. No se afirma que esas pruebas externas hayan sido completadas.

## Fuentes comprobadas

- [PR #16 — correcciones funcionales](https://github.com/Sebasm2kuy/Miluaistudio/pull/16)
- [Commit de merge `7931727`](https://github.com/Sebasm2kuy/Miluaistudio/commit/793172752c93f45977873730278d31b9a866cd84)
- [Workflow Validate Miluaistudio — success](https://github.com/Sebasm2kuy/Miluaistudio/actions/runs/40576971847)
- [Workflow Deploy to GitHub Pages — success](https://github.com/Sebasm2kuy/Miluaistudio/actions/runs/40576971868)
- [Workflow pages build and deployment — success](https://github.com/Sebasm2kuy/Miluaistudio/actions/runs/40577058230)
- [Índice de iteraciones](./README.md)
- Código actual revisado: `src/app/admin/page.tsx`, `src/lib/publicacion-panel.ts`, `src/lib/github-deploy.ts`, `src/lib/rsvp-client.ts`, `src/data/invitacion-publicada.ts`, `scripts/verify-export.mjs`, `tests/publicacion-panel.test.ts`, `tests/publicacion-github.test.ts`.
- Documentación revisada: `docs/ADMINISTRACION.md`, `docs/PRUEBA-MANUAL-RSVP.md`.

## Hallazgo anterior F-01 — Acción heredada «Deploy»

**Estado: corregido en código y cubierto por tests.**

En `src/app/admin/page.tsx` se retiró la acción heredada que podía escribir `src/data/config.ts` y dar la impresión de haber publicado una invitación. El flujo normal se centra ahora en «Publicar invitación». La sección del token explica que pegarlo no publica por sí solo. La función antigua `deployToGitHub()` queda documentada como legado en lugar de eliminarse sin comprobar otros usos.

La unidad `src/lib/publicacion-panel.ts` valida slug/token antes de contactar a GitHub y delega la publicación por slug. `tests/publicacion-panel.test.ts` incluye guardas para impedir que vuelva a introducirse la acción heredada en la interfaz.

**Límite:** las pruebas usan `fetch` simulado. No demuestran por sí solas que el panel con un token real complete la publicación de extremo a extremo.

## Hallazgo anterior F-02 — Firma de imagen al fallar la lectura de bytes

**Estado: corregido en código y cubierto por tests.**

La ruta real de `uploadToGitHub()` ahora rechaza el archivo si falla la lectura de los primeros bytes, muestra un mensaje recuperable y no llama a la API de GitHub. La validación opcional sin bytes queda limitada a la prevalidación de interfaz; no permite omitir la comprobación en la subida real.

Las pruebas nuevas cubren tanto el rechazo asíncrono de `arrayBuffer()` como el error síncrono de `slice()`, y un archivo con extensión/MIME convincentes pero bytes ilegibles. El PR reporta **106 tests aprobados, 0 fallidos**. El workflow de validación también confirma que el paso de tests terminó correctamente.

## Export estático y despliegue

El log del workflow de validación confirma:
- Next.js generó 21 páginas estáticas.
- `/i/ejemplo-boda` y `/i/ejemplo-quince` se generaron como rutas estáticas SSG.
- `out/admin/` se eliminó del export.
- `verify-export` terminó con «sin errores».
- Los assets referenciados por las dos invitaciones de ejemplo existen en el artefacto.
- El chequeo de export informó `out/uploads/` sin imágenes.

Además, la rama `gh-pages` recibió el despliegue del commit de merge y el workflow de Pages terminó en éxito.

**Limitación de esta auditoría:** no se pudo realizar una inspección visual independiente de las páginas vivas desde el navegador de auditoría. Por eso el estado de publicación se basa en los workflows y el artefacto comprobado, no en una sesión visual interactiva.

## Hallazgo F-03 — Aceptación manual de publicación e imágenes

**Estado: pendiente del propietario. Prioridad: P1 para dar por cerrado el flujo real.**

`docs/ADMINISTRACION.md` contiene siete pasos con datos 100 % ficticios y todos permanecen como PENDIENTE:
1. Abrir el panel local y comprobar la vista previa.
2. Publicar el slug `prueba-aceptacion` y abrir la URL después del despliegue.
3. Actualizar ese slug y comprobar que conserva la URL.
4. Publicar un segundo slug y confirmar que el primero sigue existiendo.
5. Subir una imagen sintética y comprobar que aparece en la invitación publicada y que su URL responde.
6. Enviar un RSVP ficticio y comprobar la fila en la hoja/pestaña esperada.
7. Probar un RSVP inválido y verificar que la UI no afirma falsamente que fue guardado.

Hasta que esos pasos se ejecuten con el panel y los servicios reales, la capacidad de publicación de punta a punta no se debe considerar aceptada.

## Hallazgo F-04 — Web App de RSVP no verificado en producción

**Estado: pendiente del propietario. Prioridad: P1 para confirmar integración externa.**

`src/lib/rsvp-client.ts` mantiene el contrato POST con cuerpo `text/plain;charset=utf-8` y los estados `guardado`, `pendiente` y `error`. Las pruebas automatizadas verifican respuestas simuladas, no el Web App actualmente desplegado ni la escritura en la hoja real.

Seguir `docs/PRUEBA-MANUAL-RSVP.md` usando solo datos ficticios. Registrar POST válido, fila creada, POST inválido y comportamiento de la UI. No copiar URL real del Web App ni tokens al repositorio, documentos o capturas.

## Nota técnica de baja prioridad

Los logs de CI incluyen una advertencia de que algunas acciones de workflow que apuntan a Node.js 20 están siendo forzadas a Node.js 24 por el runner. **No bloqueó la validación ni el despliegue.** Como mantenimiento futuro, revisar las versiones de `actions/checkout` y `actions/setup-node` para mantener compatibilidad con los runners actuales y reducir avisos de obsolescencia.

## Checklist final

- [x] Botón heredado fuera del flujo de publicación.
- [x] Publicación principal por slug con pruebas.
- [x] Lectura de bytes fallida rechaza la imagen antes de llamar a GitHub.
- [x] Tests, lint y build/export aprobados por el workflow.
- [x] Dos rutas de ejemplo generadas en el export estático.
- [x] Deploy y publicación de Pages exitosos.
- [ ] Publicación real desde el panel con token del propietario.
- [ ] Actualización del mismo slug y publicación de segundo slug en una sesión real.
- [ ] Subida real de imagen y verificación en la invitación publicada.
- [ ] POST de RSVP validado contra el Apps Script desplegado y fila verificada.
- [ ] Comprobación manual de RSVP inválido sin falso éxito.
- [ ] Revisión futura de las acciones de CI que muestran advertencia de Node.js.

## Conclusión

Los dos hallazgos de código de la Iteración 011 quedan cerrados según la implementación revisada y los tests/CI. **El trabajo no está completamente aceptado desde la perspectiva del usuario final** hasta completar los pasos manuales de publicación, imagen y RSVP. No se encontró en esta revisión una nueva regresión funcional demostrada por el código inspeccionado; el principal riesgo abierto es la falta de validación real de los servicios externos.

La auditoría general de privacidad sigue fuera del alcance por decisión del propietario.
