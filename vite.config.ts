import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        background: "src/background/index.ts",
        content: "src/content/content.ts",
        popup: "src/pages/popup.ts",
        options: "src/pages/options.ts",
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
    outDir: "dist",
  }
});