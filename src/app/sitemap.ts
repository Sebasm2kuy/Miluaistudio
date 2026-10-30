import type { MetadataRoute } from "next";

/* sitemap.xml nativo de Next.js (App Router): se prerenderiza como
   out/sitemap.xml en el build estático (output: "export") y queda
   expuesto en https://lumengala.site/sitemap.xml.
   Reemplaza al archivo estático public/sitemap.xml, que entraba en
   conflicto con esta ruta de metadatos.

   Solo incluye páginas INDEXABLES:
   - Portada (/), catálogo (/catalogo/) y personalizador (/personalizar/).
   Quedan fuera a propósito:
   - Demos /catalogo/<designId>/ → robots: index:false en su metadata.
   - Invitaciones publicadas /i/<slug>/ → noindex (datos de eventos
     privados de clientes).
   - Herramientas operativas (/editar/, /previsualizar/).
   Con trailingSlash: true, las URLs llevan "/" final para coincidir
   con los canonical declarados en cada página. */

const BASE_URL = "https://lumengala.site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const ultimaActualizacion = new Date();

  return [
    {
      url: `${BASE_URL}/`,
      lastModified: ultimaActualizacion,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/catalogo/`,
      lastModified: ultimaActualizacion,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/personalizar/`,
      lastModified: ultimaActualizacion,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];
}
