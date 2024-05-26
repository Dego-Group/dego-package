import { cp, readdirSync } from 'fs'
import { Color, color, degoPackageRootPath } from '../helpers.mjs'
import { resolve } from 'path'

export function create(isForced: boolean) {
  console.log(color('Generating default Dego project...', Color.Blue))
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

  const defaultProjectPath = resolve(degoPackageRootPath, './default-project')

  cp(defaultProjectPath, rootDir, { recursive: true }, err => {
    if (err) {
      console.error(
        color(
          '\nThere was an error while generating project. ' + err,
          Color.Red
        )
      )

      return
    }

    console.log(
      color('Default project created!\n', Color.Green) +
        color('Steps to continue:', Color.White) +
        color(
          '1. Run `npm i` or `pnpm i`.\n2. Run `npm run dev`.',
          Color.Cyan
        ) +
        color('\nGet your app ready for production:', Color.White) +
        color(
          '1. Run `npm run build`.\n2. Run `npm run serve` to serve app in production mode.\n',
          Color.Cyan
        )
    )
  })
}
