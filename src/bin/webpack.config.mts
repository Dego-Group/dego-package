const path = require('path')
const DegoBuild = require('./DegoPlugin')
const CopyPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

const out = path.resolve(__dirname, 'out/web')

/** @type {import('webpack').Configuration} */
module.exports = {
  target: 'web',
  entry: {
    app: './src/root.ts',
  },
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[id].bundle.js',
    path: out, // Output directory
  },
  resolve: {
    plugins: [new TsconfigPathsPlugin({ mainFields: ['app'] })],
  },
  module: {
    rules: [
      {
        test: /\.m?ts$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'swc-loader',
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
      patterns: [{ from: 'public', to: out }],
    }),
    new MiniCssExtractPlugin(),
    new DegoBuild({
      pagesFolder: path.resolve(__dirname, 'src/pages'),
      htmlTemplateOverrideFile: path.resolve(__dirname, 'template.html'),
      outputFilePathForSSG: out,
      ssg: false,
    }),
  ],
  mode: 'development',
  watchOptions: {
    poll: 1000,
  },
  devServer: {
    hot: true,
    port: 3000,
    watchFiles: ['public/**/*', 'src/**/*'],
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
}
