import path from 'path'
import DegoBuild from './DegoPlugin.mjs'
import CopyPlugin from 'copy-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import { Configuration } from 'webpack'
import webpack from 'webpack'
import { DegoConfiguration } from '../config.mjs'
import { SWCOptions, SWCOptionsDev } from './swc.config.mjs'
import { existsSync, readdirSync } from 'fs'
import { createRequire } from 'module'

let hasPublic: boolean | undefined = undefined

export function getPlugins(
  out: string,
  config: DegoConfiguration,
  ssg: boolean
) {
  hasPublic =
    hasPublic === undefined
      ? existsSync(config.publicDir) && readdirSync(config.publicDir).length > 0
      : hasPublic

  const plugins: any[] = [
    new MiniCssExtractPlugin(),
    new DegoBuild({
      pagesFolder: config.pagesDir,
      htmlTemplateOverrideFile: config.htmlTemplate,
      out: config.outDir,
      srcFolder: config.srcDir,
      ssg,
    }),
    new webpack.DefinePlugin({
      PAGES_DIR: JSON.stringify(config.pagesDir.replaceAll('\\', '/')),
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
  const require = createRequire(import.meta.url)
  const swcPath = require.resolve('swc-loader')
  const cssPath = require.resolve('css-loader')

  const out = path.resolve(config.outDir, './static')
  return {
    target: 'web',
    entry: {
      app: config.root,
    },
    output: {
      filename: 'a.js',
      chunkFilename: '[id].js',
      path: out,
    },
    resolve: {
      extensions: ['', '.ts', '.js', '.mts', '.mjs'],
    },
    module: {
      rules: [
        {
          test: /\.m?ts$/,
          exclude: /node_modules/,

          use: {
            loader: swcPath,
            options: production ? SWCOptions : SWCOptionsDev,
          },
        },
        {
          test: /\.css$/i,
          exclude: /node_modules/,

          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: cssPath,
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
  } satisfies Configuration
}
