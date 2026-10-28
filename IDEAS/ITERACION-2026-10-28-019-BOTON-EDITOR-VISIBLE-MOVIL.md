# Iteración 019 — El botón «Editar tocando la invitación» pasa a ser visible en el móvil

**Fecha:** 28-10-2026 · **Rama:** `fix/boton-editor-movil-paso-1`

## Reporte del propietario (textual)

> «ya se cual es el problema entre en la version pc y enla tarjeta que se ve y se
> desplaza a la derecha mientras vas cambiando las cosas tiene un boton que dice
> editar tocando la invitacion que en la version movil no se llega a ver, ese boton
> deberia estar una vez elegido el diseño cuando abre la pantalla de edicion
> aparecer ahi debajo del 1»

## Diagnóstico

El botón del PR #18/018 funciona, pero **vive en la columna de vista previa** del
paso 2 (`aside` con `lg:sticky`). Esa columna tiene dos comportamientos según
pantalla:

- **PC (≥ lg):** columna derecha, pegajosa, siempre a la vista junto al
  formulario → el botón se encuentra sin problema.
- **Móvil (< lg):** la grilla colapsa a una columna y el `aside` se va **al final
  de todo**, después del formulario completo (datos, frase, música, cronograma,
  secciones y estilo) y de la tarjeta de paso 3. Resultado: el botón existe pero
  queda enterrado a varias pantallas de profundidad y «no se llega a ver».

Es decir: no fue un problema de deploy (el PR #19 está fusionado y publicado,
verificado con curl sobre el HTML de Pages) sino de **posición en el layout
responsive**.

## Decisión

Pedida explícitamente por el propietario: duplicar el acceso **debajo del paso 1**,
apenas se elige el diseño, en una tarjeta que solo se muestra en pantallas chicas.

- Se reutiliza el mismo mecanismo del botón original: enlace `<a href={EDITOR_URL}>`
  con `onClick={editarSobreInvitacion}` (guarda la configuración vigente con
  `saveConfig()` antes de navegar; funciona también sin JS).
- `lg:hidden`: en PC no se duplica (allí ya está el de la columna pegajosa).
- Estilo distintivo (fondo marfil + borde dorado + botón degradado) para que se
  lea como atajo, no como parte del formulario.
- Texto de apoyo de una línea que explica qué hace («Se abre el editor con estos
  datos: tocás un texto o una foto y lo cambiás directo.»).

## Cambios

- `src/components/personalizador-app.tsx`: en el paso 1, rama «Elegiste {diseño}…»,
  nueva tarjeta `lg:hidden` con el botón «Editar tocando la invitación» y su
  explicación. Sin cambios de lógica: comparte `editarSobreInvitacion`.
- Docs: este archivo + índice + worklog + paso 0b del guion manual actualizado.

## Alternativas descartadas

- **Mover el `aside` antes del formulario en móvil** (`order-*`): pondría la vista
  previa y el paso 3 entre el paso 1 y los campos; confundiría el flujo de carga.
- **Flotante fijo en pantalla:** tapa la invitación en el editor y en la vista
  previa; ya se descartó en la 016 por ese motivo.
- **Mostrar también en PC debajo del paso 1:** redundante con la columna pegajosa.

## Pruebas

- `npm test` (127), `npm run lint`, `npm run typecheck`, `npm run build`
  (verify-export §7 sigue OK: los enlaces estáticos a `/editar/` permanecen).
- Emulador 390×844: al elegir un diseño la tarjeta aparece debajo de «Elegiste…»
  y encima del paso 2, sin scroll previo; al tocarla abre `/editar/` con los datos
  cargados (no la demo); en 1280×800 la tarjeta no aparece (regresión PC intacta).
- **Pendiente del propietario:** validar en teléfono físico (paso 0b actualizado).

## Riesgos

- Bajo: dos botones con el mismo destino en móvil (el nuevo arriba y el original
  al pie). Ambos disparan la misma acción idempotente (`saveConfig` + navegación),
  así que no hay conflicto de estado.
