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

/* Datos estructurados Schema.org (JSON-LD): entidad principal del negocio.
   LocalBusiness con la oferta de servicio (Offer/Service) para que Google,
   Bing y los motores basados en IA asocien marca + servicio + área de
   cobertura. Validar cambios en https://search.google.com/test/rich-results */
const JSON_LD_NEGOCIO = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://lumengala.site/#negocio",
  name: "Lumen Gala Studio",
  alternateName: "Lumen Gala",
  description: "Invitaciones web elegantes y personalizadas para fiestas de 15 y bodas.",
  url: "https://lumengala.site",
  email: "lumengala.studio@gmail.com",
  telephone: "+598 95 239 386",
  image: "https://lumengala.site/lgs-preview.jpg",
  logo: "https://lumengala.site/logo-lgs.png",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Montevideo",
    addressCountry: "UY",
  },
  areaServed: [
    { "@type": "City", name: "Montevideo" },
    { "@type": "Country", name: "Uruguay" },
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "lumengala.studio@gmail.com",
    availableLanguage: ["es"],
  },
  makesOffer: {
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: "Invitaciones web elegantes y personalizadas para fiestas de 15 y bodas",
      serviceType: "Invitaciones web digitales personalizadas",
      description:
        "Invitaciones web elegantes y personalizadas para fiestas de 15 y bodas en Uruguay: música, galería de fotos, cuenta regresiva, ubicación y confirmación de asistencia en un solo enlace.",
      areaServed: "Montevideo, Uruguay",
      provider: { "@id": "https://lumengala.site/#negocio" },
    },
  },
};

export const metadata: Metadata = {
  metadataBase: new URL("https://lumengala.site/"),
  title: {
    default: "Lumen Gala Studio | Invitaciones web elegantes para fiestas de 15 y bodas",
    template: "%s | Lumen Gala Studio",
  },
  description:
    "Invitaciones web elegantes y personalizadas para fiestas de 15 y bodas en Uruguay: música, galería, cuenta regresiva y RSVP en un solo enlace.",
  keywords: [
    "invitaciones web Montevideo",
    "invitaciones digitales Uruguay",
    "invitación digital 15 años",
    "invitaciones web elegantes",
    "invitaciones para bodas Uruguay",
    "invitaciones interactivas",
    "quinceañera",
    "RSVP y cuenta regresiva",
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
    title: "Lumen Gala Studio | Invitaciones web elegantes para fiestas de 15 y bodas",
    description:
      "Invitaciones web elegantes y personalizadas para fiestas de 15 y bodas en Uruguay: música, galería, cuenta regresiva y RSVP en un solo enlace.",
    type: "website",
    locale: "es_UY",
    url: "https://lumengala.site/",
    siteName: "Lumen Gala Studio",
    images: [
      {
        url: "https://lumengala.site/lgs-preview.jpg",
        width: 1200,
        height: 630,
        alt: "Isotipo dorado de Lumen Gala Studio: rombo con las letras LGS entrelazadas sobre fondo oscuro",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumen Gala Studio | Invitaciones web elegantes para fiestas de 15 y bodas",
    description:
      "Invitaciones web elegantes y personalizadas para fiestas de 15 y bodas en Uruguay: música, galería, cuenta regresiva y RSVP en un solo enlace.",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_NEGOCIO) }}
        />
        {children}
      </body>
    </html>
  );
}
