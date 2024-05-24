//@ts-ignore

import { startServer } from '../serve/serve.mts'

const port = Number.parseInt(process.argv[2] ?? 3000)

if (Number.isNaN(port))
  throw new Error('Port is invalid, expected first arg to be a valid port.')

startServer(port)
