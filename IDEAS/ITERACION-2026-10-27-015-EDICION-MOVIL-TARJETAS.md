# Iteración 015 — Edición móvil de tarjetas: diagnóstico y mejora responsive

**Fecha:** 27-10-2026  
**Tipo:** Requisito de producto + prompt de implementación para Z.AI  
**Estado:** Pendiente de diagnóstico técnico, implementación y validación en dispositivo real

## Contexto y observación del usuario

La edición de la tarjeta funciona bien en PC, pero desde un móvil resulta prácticamente imposible. El usuario está intentando editar desde el teléfono y remarca que la mayoría de las personas utilizarán móviles.

Esta observación es evidencia directa de una barrera de usabilidad reportada en móvil. El usuario aclara que se combinan varios problemas y que ocurren tanto en el panel de administración al personalizar la invitación como al interactuar directamente con la tarjeta o sus elementos. Todavía no se conoce la causa técnica exacta: no asumir que sea un único problema de CSS ni que afecte solo a un componente. El diagnóstico debe recorrer el flujo completo y las dos superficies de interacción.

## Objetivo

Hacer que crear y editar una tarjeta/invitación sea realmente usable desde un teléfono, preservando el comportamiento actual de escritorio. La experiencia móvil es un requisito principal, no una adaptación secundaria.

## Criterios de experiencia móvil

- Los controles de edición deben ser fáciles de tocar y no depender de precisión de mouse.
- Ningún control esencial debe quedar fuera del viewport, tapado, recortado o inaccesible por scroll.
- Si el editor tiene lienzo, elementos arrastrables o controles de selección, debe existir una forma móvil viable de seleccionar y editar sin depender exclusivamente de hover, drag fino o gestos ambiguos.
- Separar o alternar la vista previa y los controles de edición cuando el ancho no permita mostrarlos cómodamente a la vez. No imponer una solución concreta antes de inspeccionar el código.
- Los campos, selectores, botones, modales y paneles deben adaptarse al ancho disponible y al teclado virtual.
- Guardar, cancelar, volver y confirmar el estado deben ser claros; evitar pérdidas accidentales de cambios.
- Mantener la funcionalidad y el diseño de escritorio. Preferir estilos/layout adaptativos a duplicar toda la lógica del editor.
- No eliminar funcionalidades de escritorio para resolver el móvil.
- No introducir nuevas dependencias salvo justificación técnica concreta.

## Prompt para Z.AI

Trabaja en el repositorio de Miluaistudio. Resuelve la usabilidad móvil del editor de tarjetas/invitaciones. El reporte del usuario es: «En PC la edición funciona bien, pero desde el móvil es imposible; la mayoría de los usuarios usarán móviles».

### Fase 1: inspección antes de cambiar

1. Revisa el flujo completo de edición desde el panel de administración y desde la interacción directa con la tarjeta/elementos. Sigue el recorrido desde abrir la invitación hasta seleccionar un elemento, editar contenido/estilo y guardar.
2. Inspecciona componentes, CSS/Tailwind, dimensiones y overflow de contenedores, posicionamiento sticky/fixed, modales, paneles, canvas/preview, eventos de pointer/touch, selección/arrastre, formularios, teclado virtual y guardado.
3. Comprueba si existen causas combinadas: paneles que se comprimen, controles fuera de pantalla, scroll anidado, overlays o z-index, objetivos táctiles pequeños, dependencia de hover/mouse, selección difícil de elementos, zoom/escala de la vista previa o controles tapados por el teclado. Esta lista es una guía de investigación, no una afirmación de que todos esos defectos existan.
4. Reproduce el flujo con viewport estrecho y escritorio antes de elegir la solución. Documenta cada defecto observado con pasos de reproducción, viewport/dispositivo usado y componente/ruta implicada.
5. Localiza la causa o causas concretas y cítalas en el PR. Si no puedes reproducir un problema, no lo presentes como confirmado.
6. Revisa el historial de iteraciones en `IDEAS/` y conserva las decisiones existentes.
7. Distingue entre lo confirmado por código, lo reproducido por pruebas y lo que requiera validación manual. No afirmes que probaste un teléfono real si no lo hiciste.

