import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  cjsInterop: true,
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: false,
  minify: false,
  treeshake: true,
});
