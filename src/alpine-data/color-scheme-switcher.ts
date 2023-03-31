import { currentColorScheme } from "../main";

export default () => ({
  colorSchemes: [
    { label: "暗色", value: "dark", icon: "i-gg-moon" },
    { label: "亮色", value: "light", icon: "i-gg-sun" },
    { label: "跟随系统", value: "system", icon: "i-gg-dark-mode" },
  ],
  currentValue: currentColorScheme,
  get colorScheme() {
    return this.colorSchemes.find((x) => x.value === this.currentValue);
  },
  get nextColorScheme() {
    const index = this.colorSchemes.findIndex((x) => x.value === this.currentValue);
    return this.colorSchemes[(index + 1) % this.colorSchemes.length];
  },
});
