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
