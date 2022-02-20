import * as path from 'path'
import { createFilter } from '@rollup/pluginutils'
import * as stylelint from 'stylelint'
import type { FormatterType } from 'stylelint'
import type { Plugin } from 'vite'
import { normalizePath } from './utils'

export interface Options {
  /** store the results of processed files so that Stylelint only operates on the changed ones */
  cache?: boolean
  /** automatically fix, where possible, problems reported by rules */
  fix?: boolean
  /** files to include when linting picomatch pattern */
  include?: string | RegExp | (string | RegExp)[]
  /** files to exclude when linting picomatch pattern */
  exclude?: string | RegExp | (string | RegExp)[]
  /** path to a file or directory for the cache location */
  cacheLocation?: string
  /** specify the formatter to format your results */
  formatter?: FormatterType
  /** whether to throw a warning */
  throwOnWarning?: boolean
  /** whether to throw an error */
  throwOnError?: boolean
}

export default (options: Options): Plugin => {
  const defaultOptions = {
    cache: true,
    fix: false,
    include: ['src/**/*.css', 'src/**/*.less', 'src/**/*.scss', 'src/**/*.sass', 'src/**/*.style', 'src/**/*.vue'],
    exclude: [/node_modules/],
    formatter: 'string' as FormatterType,
    throwOnWarning: true,
    throwOnError: true
  }

  options = options ? options : {}
  options.include = options.include ? options.include : defaultOptions.include
  options.exclude = options.exclude ? options.exclude : defaultOptions.exclude
  options.cache = options.cache ? options.cache : defaultOptions.cache
  options.cacheLocation = options.cacheLocation ? options.cacheLocation : path.resolve(process.cwd(), './node_modules/.vite/vite-plugin-stylelint-server')
  options.fix = options.fix ? options.fix : defaultOptions.fix
  options.formatter = options.formatter ? options.formatter : defaultOptions.formatter
  options.throwOnError = options.throwOnError ? options.throwOnError : defaultOptions.throwOnError
  options.throwOnWarning = options.throwOnWarning ? options.throwOnWarning : defaultOptions.throwOnWarning

  const filter = createFilter(options.include, options.exclude)

  return {
    name: 'vite-plugin-stylelint-serve',
    async transform(code, id) {
      const file = normalizePath(id)

      if (!filter(id)) {
        return null
      }

      const { throwOnError, throwOnWarning, ...opts } = options
      await stylelint
        .lint({
          files: file,
          ...opts
        })
        .then((data) => {
          const { errored, output } = data
          // output format log
          if (output) {
            if (errored && throwOnError || throwOnWarning) {
              console.log(output)
            }
          }
          // at least one rule with an "error"-level severity registered a problem
          if (errored) {
            this.error(output)
          }
        })
        .catch((error) => {
          console.log('please check if the configuration is correct and if there is a difference in the stylelint version: https://github.com/Gertyxs/vite-plugin-stylelint-serve')
          this.error(error)
        })
      return null
    }
  }
}
