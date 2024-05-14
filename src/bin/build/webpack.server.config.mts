import path from 'path'
import { Configuration } from 'webpack'
import { DegoConfiguration } from '../config.mjs'
import getWebpackConfig from './webpack.config.mjs'
import { degoPackageRootPath } from '../helpers.mjs'

export default function getWebpackServerConfig(
  config: DegoConfiguration,
  production: boolean
) {
  const node_modules = path.resolve(degoPackageRootPath, './node_modules')
  const out = path.resolve(config.outDir, './server')
  const normalConfig = getWebpackConfig(config, production)
  return {
    ...normalConfig,
    target: 'node',
    entry: {
      server: path.resolve(
        degoPackageRootPath,
        './src/bin/server/start-server.mts'
      ),
    },
    output: { ...normalConfig.output, path: out },
    plugins: undefined,
    devServer: undefined,
    resolve: {
      ...normalConfig.resolve,
      modules: [node_modules, 'node_modules'],
    },
  } satisfies Configuration & { devServer: any }
}
