import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node20",
  clean: true,
  // @forge/core é TypeScript puro do workspace: embute no bundle
  noExternal: ["@forge/core"],
  banner: { js: "#!/usr/bin/env node" },
});
