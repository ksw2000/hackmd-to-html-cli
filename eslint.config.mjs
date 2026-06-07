import { defineConfig } from 'eslint/config';
import tseslint from "typescript-eslint";

export default defineConfig({
  files: ['**/*.ts'],
  extends: [tseslint.configs.recommended],
});