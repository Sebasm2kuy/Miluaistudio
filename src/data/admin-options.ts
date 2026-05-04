// Font options available for the admin panel
export const FONT_OPTIONS = [
  { id: 'alex-brush', name: 'Alex Brush', category: 'Script', style: "'Alex Brush', cursive", preview: 'Elegancia' },
  { id: 'playfair', name: 'Playfair Display', category: 'Serif', style: "'Playfair Display', serif", preview: 'Sophistication' },
  { id: 'montserrat', name: 'Montserrat', category: 'Sans', style: "'Montserrat', sans-serif", preview: 'Modern' },
  { id: 'great-vibes', name: 'Great Vibes', category: 'Script', style: "'Great Vibes', cursive", preview: 'Elegancia' },
  { id: 'dancing-script', name: 'Dancing Script', category: 'Script', style: "'Dancing Script', cursive", preview: 'Elegancia' },
  { id: 'lora', name: 'Lora', category: 'Serif', style: "'Lora', serif", preview: 'Elegancia' },
  { id: 'cinzel', name: 'Cinzel', category: 'Serif', style: "'Cinzel', serif", preview: 'CLASIC' },
  { id: 'oswald', name: 'Oswald', category: 'Sans', style: "'Oswald', sans-serif", preview: 'BOLD' },
  { id: 'raleway', name: 'Raleway', category: 'Sans', style: "'Raleway', sans-serif", preview: 'Elegancia' },
  { id: 'satisfy', name: 'Satisfy', category: 'Script', style: "'Satisfy', cursive", preview: 'Elegancia' },
  { id: 'libre-baskerville', name: 'Libre Baskerville', category: 'Serif', style: "'Libre Baskerville', serif", preview: 'Elegancia' },
  { id: 'cormorant', name: 'Cormorant', category: 'Serif', style: "'Cormorant', serif", preview: 'Elegancia' },
  { id: 'poppins', name: 'Poppins', category: 'Sans', style: "'Poppins', sans-serif", preview: 'Modern' },
  { id: 'allura', name: 'Allura', category: 'Script', style: "'Allura', cursive", preview: 'Elegancia' },
  { id: 'bodoni-moda', name: 'Bodoni Moda', category: 'Serif', style: "'Bodoni Moda', serif", preview: 'CLASIC' },
] as const

// Clock/countdown style options
export const CLOCK_STYLES = [
  {
    id: 'classic',
    name: 'Clásico',
    description: 'Tarjetas blancas con números grandes',
    preview: '█08█',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Solo números, sin bordes',
    preview: '08',
  },
  {
    id: 'gold-glass',
    name: 'Dorado Vidrio',
    description: 'Fondo dorado translúcido',
    preview: '◈08◈',
  },
  {
    id: 'dark-luxury',
    name: 'Lujo Oscuro',
    description: 'Fondo oscuro con acentos dorados',
    preview: '◆08◆',
  },
  {
    id: 'neon',
    name: 'Neón',
    description: 'Efecto neón brillante',
    preview: '✦08✦',
  },
] as const

// Card/section style options
export const CARD_STYLES = [
  { id: 'glass', name: 'Cristal', description: 'Fondo blanco translúcido' },
  { id: 'dark', name: 'Oscuro', description: 'Fondo oscuro elegante' },
  { id: 'gold-border', name: 'Borde Dorado', description: 'Borde dorado con fondo claro' },
  { id: 'minimal-dark', name: 'Minimal Oscuro', description: 'Sin bordes, fondo semi-oscuro' },
] as const

// Button style options
export const BUTTON_STYLES = [
  { id: 'gold-gradient', name: 'Gradiente Dorado', description: 'Degradado clásico dorado' },
  { id: 'outline-gold', name: 'Contorno Dorado', description: 'Solo borde dorado' },
  { id: 'filled-dark', name: 'Sólido Oscuro', description: 'Botón oscuro con texto dorado' },
  { id: 'minimal', name: 'Minimal', description: 'Texto limpio sin fondo' },
] as const

// Google Fonts to load (subset: latin)
export const GOOGLE_FONTS = FONT_OPTIONS.map(f => f.name).join('&family=').replace(/ /g, '+')
