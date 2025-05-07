/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ne pas tenter de résoudre ces modules côté client
      config.resolve.fallback = {
        fs: false,
        path: false,
        stream: false,
        crypto: false,
        net: false,
        tls: false,
        dns: false,
      };
    }
    return config;
  },
}

export default nextConfig
