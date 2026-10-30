# Prueba manual del editor móvil en un teléfono físico

**Ruta:** `/editar/` — **publicada** desde la iteración 017:
`https://lumengala.site/editar/` (con token de GitHub en
Ajustes → «Conexión con GitHub» para cargar y publicar la invitación real).
También funciona en desarrollo local: con `npm run dev` en la compu, abrir desde el
celular `http://<IP-de-la-compu>:3000/editar/` (misma red Wi-Fi), o el
botón «📱 Editor móvil» del panel `/admin` local.

> Regla de honestidad: marcar cada paso solo si se hizo REALMENTE en el teléfono. Lo probado solo con emulador o navegador de escritorio no cuenta para esta lista.

## Llegar al editor desde el sitio publicado (iteración 018)

- [ ] 0a. Abrir `https://lumengala.site/` en el teléfono: en el pie debe verse el enlace «Editor de invitaciones» y llevar a `/editar/`.
- [ ] 0b. Ir a «Personalizar» desde el sitio, elegir un diseño y completar el nombre: en el teléfono, debajo del paso 1 (tarjeta «Elegiste…») debe verse el botón dorado «Editar tocando la invitación». Tocarlo: debe abrir el editor con LOS DATOS que cargaste (nombre, fecha, lugar), no la demo de ejemplo. En PC el mismo botón sigue estando en la tarjeta «Vista previa en vivo» de la derecha.
- [ ] 0c. En `/editar/` con el navegador «limpio» (sin borrador): debajo del aviso de «Tocá cualquier elemento…» debe verse la franja «Esta es una invitación de ejemplo…». Tocarla abre Ajustes directamente, con la sección «Invitación publicada».
- [ ] 0d. (Iteración 020) En `/editar/` → Ajustes → «Importar pedido por WhatsApp»: pegar un mensaje REAL que te haya mandado un cliente con «Enviar mi configuración», tocar «Leer el mensaje» y revisar la vista previa (✓ por campo, ⚠ por avisos). Tocar «Cargar en la invitación»: el editor debe mostrar la invitación con LOS DATOS DEL CLIENTE (nombre, fecha, lugar, cronograma). Si la historia venía recortada, completarla tocando la dedicatoria. Luego publicar con tu token y verificar en /i/slug/.

## Preparación

- [ ] 1. Abrir `/editar/` en el teléfono. Debe verse la invitación completa con la barra superior (Editar/Previa, Guardar) y la barra inferior con «Ajustes». En el sitio publicado no debe haber flecha «volver al panel» (solo existe en dev).

## Edición directa

- [ ] 2. Recorrer la invitación completa deslizando hacia arriba y abajo. El scroll debe ser natural, sin cortes ni zonas muertas.
- [ ] 3. Verificar que los elementos editables tienen un contorno dorado punteado discreto (portada, dedicatoria, cuenta regresiva, ubicación, cronograma, galería, música, confirmación, regalos, cierre). Los NO editables (adornos, divisores) no muestran contorno.
- [ ] 4. Tocar el nombre de la portada: se abre el panel inferior «Nombre de la portada». Escribir otro nombre: el texto de la invitación debe cambiar EN VIVO detrás del panel.
- [ ] 5. Tocar «Listo». Volver a tocar el nombre: el valor guardado debe ser el nuevo.
- [ ] 6. Tocar la fecha de la portada, cambiar el texto y tocar «Cancelar»: el cambio debe revertirse.
- [ ] 7. Editar la hora/fecha real del evento desde «La Gran Noche» (campo fecha y hora) y verificar que la cuenta regresiva se recalcula.
- [ ] 8. Tocar el mapa: NO debe abrirse Google Maps; debe abrir el editor del mapa. Ídem el botón «Cómo llegar» (debe editar el enlace, no abrir Maps).
- [ ] 9. Tocar un momento del cronograma y editarlo. Con el panel abierto, usar «Quitar este momento» (pide confirmación) y verificar que desaparece. Agregar otro desde Ajustes → Cronograma.
- [ ] 10. Con el panel de un elemento abierto, girar el teléfono (si aplica) y verificar que el panel sigue usable.

## Fotografías

