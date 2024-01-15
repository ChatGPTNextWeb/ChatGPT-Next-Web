import { BuiltinPlugin } from "./typing";

export const EN_PLUGINS: BuiltinPlugin[] = [
  {
    name: "WebSearch",
    toolName: "web-search",
    lang: "en",
    description: "Web search function tool for search engines.",
    builtin: true,
    createdAt: 1693744292000,
    enable: true,
    onlyNodeRuntime: false,
  },
  {
    name: "Calculator",
    toolName: "calculator",
    lang: "en",
    description:
      "The Calculator class is a tool used to evaluate mathematical expressions. It extends the base Tool class.",
    builtin: true,
    createdAt: 1693744292000,
    enable: true,
    onlyNodeRuntime: false,
  },
  {
    name: "WebBrowser",
    toolName: "web-browser",
    lang: "en",
    description:
      "A class designed to interact with web pages, either to extract information from them or to summarize their content.",
    builtin: true,
    createdAt: 1693744292000,
    enable: true,
    onlyNodeRuntime: false,
  },
  {
    name: "Wikipedia",
    toolName: "WikipediaQueryRun",
    lang: "en",
    description:
      "A tool for interacting with and fetching data from the Wikipedia API.",
    builtin: true,
    createdAt: 1694235989000,
    enable: false,
    onlyNodeRuntime: false,
  },
  {
    name: "DALL·E",
    toolName: "dalle_image_generator",
    lang: "en",
    description:
      "DALL·E 2 is an AI system that can create realistic images and art from a description in natural language. Using this plugin requires configuring Cloudflare R2 object storage service.",
    builtin: true,
    createdAt: 1694703673000,
    enable: false,
    onlyNodeRuntime: false,
  },
  {
    name: "Stable Diffusion",
    toolName: "stable_diffusion_image_generator",
    lang: "en",
    description:
      "Stable Diffusion text-to-image model. Using this plugin requires configuring Cloudflare R2 object storage service and stable-diffusion-webui API.",
    builtin: true,
    createdAt: 1688899480510,
    enable: false,
    onlyNodeRuntime: false,
  },
  {
    name: "Arxiv",
    toolName: "arxiv",
    lang: "en",
    description: "Arxiv search and get the article information.",
    builtin: true,
    createdAt: 1699265115000,
    enable: false,
    onlyNodeRuntime: false,
  },
  {
    name: "PDFBrowser",
    toolName: "pdf-browser",
    lang: "en",
    description:
      "A class designed to interact with pdf file, extract information from the URL of a PDF file or summarize its content.",
    builtin: true,
    createdAt: 1700907315000,
    enable: false,
    onlyNodeRuntime: true,
  },
  {
    name: "WolframAlphaTool",
    toolName: "wolfram_alpha_llm",
    lang: "en",
    description:
      "Useful for when you need to answer questions about Math, Science, Technology, Culture, Society and Everyday Life.",
    builtin: true,
    createdAt: 1703846656000,
    enable: false,
    onlyNodeRuntime: false,
  },
];
