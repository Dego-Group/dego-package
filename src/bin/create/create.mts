import { cpSync, existsSync, readdirSync, writeFileSync } from 'fs'
import { Color, color, degoPackageRootPath, utf8Decode } from '../helpers.mjs'
import { resolve } from 'path'
import { getPackageInfo } from '../version.mjs'
import { execSync } from 'child_process'

export function create(isForced: boolean) {
  console.log(color('Generating default Dego project...', Color.Blue))

  try {
    const rootDir = process.cwd()

    const files = readdirSync(rootDir)

    if (files.length > 0 && !isForced) {
      console.log(
        color(
          'Directory not empty! Add -f flag to force or pick an empty directory.\nNOTE: Forcing will overwrite any overlapping files.\nDirectory: ' +
            rootDir,
          Color.Red
        )
      )

      return
    }

    const hasPnpm = checkForPnpm()

    function checkForPnpm() {
      try {
        return !!Number.parseInt(utf8Decode(execSync('pnpm -v')).split('.')[0])
      } catch {
        return false
      }
    }

    if (!existsSync(degoPackageRootPath)) {
      console.log(color('Installing `dego-package`...', Color.Blue))

      // Check if pnpm is installed
      if (hasPnpm) {
        console.log(
          color('Detected `pnpm`, using `pnpm` to install...', Color.Green)
        )

        execSync('pnpm install dego-package')
        console.log(color('Installed `dego-package`!', Color.Green))
      } else {
        execSync('npm install dego-package')
        console.log(color('Installed `dego-package`!', Color.Green))
      }
    }

    const defaultProjectPath = resolve(degoPackageRootPath, './default-project')
    cpSync(defaultProjectPath, rootDir, { recursive: true })

    const packagePath = resolve(rootDir, './package.json')

    const packageJson = {
      name: 'default-dego-app',
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'dego-package dev',
        build: 'dego-package build',
        serve: 'dego-package serve',
      },
      dependencies: {
        'dego-package': `^${getPackageInfo().version}`,
      },
      devDependencies: {
        typescript: '^5',
      },
    }

    writeFileSync(packagePath, JSON.stringify(packageJson, null, 2), {
      encoding: 'utf8',
    })

    console.log('\n' + utf8Decode(execSync(hasPnpm ? 'pnpm i' : 'npm i')))

    console.log(
      color('Default project created!\n', Color.Green) +
        color('Steps to continue:', Color.White) +
        color('Run `npm run dev` and get to building!', Color.Cyan) +
        color('\nGet your app ready for production:', Color.White) +
        color(
          '1. Run `npm run build`.\n2. Run `npm run serve` to serve app in production mode.\n',
          Color.Cyan
        )
    )
  } catch (error) {
    console.log('There was a error creating the default project!')
    console.log(
      'Path of default-project:',
      resolve(degoPackageRootPath, './default-project')
    )
    console.log('Path of dego package:', degoPackageRootPath)
    console.log(error)
  }
}
