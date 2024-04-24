#!/usr/bin/env node

import { getConfig } from './config'
import { readFileSync } from 'fs'
import yargs from 'yargs'

const argv = yargs(process.argv.slice(2))
  .options({
    config: { type: 'string' },
  })
  .parseSync()

let configPath = argv.config

if (configPath?.startsWith('.')) {
  configPath = configPath.slice(1)
}

const config = getConfig(configPath)

switch (argv._[0]) {
  case 'dev': {
    console.log('Dev mode')
    break
  }
  case 'version': {
    const packageJSONLocation =
      argv.$0.split('\\').slice(0, -2).join('\\') + '\\package.json'

    const headers = new Headers()
    headers.set(
      'Authorization',
      'Bearer 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'
    )
    headers.set('accept', 'application/vnd.github+json')

    const response = await await fetch(
      'https://api.github.com/repos/Hexy32/dego-package/contents/package.json',
      { headers }
    ).then(res => res.json())

    const remotePackageInfo = JSON.parse(
      Buffer.from(response.content, 'base64').toString('utf8')
    )

    const file = readFileSync(packageJSONLocation, { encoding: 'utf8' })
    const packageInfo = JSON.parse(file)
    if (remotePackageInfo.version !== packageInfo.version) {
      console.log(
        `Dego is out of date!\nYour version: ${packageInfo.version}\nCurrent version: ${remotePackageInfo.version}`
      )
    } else {
      console.log(`Dego up to date!\nVersion:${packageInfo.version}`)
    }
    break
  }
}
