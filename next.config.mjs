import webpack from "webpack";
// import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
const mode = process.env.BUILD_MODE ?? "standalone";
console.log("[Next] build mode", mode);

const disableChunk = !!process.env.DISABLE_CHUNK || mode === "export";
console.log("[Next] build with chunk: ", disableChunk);

/** @type {import('next').NextConfig} */
// const isProd = process.env.NODE_ENV === 'production'

// 为了修复tiktoken的插件问题
import CopyPlugin from "copy-webpack-plugin";
const nextConfig = {
  // transpilePackages: ['tiktoken'],
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    if (disableChunk) {
      config.plugins.push(
        new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
      )
    }
    // turn off static file serving of WASM files
    // we need to let Webpack handle WASM import
    // config.module.rules
    //   .find((i) => "oneOf" in i)
    //   .oneOf.find((i) => i.type === "asset/resource")
    //   .exclude.push(/\.wasm$/);
    // config.plugins.push(
    //     new CopyPlugin({
    //       patterns: [
    //         {
    //           from: ".//node_modules/tiktoken/,
    //           to: "",
    //         }
    //       ]
    //     })
    // )

    config.optimization.minimize = true
    config.optimization.splitChunks = {
      minSize: 1024 * 300
    }
    // console.log('=======', config.optimization)

    config.resolve.fallback = {
      child_process: false,
    };

    // tiktoken
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    return config;
  },
  output: mode,
  // 不影响public，https://www.nextjs.cn/docs/api-reference/next.config.js/cdn-support-with-asset-prefix
  // assetPrefix: isProd ? "https://cos.xiaosi.cc" : "",
  images: {
    unoptimized: mode === "export",
    // domains: ["cos.xiaosi.cc"],
    remotePatterns: [
      { hostname: "**.xiaosi.cc" },
      { hostname: "public.blob.vercel-storage.com" },
      { hostname: "res.cloudinary.com" },
      { hostname: "abs.twimg.com" },
      { hostname: "pbs.twimg.com" },
      { hostname: "avatar.vercel.sh" },
      { hostname: "avatars.githubusercontent.com" },
      { hostname: "www.google.com" },
      { hostname: "flag.vercel.app" },
      { hostname: "illustrations.popsy.co" },
    ]
  },
  experimental: {
    forceSwcTransforms: true,
  },
  swcMinify: true,
};

const CorsHeaders = [
  { key: "Access-Control-Allow-Credentials", value: "true" },
  { key: "Access-Control-Allow-Origin", value: "*" },
  {
    key: "Access-Control-Allow-Methods",
    value: "*",
  },
  {
    key: "Access-Control-Allow-Headers",
    value: "*",
  },
  {
    key: "Access-Control-Max-Age",
    value: "86400",
  },
];
const IndexHeaders = [
  { key: "Cache-Control", value: "public, max-age=86400"}
]

if (mode !== "export") {
  nextConfig.headers = async () => {
    return [
      {
        source: "/api/:path*",
        headers: CorsHeaders,
      },
      // {
      //   source: "/",
      //   headers: IndexHeaders,
      // },
    ];
  };

  nextConfig.rewrites = async () => {
    const ret = [
      {
        source: "/api/proxy/:path*",
        destination: "https://api.openai.com/:path*",
      },
      {
        source: "/google-fonts/:path*",
        destination: "https://fonts.googleapis.com/:path*",
      },
      {
        source: "/sharegpt",
        destination: "https://sharegpt.com/api/conversations",
      },
    ];

    return {
      beforeFiles: ret,
    };
  };
}

export default nextConfig;
