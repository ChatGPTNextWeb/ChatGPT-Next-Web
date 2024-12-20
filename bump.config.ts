import { defineConfig } from 'bumpp';

export default defineConfig({
  files: [
    'package.json',
  ],
  all: true,
  recursive: true,
  execute: 'node scripts/release.js',
});
