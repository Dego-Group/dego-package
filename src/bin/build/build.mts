import { DegoConfiguration } from '../config.mjs'
import getWebpackConfig from './webpack.config.mjs'
import getWebpackSSGConfig from './webpack.sgg.config.mjs'
import getWebpackServerConfig from './webpack.server.config.mjs'
import webpack from 'webpack'

let webServerReady: 'NO' | 'READY' | 'LONG_LOAD' | 'DONE' = 'NO'
const webServerLog = '\x1b[32m\nDego web server built!\x1b[0m'

/**
 * [Webpack Documentation (Node Interface)](https://webpack.js.org/api/node/)
 */
export function setupBuild(config: DegoConfiguration, devServer = false) {
  // Node/SSG compilation
  const ssgWebpackInstance = webpack(getWebpackSSGConfig(config, !devServer))

  if (devServer) {
    console.log('\x1b[34mBuilding...\x1b[0m')

    ssgWebpackInstance.watch({}, (err, stats) => {
      if (hasErrors(err, stats, true)) {
        throw new Error('There has been a compilation error:', err!)
      }

      console.log('\n\x1b[34mPre-render built.\x1b[0m')
    })

    // Web/Static compilation
    const webpackInstance = webpack(getWebpackConfig(config, !devServer))

    webpackInstance.watch({}, (err, stats) => {
      if (hasErrors(err, stats, true)) {
        throw new Error('There has been a compilation error:', err!)
      }

      console.log('\x1b[34mApp built.\x1b[0m\n')
      console.log('\x1b[32mWatching for changes...\x1b[0m\n')
    })

    return
  }

  console.log('\n--------------')
  console.log('\x1b[34mBuilding pre-render app and web server...\x1b[0m\n')

  // Web server compilation
  const serverWebpackInstance = webpack(
    getWebpackServerConfig(config, !devServer)
  )

  serverWebpackInstance.run((err, stats) => {
    if (hasErrors(err, stats)) return

    if (webServerReady === 'LONG_LOAD') {
      console.log(webServerLog)
    } else {
      webServerReady = 'READY'
    }

    serverWebpackInstance.close(err => {
      if (err) {
        return console.error(
          'There has been an issue closing the Webpack Instance:' + err
        )
      }
    })
  })

  // Node/SSG compilation continued
  ssgWebpackInstance.run((err, stats) => {
    if (hasErrors(err, stats)) return
    console.log('\x1b[32m\nDego pre-render app built!\x1b[0m')
    if (webServerReady === 'READY') {
      console.log(webServerLog)
      webServerReady = 'DONE'
    }
    console.log('--------------\n')

    ssgWebpackInstance.close(err => {
      if (err) {
        return console.error(
          'There has been an issue closing the Webpack Instance:' + err
        )
      }

      console.log('\n--------------')
      console.log(
        `\x1b[34mBuilding web app... ${
          webServerReady === 'NO' ? 'web server still building...' : ''
        }\x1b[0m\n`
      )

      // Web/Static compilation
      const webpackInstance = webpack(getWebpackConfig(config, !devServer))
      webpackInstance.run((err, stats) => {
        if (hasErrors(err, stats)) return

        if (webServerReady === 'READY') {
          console.log(webServerLog)
        } else if (webServerReady === 'NO') {
          webServerReady = 'LONG_LOAD'
          console.log('\n')
        }

        console.log('\x1b[32mDego web app built!\x1b[0m')
        console.log('--------------\n')

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

function hasErrors(
  err: Error | null,
  stats: webpack.Stats | undefined,
  devServer = false
) {
  if (err) {
    console.error(err.stack || err)
    if ('details' in err) {
      console.error(err.details)
    }
    return true
  }

  if (!stats) {
    console.error('No stats object returned after webpack build!')
    console.log('A Webpack error occurred!')
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

    if (info.warnings!.length > 0) {
      console.warn(info.warnings)
      console.log('A Webpack warning occurred!')
    }

    return false
  }

  if (!devServer) console.log(stats.compilation.assets)
  return false
}
