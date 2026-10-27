# Iteración 003 — Prompt de corrección final para Z.AI (27-10-2026)

## Objetivo

Preparar una instrucción ejecutable para que Z.AI implemente, de forma revisable y sin rehacer el proyecto, las correcciones encontradas en la auditoría profunda de la web publicada.

## Insumos revisados

- `IDEAS/ITERACION-2026-10-27-002-AUDITORIA-WEB.md`
- `IDEAS/PROMPT-ZAI-AUDITORIA-REDISENO.md`
- `src/data/config.ts`, `src/data/demo-config.ts`
- `src/app/layout.tsx`, `src/app/personalizar/page.tsx`, `src/app/admin/page.tsx`
- `src/components/mini-invitation.tsx`, componentes de RSVP y galería
- Configuración de exportación estática y workflows de validación/publicación

## Entregable agregado

- [Prompt para Z.AI — Corrección final de Miluaistudio](./PROMPT-ZAI-CORRECCION-FINAL.md)

El prompt instruye a Z.AI para inspeccionar el estado actual de la rama antes de editar y trabajar primero en una rama revisable.

## Prioridades contenidas en el prompt

1. Sacar el panel administrativo inseguro de la exportación pública y evitar que se presente autenticación client-side como protección real.
2. Auditar los datos prellenados y los recursos de `public/`, evitando exponer datos personales o fotografías sin autorización.
3. Corregir contrastes insuficientes y revisar estados de foco, teclado, formularios y movimiento reducido.
4. Eliminar contadores fijos engañosos de las miniaturas y corregir título duplicado/estructura de encabezados.
5. Alinear los estados y contratos de RSVP y carga de fotos sin declarar exitosos los envíos que no se puedan verificar; preservar la moderación.
6. Reducir HTML repetido y optimizar recursos sin dañar los diseños ni inventar métricas de rendimiento.
7. Verificar precio/enlace comercial sin cambiar condiciones aprobadas.
8. Ejecutar lint, comprobación de tipos, build estático y verificaciones sobre los archivos exportados.

## Reglas y límites

- Mantener Next.js con `output: "export"`, `basePath: "/Miluaistudio"` y `trailingSlash: true`.
- No reescribir historial Git, no imprimir secretos ni incluir datos privados en informes.
- No eliminar fotografías de forma irreversible si su titularidad/consentimiento es incierto; en tal caso marcar la validación humana como requisito antes de fusionar.
- No cambiar nombre de marca, precio ni condiciones comerciales sin aprobación.
- No fusionar ni desplegar a producción sin aprobación humana.
- Informar qué pruebas se ejecutaron realmente y qué aspectos externos no pudieron comprobarse.

## Estado de implementación

Esta iteración guarda y organiza instrucciones. **No cambia el código funcional de la web ni implementa todavía esas correcciones.** La implementación debe hacerse después en el entorno de trabajo de Z.AI, en una rama revisable.

## Siguientes pasos

1. Abrir el prompt nuevo en Z.AI junto al repositorio correcto.
2. Pedir implementación, no sólo recomendaciones, y revisar el diff/PR que produzca.
3. Confirmar visualmente la revisión de imágenes/datos y ejecutar pruebas reales de integraciones antes de fusionar o publicar.
