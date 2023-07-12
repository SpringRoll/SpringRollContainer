import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import eslint from '@rollup/plugin-eslint';
import terser from '@rollup/plugin-terser';
import { babel } from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';


const plugins = [
  nodeResolve(),
  commonjs(),
  json(),
  eslint(),
  babel({ sourceMap: true }),
  terser()
];

export default [
  {
    input: 'e2e/client-source.js',
    output: {
      file: 'e2e/client.js',
      format: 'es'
    },
    plugins
  },
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.js',
      format: 'es'
    },
    plugins
  },
  {
    input: 'src/index.js',
    output: {
      file: 'dist/SpringRoll-Container-umd.js',
      format: 'umd',
      name: 'springroll',
      extend: true,
      sourcemap: true,
      globals: {
        'bellhop-iframe': 'Bellhop'
      }
    },
    plugins
  }
];
