import "./styles/tailwind.css";
import "./styles/main.css";
import Alpine from "alpinejs";
import * as tocbot from "tocbot";
import dropdown from "./alpine-data/dropdown";
import colorSchemeSwitcher from "./alpine-data/color-scheme-switcher";
import postUpvote from "./alpine-data/post-upvote";

window.Alpine = Alpine;

Alpine.data("dropdown", dropdown);
Alpine.data("colorSchemeSwitcher", colorSchemeSwitcher);
Alpine.data("postUpvote", postUpvote);

Alpine.start();

const onScroll = () => {
  const headerMenu = document.getElementById("header-menu");
  if (window.scrollY > 0) {
    headerMenu?.classList.add("menu-sticky");
  } else {
    headerMenu?.classList.remove("menu-sticky");
  }
};

window.addEventListener("scroll", onScroll);

export function generateToc() {
  tocbot.init({
    tocSelector: ".toc",
    contentSelector: "#content",
    headingSelector: "h1, h2, h3, h4",
    extraListClasses: "space-y-1 dark:border-slate-500",
    extraLinkClasses:
      "group flex items-center justify-between rounded py-1 px-1.5 transition-all hover:bg-gray-100 text-sm opacity-80 dark:hover:bg-slate-700 dark:text-slate-50",
    activeLinkClass: "is-active-link bg-gray-100 dark:bg-slate-600",
    collapseDepth: 6,
    headingsOffset: 100,
    scrollSmooth: true,
    scrollSmoothOffset: -100,
  });
}

type ColorSchemeType = "system" | "dark" | "light";

export let currentColorScheme: ColorSchemeType = "system";

export function initColorScheme(defaultColorScheme: ColorSchemeType, enableChangeColorScheme: boolean) {
  let colorScheme = defaultColorScheme;

  if (enableChangeColorScheme) {
    colorScheme = (localStorage.getItem("color-scheme") as ColorSchemeType) || defaultColorScheme;
  }

  currentColorScheme = colorScheme;

  setColorScheme(colorScheme, false);
}

export function setColorScheme(colorScheme: ColorSchemeType, store: boolean) {
  if (colorScheme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.add(prefersDark ? "dark" : "light");
    document.documentElement.classList.remove(prefersDark ? "light" : "dark");
  } else {
    document.documentElement.classList.add(colorScheme);
    document.documentElement.classList.remove(colorScheme === "dark" ? "light" : "dark");
  }
  currentColorScheme = colorScheme;
  if (store) {
    localStorage.setItem("color-scheme", colorScheme);
  }
}

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
  if (currentColorScheme === "system") {
    setColorScheme("system", false);
  }
});
