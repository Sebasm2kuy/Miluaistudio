# Miluaistudio — catálogo y temas de invitación

## Objetivo

Reutilizar la invitación actual como motor compartido, ofrecer diez direcciones visuales y construir gradualmente un catálogo comercial propio sin duplicar las funciones ni tocar la versión pública hasta validar los cambios.

## Rama y estado de esta iteración

Rama: `work/miluaistudio-catalogo-20261026`

Pull request en borrador: https://github.com/Sebasm2kuy/Miluaistudio/pull/4

- `src/data/invitation-designs.ts`: diez presets con paleta, composición, tipografía, ornamentación y estilo de reloj.
- `src/app/catalogo/page.tsx`: catálogo, fichas visuales, vista ampliada, precio de referencia y enlace a la publicación actual de Mercado Libre.
- `src/app/catalogo/[designId]/page.tsx`: rutas estáticas de demostración que reutilizan el mismo motor de invitación.
- `src/data/demo-config.ts`: sustituye los datos reales por datos de demostración antes de renderizar las vistas públicas.
- `src/components/invitation-experience.tsx`: motor de invitación compartido por la página original y las páginas de muestra.
- `src/hooks/useConfig.tsx`: contexto de configuración para cambiar de tema sin heredar el estado guardado de la invitación real.
- `src/app/globals.css` y componentes compartidos: tokens de tema y variaciones de composición, tipografía y reloj.
- `src/app/catalogo/layout.tsx`: metadatos propios del catálogo para no heredar el título personal de la invitación original.
- `public/catalogo/`: recursos SVG genéricos, sin datos ni fotografías familiares.
- `docs/PLAN-CATALOGO-DISENOS.md`: este plan técnico.

## Validación

- El build estático de Next.js pasó en GitHub Actions en la rama de trabajo.
- La configuración de lint heredada está rota/incompatible: importa `eslint-config-next`, que no está declarada en las dependencias, y la combinación de ESLint 10 con la versión del plugin React también mostró incompatibilidad. Por eso el workflow deja el lint como advertencia no bloqueante; no afirmar que está corregido.
- La versión de `main` no incluye el catálogo ni las nuevas rutas. No fusionar ni desplegar hasta la revisión manual.

## Qué hacen las demos y qué no hacen

Las diez rutas usan el componente real compartido, con paletas, composición y reloj seleccionados por preset. Son demos para explorar el estilo, no una plataforma de compra automatizada.

- Las confirmaciones de asistencia de una demo se simulan localmente; no se envían a Google Sheets.
- La galería demo no permite subir fotos.
- Los números de regalos/pagos reales quedan ocultos.
- El pie de demo no permite abrir el panel administrativo oculto.
- Los datos del evento, fotos y endpoints de la invitación real se reemplazan por valores genéricos.

Antes de producción, probar cada ruta en móvil y escritorio; confirmar mapa, cuenta regresiva, música, galería, formularios y enlaces; revisar los contrastes de cada tema y que los datos de demostración no se mezclen con los del cliente.

## Hallazgos de la auditoría

- El proyecto usa Next.js 16 + React 19 y exportación estática con `basePath: /Miluaistudio`.
- La invitación ya tenía cinco estilos de reloj, presets de color, tipografías, estilos de tarjetas y botones.
- Algunas secciones tenían colores o direcciones incrustadas directamente; los tokens CSS y los cambios por componente empiezan a centralizar los temas, pero conviene continuar el trabajo de consistencia visual antes de anunciar todos los temas como terminados.
- El sitio estático no puede ejecutar libremente un backend de pedidos/pagos. El flujo comercial deberá decidirse por separado.

## Siguientes pasos

1. Revisión visual de las diez demos, especialmente móvil y contraste.
2. Corregir la configuración de ESLint en una tarea separada y no bloqueante para el usuario.
3. Acabar de unificar los colores hardcodeados que queden en componentes secundarios.
4. Diseñar una ficha comercial por plantilla, con entregables y condiciones claras.
5. Añadir un flujo simple de consulta/pedido antes de automatizar pagos o generación.
6. Fusionar a `main` únicamente tras revisar la PR y comprobar que la invitación existente sigue comportándose igual.

## Seguridad — pendiente

El árbol público de Git tiene un archivo `.env` versionado. No se ha leído su contenido. Verificá si contiene credenciales; si las contiene, revocá/rotá las claves y retiralas del repositorio y de su historial. No almacenar secretos en variables de entorno de una web estática que termina expuesta al navegador.
