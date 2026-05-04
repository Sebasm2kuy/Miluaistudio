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
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              document.documentElement.classList.add('admin-page');
              document.documentElement.style.overflow = 'auto';
              document.documentElement.style.height = 'auto';
              document.documentElement.style.position = 'static';
              document.body.style.overflow = 'auto';
              document.body.style.height = 'auto';
              document.body.style.position = 'static';
            })();
          `,
        }}
      />
      {children}
    </>
  );
}
