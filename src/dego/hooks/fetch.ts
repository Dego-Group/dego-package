import { HookHelper } from './hook-helper'

type Result<T> =
  | { status: 'waiting'; fetch: () => void }
  | { status: 'finished'; data: T; refetch: () => void }
  | { status: 'loading'; cancel: () => void }
  | {
      status: 'error'
      error: any
      refetch: () => void
      errorCode: number
    }

export function useFetch<T>(
  url: string,
  init?: RequestInit,
  fetchOnMount = true
): Result<T> {
  if (window.isNode) {
    return fetchOnMount
      ? { status: 'loading', cancel() {} }
      : {
          status: 'waiting',
          fetch() {},
        }
  }

  const hook = new HookHelper<Info<T>>()

  function cancelFetch(controller: AbortController) {
    controller.abort()

    hook.setMemory({
      data: {
        status: 'waiting',
        fetch: () => preformFetch(new AbortController()),
      },
    })

    hook.requestReRender()
  }

  function preformFetch(controller: AbortController, reRender = true) {
    hook.setMemory({
      data: {
        status: 'loading',
        cancel: () => {
          cancelFetch(controller)
        },
      },
    })

    fetch(url, {
      ...init,
      signal: controller.signal,
    })
      .then(res => {
        if (res.ok) {
          const ct = (res.headers.get('content-type') || '').toLowerCase()

          if (ct.startsWith('application/json')) {
            res.json().then(set)
          } else if (
            ct.startsWith('text/html') ||
            ct.startsWith('text/plain')
          ) {
            res.text().then(set)
          } else {
            console.warn('Unsupported content type:', ct)
            res.text().then(set) // Fallback to treat as text
          }

          function set(data: any) {
            hook.setMemory({
              data: {
                status: 'finished',
                data,
                refetch: () => {
                  preformFetch(new AbortController())
                },
              },
            })

            hook.requestReRender()
          }
        } else {
          hook.setMemory({
            data: {
              status: 'error',
              error: res.text,
              refetch: () => {
                preformFetch(new AbortController())
              },
              errorCode: res.status,
            },
          })
        }
      })
      .catch(reason => {
        hook.setMemory({
          data: {
            status: 'error',
            error: reason,
            refetch: () => {
              preformFetch(new AbortController())
            },
            errorCode: 400,
          },
        })

        hook.requestReRender()
      })

    hook.addUnmountFunction(() => controller.abort())
    if (reRender) hook.requestReRender()
  }

  let memory: Info<T> = hook.getMemory()

  if (!memory) {
    const controller = new AbortController()
    if (fetchOnMount) {
      preformFetch(controller, false)
      memory = {
        data: {
          status: 'loading',
          cancel: () => {
            cancelFetch(controller)
          },
        },
      } satisfies Info<T>
    } else {
      memory = {
        data: {
          status: 'waiting',
          fetch: () => {
            preformFetch(controller)
          },
        },
      } satisfies Info<T>
    }
  } else {
  }

  hook.setMemory(memory)
  return memory.data
}

type Info<T> = {
  data: Result<T>
}
