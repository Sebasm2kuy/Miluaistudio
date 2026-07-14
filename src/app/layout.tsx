import type { Metadata } from "next";
import { Alex_Brush, Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";

const alexBrush = Alex_Brush({
  weight: '400',
  variable: "--font-cursive",
  subsets: ["latin"],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: 'swap',
});

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sebasm2kuy.github.io/Miluaistudio/"),
  title: "Mis XV - Milagros Cabrera",
  description: "Invitación digital para los XV años de Milagros Cabrera. Sábado 22 de Agosto de 2026, Salón My Father, Montevideo.",
  keywords: ["XV años", "Milagros", "quinceañera", "Milu", "invitación", "Montevideo", "Uruguay"],
  icons: {
    icon: [
      { url: "/Miluaistudio/logo.svg", type: "image/svg+xml" },
      { url: "/Miluaistudio/sello-sm.png", type: "image/png", sizes: "256x256" },
    ],
    shortcut: ["/Miluaistudio/sello-sm.png"],
    apple: [{ url: "/Miluaistudio/sello-sm.png", sizes: "256x256" }],
  },
  openGraph: {
    title: "Mis XV Años — Milagros Cabrera",
    description: "Sábado 22 de Agosto de 2026 · Salón My Father, Montevideo. ¡Te espero para compartir esta noche inolvidable!",
    type: "website",
    locale: "es_UY",
    url: "https://sebasm2kuy.github.io/Miluaistudio/",
    siteName: "XV Años de Milagros",
    images: [
      {
        // JPG optimizado (90KB, 1200x630) — WhatsApp no soporta webp para previews
        url: "/Miluaistudio/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Invitación XV Años de Milagros Cabrera — 22 de Agosto de 2026",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mis XV Años — Milagros Cabrera",
    description: "Sábado 22 de Agosto de 2026 · Salón My Father, Montevideo",
    images: ["/Miluaistudio/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${alexBrush.variable} ${playfair.variable} ${montserrat.variable} antialiased`}
        style={{
          margin: 0,
          fontFamily: "'Montserrat', sans-serif",
          backgroundColor: '#050505',
          color: '#fdfcfb',
          overflowX: 'hidden',
        }}
      >
        {children}
      </body>
    </html>
  );
}
