import express from 'express'

export function startServer(port: number, outDir = '../static') {
  const app = express()

  app.get('/', (req, res) => {
    res.send('<div>Hello</div>')
  })

  const server = app.listen(port, () => {
    console.log(`Dego listening on port ${port}`)
  })

  return () => {
    server.close()
  }
}
