import path from 'path'
import DegoBuild from './DegoPlugin.mjs'
import CopyPlugin from 'copy-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { Configuration } from 'webpack'
import { DegoConfiguration } from '../config.mjs'
import getWebpackConfig from './webpack.config.mjs'

export default function getWebpackSSGConfig(config: DegoConfiguration) {
  const out = path.resolve(config.outDir, './node')
  return {
    ...getWebpackConfig(config),
    target: 'node',
    entry: {
      ssg: config.root,
    },
    plugins: [
      new CopyPlugin({
        patterns: [{ from: path.resolve(process.cwd(), 'public'), to: out }],
      }),
      new MiniCssExtractPlugin(),
      new DegoBuild({
        pagesFolder: config.pagesDir,
        htmlTemplateOverrideFile: config.htmlTemplate,
        out: config.outDir,
        ssg: true,
      }),
    ],
    devServer: undefined,
  } satisfies Configuration & { devServer: any }
}
