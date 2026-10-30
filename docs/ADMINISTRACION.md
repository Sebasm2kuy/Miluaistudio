# Administración de Miluaistudio (flujo seguro)

El panel de administración `/admin` **no se publica** en el sitio público: cualquier
página alcanzable por URL en GitHub Pages es pública aunque tenga `noindex`, así que
el panel completo vive como herramienta local y la exportación de producción se
verifica automáticamente (`scripts/verify-export.mjs` falla el build si `out/admin/`
reaparece).

El **editor móvil `/editar` SÍ se publica** (iteración 017): es la forma de editar la
invitación desde el teléfono. Publica solo la interfaz, sin secretos ni datos: toda
acción que toca el sitio real (cargar por slug, publicar, subir fotos) exige el token
de GitHub del propietario.

## Opción A — Editor móvil publicado (recomendada para editar desde el teléfono)

1. Abrir `https://lumengala.site/editar/` en el navegador del
   teléfono y guardarlo en marcadores. Tip: `…/editar/?slug=mi-invitacion` preselecciona
   el slug (un marcador por invitación).
2. En Ajustes → **Conexión con GitHub** pegar el token (igual que en el panel) y
   «Verificar y usar».
3. En Ajustes → **Invitación publicada**: escribir el slug y tocar **«Cargar
   publicada»** para traer la invitación real al editor; editar tocando los elementos
   (los cambios se ven en vivo) y tocar **«Publicar cambios»** para guardar en el
   repositorio. El botón «Guardar» de arriba solo guarda un borrador en ese navegador.
4. El deploy de GitHub Pages se dispara solo tras publicar (≈2-3 min) y la invitación
   real (`/i/<slug>/`) se actualiza.

Sin token, la interfaz del editor funciona con el borrador local/demos y avisa
honestamente que hace falta el token para cargar o publicar: un visitante no puede
leer ni modificar datos reales.

## Opción B — Panel local (herramienta principal de escritorio)

1. Clonar el repositorio y instalar dependencias:
   ```bash
   npm ci
   npm run dev
   ```
2. Abrir `http://localhost:3000/admin` (solo existe en tu máquina).
   - **Desde el teléfono (dev):** el botón **📱 Editor móvil** del encabezado lleva a
     `/editar/` en el servidor local. Para el uso normal del teléfono no
     hace falta esto: usá la Opción A.
3. Pegar el token de GitHub **solo si** vas a publicar o subir imágenes (sección
   **“Conexión con GitHub”**):
   - Usar un *fine-grained PAT* con permiso mínimo: `Contents: Read and write`
     únicamente para el repo `Sebasm2kuy/Miluaistudio`.
   - Pegar el token NO publica nada por sí solo: la publicación se hace desde
     la sección **“Publicar invitación”** (flujo por slug, con su estado real).
   - El token se guarda en `sessionStorage` (muere al cerrar la pestaña) y NO se
     escribe en `localStorage` ni en ningún archivo.
   - Al terminar, pulsar **“Borrar el token de este navegador (cerrar sesión)”**.
   - Si el token se sospecha expuesto, revocarlo en GitHub → Settings → Developer
     settings → Personal access tokens.
4. Publicar desde el panel usa la API de GitHub y crea commits en `main`
   (el deploy a Pages se dispara solo). La única acción de publicación del
   panel es **“Publicar invitación”**: guarda `content/invitaciones/<slug>.json`
   y muestra el resultado real (creada / actualizada / error). No existe ningún
   botón que publique escribiendo `src/data/config.ts`: esa función quedó como
   utilidad de legado documentada en `src/lib/github-deploy.ts` y ninguna
   pantalla la ofrece.

## Opción C — Sin panel (flujo Git / Pull Request)

Para cambiar la configuración de una invitación o de la tienda sin usar tokens en el
navegador:

1. Editar `src/data/config.ts` (o `src/data/demo-config.ts` para demos) en una rama.
2. Abrir un Pull Request y revisar el diff (la vista del PR muestra exactamente qué
   datos quedan públicos).
3. Fusionar el PR → el workflow de deploy publica los cambios.

Este es el flujo preferible cuando participan varias personas o cuando se quiere
dejar registro revisable de cada cambio.

## Reglas de privacidad que sostiene el proyecto

- `public/uploads/` está ignorado en Git (`.gitignore`): las fotos de invitados suben
  por el backend de moderación (`google-apps-script/photo-server.gs`) y quedan en
  Google Drive, no en el repositorio.
- Ningún dato de un evento real va versionado: `src/data/config.ts` es una plantilla
  neutra y los perfiles de demostración son sintéticos (`demo-config.ts`).
- La verificación de exportación (`npm run verify:export`) comprueba además que no
  haya secretos embebidos ni imágenes personales en `out/`.

## Qué verificar antes de cada publicación

```bash
npm run lint
npm run typecheck
npm test
npm run build      # incluye prune + verify de la exportación
```

Si `verify-export` falla, no publicar: revisar qué ruta/asset reintrodujo el problema.

## Publicar invitaciones con URL propia (`/i/<slug>/`)

Cada invitación publicada vive en **su propio archivo JSON**
(`content/invitaciones/<slug>.json`) y genera **su propia página estática**
(`/i/<slug>/`) durante el build. Publicar una nueva no sobrescribe las
anteriores; actualizar el mismo slug conserva el enlace y la fecha de primera
publicación.

### Flujo recomendado (panel local)

