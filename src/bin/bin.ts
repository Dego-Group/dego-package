#!/usr/bin/env node

import { getConfig } from './config'

try {
  // TODO: Allow custom config path
  const config = getConfig()
  console.log('Hello! This is your config:', config)
} catch (error: any) {
  console.error(`Error loading config file: ${error.message}`)
}
