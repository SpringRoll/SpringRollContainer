import { eslint } from 'rollup-plugin-eslint';
import { terser } from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import prettier from 'rollup-plugin-prettier';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';

// @ts-ignore
import { version } from './package.json';
const prettierConfig = require('./.prettierrc');

export default [
  {
    input: 'src/index.js',
    output: [
      {
        file: 'dist/index.js',
        format: 'es'
      }
    ],
    plugins: [
      replace({
        CONTAINER_VERSION: version
      }),
      eslint(),
      prettier(prettierConfig),
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
  }
];
