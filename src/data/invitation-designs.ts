export type DesignLayout = "classic" | "editorial" | "split" | "framed" | "botanical" | "modern" | "rounded" | "cinematic" | "arch" | "minimal";

export type DesignAdorno =
  | "rosas"
  | "hojas-oro"
  | "flores-silvestres"
  | "luna-estrellas"
  | "eucalipto"
  | "mariposas"
  | "hojas-tropicales"
  | "geometrico"
  | "rosas-coral";

export type ThemeMode = "light" | "dark";

export interface InvitationDesign {
  id: string;
  name: string;
  category: string;
  description: string;
  palette: string;
  /** Colores mostrados como puntos de paleta en la tarjeta del catálogo */
  paletteDots: [string, string, string, string];
  /** Fondo de la página de invitación (demo) */
  background: string;
  accent: string;
  accentSoft: string;
  text: string;
  muted: string;
  layout: DesignLayout;
  backgroundPreset: string;
  clock: "cards" | "minimal" | "glass" | "circles" | "outline";
  font: "serif" | "script" | "sans";
  ornament: "sparkles" | "botanical" | "stars" | "petals" | "geometry" | "none";
  /** Set de adornos SVG temáticos (flores, luna, hojas, mariposas, etc.) */
  adorno: DesignAdorno;
  /** Modo visual del tema: fondo claro u oscuro */
  themeMode: ThemeMode;
  /** Nombre ficticio mostrado en la maqueta (= perfil de demostración) */
  mockupName: string;
  /** Tipo de evento mostrado en la maqueta */
  mockupTipo: string;
  /** Fecha de la demo en formato visual "DD · MM · YYYY" */
  mockupDate: string;
  /** Botón "Ver invitación" de la tarjeta del catálogo */
  buttonBg: string;
  buttonText: string;
  /** Color base de la tarjeta/miniatura de invitación */
  cardBg: string;
  cardText: string;
  /** Escena fotográfica de la tarjeta del catálogo */
  scene: string;
}

/**
 * Orden y nombres según la referencia comercial aprobada.
 * Los ids y rutas existentes NO cambian.
 */
