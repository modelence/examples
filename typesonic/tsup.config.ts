import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server/app.ts'],
  format: ['esm'],
  target: 'node18',
  clean: true,
  outDir: '.modelence/build',
  sourcemap: true,
  dts: false,
  splitting: false,
  bundle: true,
  minify: false,
  outExtension: ({ format }) => ({
    js: format === 'esm' ? '.mjs' : '.js'
  }),
});
