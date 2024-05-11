import path from 'path'
import DegoBuild from './DegoPlugin.mjs'
import CopyPlugin from 'copy-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import { Configuration } from 'webpack'
import { DegoConfiguration } from '../config.mjs'
import { SWCOptions } from './swc.config.mjs'

export default function getWebpackConfig(config: DegoConfiguration) {
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
      modules: [config.srcDir, 'node_modules'],
      extensions: ['', '.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.m?ts$/,
          exclude: /(node_modules)/,
          use: {
            loader: 'swc-loader',
            options: SWCOptions,
          },
        },
        {
          test: /\.css$/i,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: 'css-loader',
            },
          ],
        },
      ],
    },
    plugins: [
      new CopyPlugin({
        patterns: [{ from: path.resolve(process.cwd(), './public'), to: out }],
      }),
      new MiniCssExtractPlugin(),
      new DegoBuild({
        pagesFolder: config.pagesDir,
        htmlTemplateOverrideFile: config.htmlTemplate,
        out: config.outDir,
        ssg: false,
      }),
    ],
    mode: 'production',
    watchOptions: {
      poll: 1000,
    },
    devServer: {
      hot: true,
      port: 3000,
      watchFiles: ['public/**/*', `${config.srcDir}/**/*`],
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
