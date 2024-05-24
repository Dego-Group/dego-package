import path from 'path'
import { z } from 'zod'

const srcDefault = './src'
const publicDefault = './public'

const configSchema = z.object({
  srcDir: z.string().default(srcDefault),
  outDir: z.string().default('./.dego'),
  publicDir: z.string().default(publicDefault),
  pagesDir: z.string().default(`${srcDefault}/pages`),
  root: z.string().default(`${srcDefault}/root.ts`),
  port: z.number().default(3000),
  liveReloadPort: z.number().default(35729),
  watch: z
    .union([z.string(), z.array(z.string())])
    .default([srcDefault, publicDefault]),
  htmlTemplate: z.string().optional(),
})

// For inline documentation
interface ConfigOptions {
  /**
   * The source directory of your project, where your source code resides. Defaults to 'src'.
   */
  srcDir: string
  /**
   * The output directory for your compiled code, where the build process will place the generated files. Defaults to '.dego'.
   */
  outDir: string
  /**
   * The public directory for your static assets, containing files like images, fonts, or stylesheets that are directly accessible during runtime. Defaults to 'public'.
   */
  publicDir: string
  /**
   * The directory containing your page components, which define the building blocks of your application's UI. Defaults to `src/pages`.
   */
  pagesDir: string
  /**
   * The root file of your application, the entry point for Dego's execution. Defaults to `src/root.ts`.
   */
  root: string
  /**
   * The port on which the Dego development server listens for incoming connections. Defaults to `3000`.
   */
  port: number
  /**
   * The port on which the Dego development server handles live reloading the browser. Defaults to `35729`, do not change unless you know what you are doing!
   */
  liveReloadPort: number
  /**
   * A string or an array of strings specifying directories to watch for changes during development. The server will trigger a rebuild when changes are detected in these directories. Defaults to watching both 'src' and 'public' directories.
   */
  watch: string | string[]
  /**
   * Path to a custom HTML template to use for the build process.
   */
  htmlTemplate?: string
}

export const DEFAULT_CONFIG_PATH = './dego.config.js'

let relativePath = DEFAULT_CONFIG_PATH

export type DegoConfiguration = z.infer<typeof configSchema> & ConfigOptions

export async function getConfig(
  configPath?: string
): Promise<DegoConfiguration> {
  try {
    if (configPath) relativePath = configPath

    const userConfig = await import(
      `file://${path.resolve(process.cwd(), relativePath)}`
    )

    const parsed = configSchema.parse(userConfig.default)

    Object.entries(parsed).map(([key, value]) => {
      if (typeof value === 'string') {
        ;(parsed as any)[key] = path.resolve(process.cwd(), value)
      }
    })

    return parsed
  } catch (error: any) {
    throw console.error(
      `Error loading config file. Path must be within project root. ${error.message}`
    )
  }
}
