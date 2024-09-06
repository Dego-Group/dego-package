import { HookHelper } from './hook-helper'

/**
 * @param callback
 * Runs once when it detects a change in the `deps` array during a re-render.
 *
 * __Note:__ Only checks for changes on a re-render, this means some other hook must trigger a re-render for this code to run.
 *
 * @param deps
 * An array that can take in many values and any type. Dego.JS uses [`Object.is()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) to check equality, which checks by reference on some types.
 *
 * If `deps` isn't included it will run on mount by default.
 */
export function useWatch<T extends any[]>(
  callback: (prevValues: T, newValues: T) => void | (() => void)
): undefined
export function useWatch<T extends any[]>(
  callback: (prevValues: T, newValues: T) => void | (() => void),
  deps: Readonly<T>,
  runOnMount?: boolean
): undefined
export function useWatch<T extends any[]>(
  callback: (prevValues: T, newValues: T) => void | (() => void),
  deps?: Readonly<T>,
  runOnMount = false
): undefined {
  if (window.isNode) return

  const onMount = deps === undefined ? true : runOnMount
  if (!deps) deps = [] as unknown as Readonly<T>

  const hook = new HookHelper<Memory>()

  const data = hook.getMemory()

  if (!data) {
    let cleanup: (() => void) | void = undefined
    let id: string | undefined = undefined

    if (onMount) {
      cleanup = callback(deps, deps)

      if (typeof cleanup === 'function') {
        id = hook.addUnmountFunction(cleanup)
      }
    }

    hook.setMemory({
      prevValues: deps,
      prevCleanup: cleanup,
      prevCleanupId: id,
    })
    return
  }

  if (data.prevValues.length !== deps.length) {
    throw new Error(
      'Cannot change number of items in `deps` array between renders. (useWhen)'
    )
  }

  let hasChange = false

  for (let i = 0; i < data.prevValues.length; i++) {
    const prevValue = data.prevValues[i]
    const newValue = deps[i]

    if (!Object.is(prevValue, newValue)) {
      hasChange = true
      break
    }
  }

  if (hasChange) {
    const newCleanup = callback(data.prevValues as T, deps)
    let id: string | undefined = undefined

    if (newCleanup) {
      if (data.prevCleanupId) hook.removeUnmountFunction(data.prevCleanupId)

      id = hook.addUnmountFunction(newCleanup)
    }

    if (data.prevCleanup) data.prevCleanup()

    hook.setMemory({
      prevValues: deps,
      prevCleanup: newCleanup,
      prevCleanupId: id,
    })
  }
}

type Memory = {
  prevValues: Readonly<any[]>
  prevCleanup: (() => void) | void
  prevCleanupId?: string
}
