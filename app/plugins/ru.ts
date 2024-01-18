import { BuiltinPlugin } from "./typing";

export const RU_PLUGINS: BuiltinPlugin[] = [
  {
    name: "WebSearch",
    toolName: "web-search",
    lang: "ru",
    description: "Функциональный инструмент веб-поиска для поисковых систем.",
    builtin: true,
    createdAt: 1693744292000,
    enable: true,
    onlyNodeRuntime: false,
  },
  {
    name: "Calculator",
    toolName: "calculator",
    lang: "ru",
    description:
      "Класс Calculator - это инструмент, используемый для оценки математических выражений. Он расширяет базовый класс Tool.",
    builtin: true,
    createdAt: 1693744292000,
    enable: true,
    onlyNodeRuntime: false,
  },
  {
    name: "WebBrowser",
    toolName: "web-browser",
    lang: "ru",
    description:
      "Класс, предназначенный для взаимодействия с веб-страницами, извлечения из них информации или обобщения их содержимого.",
    builtin: true,
    createdAt: 1693744292000,
    enable: true,
    onlyNodeRuntime: false,
  },
  {
    name: "Wikipedia",
    toolName: "WikipediaQueryRun",
    lang: "ru",
    description:
      "Инструмент для взаимодействия с API Википедии и получения данных из нее.",
    builtin: true,
    createdAt: 1694235989000,
    enable: false,
    onlyNodeRuntime: false,
  },
  {
    name: "DALL·E",
    toolName: "dalle_image_generator",
    lang: "ru",
    description:
      "DALL-E 2 - это система искусственного интеллекта, которая может создавать реалистичные изображения и произведения искусства на основе описания на естественном языке. Для использования этого плагина требуется настройка службы хранения объектов Cloudflare R2.",
    builtin: true,
    createdAt: 1694703673000,
    enable: false,
    onlyNodeRuntime: false,
  },
  {
    name: "Stable Diffusion",
    toolName: "stable_diffusion_image_generator",
    lang: "ru",
    description:
      "Модель преобразования текста в изображение Stable Diffusion. Для использования этого плагина требуется настройка сервиса хранения объектов Cloudflare R2 и API stable-diffusion-webui.",
    builtin: true,
    createdAt: 1688899480510,
    enable: false,
    onlyNodeRuntime: false,
  },
  {
    name: "Arxiv",
    toolName: "arxiv",
    lang: "ru",
    description: "Поиск в Arxiv и получение информации о статье.",
    builtin: true,
    createdAt: 1699265115000,
    enable: false,
    onlyNodeRuntime: false,
  },
  {
    name: "PDFBrowser",
    toolName: "pdf-browser",
    lang: "ru",
    description:
      "Класс, предназначенный для взаимодействия с pdf-файлом, извлечения информации из URL-адреса PDF-файла или обобщения его содержимого.",
    builtin: true,
    createdAt: 1700907315000,
    enable: false,
    onlyNodeRuntime: true,
  },
  {
    name: "WolframAlphaTool",
    toolName: "wolfram_alpha_llm",
    lang: "ru",
    description:
      "Пригодится, если вам нужно ответить на вопросы по математике, науке, технике, культуре, обществу и повседневной жизни.",
    builtin: true,
    createdAt: 1703846656000,
    enable: false,
    onlyNodeRuntime: false,
  },
];
