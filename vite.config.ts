import { resolve } from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: "tsconfig.build.json"
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/connection/index.ts"),
      name: "@qu-beyond/activation",
      fileName: "index"
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    },
    sourcemap: true
  }
})
