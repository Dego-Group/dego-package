const path = require('path')

const out = path.resolve(__dirname, 'dist')

/** @type {import('webpack').Configuration} */
module.exports = {
  target: 'node',
  entry: {
    bin: './src/bin.ts',
    index: './src/index.ts',
  },
  output: {
    filename: '[name].js',
    path: out,
    library: {
      name: 'dego',
      type: 'umd',
    },
  },
  module: {
    rules: [
      {
        test: /\.m?ts$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'ts-loader',
        },
      },
    ],
  },
  mode: 'development',
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['', '.ts', '.js'],
  },
  watchOptions: {
    poll: 1000,
  },
  optimization: {
    usedExports: false,
  },
}
