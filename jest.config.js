module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": "@swc/jest",
  },
  setupFiles: ["<rootDir>/jest.setup.ts"],
  globalSetup: "<rootDir>/test/globalSetup.ts",
}
