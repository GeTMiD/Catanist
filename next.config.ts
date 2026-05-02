import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pins the tracing root to this exact directory, preventing webpack from
  // resolving node_modules via the parent folder with different casing on Windows.
  outputFileTracingRoot: path.resolve(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
