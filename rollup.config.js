const { eslint } = require('rollup-plugin-eslint');
const { terser } = require('rollup-plugin-terser');

const base = {
  plugins: [
    require('rollup-plugin-json')(),
    eslint(),
    // @ts-ignore
    require('rollup-plugin-babel')({ sourceMap: true }),
    // @ts-ignore
    require('rollup-plugin-node-resolve')({
      module: true,
      jsnext: true,
      main: true,
      browser: true,
      preferBuiltins: false
    }),

    // @ts-ignore
    require('rollup-plugin-commonjs')({
      namedExports: {
        'bellhop-iframe': ['Bellhop']
      }
    }),
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
    name: 'SRC',
    extend: true,
    sourceMap: true
  }
});

module.exports = [umd, es, e2e];
