import { GlobalContext } from './globals'
import { HookHelper } from './hook-helper'

export function useGlobalValue<
  V extends Record<string, any>,
  R extends Record<string, any>
>(globalContext: GlobalContext<V, R>): [GlobalGetter<V>, GlobalSetter<V>] {
  const hook = new HookHelper<never>()

  return [
    id => {
      globalContext.createValueSubscription(id, hook.degoId)
      return globalContext.getValue(id)
    },
    (id, data) => {
      globalContext.setValue(id, data)
    },
  ] as const
}

export type GlobalGetter<V> = <T extends keyof V>(id: T) => V[T]
export type GlobalSetter<V> = <T extends keyof V>(id: T, data: V[T]) => void
