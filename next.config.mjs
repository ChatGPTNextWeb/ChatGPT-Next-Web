import webpack from "webpack";
// debug build
// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);



// import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
const mode = process.env.BUILD_MODE ?? "standalone";
console.log("[Next] build mode", mode);

const disableChunk = !!process.env.DISABLE_CHUNK || mode === "export";
// const disableChunk = true;
console.log("[Next] build with chunk: ", disableChunk);

/** @type {import('next').NextConfig} */
// const isProd = process.env.NODE_ENV === 'production'

// 为了修复tiktoken的插件问题
// const CopyWebpackPlugin = require("copy-webpack-plugin");

const nextConfig = {
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

    // 为了修复tiktoken的插件问题
    // config.plugins.push(
    //   new CopyWebpackPlugin({
    //     patterns: [
    //       {
    //         from: "node_modules/tiktoken/lite/tiktoken_bg.wasm",
    //         to: "./tiktoken/lite/tiktoken_bg.wasm",
    //         toType: "file",
    //       },
    //     ],
    //   })
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
      { hostname: "localhost" },
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
    serverComponentsExternalPackages: ["tiktoken"]
  },
  // externals: {
  //   'sharp': 'commonjs sharp'
  // },
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
const ForceCacheHeaders = [
  { key: "Cache-Control", value: "max-age=2592000, s-maxage=86400"}
]
const NoCacheHeaders = [
  { key: "Cache-Control", value: "no-cache, no-store, must-revalidate, max-age=0" }
]

nextConfig.headers = async () => {
  return [
    {
      source: '/',
      headers: NoCacheHeaders,
    }
  ]
}

if (mode !== "export") {
  // nextConfig.headers = async () => {
  //   return [
  //     {
  //       source: "/:path*\\.(png|ico|txt|css|js|json|webmanifest)",
  //       headers: ForceCacheHeaders,
  //     },
  //     {
  //       source: "/api/:path*",
  //       headers: CorsHeaders,
  //     },
  //   ];
  // };

  nextConfig.rewrites = async () => {
    const ret = [
      // adjust for previous version directly using "/api/proxy/" as proxy base route
      // {
      //   source: "/api/proxy/v1/:path*",
      //   destination: "https://api.openai.com/v1/:path*",
      // },
      {
        // https://{resource_name}.openai.azure.com/openai/deployments/{deploy_name}/chat/completions
        source: "/api/proxy/azure/:resource_name/deployments/:deploy_name/:path*",
        destination: "https://:resource_name.openai.azure.com/openai/deployments/:deploy_name/:path*",
      },
      {
        source: "/api/proxy/google/:path*",
        destination: "https://generativelanguage.googleapis.com/:path*",
      },
      {
        source: "/api/proxy/openai/:path*",
        destination: "https://api.openai.com/:path*",
      },
      {
        source: "/api/proxy/anthropic/:path*",
        destination: "https://api.anthropic.com/:path*",
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
