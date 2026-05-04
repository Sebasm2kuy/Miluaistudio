// Deploy via GitHub API — works on static sites (GitHub Pages, etc.)

const GITHUB_REPO = 'Sebasm2kuy/Miluaistudio'
const CONFIG_PATH = 'src/data/config.ts'

// Type definitions are embedded here so we can build the full config.ts file
const CONFIG_TYPES = `// ============================================================
// CONFIGURACIÓN CENTRAL — Editá todo desde acá o desde /admin
// ============================================================

export interface TimelineEvent {
  hora: string
  titulo: string
  desc: string
  icono: string
}

export interface GalleryPhoto {
  webp: string
  fallback: string
}

export interface SiteConfig {
  evento: {
    tipo: string
    nombre: string
    apellido: string
    apodo: string
    fecha: string
    anio: string
    fechaEvento: string
    lugar: string
    ubicacion: string
    direccion: string
    mapsUrl: string
    hashtag: string
    hashtagUrl: string
  }
  dedicatoria: {
    cita: string
    cuerpo: string
    firma: string
  }
  timeline: {
    titulo: string
    subtitulo: string
    eventos: TimelineEvent[]
  }
  galeria: {
    titulo: string
    subtitulo: string
    botonSubir: string
    fotos: GalleryPhoto[]
  }
  musica: {
    titulo: string
    subtitulo: string
    playlistUrl: string
    embedUrl: string
    botonAgregar: string
    botonSpotify: string
  }
  rsvp: {
    titulo: string
    subtitulo: string
    fechaLimite: string
    fechaLimiteFull: string
    googleSheetUrl: string
    hostPhone: string
    regalos: {
      titulo: string
      subtitulo: string
      abitab: { titulo: string; numero: string }
      miDinero: { titulo: string; numero: string }
    }
  }
  footer: {
    apodo: string
    ubicacion: string
    frase: string
  }
  invitacion: {
    imagen: string
    imagenFallback: string
    textoAbrir: string
  }
  countdown: {
    titulo: string
    labels: { D: string; H: string; M: string; S: string }
    botonCalendario: string
    calendarioTitulo: string
    calendarioLocation: string
    calendarioDetalles: string
  }
  fondo: {
    fotos: string[]
  }
  colores: {
    principal: string
    dorado: string
    doradoClaro: string
    marfil: string
    fondo: string
  }
  estilos: {
    fuenteTitulo: string
    fuenteCuerpo: string
    fuenteCursiva: string
    modeloReloj: string
    estiloTarjetas: string
    estiloBotones: string
  }
}

`

export function buildConfigFile(configData: Record<string, unknown>): string {
  return `${CONFIG_TYPES}
// ============================================================
// VALORES — Auto-generated from admin panel
// ============================================================
const config: SiteConfig = ${JSON.stringify(configData, null, 2)} as SiteConfig

export default config
`
}

export async function deployToGitHub(
  configData: Record<string, unknown>,
  token: string,
): Promise<{ success: boolean; message: string }> {
  if (!token) {
    return { success: false, message: 'Falta el GitHub Token' }
  }

  const apiBase = `https://api.github.com/repos/${GITHUB_REPO}/contents/${CONFIG_PATH}`

  try {
    // 1. Get current file SHA
    const getRes = await fetch(apiBase, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!getRes.ok && getRes.status !== 404) {
      const err = await getRes.json().catch(() => ({}))
      return { success: false, message: `Error GitHub API: ${err.message || getRes.status}` }
    }

    const sha = getRes.ok ? (await getRes.json()).sha : undefined

    // 2. Build config content
    const contentStr = buildConfigFile(configData)
    const content = btoa(unescape(encodeURIComponent(contentStr)))

    // 3. Push file
    const putRes = await fetch(apiBase, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Config update from admin - ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`,
        content,
        sha,
        branch: 'main',
      }),
    })

    if (putRes.ok) {
      return { success: true, message: 'Config pusheado a GitHub. El deploy se activara automaticamente (~2 min).' }
    }

    const err = await putRes.json().catch(() => ({}))
    return { success: false, message: `Error al pushear: ${err.message || putRes.status}` }
  } catch (err) {
    return { success: false, message: `Error de red: ${err instanceof Error ? err.message : 'unknown'}` }
  }
}
