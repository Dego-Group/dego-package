import { DegoId } from '../types'
import { reRender } from '../render'

export const renderQueue: {
  lastRequestId: undefined | DegoId
  add: (degoId: DegoId) => void
} = {
  lastRequestId: undefined,
  add(degoId) {
    if (
      this.lastRequestId &&
      (this.lastRequestId.id === degoId.id ||
        isComponentAbove(this.lastRequestId, degoId))
    ) {
      this.lastRequestId = degoId
      return
    }

    this.lastRequestId = degoId
    const storedDegoId = degoId

    setTimeout(() => {
      this.lastRequestId = undefined

      reRender(storedDegoId)
    })
  },
}

function isComponentAbove(parent: DegoId, child: DegoId): boolean {
  if (child.parent === 'ROOT') return false

  if (child.parent.degoId.id === parent.id) return true

  return isComponentAbove(parent, child.parent.degoId)
}
