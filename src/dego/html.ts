import {
  DegoComponent,
  DegoComponentInvocation,
  DegoId,
  UniqueChildId,
} from './types'
import {
  createElementFromHTML,
  createSingleString,
  cuid,
  replaceComponent,
  runUnmountFunctions,
  setupSubRender,
} from './helpers'
import { run, timing } from './timing'

import { StoreData } from './hooks/store'
import { escapeHTML } from './helpers'

export function html(
  h: TemplateStringsArray,
  ...params: (
    | boolean
    | DegoComponentInvocation
    | string
    | number
    | undefined
    | null
    | ((e: any) => any)
    | DegoComponentInvocation[]
    | StoreData<Element | undefined>
  )[]
): DegoComponent {
  const modifiedH = [...h]
  const degoChildren: DegoComponent[] = []
  const currentInteractionIds: string[] = []
  const currentStoreReferenceIds: string[] = []
  const thisDegoId = window.degoCurrentDegoId

  const isNode = window.isNode

  thisDegoId.hooks.number = 0

  if (!thisDegoId.childIds.length) {
    thisDegoId.childIds = new Array(params.length).fill(undefined)
  }

  if (!window.degoCurrentTopComponentId) {
    window.degoCurrentTopComponentId = thisDegoId.id
  }

  const sParams = params.map((p, i) => {
    if (!p) return ''

    const prevSegment = modifiedH[i]
    const onRegex = /on([a-z]+)=(?!\w)/
    const match = prevSegment.match(onRegex)
    const onEvent = match ? match[1] : null

    // This ensures that components that get un-mounted loose their state
    if (!(typeof p === 'object' && 'isDegoComponentInvocation' in p)) {
      const currentId = thisDegoId.childIds[i]
      if (currentId && 'isDegoId' in currentId) {
        runUnmountFunctions(currentId)

        thisDegoId.childIds[i] = undefined
      }
    }

    switch (typeof p) {
      //? Add interaction using event listeners
      case 'function': {
        if (!onEvent) {
          throw new Error(
            'Unexpected function! Did you mean to call the function? Found at ' +
              prevSegment
          )
        }

        // Remove "on...=" from HTML to prevent conflicts
        modifiedH[i] = modifiedH[i].slice(0, -(onEvent.length + 3))

        if (isNode) return ''

        const oldInfo = thisDegoId.interactions[currentInteractionIds.length]

        const id = oldInfo?.id ?? `data-i-dego-${cuid()}`
        thisDegoId.interactions[currentInteractionIds.length] = {
          id,
          callback: p,
        }

        currentInteractionIds.push(id)

        const wasFocused = document.activeElement?.hasAttribute(id) ?? false

        window.degoRenderProgress.pendingInteractionIds.add({
          id,
          p,
          lastP: oldInfo?.callback,
          onEvent,
          wasFocused,
        })

        // Add ID so that once the component is rendered we can identify it
        modifiedH[i] += ` ${id} `

        return ''
      }

      //? Handle nested Dego Components
      case 'object': {
        if (p instanceof StoreData) {
          if (isNode) return ''
          const oldInfo =
            thisDegoId.storeReferences[currentStoreReferenceIds.length]

          const id = oldInfo?.id ?? `data-sr-dego-${cuid()}`

          if (!oldInfo) {
            thisDegoId.storeReferences[currentStoreReferenceIds.length] = {
              id,
            }
          }

          window.degoRenderProgress.pendingReferenceIds.add({
            id,
            type: 'store',
            data: p,
          })

          return ` ${id} `
        }

        function handleDegoComponent(
          degoComponentInvocation: DegoComponentInvocation,
          nestedIds?: UniqueChildId[]
        ) {
          const parentId = window.degoCurrentDegoId
          let newId: DegoId
          const parentData = { atIndex: degoChildren.length, degoId: parentId }

          // Check if the ID should be nested
          if (nestedIds) {
            const ids = thisDegoId.childIds[i]

            if (ids && !('isDegoId' in ids)) {
              const savedId = ids.get(degoComponentInvocation.uniqueChildId)

              if (savedId) {
                savedId.hooks.degoComponentInvocation = degoComponentInvocation
              }

              newId =
                savedId ?? generateDegoId(degoComponentInvocation, parentData)

              if (!savedId) {
                ;(thisDegoId.childIds[i] as typeof ids).set(
                  degoComponentInvocation.uniqueChildId,
                  newId
                )
              }
            } else {
              newId = generateDegoId(degoComponentInvocation, parentData)
              thisDegoId.childIds[i] = new Map()
              ;(thisDegoId.childIds[i] as Map<UniqueChildId, DegoId>).set(
                degoComponentInvocation.uniqueChildId,
                newId
              )
            }
          } else {
            const id = thisDegoId.childIds[i]
            if (id && 'isDegoId' in id) {
              id.hooks.degoComponentInvocation = degoComponentInvocation
              newId = id
            } else {
              newId = generateDegoId(degoComponentInvocation, parentData)
              thisDegoId.childIds[i] = newId
            }
          }

          if (nestedIds) {
            nestedIds.push(degoComponentInvocation.uniqueChildId)
          }

          if (degoComponentInvocation.isPage) window.degoPageId = newId
          window.degoCurrentDegoId = newId

          const isAsync = degoComponentInvocation.type === 'async'

          const degoComponent = isAsync
            ? degoComponentInvocation.loadingInvocation.getDegoComponent(newId)
            : degoComponentInvocation.getDegoComponent(newId)
          if (!degoComponent) return ''

          const idPrefix = 'data-c-dego-'

          if (degoComponent instanceof Promise) {
            throw new Error('Loading component cannot be async.')
          }

          if (isAsync) {
            run('once', 'renderingEnd', async () => {
              const end = setupSubRender(newId)
              degoComponentInvocation
                .getDegoComponent(newId)
                .then(component => {
                  const newInvocation: DegoComponentInvocation = {
                    ...degoComponentInvocation,
                    type: 'normal',
                    getDegoComponent: _ => component,
                  }

                  replaceComponent(degoComponent, newInvocation, newId)
                  end()
                })
            })
          }

          degoChildren.push(degoComponent)

          const id = `${idPrefix}${degoComponent.degoId.id}`

          let stringHtml = ''

          if (degoComponent.isNode) {
            stringHtml = degoComponent.stringHtml
          } else {
            degoComponent.rawHtml.setAttribute(id, '')
            stringHtml = degoComponent.rawHtml.outerHTML

            window.degoRenderProgress.pendingReferenceIds.add({
              id,
              degoComponent,
              type: 'component',
            })
          }

          window.degoCurrentDegoId = thisDegoId

          return stringHtml
        }

        // If it is an array, print the values
        if (Array.isArray(p) && p.length > 0) {
          const nestedIds: UniqueChildId[] = []

          const newP = p.map(v => {
            if (typeof v === 'object' && 'isDegoComponentInvocation' in v) {
              return handleDegoComponent(v, nestedIds)
            }
          })

          // Clear all child IDs that were not in this render

          ;(() => {
            const set = thisDegoId.childIds[i]

            if (!set) return

            if ('isDegoId' in set) return

            for (const childId of set.keys()) {
              if (!nestedIds.includes(childId)) {
                const id = set.get(childId)

                if (id) runUnmountFunctions(id)

                set.delete(childId)
              }
            }
          })()

          return newP.join(' ')
        }

        if ('isDegoComponentInvocation' in p) return handleDegoComponent(p)
      }

      //? To make conditional code easier on users, ignore booleans
      case 'boolean': {
        return ''
      }

      //? If string, check if it is a attribute and add the quotes
      case 'string': {
        const match = prevSegment.match(/\w+=$/)
        if (match && match[0]) {
          return `"${escapeHTML(p)}"`
        }

        return escapeHTML(p)
      }

      //? If other, just ensure it is a string and escape the HTML
      default: {
        return escapeHTML(p.toString())
      }
    }
  })

  //? If it is the top-most component (the root/component getting re-rendered) then set to run,
  //? this ensures it happens after all other nested Dego Components have been processed
  if (!isNode && window.degoCurrentTopComponentId === thisDegoId.id) {
    //? Set the `rawHtml` to contain the real reference to the element in the DOM
    run('once', 'corePassEnd', () => {
      timing.interactionPass.setOngoing(true)

      for (const reference of window.degoRenderProgress.pendingReferenceIds) {
        const element = document.querySelector(`*[${reference.id}]`)

        if (!element) {
          throw new Error(
            `Could not update HTML reference. While processing Dego Component or Store Reference id: ${reference.id}. \nCurrent HTML: ${document.body.outerHTML}`
          )
        }

        if (reference.type === 'component') {
          if (reference.degoComponent.isNode) return

          reference.degoComponent.rawHtml = element
        } else {
          reference.data.value = element
        }
      }

      window.degoRenderProgress.pendingReferenceIds.clear()
      timing.assignmentPass.setOngoing(false)
    })

    //? Add event listeners to all elements that have interaction
    run('once', 'assignmentPassEnd', () => {
      timing.assignmentPass.setOngoing(true)

      for (const interaction of window.degoRenderProgress
        .pendingInteractionIds) {
        const { id, onEvent, p, wasFocused, lastP } = interaction

        const elem = document.querySelector(`*[${id}]`)

        if (!elem) {
          throw new Error(
            `Could not add interaction. Does the element exist on the DOM? While processing Dego Component id: ${thisDegoId.id}. Looking for ${id}. \nCurrent HTML: ${document.body.outerHTML}`
          )
        }

        if (wasFocused && 'focus' in elem) (elem as HTMLElement).focus()
        elem.removeEventListener(onEvent, lastP)
        elem.addEventListener(onEvent, p)
      }
      window.degoRenderProgress.pendingInteractionIds.clear()

      timing.interactionPass.setOngoing(false)
      timing.rendering.setOngoing(false)
    })
  }

  function getFinalComponent(): DegoComponent {
    const htmlString = createSingleString(modifiedH, sParams)

    let finalElements: Element

    if (!isNode) {
      finalElements = createElementFromHTML(htmlString)
    }

    if (isNode) {
      return {
        degoId: thisDegoId,
        children: degoChildren,
        stringHtml: htmlString,
        isDegoComponent: true,
        isNode: isNode,
      }
    } else {
      return {
        degoId: thisDegoId,
        children: degoChildren,
        rawHtml: finalElements!,
        isDegoComponent: true,
        isNode: isNode,
      }
    }
  }

  const finalComponent = getFinalComponent()

  finalComponent.degoId.component = finalComponent

  return finalComponent
}

