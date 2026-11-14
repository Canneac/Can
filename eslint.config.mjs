import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  { ignores: [".next/**", ".next-e2e/**", ".next-phone/**", "outputs/**", "work/**", "public/uploads/**"] },
  ...nextVitals,
  ...nextTs,
];

export default eslintConfig;
