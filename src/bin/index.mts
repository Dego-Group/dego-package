#!/usr/bin/env node

import { DEFAULT_CONFIG_PATH, getConfig } from './config.mjs'

import { getHelp } from './help.mjs'
import { getVersion } from './version.mjs'
import { setupBuild } from './build/build.mjs'
import yargs from 'yargs'
import { startServer } from './serve/serve.mjs'
import startDevServer from './serve/dev-serve.mjs'
import { create } from './create/create.mjs'

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
  {
    command: 'serve',
    explanation:
      'Runs the built Dego code located in your `outDir` (dego.config.js)',
  },
  {
    command: 'create',
    explanation:
      'Creates a new Dego project, automatically generates required and recommended files.',
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
  force: {
    type: 'boolean',
    default: false,
    alias: ['f'],
    description:
      'Attempt to force a command, only specific commands support this.',
  },
} as const

export const argv = yargs(process.argv.slice(2))
  .options(OPTIONS)
  .help(false)
  .version(false)
  .parseSync()

const config = await getConfig(argv.config ?? DEFAULT_CONFIG_PATH)

switch (argv._[0] as (typeof EXPECTED_COMMANDS)[number]['command']) {
  case 'serve': {
    startServer(config.port, config.outDir)
    break
  }
  case 'dev': {
    setupBuild(config, true)
    startDevServer(config)
    break
  }
  case 'version': {
    console.log(await getVersion(argv))
    break
  }
  case 'build': {
    setupBuild(config)
    break
  }
  case 'create': {
    create(argv.force)
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
