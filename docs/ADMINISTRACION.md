# Administración de Miluaistudio (flujo seguro)

El panel de administración **ya no se publica** en el sitio público. GitHub Pages es
estático y no tiene autenticación de servidor: cualquier página alcanzable por URL es
pública, aunque tenga `noindex`. Por eso el panel vive ahora como herramienta local y
la exportación de producción se verifica automáticamente (`scripts/verify-export.mjs`
falla el build si `out/admin/` reaparece).

## Opción A — Panel local (recomendada para ediciones rápidas)

1. Clonar el repositorio y instalar dependencias:
   ```bash
   npm ci
   npm run dev
   ```
2. Abrir `http://localhost:3000/admin` (solo existe en tu máquina).
3. Pegar el token de GitHub **solo si** vas a publicar desde el panel:
   - Usar un *fine-grained PAT* con permiso mínimo: `Contents: Read and write`
     únicamente para el repo `Sebasm2kuy/Miluaistudio`.
   - El token se guarda en `sessionStorage` (muere al cerrar la pestaña) y NO se
     escribe en `localStorage` ni en ningún archivo.
   - Al terminar, pulsar **“Borrar el token de este navegador (cerrar sesión)”**.
   - Si el token se sospecha expuesto, revocarlo en GitHub → Settings → Developer
     settings → Personal access tokens.
4. Publicar desde el panel usa la API de GitHub y crea commits en `main`
   (el deploy a Pages se dispara solo).

## Opción B — Sin panel (flujo Git / Pull Request)

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
  `/Miluaistudio/assets-invitaciones/<archivo>`. El uploader valida tamaño
  (máx. 5 MB), extensión (JPG/PNG/WebP), MIME y la firma real del archivo
  (magic bytes), con nombres saneados y únicos.
- Fotos que suben los **invitados** (“Dejale un recuerdo”): siguen por el
  backend de moderación (`google-apps-script/photo-server.gs` → Google Drive)
  y NUNCA entran al repositorio. La regla `out/uploads/` sin imágenes sigue
  activa en `verify-export`.

