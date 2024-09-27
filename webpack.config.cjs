const path = require('path')

const out = path.resolve(__dirname, 'dist/webpack/dego')

/** @type {import('webpack').Configuration} */
module.exports = {
  target: 'node',
  entry: {
    index: './src/index.ts',
    hooks: './src/hooks.ts',
    components: './src/components.ts',
  },
  output: {
    filename: '[name].js',
    path: out,
    library: {
      name: 'dego-package',
      type: 'umd',
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'ts-loader',
        },
      },
    ],
  },
  mode: 'production',
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['', '.ts', '.js'],
  },
  watchOptions: {
    poll: 1000,
  },
  optimization: {
    usedExports: true,
  },
}
