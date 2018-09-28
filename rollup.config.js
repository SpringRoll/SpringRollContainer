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
    babel(),
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

export default args => {
  const config = [];
  config.push(es);
  if (args.e2e) {
    config.push(e2e);
  }

  return config;
};
