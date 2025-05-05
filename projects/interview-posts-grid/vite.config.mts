/// <reference types='vitest' />
import { defineConfig } from 'vite';
import { getViteBaseConfig } from '../../tools/vite.config.base';

export default defineConfig(() => ({
  ...getViteBaseConfig({ name: 'interview-posts-grid', dirName: __dirname }),
}));
