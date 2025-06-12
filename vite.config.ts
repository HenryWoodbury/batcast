import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        background: "src/background/index.ts",
        content: "src/content/content.ts",
        settings: "src/content/settings.ts",
        popup: "src/pages/popup.ts",
        options: "src/pages/options.ts",
        batcast: "src/pages/batcast.ts",
        players: "src/pages/players.ts",
      },
      output: {
        entryFileNames: "[name].js"
      },
    },
    outDir: "dist",
    target: 'modules',
  },
});