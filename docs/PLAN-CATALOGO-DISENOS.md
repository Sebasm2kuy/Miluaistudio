# Miluaistudio — Plan de catálogo y variantes

## Objetivo

Convertir la invitación actual en un producto reutilizable: conservar sus mecanismos (edición, cuenta regresiva, galería, Spotify, RSVP, mapa y calendario), ofrecer diez apariencias diferenciadas y crear un catálogo comercial propio.

## Estado actual de esta rama

Rama de trabajo: `feature/catalogo-disenos`

- Se agregó `src/data/invitation-designs.ts` con diez conceptos visuales y metadatos (paleta, composición, ornamentación y variante de reloj).
- Se agregó la ruta `/catalogo/` con tarjetas de muestra, previsualización ampliada y enlaces a la publicación actual de Mercado Libre.
- Se agregó un workflow para ejecutar lint y build al trabajar en esta rama o al abrir un pull request.
- La publicación original de `main` no se modificó ni se desplegó.

**Importante:** los diez ejemplos del catálogo actual son previsualizaciones visuales; todavía no son diez invitaciones funcionales separadas. No comunicar ni vender los diez diseños como si su integración completa ya estuviera terminada.

## Hallazgos de la auditoría

- El proyecto es Next.js 16 + React 19 y utiliza exportación estática con `basePath: /Miluaistudio`.
- La invitación principal está compuesta por componentes reutilizables, y la configuración del evento vive en `src/data/config.ts`.
- Ya existen cinco estilos de reloj, ocho presets de color, cuatro estilos de tarjetas y cuatro estilos de botones en los datos del administrador.
- Parte de las secciones usa valores de color incrustados directamente en los componentes. Para que los temas sean coherentes, primero hay que centralizar las variables visuales y luego aplicarlas al árbol compartido.
- Como el sitio está pensado para exportación estática, no se debe asumir que una ruta de servidor o una API nueva funcionará en GitHub Pages. La integración de pedidos/pagos requiere una decisión de arquitectura separada.

## Etapas siguientes

1. **Motor de temas:** definir un formato único de tema que aplique colores, tipografías, fondo, composición y reloj sin duplicar la lógica de la invitación.
2. **Primera plantilla funcional:** integrar un tema en los componentes existentes y verificar cada interacción sin modificar la apariencia original por defecto.
3. **Diez variantes funcionales:** conectar los presets al mismo motor y preparar demostraciones con datos ficticios, sin datos ni fotos personales.
4. **Catálogo:** enlazar cada tarjeta con una muestra funcional, no solo con una ilustración de diseño.
5. **Pedidos:** empezar con un flujo sencillo de consulta/encargo y automatizar pagos, creación y edición del cliente solo después de validar el proceso.
6. **Validación y despliegue:** comprobar lint, build estático, rutas con basePath, funcionamiento móvil y flujos de RSVP, galería, música y calendario antes de fusionar a `main`.

## Seguridad y privacidad — bloqueante antes de producción

El árbol público de Git contiene un archivo `.env` versionado. No se ha leído su contenido. Revisar si contiene credenciales; si las contiene, revocarlas/rotarlas y retirarlas del repositorio y de su historial. No añadir tokens ni datos privados a configuraciones estáticas del navegador.

## Criterio de aceptación

Una variante no se considera terminada hasta que todas las funciones previstas sigan funcionando con datos de demostración, los colores tengan contraste suficiente, la composición responda a pantallas pequeñas y el build de exportación estática termine sin errores.
