import type { Metadata } from "next";
import { Alex_Brush, Cormorant_Garamond, Dancing_Script, Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";

const alexBrush = Alex_Brush({
  weight: '400',
  variable: "--font-cursive",
  subsets: ["latin"],
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  weight: ['400', '500', '600', '700'],
  variable: "--font-cormorant",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: 'swap',
});

const dancingScript = Dancing_Script({
  weight: ['400', '500', '600', '700'],
  variable: "--font-dancing",
  subsets: ["latin"],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: 'swap',
});

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lumengala.site/"),
  title: {
    default: "Lumen Gala | Invitaciones digitales",
    template: "%s | Lumen Gala",
  },
  description: "Invitaciones digitales interactivas y personalizadas para fiestas de 15, bodas y celebraciones. Explorá los diseños, probá las demostraciones y consultá la personalización.",
  keywords: [
    "invitaciones digitales Uruguay",
    "invitación digital 15 años",
    "invitaciones web",
    "invitaciones interactivas",
    "invitaciones de boda",
    "quinceañera",
    "Lumen Gala",
    "Lumen Gala Studio",
    "LGS",
  ],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://lumengala.site/",
  },
  /* Identidad LGS: favicon.ico (monograma dorado, 16/32/48) en la raíz del
     dominio + apple-touch-icon.png generado desde el logo oficial. */
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "Lumen Gala Studio | Invitaciones web de alta gama",
    description:
      "Experiencias digitales personalizadas para 15s, bodas y eventos únicos. Música, RSVP y cuenta regresiva en un solo enlace.",
    type: "website",
    locale: "es_UY",
    url: "https://lumengala.site/",
    siteName: "Lumen Gala · Invitaciones digitales",
    images: [
      {
        url: "https://lumengala.site/lgs-preview.jpg",
        width: 1200,
        height: 630,
        alt: "Isotipo LGS de Lumen Gala: rombo dorado con las letras entrelazadas sobre fondo oscuro",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumen Gala Studio | Invitaciones web de alta gama",
    description:
      "Experiencias digitales personalizadas para 15s, bodas y eventos únicos. Música, RSVP y cuenta regresiva en un solo enlace.",
    images: ["https://lumengala.site/lgs-preview.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-UY" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${alexBrush.variable} ${cormorant.variable} ${dancingScript.variable} ${playfair.variable} ${montserrat.variable} antialiased`}
        style={{
          margin: 0,
          fontFamily: "'Montserrat', sans-serif",
          /* Fondo y color los controla globals.css: oscuro para la
             experiencia de invitación y marfil para las páginas de tienda
             (html:has([data-page="storefront"])). Sin inline styles acá:
             pisarían cualquier regla de tema. Sin overflow inline: el control
             de overflow vive en globals.css (body con overflow-x oculto rompe
             position:sticky en storefront). */
        }}
      >
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        {children}
      </body>
    </html>
  );
}
