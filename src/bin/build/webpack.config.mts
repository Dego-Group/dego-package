import path from 'path'
import DegoBuild from './DegoPlugin.mjs'
import CopyPlugin from 'copy-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import { Configuration } from 'webpack'
import { DegoConfiguration } from '../config.mjs'
import { SWCOptions, SWCOptionsDev } from './swc.config.mjs'
import { existsSync } from 'fs'

let hasPublic: boolean | undefined = undefined

export function getPlugins(
  out: string,
  config: DegoConfiguration,
  ssg: boolean
) {
  hasPublic = hasPublic === undefined ? existsSync(config.publicDir) : hasPublic

  const plugins: any[] = [
    new MiniCssExtractPlugin(),
    new DegoBuild({
      pagesFolder: config.pagesDir,
      htmlTemplateOverrideFile: config.htmlTemplate,
      out: config.outDir,
      ssg,
    }),
  ]

  if (hasPublic) {
    plugins.push(
      new CopyPlugin({
        patterns: [{ from: config.publicDir, to: out }],
      })
    )
  }

  return plugins
}

export default function getWebpackConfig(
  config: DegoConfiguration,
  production: boolean
) {
  const node_modules = path.resolve(
    process.argv[1].split('\\').slice(0, -4).join('\\'),
    './node_modules'
  )
  const out = path.resolve(config.outDir, './web')
  return {
    target: 'web',
    entry: {
      app: config.root,
    },
    output: {
      filename: '[name].bundle.js',
      chunkFilename: '[id].bundle.js',
      path: out,
    },
    resolve: {
      extensions: ['', '.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.m?ts$/,
          exclude: /(node_modules)/,
          use: {
            loader: path.resolve(node_modules, 'swc-loader'),
            options: production ? SWCOptions : SWCOptionsDev,
          },
        },
        {
          test: /\.css$/i,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: path.resolve(node_modules, 'css-loader'),
            },
          ],
        },
      ],
    },
    plugins: getPlugins(out, config, false),
    mode: production ? 'production' : 'development',
    watchOptions: {
      poll: 1000,
    },
    devServer: {
      hot: true,
      port: 3000,
      watchFiles: [`${config.publicDir}/**/*`, `${config.srcDir}/**/*`],
    },
    optimization: {
      minimizer: ['...', new CssMinimizerPlugin()],
      splitChunks: {
        chunks: 'async',
        minSize: 20000,
        minRemainingSize: 0,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        enforceSizeThreshold: 50000,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
    },
  } satisfies Configuration & { devServer: any }
}
