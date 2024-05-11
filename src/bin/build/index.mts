import { DegoConfiguration } from '../config.mjs'
import ssgWebpackConfig from './webpack.sgg.config.mjs'
import webpack from 'webpack'

// import webpackConfig from './webpack.config.mjs'

/**
 * [Webpack Documentation (Node Interface)](https://webpack.js.org/api/node/)
 */
export function setupBuild(config: DegoConfiguration, devServer = false) {
  console.log(`Building...`)
  const webpackInstance = webpack(ssgWebpackConfig(config))
  webpackInstance.run((err, stats) => {
    if (err) {
      console.error(err.stack || err)
      if ('details' in err) {
        console.error(err.details)
      }
      return
    }

    if (!stats) {
      return console.error('No stats object returned after webpack build!')
    }

    const info = stats.toJson()

    if (stats.hasErrors()) {
      console.error(info.errors)
    }

    if (stats.hasWarnings()) {
      console.warn(info.warnings)
    }

    console.log(stats.compilation.assets)
    console.log('SSG pre-build complete.')
  })

  webpackInstance.close(err => {
    if (err) {
      console.error(
        'There has been an issue closing the Webpack Instance:' + err
      )
    }
  })
}
