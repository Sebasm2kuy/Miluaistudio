import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/Miluaistudio",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  /* Los errores de TypeScript ya no se ocultan: el build falla si hay
     errores de tipos (anteriormente ignoreBuildErrors: true). */
  reactStrictMode: false,
};

export default nextConfig;
