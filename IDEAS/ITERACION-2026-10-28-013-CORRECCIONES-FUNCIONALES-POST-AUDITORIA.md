# Iteración 013 — Correcciones funcionales posteriores a la auditoría (012)

**Fecha:** 28-10-2026 (Montevideo)
**Base:** `main` con PR #15 fusionado + auditoría de Iteración 011 (hallazgos F-01 a F-04).
**Alcance:** corregir F-01 (botón heredado «Deploy») y F-02 (fallback permisivo de lectura de bytes en la subida), y dejar preparada la aceptación manual de publicación/RSVP (F-03/F-04).
**Exclusiones respetadas:** no se realizó auditoría general de privacidad, no se tocó el historial Git, no se abordó rotación de credenciales ni almacenamiento privado. Sin merge a `main`, sin deploy, sin actualizar la rama de Pages.

## Qué cambió

### Objetivo A — El panel ya no presenta la acción heredada como publicación (F-01, P1)

**Antes:** el encabezado del panel tenía un botón azul «Deploy» que llamaba a `handleDeploy` → `deployToGitHub()`, la cual escribe `src/data/config.ts` en `main`. Ninguna página consume ese archivo desde el desacople de la configuración operativa, así que la acción podía terminar en un mensaje de éxito sin que existiera ninguna invitación pública nueva.

**Ahora:**

- El botón «Deploy» fue **retirado del encabezado**. El camino normal del panel es: editar → **Guardar** (local) → **Ver vista previa** → **Publicar invitación** (acción principal, flujo por slug).
- La sección del token pasó de «Deploy (Git Push)» a **«Conexión con GitHub (token)»**, con texto explícito: pegar el token NO publica nada por sí solo; la publicación se hace desde «Publicar invitación». El mensaje de token verificado también dejó de decir «deploy listo».
- `handlePublicar` ya no arma la publicación inline: delega en la unidad testeable **`publicarInvitacionDesdePanel()`** (`src/lib/publicacion-panel.ts`), que valida slug y token ANTES de contactar la API, arma la representación publicada y devuelve el estado REAL (`creada` / `actualizada` / `error`) vía `publicarInvitacionEnGitHub()`.
- La sincronización fondo ↔ galería que venía aplicando la acción heredada se conservó donde corresponde: ahora la aplican **Guardar**, **Ver vista previa** y la preparación de la representación publicada (función pura `sincronizarFondoConGaleria`, sin duplicación).
- `deployToGitHub()` **no se eliminó a ciegas**: sigue exportada como utilidad de legado con contrato documentado (qué hace: escribir `config.ts`; qué NO hace: no crea ni actualiza invitaciones) y su mensaje de éxito ahora lo dice explícitamente. Ninguna pantalla la ofrece.
- Mensajes de token faltante actualizados para apuntar a la sección correcta («Conexión con GitHub»).

### Objetivo B — La subida exige firma real: sin bytes legibles no hay subida (F-02, P2)

**Antes:** `uploadToGitHub()` intentaba leer los primeros 16 bytes y, si la lectura fallaba, seguía con `bytes = undefined`; la validación caía a extensión + MIME informado, y un archivo con nombre/MIME convincente podía pasar la prevalidación de la ruta real.

**Ahora:**

- En la ruta real de subida, si `file.slice(0, 16).arrayBuffer()` falla (rechazo o error síncrono), la subida se **rechaza en el acto** con un mensaje entendible y recuperable («No se pudo leer el contenido del archivo… Volvé a seleccionarlo e intentá de nuevo») **sin llamar a la API de GitHub**.
- `validarArchivoImagen()` conserva `bytes` opcional SOLO para prevalidaciones de UI (comportamiento previo intacto); el uploader real nunca omite la comprobación de firma.
- Los mensajes no vuelcan errores internos ni detalles técnicos.

### Objetivo C — Aceptación manual preparada, no simulada

