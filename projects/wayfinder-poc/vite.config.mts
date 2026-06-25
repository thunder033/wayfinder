/// <reference types='vitest' />
import { defineConfig } from 'vite';

// eslint-disable-next-line @nx/enforce-module-boundaries
import { getViteBaseConfig } from '../../tools/vite.config.base';

//
export default defineConfig(() => ({
  ...getViteBaseConfig({ name: 'wayfinder-poc', dirName: __dirname }),
}));
