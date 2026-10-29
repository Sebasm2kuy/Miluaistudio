# Prueba manual — Iteración 022: fondos de autor (papel · gala · disco)

Objetivo: validar en un **teléfono físico** los 9 diseños nuevos agregados al catálogo
(3 flores de papel, 3 gala dorada, 3 disco). La verificación en emulador ya está hecha;
esto completa la prueba con hardware real.

## 0. Preparación (1 min)

1. Abrir `https://sebasm2kuy.github.io/Miluaistudio/` en el celular (WiFi, no datos).
2. Si la página venía abierta de antes: cerrarla y reabrir (evita caché vieja).

## 1. Catálogo (2 min)

1. Entrar a «Invitaciones» → el catálogo debe decir **«29 diseños únicos»**.
2. Bajar hasta las tarjetas **21 a 29**: Papel Rosado, Craft Crema, Papel Malva, Gala
   Estrellada, Cortinas Doradas, Salón de Gala, Pista Disco, Disco Fucsia, Bola de
   Espejos. Cada tarjeta debe mostrar su foto de fondo (no un degradado liso).
3. ✓ esperado: las fotos cargan rápido y se ven las rosas de papel / estrellas doradas /
   bola de espejo.

## 2. Demos de los 3 estilos (5 min)

Abrir «Ver invitación» en estos tres y revisar:

| Diseño | Qué mirar |
|---|---|
| **Papel Rosado** | El nombre cae **dentro del marco de papel rasgado**; las rosas craft quedan en las esquinas sin tapar el texto. |
| **Gala Estrellada** | Titular dorado legible sobre el bokeh; al bajar, la alfombra con estrellas y el fondo de cortinas siguen presentes. |
| **Pista Disco** | Bola de espejo arriba, pista ajedrezada abajo, nombre violeta legible en el medio. |

En cada demo: deslizar por toda la invitación (detalles, galería, countdown) y confirmar
que las **4 fotos de la galería** son recortes del propio fondo y no fotos de otro diseño.

## 3. Editor: elegir el fondo a mano (3 min)

1. En una demo, tocar «Personalizar este diseño» → abre el editor con los datos demo.
2. «Ajustes» → **🖼️ Fondo**: deben verse los 9 swatches nuevos con su miniatura.
3. Aplicar **Salón de Gala** a un diseño claro y **Bola de Espejos** a uno oscuro:
   el fondo cambia al instante y aparece «CAMBIOS SIN GUARDAR».
4. «Guardar» → recargar la página → el fondo elegido persiste.

## 4. Criterios de aceptación

- [ ] Catálogo muestra 29 diseños y las tarjetas 21–29 con foto.
- [ ] Las 3 demos del paso 2 cargan con fondo fotográfico y texto legible.
- [ ] Galería de cada demo con 4 recortes coherentes.
- [ ] Los 9 fondos nuevos aparecen en Ajustes → Fondo y se aplican en vivo.
- [ ] Tras guardar y recargar, el fondo elegido sigue.
- [ ] Nada del texto principal queda ilegible sobre los fondos (titular, fecha, lugar).

## 5. Si algo falla

Anotar: diseño, sección, modelo de teléfono y captura de pantalla. Los fondos con
problemas estéticos (no de carga) tienen regeneración barata: decís cuál y se regenera.
