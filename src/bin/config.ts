export const DEFAULT_CONFIG = {
  srcDir: './src',
  pagesDir: './src/pages',
  outDir: './',
}

let path = '/dego.config.js'

export function getConfig(configPath?: string) {
  try {
    if (configPath) path = configPath

    // @ts-ignore
    const userConfig = __non_webpack_require__(`${process.cwd()}${path}`)

    const config = { ...DEFAULT_CONFIG, ...userConfig }

    return config
  } catch (error: any) {
    throw new Error(
      `Error loading config file. Path must be within project root. ${error.message}`
    )
  }
}
