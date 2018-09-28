import { eslint } from 'rollup-plugin-eslint';
import { terser } from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';
const base = {
  plugins: [
    json(),
    eslint(),
    resolve({
      module: true,
      jsnext: true,
      main: true,
      browser: true,
      preferBuiltins: false
    }),
    commonjs({
      namedExports: {
        'bellhop-iframe': ['Bellhop']
      }
    }),
    babel({ sourceMap: true }),
    terser()
  ]
};
const e2e = Object.assign({}, base, {
  input: 'e2e/client-source.js',
  output: [
    {
      file: 'e2e/client.js',
      format: 'es'
    }
  ]
});

const es = Object.assign({}, base, {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/index.js',
      format: 'es'
    }
  ]
});

const umd = Object.assign({}, base, {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/SpringRoll-Container-umd.js',
      format: 'umd',
      name: 'SRC',
      extend: true,
      sourceMap: true
    }
  ]
});

export default args => {
  const config = [es, umd];
  if (args.e2e) {
    config.push(e2e);
  }

  return config;
};
