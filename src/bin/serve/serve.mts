import express from 'express'
import type { Express } from 'express'
import { existsSync, promises, readFileSync } from 'fs'
import { isAbsolute, relative, resolve } from 'path'

export function getApp(
  outDir: string,
  reload: false | number = false
): Express {
  const app = express()

  app.get('*', async (req, res) => {
    try {
      const basePath = resolve(outDir, './static', `.${req.url}`)
      const relativePath = relative(outDir, basePath)
      const isAllowed =
        relativePath &&
        !relativePath.startsWith('..') &&
        !isAbsolute(relativePath)

      if (!isAllowed) {
        res.status(403)
        res.send('Forbidden')
        return
      }

      if (req.url.indexOf('.') > -1) {
        const stats = await promises.stat(basePath)

        if (stats.isFile()) {
          res.send(await promises.readFile(basePath))
          return
        }

        res.status(404)
        res.send()
        return
      }

      const components = ['<!DOCTYPE html><html lang="en">']

      if (reload) {
        components.push(
          `<script>document.write('<script src="http://'+(location.host||'localhost').split(':')[0]+':${reload}/livereload.js?snipver=1"></'+'script>')</script>`
        )
      }

      const altPaths = [
        resolve(basePath + '.html'),
        resolve(basePath + '/index.html'),
      ]

      if (existsSync(altPaths[1])) {
        const file = readFileSync(altPaths[1], { encoding: 'utf8' })
        components.push(file)
        components.push('</html>')
      } else {
        components.push(`<body>TODO: 404.ts Support</body>`)
        components.push('</html>')
        res.status(404)
      }

      res.send(components.reduce((final, current) => final + current))
    } catch (e) {
      res.status(500)
      res.send('An internal server error has occurred!')

      console.error(e)
    }
  })

  return app
}

export function startServer(port: number, outDir = '../static') {
  const app = getApp(outDir)

  const server = app.listen(port, () => {
    console.log(`Dego web server started at http://localhost:${port}/`)
  })

  return () => {
    server.close()
  }
}
