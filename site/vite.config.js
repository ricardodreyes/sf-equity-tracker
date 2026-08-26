import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        obligation: resolve(import.meta.dirname, "obligation.html"),
        evidence: resolve(import.meta.dirname, "evidence.html"),
        methodology: resolve(import.meta.dirname, "methodology.html"),
      },
    },
  },
});
