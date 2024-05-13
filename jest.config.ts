import type { Config } from "jest";

const config: Config = {
  detectOpenHandles: true,
  globals: {
    testEnvironmentOptions: {
      NODE_ENV: "test",
    },
  },
  testPathIgnorePatterns: [
    "<rootDir>/client/", // client project has it's own jest config file
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};

export default config;
