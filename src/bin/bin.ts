#!/usr/bin/env node

import { DEFAULT_CONFIG_PATH, getConfig } from './config'

import { getHelp } from './help'
import { getVersion } from './version'
import { setupBuild } from './build'

// import yargs from 'yargs'

export const EXPECTED_COMMANDS = [
  {
    command: 'dev',
    explanation:
      'Run dev server, exposes a dev server port and auto refreshes your browser for you.',
  },
  {
    command: 'version',
    explanation:
      'Gets the current version of Dego and compares it to your local version.',
  },
  {
    command: 'build',
    explanation: 'Builds Dego based on your `dego.config.js` file.',
  },
] as const

export const OPTIONS = {
  config: {
    type: 'string',
    description:
      'Path to Dego config file, relative to the current working directory.',
  },
  help: {
    type: 'boolean',
    default: false,
    description: 'Shows all valid commands and flags along with their uses.',
  },
} as const

// @ts-ignore
export const argv = yargs(process.argv.slice(2))
  .options(OPTIONS)
  .help(false)
  .version(false)
  .parseSync()

let configPath = argv.config

if (configPath?.startsWith('.')) {
  configPath = configPath.slice(1)
}

const config = getConfig(configPath ?? DEFAULT_CONFIG_PATH)

switch (argv._[0] as (typeof EXPECTED_COMMANDS)[number]['command']) {
  case 'dev': {
    console.log('Dev mode')
    break
  }
  case 'version': {
    console.log(await getVersion(argv))
    break
  }
  case 'build': {
    console.log('TODO')
    setupBuild(config)
    break
  }
  default: {
    if (argv.help) {
      console.log(getHelp())
    } else {
      console.warn(
        `Valid command not provided, valid commands and flags:\n\n${getHelp()}`
      )
    }
  }
}
