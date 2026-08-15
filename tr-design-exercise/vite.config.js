import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: ".",
  publicDir: "public",
  appType: "mpa",
  server: {
    host: true,
    port: 5173,
    open: "/current.html",
  },
  preview: {
    host: true,
    port: 4173,
    open: "/current.html",
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        current: resolve(__dirname, "current.html"),
        option1: resolve(__dirname, "option-1.html"),
        option2: resolve(__dirname, "option-2.html"),
        option3: resolve(__dirname, "option-3.html"),
        option4: resolve(__dirname, "option-4.html"),
      },
    },
  },
});
