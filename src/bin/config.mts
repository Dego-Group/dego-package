import path from 'path'
import { z } from 'zod'

const srcDefault = './src'

const configSchema = z.object({
  srcDir: z.string().default(srcDefault),
  outDir: z.string().default('./.dego'),
  publicDir: z.string().default('./public'),
  pagesDir: z.string().default(`${srcDefault}/pages`),
  root: z.string().default(`${srcDefault}/root.ts`),
  port: z.number().default(3000),
  htmlTemplate: z.string().optional(),
})

export const DEFAULT_CONFIG_PATH = './dego.config.js'

let relativePath = DEFAULT_CONFIG_PATH

export type DegoConfiguration = z.infer<typeof configSchema>

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
