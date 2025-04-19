/// <reference types='vitest' />
import { defineConfig } from 'vite';
import { getViteBaseConfig } from '../../tools/vite.config.base';

export default defineConfig(() => ({
  ...getViteBaseConfig({ name: 'wayfinder-ui', dirName: __dirname }),
}));
