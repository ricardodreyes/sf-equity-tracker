import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        obligation: resolve(import.meta.dirname, "obligation.html"),
        evidence: resolve(import.meta.dirname, "evidence.html"),
        map: resolve(import.meta.dirname, "map.html"),
        methodology: resolve(import.meta.dirname, "methodology.html"),
      },
    },
  },
});
