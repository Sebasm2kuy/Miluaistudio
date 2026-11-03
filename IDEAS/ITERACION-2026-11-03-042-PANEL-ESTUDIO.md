# Iteración 042 — Panel del estudio `/estudio/`: métricas y administración con Google

**Fecha:** 2026-11-03 · **Estado:** implementación completa validada en local; push/deploy pendiente del PAT del propietario.

## Contexto

El propietario pidió un dashboard de administración exclusivo para su cuenta de Google (sebacabrera1982@gmail.com), con métricas de rendimiento, personas online, usuarios registrados, conversión, gráficos y gestión de clientes, protegido con autenticación de Google y validación «frontend y backend».

Restricción estructural del proyecto: el sitio es un export estático en GitHub Pages (sin servidor propio) y `/admin` (panel con token) está deliberadamente podado del build público por `prune-export.mjs` + `verify-export.mjs`. Cualquier panel público no puede apoyarse en secretos ni ofrecer escrituras.

## Ideas exploradas y decisión

1. **Reutilizar `/admin`** → descartado: está prohibido publicarlo (verify-export falla el build si reaparece) y su modelo es token-based, incompatible con «acceso con Google».
2. **Métricas con servicio de terceros (counters/abacus/GA4)** → descartado: dependencia externa frágil (counters sin históricos ni únicos), GA4 exige backend propio para consultar la API sin exponer claves, y el proyecto ya tiene un patrón de backend propio (Apps Script + hoja de Google) probado con RSVP y registro automático.
3. **Contadores en el repo de GitHub** (commit por visita) → descartado: un commit por pageview es ruido inaceptable y antipatrón de API.
4. **DECIDIDO: hoja «Metricas» en la misma hoja de cálculo del backend**, filas anónimas (visita/latido), lectura solo vía `metricas_admin` con verificación Google. Cero commits, cero dependencias nuevas, privacidad por diseño, y la activación es pegar el .gs actualizado (misma implementación → misma URL).

## Decisiones tomadas

- Ruta nueva `/estudio/` publicada con noindex y SIN enlaces desde la web (acceso por URL directa). `estudio` agregado a `SLUGS_RESERVADOS`.
- Autorización en dos capas con las mismas reglas del resto del proyecto: el frontend evalúa claims (audiencia/emisor/vigencia/email verificado/email exacto) y el backend re-verifica la firma con tokeninfo y compara el email. La sesión dura lo mismo que el id_token (≈1 h): nunca más que la credencial que la sostiene.
- Sin sesión válida no se renderiza NADA del panel («Acceso restringido»); sin backend actualizado la sección de tráfico se muestra «no disponible», nunca ceros inventados (mismo contrato honesto que rsvp/registro).
- Privacidad de la medición: sin cookies, sin IP, sin user agents; id aleatorio por pestaña + 2 banderas locales; pathname sin query string; rutas operativas excluidas del conteo.
- Gráficos SVG hechos a mano: cero dependencias nuevas y control total del estilo (paleta 041).
- Conversión con denominador honesto: `null` si no hay visitas medibles (UI muestra «—»).

## Hallazgos del E2E local (navegador real sobre el build)

- Los mocks de la Contents API necesitan `--allow-origin` del origen servido: sin ese flag el fetch cross-origin falla (mismo hallazgo que 038/041; el síntoma ahora fue «Failed to fetch» y no 403).
- El aviso «Rango inválido» aparecía al elegir «Personalizado» con inputs vacíos → corregido: solo con al menos una fecha escrita.
- El backend REAL en producción (versión vieja) respondió sin `success` al `metricas_admin` de prueba y el panel mostró el estado «todavía no tiene la acción de métricas»: la degradación honesta funciona contra infraestructura real.
- El tracker en la portada disparó visita+latido al endpoint real sin escribir nada (el backend viejo lo ignora por diseño): migración sin riesgo.

## Riesgos / puntos por verificar (pendientes del propietario)

- [ ] Pegar `google-apps-script/gallery-server.gs` actualizado en el Web App y publicar «Nueva versión» (misma URL) — guía en docs/METRICAS-ADMIN.md.
- [ ] Verificar en producción el circuito completo: login Google real (no automatizable) → métricas activas con tráfico real → purga de la hoja.
- [ ] La primera medición real recién tendrá datos desde la activación (los días previos no existen y no se inventan).

## Próximos pasos (ideas futuras, no comprometidas)

- Fuentes de tráfico (referrer) y páginas más vistas: las filas ya guardan `pagina`; agregar `document.referrer` saneado sería un cambio pequeño.
- Notificaciones (WhatsApp/email) cuando haya una confirmación RSVP nueva.
- Exportar CSV de la tabla de clientes desde el panel.
- Métricas por invitación (visitas a cada `/i/<slug>/` ya quedan discriminadas por la columna `pagina`).
