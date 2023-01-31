module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ["prettier"],
  plugins: ["prettier"],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  rules: {
    // note you must disable the base rule as it can report incorrect errors
    "no-use-before-define": "off",
    "no-unused-vars": "off",
    indent: "off",
    camelcase: "off",
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
        singleQuote: false,
      },
    ],
  },
};
