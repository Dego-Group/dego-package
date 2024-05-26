import path from 'path'
import { Configuration } from 'webpack'
import { DegoConfiguration } from '../config.mjs'
import getWebpackConfig, { getPlugins } from './webpack.config.mjs'

export default function getWebpackSSGConfig(
  config: DegoConfiguration,
  production: boolean
) {
  const out = path.resolve(config.outDir, './prebuild')
  const normalConfig = getWebpackConfig(config, production)
  return {
    ...normalConfig,
    target: 'node',
    entry: {
      ssg: config.root,
    },
    output: {
      filename: '[name].bundle.js',
      chunkFilename: '[id].bundle.js',
      path: out,
    },
    plugins: getPlugins(out, config, true),
  } satisfies Configuration
}
