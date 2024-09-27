#!/usr/bin/env node
export * from './dego/timing'
export * from './dego/types'
export * from './dego/html'
export * from './dego/helpers'
export * from './dego/attributes'
export * from './dego/render'

import { DegoConfiguration } from './bin/config.mjs'

export type Configuration = Partial<DegoConfiguration>
