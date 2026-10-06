import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Support standalone build for Docker / Render container deployments
  output: process.env.NEXT_OUTPUT_STANDALONE === "true" ? "standalone" : undefined,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "exeeiqkfrswhlipsucit.supabase.co",
        pathname: "/storage/v1/object/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "resqbackend-t1wv.onrender.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
