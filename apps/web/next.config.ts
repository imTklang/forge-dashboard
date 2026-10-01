import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@forge/core"],
  serverExternalPackages: ["web-push"],
};

export default config;
