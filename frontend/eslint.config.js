import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  // Ignore generated/dependency folders
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
    ],
  },

  // JavaScript recommended rules
  js.configs.recommended,

  // React configuration
  {
    files: ["**/*.{js,jsx}"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",

      globals: {
        ...globals.browser,
        ...globals.es2021,
      },

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      // React recommended rules
      ...react.configs.recommended.rules,

      // React Hooks recommended rules
      ...reactHooks.configs.recommended.rules,

      // React 17+ does not require React import in JSX files
      "react/react-in-jsx-scope": "off",

      // Existing code may intentionally update state inside effects
      "react-hooks/set-state-in-effect": "off",

      // Existing components can have non-component exports
      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
        },
      ],

      // Don't fail CI for unused variables
      "no-unused-vars": "warn",

      // React prop-types are not required when using modern React/JS
      "react/prop-types": "off",
    },
  },
];