export const INVITATION_DESIGNS: InvitationDesign[] = [
  {
    id: "rosa-romantica",
    backgroundPreset: "rosa-suave",
    name: "Rosa Romántica",
    category: "XV · Bodas",
    description: "Un diseño delicado y femenino, con flores en tonos rosa y detalles dorados. Ideal para quienes buscan un estilo clásico y elegante.",
    palette: "Rosas empolvados y dorado",
    paletteDots: ["#c98a94", "#e8c4c8", "#f5e6e2", "#e3aeb4"],
    background: "#fbf1f2",
    accent: "#c4768b",
    accentSoft: "#9d5f6f",
    text: "#4a343b",
    muted: "#8a6f76",
    layout: "classic",
    clock: "cards",
    font: "script",
    ornament: "petals",
    adorno: "rosas",
    themeMode: "light",
    mockupName: "Valentina",
    mockupTipo: "Mis XV años",
    mockupDate: "15 · 11 · 2027",
    buttonBg: "#c48b8f",
    buttonText: "#ffffff",
    cardBg: "#fdf3f1",
    cardText: "#4a343b",
    scene: "/Miluaistudio/catalogo/scenes/rosa-romantica.jpg",
  },
  {
    id: "noche-dorada",
    backgroundPreset: "oro-real",
    name: "Oro Real",
    category: "XV · Bodas",
    description: "Elegancia y sofisticación en cada detalle. Un diseño moderno con toques dorados y fondo oscuro, perfecto para una noche inolvidable.",
    palette: "Negro profundo y oro",
    paletteDots: ["#101010", "#8a6f3c", "#d4af37", "#6e6a62"],
    background: "#0a0a0a",
    accent: "#d4af37",
    accentSoft: "#8a6f3c",
    text: "#f6edd8",
    muted: "#b7ab8e",
    layout: "cinematic",
    clock: "glass",
    font: "serif",
    ornament: "sparkles",
    adorno: "hojas-oro",
    themeMode: "dark",
    mockupName: "Camila",
    mockupTipo: "Mis XV años",
    mockupDate: "28 · 11 · 2027",
    buttonBg: "#55524b",
    buttonText: "#ffffff",
    cardBg: "#0d0d0b",
    cardText: "#f6edd8",
    scene: "/Miluaistudio/catalogo/scenes/noche-dorada.jpg",
  },
  {
    id: "terracota",
    backgroundPreset: "jardin-pastel",
    name: "Jardín Pastel",
    category: "Bodas · XV",
    description: "Frescura y naturalidad en un diseño romántico, con flores silvestres y tonos suaves que transmiten tranquilidad y alegría.",
    palette: "Verde salvia y crema",
    paletteDots: ["#a8b5a0", "#f2ede1", "#dcd2c2", "#dbbcb2"],
    background: "#f6f4ec",
    accent: "#8fa083",
    accentSoft: "#6d7d64",
    text: "#41463c",
    muted: "#7f857a",
    layout: "botanical",
    clock: "cards",
    font: "serif",
    ornament: "botanical",
    adorno: "flores-silvestres",
    themeMode: "light",
    mockupName: "Renata",
    mockupTipo: "Mis XV años",
    mockupDate: "13 · 07 · 2027",
    buttonBg: "#8f8a80",
    buttonText: "#ffffff",
    cardBg: "#fbfaf3",
    cardText: "#41463c",
    scene: "/Miluaistudio/catalogo/scenes/terracota.jpg",
  },
  {
    id: "azul-celestial",
    backgroundPreset: "cielo-estrellado",
    name: "Cielo Estrellado",
    category: "XV · Bodas",
    description: "Un diseño mágico y moderno, inspirado en el cielo y las estrellas. Ideal para quienes sueñan en grande.",
    palette: "Azul noche, plata y luna",
    paletteDots: ["#1c3a63", "#4a6f96", "#93abc9", "#cfdcef"],
    background: "#0d1a30",
    accent: "#a9c9ea",
    accentSoft: "#3a5a82",
    text: "#eef5fd",
    muted: "#a9bcd4",
    layout: "split",
    clock: "glass",
    font: "serif",
    ornament: "stars",
    adorno: "luna-estrellas",
    themeMode: "dark",
    mockupName: "Lucía",
    mockupTipo: "Mis XV años",
    mockupDate: "07 · 12 · 2027",
    buttonBg: "#7189ab",
    buttonText: "#ffffff",
    cardBg: "#12233d",
    cardText: "#eef5fd",
    scene: "/Miluaistudio/catalogo/scenes/azul-celestial.jpg",
  },
  {
    id: "blanco-perla",
    backgroundPreset: "perla-clara",
    name: "Minimalista",
    category: "Bodas · Aniversarios",
    description: "Simple, moderno y elegante. Una propuesta con líneas limpias y tipografía delicada, que resalta lo esencial.",
    palette: "Perla, gris cálido y salvia",
    paletteDots: ["#9aa39b", "#cdd0c9", "#b3a898", "#e3dccd"],
    background: "#f5f2ec",
    accent: "#8a7f6d",
    accentSoft: "#6f675a",
    text: "#322c25",
    muted: "#7d766b",
    layout: "minimal",
    clock: "minimal",
    font: "sans",
    ornament: "none",
    adorno: "eucalipto",
    themeMode: "light",
    mockupName: "Isabella",
    mockupTipo: "Mis XV años",
    mockupDate: "10 · 10 · 2027",
    buttonBg: "#a39a8c",
    buttonText: "#ffffff",
    cardBg: "#f8f5ee",
    cardText: "#322c25",
    scene: "/Miluaistudio/catalogo/scenes/blanco-perla.jpg",
  },
  {
    id: "lavanda",
    backgroundPreset: "lavanda-suave",
    name: "Lavanda",
    category: "XV · Cumpleaños",
    description: "Un diseño tierno y romántico, con tonos lavanda y detalles de mariposas. Perfecto para una celebración llena de magia.",
    palette: "Lavanda y lila suave",
    paletteDots: ["#8b5fa8", "#ab7fc6", "#cfa9e4", "#ecdff5"],
    background: "#f7f2fb",
    accent: "#9d6fc3",
    accentSoft: "#7b5599",
    text: "#443a52",
    muted: "#857a94",
    layout: "rounded",
    clock: "cards",
    font: "script",
    ornament: "petals",
    adorno: "mariposas",
    themeMode: "light",
    mockupName: "Martina",
    mockupTipo: "Mis XV años",
    mockupDate: "23 · 04 · 2027",
    buttonBg: "#9d6fc3",
    buttonText: "#ffffff",
    cardBg: "#faf5fd",
    cardText: "#443a52",
    scene: "/Miluaistudio/catalogo/scenes/lavanda.jpg",
  },
  {
    id: "rojo-glamour",
    backgroundPreset: "rojo-velvet",
    name: "Rojo Glamour",
    category: "XV · Cumpleaños",
    description: "Pasión y elegancia en un diseño impactante, con detalles dorados y una estética sofisticada y moderna.",
    palette: "Rubí, borgoña y oro",
    paletteDots: ["#5c0e18", "#a91b2e", "#d96c6c", "#c9a227"],
    background: "#26060e",
    accent: "#d4a24a",
    accentSoft: "#8a2434",
    text: "#fbeee6",
    muted: "#d4aab0",
    layout: "framed",
    clock: "glass",
    font: "script",
    ornament: "petals",
    adorno: "hojas-oro",
    themeMode: "dark",
    mockupName: "Julieta",
    mockupTipo: "Mis XV años",
    mockupDate: "18 · 11 · 2027",
    buttonBg: "#8a1c2b",
    buttonText: "#ffffff",
    cardBg: "#300a14",
    cardText: "#fbeee6",
    scene: "/Miluaistudio/catalogo/scenes/rojo-glamour.jpg",
  },
  {
    id: "jardin-botanico",
    backgroundPreset: "botanico-suave",
    name: "Verde Botánico",
    category: "Bodas · XV",
    description: "Naturaleza y frescura en un diseño moderno, con hojas y elementos orgánicos que transmiten armonía y equilibrio.",
    palette: "Verdes naturales y beige",
    paletteDots: ["#2e4a3a", "#7d9077", "#a8b5a0", "#ddd3c0"],
    background: "#f4f1e6",
    accent: "#5c7364",
    accentSoft: "#42584a",
    text: "#333b33",
    muted: "#75806f",
    layout: "botanical",
    clock: "cards",
    font: "serif",
    ornament: "botanical",
    adorno: "hojas-tropicales",
    themeMode: "light",
    mockupName: "Sofía",
    mockupTipo: "Mis XV años",
    mockupDate: "21 · 11 · 2027",
    buttonBg: "#5c7364",
    buttonText: "#ffffff",
    cardBg: "#f0ead9",
    cardText: "#333b33",
    scene: "/Miluaistudio/catalogo/scenes/jardin-botanico.jpg",
  },
  {
    id: "geometria-moderna",
    backgroundPreset: "geometria-calida",
    name: "Geometría Moderna",
    category: "XV · Cumpleaños",
    description: "Un estilo actual y original, con formas geométricas y colores cálidos. Ideal para quienes buscan algo diferente.",
    palette: "Terracota, verde y arena",
    paletteDots: ["#d97b4f", "#3d5245", "#c9a875", "#f0e3d0"],
    background: "#f7efe4",
    accent: "#d97b4f",
    accentSoft: "#a05c3c",
    text: "#3f332b",
    muted: "#8a7a6a",
    layout: "modern",
    clock: "cards",
    font: "sans",
    ornament: "geometry",
    adorno: "geometrico",
    themeMode: "light",
    mockupName: "Valentina & Diego",
    mockupTipo: "Nuestra boda",
    mockupDate: "08 · 08 · 2027",
    buttonBg: "#dd8451",
    buttonText: "#ffffff",
    cardBg: "#f8f1e7",
    cardText: "#3f332b",
    scene: "/Miluaistudio/catalogo/scenes/geometria-moderna.jpg",
  },
  {
    id: "azul-romantico",
    backgroundPreset: "floral-crema",
    name: "Romántico Floral",
    category: "Bodas · Aniversarios",
    description: "Un diseño clásico y encantador, con flores en tonos cálidos y una estética delicada y atemporal.",
    palette: "Coral, rosas y crema",
    paletteDots: ["#c4757f", "#f2e7dd", "#e5bfc0", "#3d5245"],
    background: "#faf3ec",
    accent: "#c4757f",
    accentSoft: "#96555f",
    text: "#463437",
    muted: "#8a7070",
    layout: "arch",
    clock: "cards",
    font: "serif",
    ornament: "petals",
    adorno: "rosas-coral",
    themeMode: "light",
    mockupName: "Emilia",
    mockupTipo: "Mis XV años",
    mockupDate: "22 · 09 · 2027",
    buttonBg: "#c98b8b",
    buttonText: "#ffffff",
    cardBg: "#fdf6ee",
    cardText: "#463437",
    scene: "/Miluaistudio/catalogo/scenes/azul-romantico.jpg",
  },
];

/** Búsqueda por id que respeta el nuevo orden del catálogo */
export function getDesignById(id: string): InvitationDesign | undefined {
  return INVITATION_DESIGNS.find((design) => design.id === id);
}
