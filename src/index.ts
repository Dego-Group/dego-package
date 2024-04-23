#!/usr/bin/env node

export declare interface Configuration {
  srcDir: string
  pagesDir: string
  outDir: string
}

export * from './dego/timing'
export * from './dego/types'
export * from './dego/html'
export * from './dego/helpers'
export * from './dego/attributes'
export * from './dego/components/link'
export * from './dego/hooks/fetch'
export * from './dego/hooks/globalStore'
export * from './dego/hooks/globalValue'
export * from './dego/hooks/globals'
export * from './dego/hooks/hook-helper'
export * from './dego/hooks/render-queue'
export * from './dego/hooks/store'
export * from './dego/hooks/value'
export * from './dego/hooks/watch'
export * from './dego/render'
