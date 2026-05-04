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
      {children}
      <style dangerouslySetInnerHTML={{ __html: `
        .admin-layout { overflow-y: auto !important; height: 100vh !important; height: 100dvh !important; position: static !important; }
        .admin-layout body { overflow-y: auto !important; height: auto !important; position: static !important; }
        .admin-layout html { overflow: hidden !important; height: 100% !important; }
        .admin-layout { background: #030712; }
      `}} />
    </>
  );
}
