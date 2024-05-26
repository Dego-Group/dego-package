import { Compiler } from 'webpack'

import fs from 'fs'
import path from 'path'
import minifier from 'html-minifier'
import { z } from 'zod'
import { execSync } from 'child_process'
import { degoPackageRootPath } from '../helpers.mjs'
const minify = minifier.minify

// schema for options object
const schema = z.object({
  pagesFolder: z.string(),
  srcFolder: z.string(),
  out: z.string(),
  htmlTemplateOverrideFile: z.string().optional(),
  ssg: z.boolean().default(false),
})

type Options = z.infer<typeof schema>

export default class DegoBuild {
  options: Options
  constructor(options: Options) {
    const result = schema.parse(options)

    this.options = result
  }

  apply(compiler: Compiler) {
    const pluginName = DegoBuild.name
    const { webpack } = compiler
    const { Compilation } = webpack
    const { RawSource } = webpack.sources
    const defaultHTMLTemplatePath =
      degoPackageRootPath + '\\defaultTemplate.html'

    const nodeOutputPath = path.resolve(this.options.out, './prebuild')
    if (!fs.existsSync(nodeOutputPath)) {
      fs.mkdirSync(nodeOutputPath, { recursive: true })
    }

    const nodeManifest = path.resolve(nodeOutputPath, './manifest.json')

    compiler.hooks.done.tap(pluginName, stats => {
      if (!this.options.ssg) return
      const manifest = stats.toJson({ chunkOrigins: true }).chunks

      if (!manifest) throw new Error('Webpack manifest not found!')

      const outputData = manifest
        .map(m => {
          if (!m.origins) return
          const firstOrigin = m.origins[0]
          return firstOrigin
            ? {
                location: path.resolve(
                  this.options.srcFolder,
                  firstOrigin.loc!
                ),
                id: m.id,
              }
            : null
        })
        .filter(item => item !== null) // Filter out null entries

      fs.writeFileSync(nodeManifest, JSON.stringify(outputData, null, 2))
    })

    compiler.hooks.thisCompilation.tap(pluginName, compilation => {
      if (this.options.ssg) return

      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        () => {
          const templateHTML = fs.readFileSync(
            this.options.htmlTemplateOverrideFile ?? defaultHTMLTemplatePath,
            'utf-8'
          )

          const template = templateHTML.replace(/\$\{script\}/g, '/a.js')

          const basePath = this.options.pagesFolder
          const allFilePaths = getFilesRecursively(basePath)

          const manifest = JSON.parse(
            fs.readFileSync(nodeManifest, {
              encoding: 'utf-8',
            })
          ) as
            | {
                location: string
                id: string
              }[]
            | undefined

          if (!manifest) throw new Error('No manifest file found!')

          const ssgCSSPath = path.resolve(nodeOutputPath, './ssg.css')

          const hasRootCSS = fs.existsSync(ssgCSSPath)

          for (const filePath of allFilePaths) {
            const data = renderHtml(
              nodeOutputPath,
              filePath.slice(0, -3).replace('\\', '/')
            )

            const newHtml = editInnerHtml(
              template,
              data.rootElementId,
              data.stringHtml
            )

            const formattedPath = path.resolve(
              this.options.pagesFolder,
              `./${filePath}`
                .replaceAll('\\', '/')
                .replace('.ts', '')
                .replace('/index', '')
                .trim()
            )

            const details = manifest.filter(
              v => v.location === formattedPath
            )[0]

            if (!details) {
              console.warn('File not found in manifest! Path: ' + formattedPath)
              continue
            }

            const cssPath = path.resolve(nodeOutputPath, `./${details.id}.css`)

            const hasCSS = fs.existsSync(cssPath)

            const metaAdded = addContentToHead(newHtml, [
              ...data.headElements,
              hasCSS
                ? `<style>${fs.readFileSync(cssPath, {
                    encoding: 'utf8',
                  })}</style>`
                : '',
              hasRootCSS
                ? `<style>${fs.readFileSync(ssgCSSPath, {
                    encoding: 'utf8',
                  })}</style>`
                : '',
            ])

            const newFilePath = filePath.endsWith('index.ts')
              ? filePath.replace(/\.ts$/, '.html')
              : filePath.replace(/\.ts$/, '') + '/index.html'

            try {
              compilation.emitAsset(
                newFilePath,
                new RawSource(
                  minify(metaAdded ?? '', {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    decodeEntities: true,
                    html5: true,
                    minifyCSS: false,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeEmptyAttributes: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                  })
                )
              )
            } catch (error) {
              console.error(`\x1b[41mFailed to hydrate at ${filePath}.\x1b[0m`)
            }
          }
        }
      )
    })
  }
}

function renderHtml(out: string, route = '') {
  try {
    const regex =
      /--_DEGO_SSG_OUTPUT_START--\n(?<content>(?:.|\n)*)--_DEGO_SSG_OUTPUT_END--/g

    const result = utf8Decode(
      execSync(`node ${path.resolve(out, './ssg.bundle.js')} ${route}`)
    )

    const match = regex.exec(result)

    if (!match?.groups || !match?.groups.content) {
      throw new Error('Could not found Dego SSG output!')
    }

    return JSON.parse(match.groups.content)
  } catch (error) {
    console.error(error)
    console.error(`\x1b[41mFailed to hydrate at ${route}.\x1b[0m`)

    return {
      stringHtml: `<div>Hydration Failed<div>`,
      headElements: [],
      rootElementId: 'root', // Assume root if it failed
    }
  }
}

function utf8Decode(buffer: Buffer) {
  const decoder = new TextDecoder('utf-8')
  return decoder.decode(buffer)
}

function editInnerHtml(html: string, id: string, newInnerHtml: string) {
  const regex = new RegExp(
    `(<[^>]+ id="${id}"[^>]*>)([\\s\\S]*?)(</[^>]+>)`,
    'i'
  )

  const modifiedHtml = html.replace(regex, `$1${newInnerHtml}$3`)

  return modifiedHtml
}

function addContentToHead(html: string, newContent: string[]) {
  const headIndex = html.indexOf('<head>') + 6

  if (headIndex !== -1) {
    const modifiedHtml =
      html.substring(0, headIndex) +
      newContent.reduce((final, current) => ` ${final} ${current} `) +
      html.substring(headIndex)

    return modifiedHtml
  }
}

function getFilesRecursively(
  directoryPath: string,
  basePath = directoryPath
): string[] {
  const filePaths = []

  const files = fs.readdirSync(directoryPath)
  for (const file of files) {
    if (file.startsWith('_')) continue

    const absolutePath = path.join(directoryPath, file)
    if (fs.statSync(absolutePath).isDirectory()) {
      filePaths.push(...getFilesRecursively(absolutePath, basePath))
    } else if (file.endsWith('.ts')) {
      filePaths.push(path.relative(basePath, absolutePath))
    } else {
      continue
    }
  }

  return filePaths
}
