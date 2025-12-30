/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['pg', 'pg-pool'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('pg', 'pg-pool', 'pg-cloudflare', 'pg-protocol', 'pg-types');
    }
    return config;
  },
};

module.exports = nextConfig;
