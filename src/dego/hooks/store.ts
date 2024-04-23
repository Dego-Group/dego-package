import { HookHelper } from './hook-helper'

export class StoreData<T> {
  value: T
  constructor(value: T) {
    this.value = value
  }
}

export function useStore<T>(defaultValue?: T): {
  value: T
} {
  if (window.isNode) {
    return { value: defaultValue as T }
  }

  const hook = new HookHelper<Info<T>>()

  let info

  const saved = hook.getMemory()
  if (saved) {
    info = saved
  } else {
    info = new StoreData(defaultValue!)
    hook.setMemory(info)
  }

  return info
}

type Info<T> = {
  value: T
}
