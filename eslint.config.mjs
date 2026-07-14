import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    name: "project/rules",
    rules: {
      // Type safety: never allow `any`.
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },

  {
    // Architectuur-afhankelijkheidsregel: eenrichtingsverkeer
    // app -> features -> lib -> config. Nooit terug.
    name: "project/import-boundaries",
    files: ["src/features/**/*.{ts,tsx}", "src/lib/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/*", "@/app"],
              message:
                "Lagen features/lib mogen niet importeren uit de app-laag (eenrichtingsverkeer).",
            },
          ],
        },
      ],
    },
  },

  {
    // De service-role Supabase client mag uitsluitend server-side gebruikt worden.
    name: "project/service-client-guard",
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "src/lib/supabase/service.ts",
      "src/**/*.server.ts",
      "src/**/actions.ts",
      "src/app/api/**/*.ts",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/lib/supabase/service",
              message:
                "De service-role client mag alleen in server actions, route handlers of *.server.ts.",
            },
          ],
        },
      ],
    },
  },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "db/migrations/**",
    "coverage/**",
  ]),
]);

export default eslintConfig;
