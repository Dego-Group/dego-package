#!/usr/bin/env node

import { Configuration } from './index'

const defaultConfigPath = '/dego.config.js'

const configPath = defaultConfigPath

let config: Configuration = {
  srcDir: './src',
  pagesDir: './src/pages',
  outDir: './',
}

try {
  // @ts-ignore
  const userConfig = __non_webpack_require__(`${process.cwd()}${configPath}`)

  config = { config, ...userConfig }
} catch (error: any) {
  console.error(`Error loading config file: ${error.message}`)
}

console.log(config)
