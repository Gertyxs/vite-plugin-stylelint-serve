import path from 'path'
import { terser } from 'rollup-plugin-terser'
import filesize from 'rollup-plugin-filesize'
import nodeResolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import commonjs from '@rollup/plugin-commonjs'
import { babel } from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'

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
  typescript({
    declaration: false
  }),
  // find and package third-party modules in node_modules
  nodeResolve({ browser: false }),
  // handling json imports
  json(),
  // replace target string in file
  replace({
    preventAssignment: true,
    'process.env.NODE_ENV': JSON.stringify(env)
  }),
  // handle babel
  babel({
    exclude: '**/node_modules/**',
    babelHelpers: 'bundled'
  }),
  // convert CommonJS to ES2015 modules for Rollup to process
  commonjs(),
  // aggregate plugin to display file size in cli
  isProd && filesize(),
  // compressed code
  isProd && terser()
]

const config = {
  input: 'src/index.ts',
  external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
  output: [
    {
      file: resolveFile(pkg['main']),
      format: 'umd',
      name: 'w6s',
      banner: banner
    },
    {
      file: resolveFile(pkg['module']),
      format: 'esm',
      banner: banner
    }
  ]
}

config.plugins = plugins

export default config
