import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The backend's paths end in "/" (Django). This lets the local mock routes answer them directly.
  trailingSlash: true,
};

export default nextConfig;
