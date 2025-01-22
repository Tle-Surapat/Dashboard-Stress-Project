const nextLint = require("eslint-config-next");

module.exports = [
  nextLint(),
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "react/no-danger": "warn",
      "no-console": "warn",
    },
  },
];
