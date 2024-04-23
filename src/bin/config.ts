export const DEFAULT_CONFIG = {
  srcDir: './src',
  pagesDir: './src/pages',
  outDir: './',
}

let path = '/dego.config.js'

export function getConfig(configPath?: string) {
  if (configPath) path = configPath

  // @ts-ignore
  const userConfig = __non_webpack_require__(`${process.cwd()}${path}`)

  const config = { ...DEFAULT_CONFIG, ...userConfig }

  return config
}
