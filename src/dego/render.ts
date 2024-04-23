import {
  DegoComponent,
  DegoComponentInvocation,
  DegoConfig,
  DegoId,
} from './types'
import { e, generateDegoId } from './html'
import { replaceComponent, setupSubRender } from './helpers'
import { run, timing } from './timing'

import { degoBuildConfig } from './config'

function evalCurrentPath(preRenderRoute?: string) {
  const isNode = window.isNode

  if (isNode) return `/${window.nodePath}`

  if (preRenderRoute) return preRenderRoute

  return window.location.pathname
}

export async function getPageJS(
  route: string
): Promise<{ default: () => DegoComponent; config?: DegoConfig } | undefined> {
  if (!route.startsWith('/')) return

  try {
    const index = await import(
      /* webpackExports: ["default", "config"] */
      /* webpackIgnore: true */
      `D:/programming/linkme/dego/src/pages${evalCurrentPath(route)}`
    )

    if (
      !index ||
      !('default' in index) ||
      typeof index.default !== 'function'
    ) {
      return
    }

    return index
  } catch {
    console.warn(`Invalid URL ${route}`)
  }
}

export function replacePage(pageExport: {
  default: () => DegoComponent
  config?: DegoConfig
}) {
  const go = () => {
    const page = e(pageExport.default)

    const oldPageIndex = window.degoRootComponent.children.findIndex(
      c => c.degoId.id === window.degoPageId?.id
    )

    if (oldPageIndex === -1)
      throw new Error('Could not find old page to replace!')

    const id = generateDegoId(page, {
      atIndex: oldPageIndex,
      degoId: window.degoRootComponent.degoId,
    })
    const end = setupSubRender(id)

    const oldPage = window.degoRootComponent.children[oldPageIndex]

    replaceComponent(oldPage, page, id)

    window.degoPageId = id

    end()
  }

  if (timing.rendering.onGoing) {
    run('once', 'renderingEnd', () => {
      go()
    })
  } else {
    go()
  }
}

function getSeo(
  index: any,
  stringElementsAddToHead: string[],
  elementsToAddHead: Element[]
) {
  const isString = (a: any) => typeof a === 'string'

  if ('config' in index) {
    const config = index.config as DegoConfig

    if ('seo' in config) {
      const seo = config.seo
      if (!seo) return

      if (isString(seo.title)) {
        if (window.isNode) {
          stringElementsAddToHead.push(`<title>${seo.title}</title>`)
        } else {
          const titleElem = document.createElement('title')
          titleElem.innerText = seo.title!
          elementsToAddHead.push(titleElem)
        }
      }

      if (isString(seo.description)) {
        if (window.isNode) {
          stringElementsAddToHead.push(
            `<meta name="description" content"${seo.description}" />`
          )
        } else {
          const descriptionElem = document.createElement('meta')
          descriptionElem.name = 'description'
          descriptionElem.content = seo.description!
          elementsToAddHead.push(descriptionElem)
        }
      }
    }
  }
}

/**
 * Used to render Dego.JS to the DOM, it automatically initiates hooks, re-renders, and more.
 *
 * __Should__ be awaited with a top-level await.
 **/
export async function render(
  rootElementId: string,
  layout: (props: { page: DegoComponentInvocation }) => DegoComponent
): Promise<undefined> {
  if (typeof window === 'undefined') {
    ;(global as any).window = { isNode: true }
  } else {
    window.isNode = false
  }

  window.rootElementId = rootElementId
  const isNode = window.isNode

  if (isNode) {
    window.nodePath = process.argv[2] ?? ''
  } else {
    window.nodePath = ''
  }

  if (!isNode) {
    window.addEventListener('popstate', event => {
      const targetLocation = (event.target as Window).location.pathname
      getPageJS(targetLocation).then(page => {
        if (page) replacePage(page)
      })
    })
  }

  console.log(degoBuildConfig)

  const index = await import(
    /* webpackIgnore: true */
    `D:/programming/linkme/dego/src/pages${evalCurrentPath()}`
  )

  if (!index || !('default' in index) || typeof index.default !== 'function') {
    throw new Error(
      `No default Dego Functional Component export found at "src/pages${
        isNode === false && window.location.pathname === '/'
          ? '/index'
          : window.location.pathname
      }.ts"`
    )
  }

  const elementsToAddHead: Element[] = []
  const stringElementsAddToHead: string[] = []

  getSeo(index, stringElementsAddToHead, elementsToAddHead)

  if (!isNode) {
    for (const elem of elementsToAddHead) {
      document.head.prepend(elem)
    }
  }

  // const hasLoading = 'Loading' in index && typeof index.loading === 'function'

  const page = e(index.default)
  page.isPage = true
  const degoComponentInvocation = e(layout, { page })

  timing.rendering.setOngoing(true)
  timing.corePass.setOngoing(true)

  window.degoRenderProgress = {
    pendingInteractionIds: new Set(),
    pendingReferenceIds: new Set(),
  }

  const id = generateDegoId(degoComponentInvocation, 'ROOT')
  window.degoCurrentDegoId = id

  const newComponent = degoComponentInvocation.getDegoComponent(id)

  if (newComponent instanceof Promise) throw new Error('Not implemented')

  if (!newComponent)
    throw new Error('Root Dego Component cannot return undefined.')

  if (!newComponent.isNode) {
    const rootElement = document.getElementById('root')

    console.log('Root Dego Component: ', newComponent)

    if (!newComponent.rawHtml)
      throw new Error('Root Dego Component must have content!')

    if (!newComponent.rawHtml)
      throw new Error('No HTML found in root Dego Component!')

    if (!rootElement) throw new Error('No root element!')

    rootElement.innerHTML = ''

    rootElement.appendChild(newComponent.rawHtml)
  } else {
    console.log('--_DEGO_SSG_OUTPUT_START--')
    console.log(
      JSON.stringify({
        stringHtml: newComponent.stringHtml,
        headElements: stringElementsAddToHead,
        rootElementId,
      })
    )
    console.log('--_DEGO_SSG_OUTPUT_END--')
  }

  window.degoRootComponent = newComponent
  window.degoCurrentTopComponentId = undefined
  timing.corePass.setOngoing(false)
}

export function reRender(degoId: DegoId) {
  if (window.isNode) return
  console.log('---Re-rendering---')

  const end = setupSubRender(degoId)

  if (!degoId.component)
    throw new Error(`Could not find component ${degoId.id}.`)

  replaceComponent(
    degoId.component,
    degoId.hooks.degoComponentInvocation,
    degoId,
    {
      considerUnmount: false,
    }
  )

  end()
}
