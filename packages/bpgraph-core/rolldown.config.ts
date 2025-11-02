import { defineConfig } from 'rolldown'

export default defineConfig([
  {
    input: { index: 'src/index.ts' },
    output: {
      format: 'esm',
      dir: 'build',
      entryFileNames: '[name].mjs',
      manualChunks(id) {
        if (id.includes('node_modules')) return 'vendor'
      },
      minify: false,
      minifyInternalExports: false
    }
  },
  {
    input: { 'engine/index': 'src/engine/index.ts' },
    output: {
      format: 'esm',
      dir: 'build',
      entryFileNames: '[name].mjs',
      manualChunks(id) {
        if (id.includes('node_modules')) return 'vendor'
      },
      minify: false,
      minifyInternalExports: false
    }
  }
])