import { defineConfig } from "vite";
import { fileURLToPath } from "url";
import path from "path";

export default defineConfig({
  plugins: [],
  build: {
    outDir: fileURLToPath(new URL("./templates/assets/dist", import.meta.url)),
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      name: "main",
      fileName: "main",
      formats: ["iife"],
    },
  },
});
