import { eslint } from 'rollup-plugin-eslint';
import { terser } from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import prettier from 'rollup-plugin-prettier';
import resolve from 'rollup-plugin-node-resolve';

const prettierConfig = require('./.prettierrc');
export default args => {
  const config = [
    {
      input: 'src/index.js',
      output: [
        {
          file: 'dist/index.js',
          format: 'es'
        }
      ],
      plugins: [
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
  if (args.e2e) {
    config.push({
      input: 'e2e/client-source.js',
      output: [
        {
          file: 'e2e/client.js',
          format: 'es'
        }
      ],
      plugins: [
        resolve({
          module: true,
          jsnext: true,
          main: true,
          browser: true,
          preferBuiltins: false
        })
      ]
    });
  }
  return config;
};
