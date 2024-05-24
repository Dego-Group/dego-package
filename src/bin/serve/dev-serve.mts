import liveReload from 'livereload'
import { DegoConfiguration } from '../config.mjs'
import { getApp } from './serve.mjs'

export default function startDevServer(config: DegoConfiguration) {
  const app = getApp(config.outDir, config.liveReloadPort)

  const liveReloadServer = liveReload.createServer({
    port: config.liveReloadPort,
  })

  const server = app.listen(config.port, () => {
    liveReloadServer.watch(config.outDir)
    console.log(`Dego web server started at http://localhost:${config.port}/`)
  })

  return () => {
    server.close()
  }
}
