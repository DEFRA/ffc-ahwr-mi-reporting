const neostandard = require("neostandard");

module.exports = neostandard({
  env: ["node", "jest"],
  ignores: [...neostandard.resolveIgnoresFromGitignore()],
  noJsx: true,
  noStyle: true,
});