### Fase 2: implementación

1. Corrige las causas verificadas tanto en el panel de administración como en la edición directa de la tarjeta. No limites la solución a una sola pantalla si el diagnóstico encuentra problemas en ambas.
2. Implementa una experiencia mobile-first o responsive específica para pantallas estrechas, sin degradar PC.
3. Asegura que las acciones principales y controles puedan usarse con el dedo. Como guía, apunta a áreas táctiles cercanas a 44×44 CSS px cuando sea razonable y evita controles demasiado juntos.
4. Asegura que la vista previa y los controles no se compriman hasta volverse inutilizables. Si conviene, usa pestañas o un selector claro entre «Vista previa» y «Editar», o un panel móvil equivalente, según la arquitectura existente.
5. Comprueba scroll vertical, overlays, z-index, safe areas y comportamiento con teclado virtual abierto; no bloquees el acceso a Guardar/Cancelar.
6. Si hay interacciones basadas solo en hover, arrastre fino o puntero, proporciona una alternativa táctil/controles explícitos sin quitar la opción de escritorio. Evita gestos ambiguos y no dependas de precisión milimétrica.
7. Mantén el mismo modelo de datos y flujo de guardado; no hagas cambios de backend o publicación que no sean necesarios.
8. No modifiques ni amplíes el alcance de la auditoría de privacidad en esta iteración.

### Fase 3: validación requerida

- Añade o actualiza pruebas para las regresiones que detectes y para cualquier lógica nueva.
- Ejecuta los comandos disponibles de tests, typecheck, lint, build y exportación estática; informa exactamente qué pasó y qué no se pudo ejecutar.
- Revisa la salida exportada y los enlaces/rutas relativos compatibles con GitHub Pages y `basePath: "/Miluaistudio"`.
- Verifica visualmente al menos dos anchos móviles (aprox. 360–390 px y 400–430 px) y uno de escritorio; prueba ambos puntos de entrada: panel de administración y edición directa de tarjeta. Si no tienes navegador o emulación visual disponible, indícalo sin inventar resultados.
- Entrega una lista breve de pruebas manuales para un teléfono real: abrir editor, seleccionar tarjeta/elemento, cambiar contenido y estilo, desplazarse por todos los controles, abrir/cerrar teclado, guardar/cancelar, y confirmar que los cambios persisten al volver a abrir.
- No afirmar que la edición móvil quedó validada en un dispositivo físico si solo se ejecutaron tests automatizados.

### Entrega y flujo de Git

- Crea un archivo nuevo en `IDEAS/` con la fecha y el siguiente número de iteración disponible; no sobrescribas registros anteriores.
- Actualiza `IDEAS/README.md` con el enlace a ese registro.
- Implementa en una rama y abre un PR revisable con resumen, causas encontradas, archivos tocados, pruebas y limitaciones.
- No hagas merge ni despliegue sin aprobación explícita del usuario.
- No declares resuelto el problema solo porque el build pase: el criterio central es poder editar cómodamente desde un teléfono.

## Criterios de aceptación

- Tanto el panel de administración como la interacción directa con la tarjeta pueden utilizarse desde un viewport móvil sin controles esenciales inaccesibles ni texto/campos cortados.
- Las operaciones principales de edición no requieren mouse ni hover.
- Vista previa, controles y teclado virtual no se bloquean mutuamente.
- El flujo existente de guardado/publicación se conserva.
- La experiencia de PC sigue funcionando.
- Las pruebas automatizadas disponibles pasan y queda documentada la validación manual pendiente.

## Riesgos y pendientes

- La causa exacta aún debe localizarse en el código y/o reproducirse con un viewport móvil.
- La validación en teléfono físico debe hacerla una persona si el entorno de Z.AI no permite ese acceso.
- No se autoriza el merge ni el despliegue automático como parte de este encargo.

## Decisión de producto

La usabilidad móvil del editor pasa a ser un requisito funcional prioritario porque la mayoría de usuarios previstos utilizarán el producto desde teléfonos. La solución debe responder al problema observado, no limitarse a hacer que la página «quepa» en una pantalla pequeña.