- `docs/ADMINISTRACION.md`: nueva sección **«Lista de aceptación manual — publicación e imágenes»** con los 7 pasos (panel + vista previa ficticia; publicar slug de prueba y abrir la URL tras el deploy; actualizar el mismo slug conservando URL; segundo slug sin sobrescribir el primero; subir imagen de prueba y verificar su URL en la invitación publicada; RSVP ficticio válido verificado en la hoja; RSVP inválido con error y sin falso «guardado»). Todos los ítems quedan **PENDIENTES**: no se ejecutó una sesión real del panel con token verdadero ni contra los servicios externos.
- `docs/PRUEBA-MANUAL-RSVP.md`: se añadió a la prueba de UI la verificación anti-falso-éxito (la interfaz nunca debe afirmar guardado sin `success:true` verificable y sin fila en la hoja). El resto del guion ya era correcto y se mantiene.
- Documentación del panel actualizada a la nueva nomenclatura (sin botón heredado).

## Pruebas

Nuevas (13): 106 en total, todas pasando.

- `tests/publicacion-panel.test.ts` (10): la acción principal publica vía `publicarInvitacionEnGitHub` con URLs correctas (`/Miluaistudio/i/<slug>/`); actualización del mismo slug sin duplicados conservando `publicadoEn`; slug inválido y token faltante rechazados **sin llamar a la API**; error de lectura y error de red propagados como fallo honesto; sincronización fondo ↔ galería en la representación publicada; `prepararInvitacionDesdePanel` normaliza el slug y lanza con motivo entendible; **guarda de UI** — `src/app/admin/page.tsx` no referencia `deployToGitHub`/`handleDeploy`/botón «Deploy» y usa `publicarInvitacionDesdePanel`; **guarda de lib** — `deployToGitHub` sigue disponible como LEGADO documentado.
- `tests/publicacion-github.test.ts` (+3): archivo cuyo `slice().arrayBuffer()` rechaza → subida rechazada, mensaje entendible sin datos internos y **cero llamadas** a GitHub; error síncrono de `slice()` → mismo rechazo; extensión y MIME perfectos con bytes ilegibles → tampoco pasa.

## Validación ejecutada (comandos reales)

| Comando | Resultado |
|---|---|
| `npm test` | 106 tests, 106 pass, 0 fail |
| `npm run lint` | sin errores |
| `npm run typecheck` | sin errores |
| `npm run build` (build + prune + verify-export + verify-privacy) | sin errores; 21 páginas estáticas con `/i/ejemplo-boda` y `/i/ejemplo-quince`; `out/admin/` podado y verificado ausente; `out/uploads/` sin imágenes; sin fugas de privacidad |
| `node scripts/mide-export.mjs` | portada 652.391 B (sin regresión respecto a la iteración 010) |

## Decisiones y opciones descartadas

- **Eliminar `deployToGitHub()` de la librería:** descartado. El prompt pide no eliminar a ciegas usos que puedan ser legítimos; se conservó exportada con contrato explícito y una guarda de tests verifica que el panel no la reference.
- **Renombrar el botón heredado a «Guardar config (legado)»: descartado** en favor de retirarlo del encabezado: la preferencia del prompt era una única acción principal («Publicar invitación»), y duplicar acciones de guardado reabriría la confusión.
- **Exigir bytes obligatorios en `validarArchivoImagen()`:** descartado; la flexibilidad opcional se conserva para prevalidaciones de UI y se endurece el uploader real, que es la ruta que publica.
- **Sincronizar fondo ↔ galería solo al publicar:** se aplicó además en Guardar y Vista previa para que las tres salidas del panel (guardado local, previsualización, publicación y JSON descargable) usen la misma regla de coherencia, como ya lo hacía la acción heredada al deployar.

## Riesgos o puntos por verificar

- La unidad `publicarInvitacionDesdePanel` se prueba con fetch simulado; la llamada real a la API de GitHub con el token del propietario sigue siendo un paso manual (tabla de aceptación).
- El guard de UI lee el archivo fuente del panel: si algún día se mueve `src/app/admin/page.tsx`, el test avisa con una ruta clara (no falla en silencio).
- La prueba anti-falso-éxito del RSVP contra el Web App real sigue pendiente del propietario (F-03); no se declaró verificada.

## Próximos pasos

1. Fusionar este PR tras revisión (no se fusionó solo; no se desplegó).
2. Ejecutar la lista de aceptación manual de `docs/ADMINISTRACION.md` con datos 100% ficticios y anotar resultados.
3. Ejecutar `docs/PRUEBA-MANUAL-RSVP.md` contra el Web App desplegado y registrar resultados.
4. Mantener la exclusión de privacidad general hasta que el propietario decida reabrir ese trabajo.