1. `npm run dev` → `http://localhost:3000/admin`.
2. Cargar la configuración de la invitación (o importar el JSON del cliente).
3. Sección **“Publicar invitación”**:
   - Elegir el **slug** (sugerido a partir del nombre del evento; minúsculas,
     números y guiones; no puede chocar con rutas reservadas).
   - **Ver vista previa**: guarda la configuración en este navegador y abre
     `/previsualizar/`, que renderiza la MISMA experiencia que verán los
     invitados (`InvitationExperience` real, no una maqueta).
   - **Publicar en GitHub**: guarda el JSON en `main` vía API de GitHub y
     muestra el resultado REAL (creada / actualizada / error) con el slug y
     la URL. Guardar en el panel o iniciar la petición NO se presenta como
     publicación; ante un error la configuración queda intacta para reintentar.
   - **Descargar JSON**: alternativa sin token — baja el JSON publicable
     (`content/invitaciones/<slug>.json`) para commitearlo a mano por PR.
4. El deploy a GitHub Pages (~2-3 min) genera `out/i/<slug>/index.html`.
   `scripts/verify-export.mjs` valida en cada build que cada JSON publicado
   tenga su página y que los assets que enlaza existan en el export.

### Reglas que sostiene el flujo

- La representación publicada es **JSON puro** (sin funciones ni objetos del
  editor) con `esquema: 1`, slug, fechas y la `config` completa.
- Publicar marca `modoDemo: false`: la confirmación de asistencia funciona
  contra el backend configurado (`rsvp.googleSheetUrl`), con estados
  guardado / pendiente / error y el fallback de WhatsApp ya existentes.
- Las demos del catálogo siguen usando `createDemoConfig` (sintéticas,
  independientes de las invitaciones publicadas).
- Las invitaciones publicadas van con `noindex` (se comparten con enlace
  directo a invitados, no se promueven a buscadores).

### Recursos (imágenes) de la invitación

- Imágenes que el **propietario** sube desde el editor para mostrarse en la
  invitación: carpeta `public/assets-invitaciones/`, servida en
  `/assets-invitaciones/<archivo>`. El uploader valida tamaño
  (máx. 5 MB), extensión (JPG/PNG/WebP), MIME y la firma real del archivo
  (magic bytes), con nombres saneados y únicos.
- Fotos que suben los **invitados** (“Dejale un recuerdo”): siguen por el
  backend de moderación (`google-apps-script/photo-server.gs` → Google Drive)
  y NUNCA entran al repositorio. La regla `out/uploads/` sin imágenes sigue
  activa en `verify-export`.

## Lista de aceptación manual — publicación e imágenes (pendiente del propietario)

> **Estado: PENDIENTE DE EJECUCIÓN HUMANA.** La automatización de esta
> iteración verificó código, tests y build/export, pero **no** ejecutó una
> sesión real del panel con un token verdadero ni contra los servicios
> externos. No marcar ningún ítem como completado hasta hacerlo con el
> panel, el deploy y los servicios reales. Usar SOLO datos 100% ficticios
> (nombres de prueba, fechas futuras de prueba, imágenes sintéticas); nunca
> datos de un evento real ni de invitados reales.

Requisitos previos: repo clonado y actualizado, `npm ci`, `npm run dev`, y un
PAT fine-grained con `Contents: Read and write` solo para este repo.

| # | Paso | Cómo verificar | Resultado |
|---|------|----------------|-----------|
| 1 | Abrir el panel local y previsualizar un evento ficticio | `http://localhost:3000/admin` → editar un evento de prueba → **Ver vista previa** → `/previsualizar/` muestra la MISMA configuración (título, fecha, colores, galería) | PENDIENTE |
| 2 | Publicar una invitación con un slug de prueba y abrir la URL devuelta | Slug `prueba-aceptacion` → **Publicar en GitHub** → el panel muestra “Invitación creada” con la URL → esperar el deploy de Pages (~2-3 min) → abrir `https://lumengala.site/i/prueba-aceptacion/` | PENDIENTE |
| 3 | Actualizar el MISMO slug y confirmar que la URL se conserva | Cambiar un dato (p. ej. el título) → publicar de nuevo con el mismo slug → el panel muestra “Invitación actualizada” (no “creada”) y la MISMA URL; la página publicada refleja el cambio | PENDIENTE |
| 4 | Publicar un segundo slug y comprobar que el primero sigue disponible | Slug `prueba-aceptacion-2` → publicar → abrir ambas URLs: las dos invitaciones existen y ninguna sobrescribió a la otra | PENDIENTE |
| 5 | Subir una imagen de prueba y verificar que su URL funciona en la invitación publicada | En Galeria/Invitación, subir una imagen sintética (< 5 MB) → la tarjeta muestra la URL `/assets-invitaciones/…` → publicar → la imagen se ve en la página publicada y la URL responde 200 | PENDIENTE |
| 6 | Enviar un RSVP ficticio válido y verificarlo en la hoja/pestaña esperada | Seguir `docs/PRUEBA-MANUAL-RSVP.md` (pasos 2, 3 y 5) con “Invitado Prueba” → fila nueva en la pestaña RSVP de la hoja | PENDIENTE |
| 7 | Comprobar que un RSVP inválido muestra error y la UI no afirma que se guardó | Seguir `docs/PRUEBA-MANUAL-RSVP.md` (pasos 4 y 5) → el formulario muestra estado de error (o pendiente con fallback visible), NUNCA “confirmado” falso | PENDIENTE |

Criterio de cierre: los 7 ítems con el resultado esperado y anotados con
fecha. Cualquier desvío se registra tal cual en esta tabla (y, si aplica,
como issue): no se corrige “en silencio” ni se da por cerrado el flujo.


