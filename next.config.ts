import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for production builds
  swcMinify: true,
  reactStrictMode: true,
  
  // Image optimization for Vercel
  images: {
    remotePatterns: [],
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
