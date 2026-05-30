import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    files: ["src/**/*.tsx"],
    ignores: ["src/components/ui/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "JSXOpeningElement[name.name=/^(button|a)$/] JSXAttribute[name.name='className'] Literal[value=/rounded-full/][value=/bg-white/]",
          message:
            'Inline solid button/anchor styling — reuse <Button variant="glass"> (@/components/ui/button) instead of hand-written bg-white rounded-full classes.',
        },
      ],
    },
  },
  {
    files: [
      "src/components/Backgrounds/PersonalBackground/**",
      "src/components/Backgrounds/DevBackground/**",
      "src/components/PublicProfile/**",
      "src/hooks/useResponsiveColumns.ts",
    ],
    rules: {
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
