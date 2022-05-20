import * as path from 'path'
import { createFilter, normalizePath } from '@rollup/pluginutils'
import * as stylelint from 'stylelint'
import type * as Stylelint from 'stylelint'
import type { FormatterType } from 'stylelint'
import type { Plugin } from 'vite'

export interface Options extends Stylelint.LinterOptions {
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
  /** Stylelint does not throw an error when glob pattern matches no files. */
  allowEmptyInput?: boolean
  /** Path to a JSON, YAML, or JS file that contains your configuration object. */
  configFile?: string
  /** Absolute path to the directory that relative paths defining "extends" and "plugins" are relative to. Only necessary if these values are relative paths. */
  configBasedir?: string
}

export default (options: Options = {}): Plugin => {
  options.include = options.include ? options.include : [/.*\.(vue|css|scss|sass|less|styl|svelte)$/]
  options.exclude = options.exclude ? options.exclude : [/node_modules/]
  options.cache = options.cache ? options.cache : true
  options.cacheLocation = options.cacheLocation ? options.cacheLocation : path.resolve(process.cwd(), './node_modules/.vite/vite-plugin-stylelint-server')
  options.fix = options.fix ? options.fix : false
  options.formatter = options.formatter ? options.formatter : 'string'
  options.throwOnError = options.throwOnError ? options.throwOnError : true
  options.throwOnWarning = options.throwOnWarning ? options.throwOnWarning : true

  let filter: (id: string | unknown) => boolean

  return {
    name: 'vite-plugin-stylelint-serve',
    configResolved(config) {
      if (Array.isArray(options.exclude)) {
        options.exclude.push(config.build.outDir)
      } else {
        options.exclude = [options.exclude as string | RegExp, config.build.outDir].filter((item) => !!item)
      }
      // create filter
      filter = createFilter(options.include, options.exclude)
    },
    async transform(_, id) {

      const file = normalizePath(id).split('?')[0];

      if (!filter(file)) {
        return null;
      }

      const { throwOnError, throwOnWarning, ...opts } = options
      await stylelint
        .lint({
          files: file,
          ...opts
        })
        .then(({ errored, output, results }: Stylelint.LinterResult) => {
          results.forEach((result) => {
            const { warnings, ignored } = result
            if (!ignored) {
              warnings.forEach((warning) => {
                const { severity, text, line, column } = warning
                if (severity === 'error' && throwOnError && output) {
                  this.error(text, { line, column })
                } else if (severity === 'warning' && throwOnWarning && output) {
                  this.warn(text, { line, column })
                }
              })
            }
          })
        })
        .catch((error) => {
          console.log('please check if the configuration is correct and if there is a difference in the stylelint version: https://github.com/Gertyxs/vite-plugin-stylelint-serve')
          this.error(error)
        })
      return null
    }
  }
}
