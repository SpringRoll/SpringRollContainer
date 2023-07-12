import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import eslint from '@rollup/plugin-eslint';
import terser from '@rollup/plugin-terser';
import { babel } from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';


const base = {
  plugins: [
    nodeResolve(),
    commonjs(),
    json(),
    eslint(),
    babel({ sourceMap: true }),
    terser()
  ]
};

const e2e = Object.assign({}, base, {
  input: 'e2e/client-source.js',
  output: {
    file: 'e2e/client.js',
    format: 'es'
  }
});

const es = Object.assign({}, base, {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'es'
  }
});

const umd = Object.assign({}, base, {
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
  }
});

module.exports = [umd, es, e2e];
