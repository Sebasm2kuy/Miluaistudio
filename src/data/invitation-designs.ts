export type DesignLayout = "classic" | "editorial" | "split" | "framed" | "botanical" | "modern" | "rounded" | "cinematic" | "arch" | "minimal";

export interface InvitationDesign {
  id: string;
  name: string;
  category: string;
  description: string;
  palette: string;
  background: string;
  accent: string;
  accentSoft: string;
  text: string;
  muted: string;
  layout: DesignLayout;
  clock: "cards" | "minimal" | "glass" | "circles" | "outline";
  font: "serif" | "script" | "sans";
  ornament: "sparkles" | "botanical" | "stars" | "petals" | "geometry" | "none";
}

export const INVITATION_DESIGNS: InvitationDesign[] = [
  {
    id: "rosa-romantica",
    name: "Rosa romántica",
    category: "XV · Bodas",
    description: "Rosa empolvado, detalles delicados y una composición romántica.",
    palette: "Rosa empolvado y oro suave",
    background: "#24151d",
    accent: "#e9b9c8",
    accentSoft: "#6f4658",
    text: "#fff5f7",
    muted: "#d6bfc8",
    layout: "classic",
    clock: "cards",
    font: "script",
    ornament: "petals"
  },
  {
    id: "noche-dorada",
    name: "Noche dorada",
    category: "XV · Bodas",
    description: "Negro profundo, dorado cálido y una estética de gala.",
    palette: "Negro y champagne",
    background: "#090909",
    accent: "#d7b46a",
    accentSoft: "#514126",
    text: "#fff8e9",
    muted: "#c4b9a1",
    layout: "cinematic",
    clock: "glass",
    font: "serif",
    ornament: "sparkles"
  },
  {
    id: "azul-celestial",
    name: "Azul celestial",
    category: "XV · Bodas",
    description: "Azules nocturnos y reflejos plateados, elegante y sereno.",
    palette: "Azul noche y plata",
    background: "#101d32",
    accent: "#a9d4f3",
    accentSoft: "#29476a",
    text: "#f5faff",
    muted: "#bdcce0",
    layout: "split",
    clock: "outline",
    font: "serif",
    ornament: "stars"
  },
  {
    id: "jardin-botanico",
    name: "Jardín botánico",
    category: "Bodas · XV",
    description: "Verdes profundos, tonos marfil y detalles inspirados en hojas.",
    palette: "Verde bosque y marfil",
    background: "#14231d",
    accent: "#c6d7a7",
    accentSoft: "#3b5a49",
    text: "#f8f7eb",
    muted: "#c3d0c2",
    layout: "botanical",
    clock: "minimal",
    font: "serif",
    ornament: "botanical"
  },
  {
    id: "lavanda",
    name: "Lavanda",
    category: "XV · Cumpleaños",
    description: "Lila suave con matices fríos y una distribución liviana.",
    palette: "Lavanda y perla",
    background: "#211a32",
    accent: "#d2c0f2",
    accentSoft: "#59466f",
    text: "#fcf8ff",
    muted: "#d1c6df",
    layout: "rounded",
    clock: "circles",
    font: "script",
    ornament: "petals"
  },
  {
    id: "terracota",
    name: "Terracota",
    category: "Bodas · Cumpleaños",
    description: "Arena cálida y terracota para una celebración natural.",
    palette: "Terracota y arena",
    background: "#2b1b16",
    accent: "#e7a27f",
    accentSoft: "#754733",
    text: "#fff4e8",
    muted: "#dbc3b0",
    layout: "editorial",
    clock: "cards",
    font: "serif",
    ornament: "botanical"
  },
  {
    id: "blanco-perla",
    name: "Blanco perla",
    category: "Bodas · Aniversarios",
    description: "Limpio, luminoso y centrado en la tipografía.",
    palette: "Perla y gris cálido",
    background: "#f4f0e9",
    accent: "#806b55",
    accentSoft: "#ded3c5",
    text: "#302821",
    muted: "#75685d",
    layout: "minimal",
    clock: "minimal",
    font: "sans",
    ornament: "none"
  },
  {
    id: "rojo-glamour",
    name: "Rojo glamour",
    category: "XV · Cumpleaños",
    description: "Bordó, rojo rubí y alto contraste para una entrada impactante.",
    palette: "Rubí y borgoña",
    background: "#260b15",
    accent: "#ff8da5",
    accentSoft: "#6f233a",
    text: "#fff3f6",
    muted: "#e0bdc6",
    layout: "framed",
    clock: "glass",
    font: "script",
    ornament: "petals"
  },
  {
    id: "geometria-moderna",
    name: "Geometría moderna",
    category: "XV · Cumpleaños",
    description: "Formas geométricas, tipografía limpia y acentos vibrantes.",
    palette: "Grafito y cobre",
    background: "#181b20",
    accent: "#efaa75",
    accentSoft: "#4c3a30",
    text: "#f7f4ef",
    muted: "#c0c0bf",
    layout: "modern",
    clock: "outline",
    font: "sans",
    ornament: "geometry"
  },
  {
    id: "azul-romantico",
    name: "Azul romántico",
    category: "Bodas · Aniversarios",
    description: "Azul tinta, detalles pálidos y una composición clásica renovada.",
    palette: "Azul tinta y celeste",
    background: "#111c2b",
    accent: "#a8c9df",
    accentSoft: "#2f4b64",
    text: "#f4f8fc",
    muted: "#becbd7",
    layout: "arch",
    clock: "circles",
    font: "serif",
    ornament: "stars"
  }
];
