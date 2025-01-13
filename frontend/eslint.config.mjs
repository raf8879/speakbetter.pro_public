import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Расширяем базовые пресеты Next
const eslintConfig = [
  // Подключаем "extends" от Next.js
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Добавляем объект с нашими кастомными правилами
  {
    // Можно дать описание:
    // files: ["**/*.ts", "**/*.tsx"],
    // languageOptions: {...},
    // plugins: [...],
    // и т.д.

    rules: {
      // Отключаем / ослабляем "no-explicit-any"
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@next/next/no-html-link-for-pages": "off",
      "prefer-const": "off",
      "@next/next/no-page-custom-font": "off",
      "@next/next/no-html-link-for-pages": "off",

      // Если хочется ослабить "no-unused-vars" или др.:
      // "@typescript-eslint/no-unused-vars": "warn",
      // "prefer-const": "off",
    },
  },
];

export default eslintConfig;
