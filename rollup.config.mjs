import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import copy from '@rollup-extras/plugin-copy';
import json from '@rollup/plugin-json';

export default [{
  input: 'src/background/index.ts',
  output: {
    file: 'dist/background.js',
    format: 'iife',
    inlineDynamicImports: true,
  },
  plugins: [
    copy({ 
      src: ['public/**/*']
    }),
    json(),
    terser(),
    typescript({
      tsconfig: './tsconfig.json',
      noEmit: true,
      rootDir: './src',
    }),
  ]
},{
  input: 'src/content/content.ts',
  output: {
    file: 'dist/content.js',
    format: 'iife',
    inlineDynamicImports: true,
  },
  plugins: [
    json(),
    terser(),
    typescript({
      tsconfig: './tsconfig.json',
      noEmit: true,
      rootDir: './src',
    }),
  ]
},{
  input: 'src/content/settings.ts',
  output: {
    file: 'dist/settings.js',
    format: 'iife',
    inlineDynamicImports: true,
  },
  plugins: [
    terser(),
    typescript({
      tsconfig: './tsconfig.json',
      noEmit: true,
      rootDir: './src',
    }),
  ]
},{
  input: 'src/pages/popup.ts',
  output: {
    file: 'dist/popup.js',
    format: 'iife',
    inlineDynamicImports: true,
  },
  plugins: [
    json(),
    terser(),
    typescript({
      tsconfig: './tsconfig.json',
      noEmit: true,
      rootDir: './src',
    }),
  ]
},{
  input: 'src/pages/options.ts',
  output: {
    file: 'dist/options.js',
    format: 'iife',
    inlineDynamicImports: true,
  },
  plugins: [
    json(),
    terser(),
    typescript({
      tsconfig: './tsconfig.json',
      noEmit: true,
      rootDir: './src',
    }),
  ]
},{
  input: 'src/pages/batcast.ts',
  output: {
    file: 'dist/batcast.js',
    format: 'iife',
    inlineDynamicImports: true,
  },
  plugins: [
    terser(),
    typescript({
      tsconfig: './tsconfig.json',
      noEmit: true,
      rootDir: './src',
    }),
  ]
},{
  input: 'src/pages/players.ts',
  output: {
    file: 'dist/players.js',
    format: 'iife',
    inlineDynamicImports: true,
  },
  plugins: [
    terser(),
    typescript({
      tsconfig: './tsconfig.json',
      noEmit: true,
      rootDir: './src',
    }),
  ]
}];
