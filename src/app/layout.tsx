import type { Metadata } from "next";
import { Alex_Brush, Playfair_Display, Montserrat } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const alexBrush = Alex_Brush({
  variable: "--font-alex-brush",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Milagros Cabrera — Mis XV Años",
  description:
    "Invitación especial a la celebración de los XV años de Milagros Cabrera. Sábado 22 de Agosto de 2026, Montevideo, Uruguay.",
  keywords: [
    "XV años",
    "quinceañera",
    "Milagros Cabrera",
    "invitación",
    "Montevideo",
    "2026",
  ],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎂</text></svg>",
  },
  openGraph: {
    title: "Milagros Cabrera — Mis XV Años",
    description:
      "Invitación especial a la celebración de los XV años de Milagros Cabrera. Sábado 22 de Agosto de 2026.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${alexBrush.variable} ${playfairDisplay.variable} ${montserrat.variable} antialiased`}
        style={{ background: "#050505", color: "#fdfcfb" }}
      >
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "rgba(253, 252, 251, 0.95)",
              color: "#3d0202",
              border: "1px solid rgba(212, 175, 55, 0.3)",
            },
          }}
        />
      </body>
    </html>
  );
}
