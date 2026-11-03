# Iteración 041 — Panel claro de la web + post-login a la portada (03-11-2026)

## Pedido

Después de probar la 040, el propietario pidió tres cosas para que la navegación de una persona nueva sea muy intuitiva:

1. Al iniciar sesión hay que **quedarse en la pantalla principal**, no saltar al dashboard.
2. El dashboard debe usar **el mismo diseño de colores de la web** (era charcoal oscuro).
3. El botón «Volver a la web» debe ser **más grande y mejor posicionado**.

## Cambios

- **Post-login → portada (`acceso/page.tsx`):** los cuatro caminos de ingreso (contraseña PBKDF2, Google, registro automático y el auto-redirect de /acceso/ con sesión ya activa) ahora llevan a `/`. El botón con el nombre de la navbar (040) queda como ÚNICO camino al panel: el cliente entra, sigue navegando la web y va al panel cuando quiere.
- **Panel en paleta clara (`guardia.tsx`, `ui.tsx` y las 3 pestañas):** repaint completo con los tokens auditados de la web — marfil #faf8f4, tinta #292522, bordes #e8e0d7, dorado #8a6534 (GOLD_TEXT/GOLD_UI de store-tokens.ts, 4.97:1 sobre blanco), tarjetas blancas con sombra suave, insets marfil. El botón primario del panel pasa a tinta oscura #26221d (igual que los CTA de la web). Avisos/insignias en versiones claras (verde/rojo/ámbar suaves), esqueletos #efe8dd.
- **«Volver a la web» primario (guardia.tsx):** pill de tinta oscura con globo, texto siempre visible, primer elemento de las acciones, a la izquierda del nombre y de «Salir» (que pasa a secundario y en móvil queda como icono con aria-label).
- **/acceso/ también en claro:** gradiente marfil, tarjeta blanca, campos blancos con foco dorado, botón «Ingresar al panel» en tinta oscura; el widget de Google sigue en filled_black (pill negra, coherente con los CTA). El flujo completo web → login → web queda visualmente continuo.

## Motivo

Un cliente nuevo que ingresa no debía ser arrojado a un panel oscuro que «no es la web que le mostraron». Ahora el circuito es: web (claro) → login (claro) → web con tu nombre en la navbar → panel (claro) → «Volver a la web» bien visible para regresar. Un solo lenguaje visual y un solo camino al panel.

## Descartado

- Mantener el panel oscuro como «modo administrativo»: rompía la continuidad y el propietario lo pidió explícitamente al revés.
- Poner «Volver a la web» a la izquierda del logo: la barra ya tiene la marca como ancla; el botón primario primero en las acciones cumple «grande y bien posicionado» sin romper el patrón.

## Pruebas

- 233/233 tests, lint 0, typecheck 0, build + verify-export + verify-privacy OK. `rg` sin hexes oscuros legacy en dashboard/, components/dashboard/ y acceso/.
- E2E en producción (navegador real): visitante → «Iniciar sesión» → login demo → **vuelve a la portada** con el nombre en la navbar; clic en el nombre → panel claro verificado en capturas (Resumen y Mi invitación, con datos reales de la invitación demo); «Volver a la web» primario visible y operativo (regresa a la portada con la sesión intacta); consola sin errores.
- Nota honesta: por rate-limit 403 de la API anónima de GitHub se mockearon los endpoints Contents (clientes.json e invitación) con el contenido REAL de origin/main — mismo método de 038/040. Login, sesión, redirects, paleta y navegación: 100% reales.

## Próximos pasos

- (Idea) Si el estudio quiere, el aviso de «Sin publicar» del Resumen puede destacar más el WhatsApp como siguiente paso para clientes nuevos.
- (Dato) El widget de Google en filled_black quedó como acento oscuro intencional sobre la página clara.
