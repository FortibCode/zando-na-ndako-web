import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Ce back-office est un outil interne entièrement client-side : le pattern
      // "fetch au montage via useEffect + useState" y est utilisé volontairement
      // sur toutes les pages de listing (pas de React Compiler / Server Components
      // pour ces données). Cette règle, pensée pour les apps compilées par le
      // React Compiler, ferait échouer le lint sur ce pattern standard et correct.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
