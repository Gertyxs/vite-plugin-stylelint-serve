# Vite-plugin-stylelint-serve

------

Stylelint plugin for vite serve.

## Install

```shell
npm install vite-plugin-stylelint-serve --save-dev
# or
yarn add -D vite-plugin-stylelint-seve
```

## Usage

```js
import { defineConfig } from 'vite';
import stylelintPluginServe from 'vite-plugin-stylelint-serve';

export default defineConfig({
  plugins: [stylelintPluginServe(options)],
});
```

------

## Options

 [stylelint Options]( https://stylelint.io/user-guide/usage/options) 

### cache
- Type: boolean
- Default: true

store the results of processed files so that Stylelint only operates on the changed ones

### fix

- Type: boolean
- Default: false

automatically fix, where possible, problems reported by rules

### include

- Type: string | string[]
- Default: ```[src/**/*.css, src/**/*.less, src/**/*.scss, src/**/*.sass, src/**/*.style, src/**/*.vue]```

files to include when linting [picomatch](https://github.com/micromatch/picomatch#globbing-features) pattern

### exclude

- Type: string | string[]
- Default: node_modules

files to exclude when linting [picomatch](https://github.com/micromatch/picomatch#globbing-features) pattern

### cacheLocation
- Type: string
- Default: /node_modules/.vite/vite-plugin-stylelint-server

path to a file or directory for the cache location

### formatter

- Type: string | FormatterType
- Default: string

specify the formatter to format your results

### throwOnWarning

- Type: boolean
- Default: true

whether to throw a warning

### throwOnError

- Type: boolean
- Default: true

whether to throw an error

## License

MIT