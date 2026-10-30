import type { MetadataRoute } from "next";

/* robots.txt nativo de Next.js (App Router): se prerenderiza como
   out/robots.txt en el build estático (output: "export") y queda
   expuesto en https://lumengala.site/robots.txt.
   Reemplaza al archivo estático public/robots.txt, que entraba en
   conflicto con esta ruta de metadatos.

   Política de producción:
   - Rastreo abierto para buscadores (Googlebot, Bingbot), bots de
     redes sociales (Twitterbot, facebookexternalhit) y crawlers de
     motores de IA (GPTBot, ClaudeBot, PerplexityBot, …). Se declaran
     explícitos para que una regla futura no los bloquee por accidente:
     la marca quiere aparecer en respuestas de IA, no ocultarse.
   - El sitemap solo declara páginas indexables; las demos
     (catalogo/[designId]) y las invitaciones (/i/<slug>) llevan
     <meta name="robots" content="noindex"> en su propia metadata. */

const BASE_URL = "https://lumengala.site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: ["Googlebot", "Bingbot"],
        allow: "/",
      },
      {
        // Crawlers de motores basados en IA (OpenAI, Anthropic,
        // Perplexity, Google Gemini, Common Crawl, Apple).
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "PerplexityBot",
          "Google-Extended",
          "CCBot",
          "Applebot",
        ],
        allow: "/",
      },
      {
        // Bots de vistas previas sociales (WhatsApp/X/Facebook).
        userAgent: ["Twitterbot", "facebookexternalhit"],
        allow: "/",
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
