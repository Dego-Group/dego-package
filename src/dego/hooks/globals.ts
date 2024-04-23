import { DegoId } from '../types'
import { StoreData } from './store'
import { cuid } from '../helpers'
import { renderQueue } from './render-queue'

type R = Record<string, any>

/**
 * Creates a context that can then be passed into both `useGlobalValue` and `useGlobalStore`.
 *
 * You can create multiple contexts, and use them with different hooks.
 *
 * > __Note:__ It is __not__ recommended to use this class's functions directly, you should let `useGlobalValue` and `useGlobalStore` handle the state for you unless you know what you are doing.
 */
export class GlobalContext<
  V extends R = R,
  S extends R = R,
  K extends keyof S = keyof S
> {
  values: V
  stores: Record<K, StoreData<S[K]>>
  componentsUsingValue = new Map<keyof V, Set<DegoId>>()

  constructor(defaultValues?: V, defaultStores?: S) {
    this.values = defaultValues ?? ({} as V)
    this.stores = createStores() as any

    function createStores() {
      const stores = defaultStores ?? ({} as S)

      const entries = Object.entries(stores as {})

      const finalStores: Record<string, StoreData<any>> = {}

      for (const [key, value] of entries) {
        finalStores[key] = new StoreData(value)
      }

      return finalStores
    }
  }

  createValueSubscription<T extends keyof V>(action: T, degoId: DegoId) {
    const id = cuid()

    const data = this.componentsUsingValue.get(action)
    if (data) {
      data.add(degoId)
    } else {
      this.componentsUsingValue.set(action, new Set([degoId]))
    }

    degoId.hooks.unmountFunctions.set(id, () => {
      if (data) return data.delete(degoId)
      this.componentsUsingValue.get(action)!.delete(degoId)
    })
  }

  // Values

  setValue<T extends keyof V>(id: T, data: V[T]) {
    this.values[id] = data

    const subscribed = this.componentsUsingValue.get(id)

    if (subscribed) {
      subscribed.forEach(degoId => {
        renderQueue.add(degoId)
      })
    }
  }

  getValue<T extends keyof V>(id: T) {
    return this.values[id]
  }

  // Stores

  getStore<T extends K>(id: T) {
    return this.stores[id] as StoreData<S[T]>
  }
}
