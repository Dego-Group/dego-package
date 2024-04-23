import {
  DegoConfig,
  type DegoComponent,
  type DegoComponentInvocation,
} from '../types'
import { getPageJS, replacePage } from '../render'

import type { AnchorHTMLAttributes } from '../attributes'
import { attr } from '../attributes'
import { html } from '../html'
import { useWatch } from '../hooks/watch'

const preFetchedPages = new Map<
  string,
  { default: () => DegoComponent; config?: DegoConfig }
>()

export function Link({
  content,
  href,
  attributes,
  options = { prefetch: true },
}: {
  content: string | DegoComponentInvocation
  href: string
  attributes?: Omit<AnchorHTMLAttributes, 'href' & 'onclick'>
  options?: { prefetch: boolean }
}) {
  useWatch(() => {
    async function get() {
      if (!options.prefetch) return

      if (!preFetchedPages.has(href)) {
        const output = await getPageJS(href)
        if (output) preFetchedPages.set(href, output)
      }
    }

    get()

    return () => {
      preFetchedPages.delete(href)
    }
  })

  return html`<a
    onclick=${(e: MouseEvent) => {
      const currentPage = window.location.pathname
      const isSamePage =
        href === currentPage ||
        href === currentPage + 'index' ||
        href === currentPage + '/index'

      if (isSamePage) {
        return e.preventDefault()
      }

      if (!options.prefetch) {
        getPageJS(href).then(page => {
          if (page) replacePage(page)
        })
        e.preventDefault()
        window.history.pushState({}, '', window.location.origin + href)
        return
      }

      if (!preFetchedPages.has(href)) return

      e.preventDefault()
      replacePage(preFetchedPages.get(href)!)
      window.history.pushState(undefined, '', window.location.origin + href)
    }}
    href=${href}
    ${attributes && attr(attributes)}
    >${content}</a
  >`
}
