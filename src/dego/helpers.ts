import { DegoComponent, DegoComponentInvocation, DegoId } from './types'

import { timing } from './timing'

export function createSingleString(h: string[], stringParams: string[]) {
  function getString(i: number) {
    if (i < stringParams.length) return stringParams[i]
    return ''
  }

  return h.reduceRight(
    (final, current, i) => current + getString(i) + final,
    ''
  )
}

export function createElementFromHTML(htmlString: string) {
  // Create a temporary container to hold the parsed HTML
  const tempContainer = document.createElement('div')
  tempContainer.innerHTML = htmlString

  // Extract the first child element as our result
  const resultElement = tempContainer.firstElementChild

  // Detach the result from the temporary container for safety
  if (resultElement) {
    tempContainer.removeChild(resultElement)
  } else {
    throw new Error('Dego Components can not be empty.')
  }

  tempContainer.remove()

  return resultElement
}

export function escapeHTML(str: string): string {
  const htmlEscapeMap = new Map([
    ['&', '&amp;'],
    ['<', '&lt;'],
    ['>', '&gt;'],
    ['{', '&#123;'],
    ['}', '&#125;'],
    ['(', '&#40;'],
    [')', '&#41;'],
    ['.', '&#46;'],
  ])

  return str.replace(
    /[&<>{}()=.;\x00-\x1F\x7F-\x9F]/g,
    char => htmlEscapeMap.get(char) || char
  )
}

export function cuid(length = 19): string {
  if (length < 10) {
    throw new Error('CUID length must be at least 10 characters')
  }

  const fingerprintLength = 4 // Bytes
  const counterLength = Math.max(4, Math.ceil((length - 10) / 3)) // Adjusted for variable length

  const fingerprint = new Uint8Array(fingerprintLength)
  crypto.getRandomValues(fingerprint)

  const hexFingerprint = fingerprint.reduce(
    (hexStr, byte) => hexStr + byte.toString(16).padStart(2, '0'),
    ''
  )

  const counter = (Date.now() * 1000 + Math.random() * 1000).toString(36)

  const sections = ['c', hexFingerprint, counter]

  // Add additional random parts based on desired length
  const numRandomParts = Math.floor((length - 10 - counterLength * 2) / 8) // 8 chars per random part
  for (let i = 0; i < numRandomParts; i++) {
    const randomPart = new Uint8Array(4)
    crypto.getRandomValues(randomPart)
    sections.push(
      randomPart.reduce(
        (hexStr, byte) => hexStr + byte.toString(16).padStart(2, '0'),
        ''
      )
    )
  }

  return sections.join('').slice(0, length) // Truncate to desired length
}

export function runUnmountFunctions(degoId: DegoId) {
  degoId.hooks.unmountFunctions.forEach(func => func())

  for (const child of degoId.childIds) {
    if (!child) continue

    if (child instanceof Map) {
      child.forEach(childOfChild => runUnmountFunctions(childOfChild))
    } else {
      runUnmountFunctions(child)
    }
  }
}

export function setupSubRender(degoId: DegoId) {
  timing.rendering.setOngoing(true)
  timing.corePass.setOngoing(true)
  window.degoCurrentTopComponentId = degoId.id
  window.degoCurrentDegoId = degoId

  return () => {
    window.degoCurrentTopComponentId = undefined
    timing.corePass.setOngoing(false)
  }
}

export function replaceComponent(
  oldComponent: DegoComponent,
  newComponentInvocation: DegoComponentInvocation,
  newComponentId: DegoId,
  opts?: {
    considerUnmount?: boolean
  }
) {
  const chosenOptions = {
    considerUnmount:
      opts?.considerUnmount === undefined ? true : opts?.considerUnmount,
  }

  const { considerUnmount } = chosenOptions

  const isAsync = newComponentInvocation.type === 'async'

  const newComponent = isAsync
    ? newComponentInvocation.loadingInvocation.getDegoComponent(newComponentId)
    : newComponentInvocation.getDegoComponent(newComponentId)

  if (newComponent instanceof Promise)
    throw new Error('Loading component cannot be async!')

  if (oldComponent.isNode || newComponent.isNode)
    throw new Error('Cannot replace node components!')

  const parent = oldComponent.degoId.parent

  if (parent === 'ROOT') throw new Error('Cannot replace ROOT!')
  if (!parent.degoId.component) {
    throw new Error('Cannot replace component because it does not exist!')
  }

  const result = {
    parent: {
      component: parent.degoId.component,
      index: parent.atIndex,
    },
  }

  if (!result || result.parent?.index === undefined)
    throw new Error('Could not find replacement component')

  const changed = getChanged(oldComponent.rawHtml, newComponent.rawHtml)

  if (changed) {
    for (const change of changed) {
      change.old.replaceWith(change.new)
    }
  }

  if (!changed || changed[0].depth > 0) {
    newComponent.rawHtml = oldComponent.rawHtml
  }

  if (!parent) {
    window.degoRootComponent = newComponent
  } else {
    result.parent.component.children[result.parent.index] = newComponent
  }

  if (considerUnmount) {
    runUnmountFunctions(oldComponent.degoId)
  }
}

export function getChanged(
  oldE: Element,
  newE: Element,
  depth = 0
): ChangeResult[] | false {
  // 1. Tag names
  if (oldE.tagName !== newE.tagName) {
    return [{ new: newE, old: oldE, depth }]
  }

  // 2. Attributes
  const oldAttributes = oldE.attributes
  const newAttributes = newE.attributes

  let differentAttributes = false
  for (let i = 0; i < newAttributes.length; i++) {
    const oldAttr = oldAttributes[i]
    const newAttr = newAttributes[i]

    if (!oldAttr) {
      differentAttributes = true
      break
    }

    if (oldAttr.name !== newAttr.name || oldAttr.value !== newAttr.value) {
      differentAttributes = true
      break
    }
  }

  if (differentAttributes) return [{ new: newE, old: oldE, depth }]

  // 4. Check text nodes
  const newChildNodes = Array.from(newE.childNodes)
  const oldChildNodes = Array.from(oldE.childNodes)

  const newTextNodes = newChildNodes.filter(
    node => node.nodeType === document.TEXT_NODE
  )
  const oldTextNodes = oldChildNodes.filter(
    node => node.nodeType === document.TEXT_NODE
  )

  let differentTextNodes = false
  for (let i = 0; i < newTextNodes.length; i++) {
    const oldNode = oldTextNodes[i]
    const newNode = newTextNodes[i]

    if (!oldNode) {
      differentTextNodes = true
      break
    }

    if (oldNode.textContent !== newNode.textContent) {
      differentTextNodes = true
      break
    }
  }

  if (differentTextNodes) return [{ new: newE, old: oldE, depth }]

  // 5. Check children
  const newChildElements = newChildNodes.filter(
    node => node.nodeType === document.ELEMENT_NODE
  ) as Element[]
  const oldChildElements = oldChildNodes.filter(
    node => node.nodeType === document.ELEMENT_NODE
  ) as Element[]

  let changedChildren: ChangeResult[] = []
  for (let i = 0; i < newChildElements.length; i++) {
    const newElement = newChildElements[i]
    const oldElement = oldChildElements[i]

    const changed = getChanged(oldElement, newElement, depth + 1)
    if (changed) changedChildren.push(...changed)
  }

  return changedChildren.length ? changedChildren : false
}

type ChangeResult = { new: Element; old: Element; depth: number }
