import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Configuración",
  robots: "noindex, nofollow",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Preload Google Fonts for the admin font picker (scoped to /admin) */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Playfair+Display:ital@0;1&family=Montserrat:wght@300;400;600;700&family=Great+Vibes&family=Dancing+Script:wght@400;700&family=Lora:ital@0;1&family=Cinzel:wght@400;700&family=Oswald:wght@400;600&family=Raleway:wght@300;400;600&family=Satisfy&family=Libre+Baskerville:ital@0;1&family=Cormorant:ital,wght@0,400;0,600;1,400&family=Poppins:wght@300;400;600&family=Allura&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,700;1,6..96,400&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
