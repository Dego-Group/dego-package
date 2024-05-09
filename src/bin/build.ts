import { Configuration } from '..'
import webpack from 'webpack'

/**
 * [Webpack Documentation (Node Interface)](https://webpack.js.org/api/node/)
 */
export function setupBuild(config: Configuration) {
  console.log('Starting build...')
  console.log(webpack)
  // const webpackInstance = webpack({})
  // webpackInstance.run((err, stats) => {
  //   if (err) {
  //     console.error(err.stack || err)
  //     if ('details' in err) {
  //       console.error(err.details)
  //     }
  //     return
  //   }

  //   if (!stats) {
  //     return console.error('No stats object returned after webpack build!')
  //   }

  //   const info = stats.toJson()

  //   if (stats.hasErrors()) {
  //     console.error(info.errors)
  //   }

  //   if (stats.hasWarnings()) {
  //     console.warn(info.warnings)
  //   }

  //   console.log(stats)
  // })

  // webpackInstance.close(err => {
  //   if (err) {
  //     console.error(
  //       'There has been an issue closing the Webpack Instance:' + err
  //     )
  //   }
  // })
}
