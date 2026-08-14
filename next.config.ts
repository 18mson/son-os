import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mengizinkan akses HMR dev server dari HP / IP lokal (Moto G45, Galaxy A54, dll)
  allowedDevOrigins: [
    "10.168.71.103",
    "localhost:3000",
    "localhost",
    "127.0.0.1",
  ],
};

export default nextConfig;
