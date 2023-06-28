const { eslint } = require('@rollup/plugin-eslint');
const { terser } = require('@rollup/plugin-terser');


const base = {
  plugins: [
    // @ts-ignore
    require('@rollup/plugin-node-resolve')(),
    // @ts-ignore
    require('@rollup/plugin-commonjs')(),
    require('@rollup/plugin-json')(),
    require('@rollup/plugin-eslint'),
    require('@rollup/plugin-babel')({ sourceMap: true }),
    require('@rollup/plugin-terser')
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
