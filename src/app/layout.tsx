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
  title: "Mis XV - Milagros Cabrera",
  description: "Invitación digital para los XV años de Milagros Cabrera. Sábado 22 de Agosto de 2026, Salón My Father, Montevideo.",
  keywords: ["XV años", "Milagros", "quinceañera", "Milu", "invitación", "Montevideo", "Uruguay"],
  openGraph: {
    title: "Mis XV - Milagros Cabrera",
    description: "Invitación digital para los XV años de Milagros Cabrera",
    type: "website",
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
          color: '#1a1a1a',
          overflowX: 'hidden',
        }}
      >
        {children}
      </body>
    </html>
  );
}
