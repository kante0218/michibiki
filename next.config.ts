import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force trailing slashes for consistent URLs
  trailingSlash: false,

  // Disable x-powered-by header (hides Next.js fingerprint)
  poweredByHeader: false,

  // Security: restrict image domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
