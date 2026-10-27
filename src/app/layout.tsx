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
  metadataBase: new URL("https://sebasm2kuy.github.io/Miluaistudio/"),
  title: {
    default: "Miluaistudio | Invitaciones digitales personalizadas",
    template: "%s | Miluaistudio",
  },
  description: "Invitaciones digitales interactivas y personalizadas para fiestas de 15, bodas y celebraciones. Explorá los diseños, probá las demostraciones y consultá la personalización.",
  keywords: [
    "invitaciones digitales Uruguay",
    "invitación digital 15 años",
    "invitaciones web",
    "invitaciones interactivas",
    "invitaciones de boda",
    "quinceañera",
    "Miluaistudio",
  ],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://sebasm2kuy.github.io/Miluaistudio/",
  },
  icons: {
    icon: [
      { url: "/Miluaistudio/logo.svg", type: "image/svg+xml" },
      { url: "/Miluaistudio/sello-sm.png", type: "image/png", sizes: "256x256" },
    ],
    shortcut: ["/Miluaistudio/sello-sm.png"],
    apple: [{ url: "/Miluaistudio/sello-sm.png", sizes: "256x256" }],
  },
  openGraph: {
    title: "Miluaistudio | Invitaciones digitales personalizadas",
    description: "Explorá diseños de invitación web para fiestas de 15, bodas y celebraciones. Cada invitación reúne el estilo y los detalles de tu evento en un solo enlace.",
    type: "website",
    locale: "es_UY",
    url: "https://sebasm2kuy.github.io/Miluaistudio/",
    siteName: "Miluaistudio · Invitaciones digitales",
    images: [
      {
        url: "https://sebasm2kuy.github.io/Miluaistudio/catalogo/demo-cover.svg",
        width: 900,
        height: 1200,
        alt: "Invitación digital de demostración de Miluaistudio",
        type: "image/svg+xml",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Miluaistudio | Invitaciones digitales personalizadas",
    description: "Diseños web personalizados para fiestas de 15, bodas y celebraciones.",
    images: ["https://sebasm2kuy.github.io/Miluaistudio/catalogo/demo-cover.svg"],
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
        className={`${alexBrush.variable} ${cormorant.variable} ${dancingScript.variable} ${playfair.variable} ${montserrat.variable} antialiased`}
        style={{
          margin: 0,
          fontFamily: "'Montserrat', sans-serif",
          backgroundColor: '#050505',
          color: '#fdfcfb',
          overflowX: 'hidden',
        }}
      >
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        {children}
      </body>
    </html>
  );
}
