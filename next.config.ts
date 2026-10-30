import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  /* El sitio se sirve en la RAÍZ del dominio propio (lumengala.site), ya
     no en el subdirectorio /Miluaistudio/ de GitHub Pages. Sin basePath,
     todas las rutas internas quedan ancladas a "/" del dominio. */
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  /* Los errores de TypeScript ya no se ocultan: el build falla si hay
     errores de tipos (anteriormente ignoreBuildErrors: true). */
  reactStrictMode: false,
};

export default nextConfig;
