/**
 * @file ecosystem.config.cjs
 * @description PM2 config для HAEE Neurocosmetics
 * @created 2025-03-06
 */

const path = require("path");

module.exports = {
  apps: [
    {
      name: "neurocosmetics",
      script: path.join(__dirname, "node_modules/.bin/next"),
      args: "dev",
      cwd: __dirname,
      env: {
        NODE_ENV: "development",
        DEBUG_MODE: "true",
      },
      env_production: {
        NODE_ENV: "production",
        DEBUG_MODE: "true",
      },
    },
  ],
};
