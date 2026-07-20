import globals from "globals";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node, // Tells ESLint that process, __dirname, etc. are valid Node.js globals
      },
    },
  },
];