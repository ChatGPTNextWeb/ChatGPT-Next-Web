export const MCP_CONF = {
  "brave-search": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-brave-search"],
    env: {
      BRAVE_API_KEY: "<YOUR_API_KEY>",
    },
  },
  filesystem: {
    command: "npx",
    args: [
      "-y",
      "@modelcontextprotocol/server-filesystem",
      "/Users/kadxy/Desktop",
    ],
  },
  github: {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-github"],
    env: {
      GITHUB_PERSONAL_ACCESS_TOKEN: "<YOUR_TOKEN>",
    },
  },
  "google-maps": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-google-maps"],
    env: {
      GOOGLE_MAPS_API_KEY: "<YOUR_API_KEY>",
    },
  },
  "aws-kb-retrieval": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-aws-kb-retrieval"],
    env: {
      AWS_ACCESS_KEY_ID: "<YOUR_ACCESS_KEY_HERE>",
      AWS_SECRET_ACCESS_KEY: "<YOUR_SECRET_ACCESS_KEY_HERE>",
      AWS_REGION: "<YOUR_AWS_REGION_HERE>",
    },
  },
};
