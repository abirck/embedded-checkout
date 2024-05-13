import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.tsx?$": [
      "esbuild-jest",
      {
        sourcemap: true,
        loaders: {
          ".spec.ts": "tsx",
        },
      },
    ],
  },
};

export default config;
