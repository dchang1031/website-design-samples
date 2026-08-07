import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: ".",
  publicDir: "public",
  server: {
    host: true,
    port: 5173,
    open: "/option-4.html",
  },
  preview: {
    host: true,
    port: 4173,
    open: "/option-4.html",
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        option2: resolve(__dirname, "option-2.html"),
        option3: resolve(__dirname, "option-3.html"),
        option4: resolve(__dirname, "option-4.html"),
        option5: resolve(__dirname, "option-5.html"),
      },
    },
  },
});
