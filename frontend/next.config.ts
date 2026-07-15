import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack altfel urcă până la primul package-lock.json găsit în arborele de directoare
  // (inclusiv unul neînrudit din ~/), ceea ce rupe rezoluția modulelor. Fixăm rădăcina explicit.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
