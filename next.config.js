/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    appDir: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    }); // 针对 SVG 的处理规则

    return config;
  },
  async redirects() {
    if (!process.env.DOMAIN) {
      return []
    }

    return [
      {
        source: '/',
        destination: `https://${process.env.DOMAIN}/`,
        has: [
          {
            type: 'host',
            value: process.env.DOMAIN,
            not: true
          },
        ],
        permanent: true,
      },
    ]
  },
};

if (process.env.DOCKER) {
  nextConfig.output = 'standalone'
}

module.exports = nextConfig;
