/** @type {import('next').NextConfig} */

const withLess = require("next-with-less");

const nextConfig = withLess({
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
});

module.exports = nextConfig;