/**
 * Component Invoker *(__e__ for element)*
 *
 * @param degoFunctionComponent
 * Pass a function that returns a `DegoComponent` (do not call the function)
 *
 * @param props
 * Takes in props object if it exists
 *
 * @param uniqueChildId
 * __Required for components in arrays__, a unique child ID key, defaults to `DEFAULT`.
 **/
export function e<P extends Record<string, any>>(
  degoFunctionComponent: (props: P) => DegoComponent,
  props: P,
  uniqueChildId?: UniqueChildId
): DegoComponentInvocation<P>
export function e(
  degoFunctionComponent: () => DegoComponent,
  uniqueChildId?: UniqueChildId
): DegoComponentInvocation
export function e<P>(
  degoFunctionComponent: (props: P) => DegoComponent,
  props?: P,
  uniqueChildId?: UniqueChildId
): DegoComponentInvocation<P> {
  if (typeof props === 'object') {
    return {
      uniqueChildId: uniqueChildId ?? 'DEFAULT',
      isDegoComponentInvocation: true,
      getDegoComponent: () => degoFunctionComponent(props!),
      props,
      isPage: false,
      type: 'normal',
    }
  } else {
    return {
      uniqueChildId: (props as UniqueChildId) ?? 'DEFAULT',
      isDegoComponentInvocation: true,
      getDegoComponent: () => degoFunctionComponent(props!),
      props: undefined,
      isPage: false,
      type: 'normal',
    }
  }
}

