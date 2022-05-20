import * as path from 'path'
import { terser } from 'rollup-plugin-terser'
import nodeResolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import commonjs from '@rollup/plugin-commonjs'
import ts from 'rollup-plugin-typescript2'
import dts from 'rollup-plugin-dts'
import json from '@rollup/plugin-json'
import { babel } from '@rollup/plugin-babel'

const resolveFile = (filePath) => path.join(process.cwd(), '.', filePath)

const env = process.env.NODE_ENV
const pkg = require('./package.json')
const isProd = env === 'production'

const banner = `
/*!
 * vite-plugin-stylelint-serve v${pkg.version}
 * (c) ${new Date().getFullYear()} ${pkg.author.name}
 */
`

const plugins = [
  // handle Typescript
  ts(),
  // find and package third-party modules in node_modules
  nodeResolve(),
  // handle babel
  babel({
    exclude: '**/node_modules/**',
    babelHelpers: 'bundled'
  }),
  // handling json imports
  json(),
  // replace target string in file
  replace({
    preventAssignment: true,
    'process.env.NODE_ENV': JSON.stringify(env)
  }),
  // convert CommonJS to ES2015 modules for Rollup to process
  commonjs()
]

// compressed code
if (isProd) {
  plugins.push(terser())
}

const config = {
  input: './src/index.ts',
  external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
  output: [
    {
      file: resolveFile(pkg['main']),
      format: 'cjs',
      name: 'vite-plugin-stylelint-serve',
      exports: 'auto',
      banner: banner
    },
    {
      file: resolveFile(pkg['module']),
      exports: 'auto',
      format: 'esm',
      banner: banner
    }
  ]
}

config.plugins = plugins

const dtsConfig = {
  input: './src/index.ts',
  output: [{ file: 'dist/index.d.ts', format: 'es' }],
  plugins: [dts()]
}

export default [config, dtsConfig]
