//@ts-ignore

import { startServer } from '../serve/serve.mts'

const port = Number.parseInt(process.argv[2])

if (Number.isNaN(port)) throw new Error('Port is invalid')

startServer(port)