// export function asyncE<
//   P1 extends Record<string, any>,
//   P2 extends Record<string, any>
// >(
//   asyncComponent: {
//     component: (props: P1) => Promise<DegoComponent>
//     props?: P1
//   },
//   loadingComponent: {
//     component: (props: P2) => DegoComponent
//     props?: P2
//   },
//   uniqueChildId?: UniqueChildId
// ): DegoComponentInvocation
// export function asyncE(
//   asyncComponent: {
//     component: () => Promise<DegoComponent>
//   },
//   loadingComponent: {
//     component: () => DegoComponent
//   },
//   uniqueChildId?: UniqueChildId
// ): DegoComponentInvocation
// export function asyncE<
//   P1 extends Record<string, any>,
//   P2 extends Record<string, any>
// >(
//   asyncComponent: {
//     component: (props: P1) => Promise<DegoComponent>
//     props?: P1
//   },
//   loadingComponent: {
//     component: (props: P2) => DegoComponent
//     props?: P2
//   },
//   uniqueChildId?: UniqueChildId
// ): DegoComponentInvocation<P2, P1> {
//   function getLoadingInvocation(): DegoComponentInvocation {
//     const { component, props } = loadingComponent

//     return {
//       type: 'normal',
//       uniqueChildId: uniqueChildId ?? 'DEFAULT',
//       isDegoComponentInvocation: true,
//       getDegoComponent: () => component(props!),
//       props,
//       isPage: false,
//     }
//   }

//   // Handle loading component
//   const loadingInvocation = getLoadingInvocation()

//   const { component, props } = asyncComponent

//   return {
//     type: 'async',
//     loadingInvocation,
//     uniqueChildId: uniqueChildId ?? 'DEFAULT',
//     isDegoComponentInvocation: true,
//     getDegoComponent: () => component(props!),
//     props,
//     isPage: false,
//   }
// }

export function generateDegoId(
  degoComponentInvocation: DegoComponentInvocation,
  parent: { degoId: DegoId; atIndex: number } | 'ROOT'
): DegoId {
  const id = cuid()

  return {
    id,
    interactions: [],
    storeReferences: [],
    childIds: [],
    parent,
    hooks: {
      number: 0,
      degoComponentInvocation,
      memory: [],
      unmountFunctions: new Map(),
    },
    isDegoId: true,
  }
}
