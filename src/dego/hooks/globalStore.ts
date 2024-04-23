import { GlobalContext } from './globals'
import { HookHelper } from './hook-helper'
import { StoreData } from './store'

export function useGlobalStore<
  V extends Record<string, any>,
  R extends Record<string, any>
>(globalContext: GlobalContext<V, R>): GlobalStoreGetter<R> {
  new HookHelper<never>()

  return id => {
    return globalContext.getStore(id)
  }
}

export type GlobalStoreGetter<V> = <T extends keyof V>(id: T) => StoreData<V[T]>