- [ ] 11. Tocar una foto de la galería: se abre «Foto de la galería #N» con vista previa, «Reemplazar foto», «Quitar», y acciones «Agregar otra foto» / «Quitar esta foto».
- [ ] 12. Tocar «Reemplazar foto» SIN token cargado: debe mostrarse el mensaje honesto «Para subir la foto hace falta el token…» y NO debe decir «Subida».
- [ ] 13. Pegar el token en Ajustes → Conexión con GitHub, tocar «Verificar y usar» (debe decir «Token válido»).
- [ ] 14. Repetir el reemplazo con una foto REAL del teléfono: la vista previa aparece mientras sube («Subiendo…»), luego «Foto subida.» y la invitación muestra la foto nueva.
- [ ] 15. Intentar subir un archivo que no sea imagen (ej. un PDF renombrado .jpg): debe rechazarse con mensaje entendible y la foto anterior debe quedar intacta.
- [ ] 16. Quitar una foto y agregar una nueva desde Ajustes → Galería. Guardar y verificar en la vista previa.

## Teclado virtual y paneles

- [ ] 17. Con el teclado virtual abierto dentro de un panel: los campos siguen visibles, el panel scrollea y los botones Cancelar/Listo siguen alcanzables.
- [ ] 18. Cerrar el teclado y verificar que el panel sigue en su lugar. Cerrar el panel con «Listo»: la invitación debe quedar en la MISMA posición de scroll en la que estaba.

## Modos

- [ ] 19. Alternar a «Previa»: desaparecen los contornos, aparece la experiencia completa del invitado (sobre/carga/música/navegación).
- [ ] 20. En Previa, completar el flujo de confirmación (RSVP) con datos ficticios: el formulario debe funcionar normal.
- [ ] 21. Volver a «Editar»: el contenido editado sigue ahí y los contornos vuelven.

## Guardado y persistencia

- [ ] 22. Tocar «Guardar» (debe decir «Guardado ✓») y cerrar el navegador del teléfono por completo. Reabrir `/editar/`: los cambios deben seguir.
- [ ] 23. Abrir `/previsualizar/`: la invitación debe reflejar los cambios guardados.
- [ ] 24. Con cambios sin guardar, en escritorio intentar cerrar la pestaña: debe avisar (en el teléfono este aviso puede no aparecer: es mejor esfuerzo del navegador).

## Escritorio (regresión)

- [ ] 25. Abrir `/admin` en la compu: todo el formulario funciona igual que siempre, con el nuevo botón «📱 Editor móvil».
- [ ] 26. Editar algo desde `/editar` en la compu y verificar que `/admin` → «Ver vista previa» muestra los mismos cambios (misma fuente localStorage).
- [ ] 27. Verificar que `/i/ejemplo-boda/` y el resto del sitio público se ven idénticos a antes (sin contornos ni cambios de comportamiento).

## Carga y publicación de la invitación real (sitio publicado)

- [ ] 28. Abrir el editor publicado, tocar «⚙️ Ajustes» → «Invitación publicada». Sin token: «Publicar cambios» debe estar deshabilitado y «Cargar publicada» con un slug debe avisar honestamente que falta el token (sin éxito fingido).
- [ ] 29. Pegar el token en «Conexión con GitHub» y verificarlo. Luego, en «Invitación publicada», escribir el slug de una invitación real y tocar «Cargar publicada»: la invitación real debe aparecer completa en el editor.
- [ ] 30. Editar un texto, tocar «Guardar» (borrador) y recargar la página: el borrador y el slug deben recordarse.
- [ ] 31. Tocar «Publicar cambios»: debe mostrar el estado real (creada/actualizada) y el enlace «Ver la invitación publicada ↗». Esperar el deploy (~2-3 min) y verificar que la invitación real `/i/<slug>/` refleja el cambio.
- [ ] 32. Publicar con un slug inválido o sin token borrado: los mensajes deben ser honestos y nada debe quedar a medias.
- [ ] 33. Con cambios sin guardar, tocar «Cargar publicada» de otro slug: debe pedir confirmación antes de reemplazar el borrador.

## Resultado

- Fecha de ejecución: ______
- Dispositivo / navegador: ______
- Pasos fallidos (si los hay): ______
