# Iteración 039 — «Panel de clientes» + «Volver a la web» (02-11-2026)

## Pedido

1. En la barra de navegación del sitio público, el botón «Acceso clientes» debe pasar a un texto más comercial y profesional: «Panel de clientes».
2. En la barra superior del panel (`/dashboard/`), agregar un enlace claro «Volver a la web» que lleve a la portada **sin cerrar la sesión activa**.

## Cambios

- **Renombre «Acceso clientes» → «Panel de clientes»** en toda la UI pública: nav compartido de portada/catálogo (`store-nav.tsx`: pill de escritorio, botón compacto de móvil con aria-label, ítem del menú móvil), header y pie del catálogo, pie de portada, pie del personalizador y `<title>` de `/acceso/` («Panel de clientes | Lumen Gala»). Los hrefs siguen siendo `/acceso/`: no cambia ninguna ruta.
- **«Volver a la web» en la barra del panel** (`guardia.tsx`): enlace con icono de globo a la izquierda de «Salir», mismo estilo. Es un `<Link>` común: no toca la sesión (sessionStorage de la pestaña), que sigue activa al regresar.
- **/acceso/ con sesión activa → directo al panel** (`acceso/page.tsx`): en el montaje, si `leerSesion()` devuelve sesión vigente, redirige a `/dashboard/` sin pedir login de nuevo. Cierra el circuito «Volver a la web → Panel de clientes» sin fricción; para cambiar de cuenta queda «Salir» en el panel.

## Motivo

«Acceso clientes» sonaba a trámite; «Panel de clientes» nombra el producto que el cliente recibe. Y un cliente que quiere ver la web desde el panel no debía perder la sesión ni quedarse sin camino de vuelta.
