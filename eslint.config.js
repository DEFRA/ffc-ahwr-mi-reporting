const neostandard = require("neostandard");
const sonarjs = require("eslint-plugin-sonarjs");

module.exports = [
  ...neostandard({
    env: ["node", "jest"],
    ignores: [...neostandard.resolveIgnoresFromGitignore()],
    noJsx: true,
    noStyle: true,
  }),
  sonarjs.configs.recommended,
  {
    rules: {
      "sonarjs/no-commented-code": "error",
    },
  },
];
