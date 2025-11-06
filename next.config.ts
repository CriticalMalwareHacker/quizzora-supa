import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https" as const, // Added 'as const' for stricter typing
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https" as const, // Added 'as const' for stricter typing
        hostname: "raw.githubusercontent.com",
      },
      // ✅ CORRECTED BLOCK
      {
        protocol: "https" as const,
        hostname: "xdkinaaybowsqgmyljnv.supabase.co", // Removed "https://"
        // You can also add the pathname for extra security
        // pathname: "/storage/v1/object/public/**", 
      },
    ],
  },
};

export default nextConfig;