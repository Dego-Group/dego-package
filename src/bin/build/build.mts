import { DegoConfiguration } from '../config.mjs'
import getWebpackConfig from './webpack.config.mjs'
import getWebpackSSGConfig from './webpack.sgg.config.mjs'
import getWebpackServerConfig from './webpack.server.config.mjs'
import webpack from 'webpack'

// import webpackConfig from './webpack.config.mjs'

/**
 * [Webpack Documentation (Node Interface)](https://webpack.js.org/api/node/)
 * [Webpack Dev Server Documentation](https://webpack.js.org/api/webpack-dev-server/#start)
 */
export function setupBuild(config: DegoConfiguration, devServer = false) {
  console.log(`\nBuilding pre-render app and web server...\n`)

  // Web server compilation
  const serverWebpackInstance = webpack(
    getWebpackServerConfig(config, !devServer)
  )

  serverWebpackInstance.run((err, stats) => {
    if (hasErrors(err, stats)) return
    console.log('Dego web server built!')

    serverWebpackInstance.close(err => {
      if (err) {
        return console.error(
          'There has been an issue closing the Webpack Instance:' + err
        )
      }
    })
  })

  // Node/SSG compilation
  const ssgWebpackInstance = webpack(getWebpackSSGConfig(config, !devServer))

  ssgWebpackInstance.run((err, stats) => {
    if (hasErrors(err, stats)) return
    console.log('Dego pre-render app built!')

    ssgWebpackInstance.close(err => {
      if (err) {
        return console.error(
          'There has been an issue closing the Webpack Instance:' + err
        )
      }

      console.log('\nBuilding web app...\n')

      // Web/Static compilation
      const webpackInstance = webpack(getWebpackConfig(config, !devServer))
      webpackInstance.run((err, stats) => {
        if (hasErrors(err, stats)) return
        console.log('Dego build complete!')

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
    const ignoreWarningIndex = info.warnings!.findIndex(
      warning =>
        warning.message ===
        'Critical dependency: the request of a dependency is an expression'
    )

    info.warnings!.splice(ignoreWarningIndex, 1)

    if (info.warnings!.length > 0) console.warn(info.warnings)

    return false
  }

  console.log(stats.compilation.assets)
  return false
}
