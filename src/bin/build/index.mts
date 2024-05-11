import { DegoConfiguration } from '../config.mjs'
import getWebpackConfig from './webpack.config.mjs'
import ssgWebpackConfig from './webpack.sgg.config.mjs'
import webpack from 'webpack'

// import webpackConfig from './webpack.config.mjs'

/**
 * [Webpack Documentation (Node Interface)](https://webpack.js.org/api/node/)
 * [Webpack Dev Server Documentation](https://webpack.js.org/api/webpack-dev-server/#start)
 */
export function setupBuild(config: DegoConfiguration, devServer = false) {
  console.log(`Building...`)
  const ssgWebpackInstance = webpack(ssgWebpackConfig(config, !devServer))
  ssgWebpackInstance.run((err, stats) => {
    if (hasErrors(err, stats)) return
    console.log('SSG pre-build complete.')

    ssgWebpackInstance.close(err => {
      if (err) {
        return console.error(
          'There has been an issue closing the Webpack Instance:' + err
        )
      }

      const webpackInstance = webpack(getWebpackConfig(config, !devServer))
      webpackInstance.run((err, stats) => {
        if (hasErrors(err, stats)) return
        console.log('Build complete!')

        ssgWebpackInstance.close(err => {
          if (err) {
            return console.error(
              'There has been an issue closing the Webpack Instance:' + err
            )
          }
        })
      })
    })
  })
}

function hasErrors(err: Error | null, stats: webpack.Stats | undefined) {
  if (err) {
    console.error(err.stack || err)
    if ('details' in err) {
      console.error(err.details)
    }
    return true
  }

  if (!stats) {
    console.error('No stats object returned after webpack build!')
    return true
  }

  const info = stats.toJson()

  if (stats.hasErrors()) {
    console.error(info.errors)
    return true
  }

  if (stats.hasWarnings()) {
    console.warn(info.warnings)
    return true
  }

  console.log(stats.compilation.assets)
  return false
}
