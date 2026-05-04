const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        File: "readonly",
        SpeechSynthesisUtterance: "readonly",
        URL: "readonly",
        document: "readonly",
        localStorage: "readonly",
        navigator: "readonly",
        setInterval: "readonly",
        setTimeout: "readonly",
        speechSynthesis: "readonly",
        window: "readonly",
      },
    },
    rules: {
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
];
