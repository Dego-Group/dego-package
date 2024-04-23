import { HookHelper } from './hook-helper'

export function useValue<T>(defaultValue?: T): [T, Setter<T>] {
  if (window.isNode) {
    return [defaultValue, () => {}] as unknown as [T, Setter<T>]
  }

  const hook = new HookHelper<Info<T>>()

  const info: Info<T> = hook.getMemory() ?? {
    setFunction: undefined,
    value: defaultValue!,
    initialLoad: true,
  }

  if (info.initialLoad && info.setFunction === undefined) {
    info.setFunction = newValue => {
      info.value = newValue

      hook.setMemory({ ...info, initialLoad: false })
      hook.requestReRender()

      return newValue
    }
  }

  return [info.value, info.setFunction!] as const
}

type Info<T> = {
  value: T
  setFunction: Setter<T> | undefined
  initialLoad: boolean
}
export type Setter<T> = (newValue: T) => T
