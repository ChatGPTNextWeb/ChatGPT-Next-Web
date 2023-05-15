/** @type {import('next').NextConfig} */
require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');


const nextConfig = {
  experimental: {
    appDir: true,
  },
  async rewrites() {
    const ret = [
      {
        source: "/api/proxy/:path*",
        destination: "https://api.openai.com/:path*",
      },
    ];

    const apiUrl = process.env.API_URL;
    if (apiUrl) {
      console.log("[Next] using api url ", apiUrl);
      ret.push({
        source: "/api/:path*",
        destination: `${apiUrl}/:path*`,
      });
    }

    return {
      beforeFiles: ret,
    };
  },
  webpack(config, options) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    if (options.isServer) {
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: `${path.dirname(
                require.resolve(`gpt-3-encoder/package.json`)
              )}/encoder.json`,
              to: "./app/api/openai/[...path]/",
            },
            {
              from: `${path.dirname(
                require.resolve(`gpt-3-encoder/package.json`)
              )}/vocab.bpe`,
              to: "./app/api/openai/[...path]/",
            },
          ],
        })
      )
    }
    return config;
  },
  output: "standalone",
};

module.exports = nextConfig;
