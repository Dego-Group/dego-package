import path from 'path'
import { Configuration } from 'webpack'
import { DegoConfiguration } from '../config.mjs'
import getWebpackConfig from './webpack.config.mjs'
import { degoPackageRootPath } from '../helpers.mjs'
import nodeExternals from 'webpack-node-externals'

export default function getWebpackServerConfig(
  config: DegoConfiguration,
  production: boolean
) {
  const node_modules = path.resolve(degoPackageRootPath, './node_modules')
  const out = path.resolve(config.outDir, './')
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
    output: { filename: '[name].js', path: out },
    plugins: undefined,
    externals: [nodeExternals()],
    optimization: { minimize: false },
    resolve: {
      ...normalConfig.resolve,
      modules: [node_modules, 'node_modules'],
    },
  } satisfies Configuration
}
