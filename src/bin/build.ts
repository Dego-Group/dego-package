import { existsSync, readFileSync } from 'fs'

import { Configuration } from '..'

const PATH_TO_DEGO_BROWSER_CONFIG = '../src/dego/config/index.ts'
const REGEX =
  /\/\* __DEGO-REPLACE:START__ \*\/(.*)\/\* __DEGO-REPLACE:END__ \*\//

export function setupBuild(config: Configuration) {
  const doesExist = existsSync(PATH_TO_DEGO_BROWSER_CONFIG)
  if (!doesExist) {
    throw console.error(
      'Dego browser config does not exist at ' + PATH_TO_DEGO_BROWSER_CONFIG
    )
  }

  const file = readFileSync(PATH_TO_DEGO_BROWSER_CONFIG, { encoding: 'utf8' })
  file.replace(REGEX, 'test')
  console.log(file)
}
