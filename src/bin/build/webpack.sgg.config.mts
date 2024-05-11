import path from 'path'
import { Configuration } from 'webpack'
import { DegoConfiguration } from '../config.mjs'
import getWebpackConfig, { getPlugins } from './webpack.config.mjs'

export default function getWebpackSSGConfig(
  config: DegoConfiguration,
  production: boolean
) {
  const out = path.resolve(config.outDir, './node')
  const normalConfig = getWebpackConfig(config, production)
  return {
    ...normalConfig,
    target: 'node',
    entry: {
      ssg: config.root,
    },
    output: { ...normalConfig.output, path: out },
    plugins: getPlugins(out, config, true),
    devServer: undefined,
  } satisfies Configuration & { devServer: any }
}
