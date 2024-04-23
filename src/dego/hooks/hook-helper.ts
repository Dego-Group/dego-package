import { DegoId } from '../types'
import { cuid } from '../helpers'
import { renderQueue } from './render-queue'

export class HookHelper<T> {
  degoId: DegoId
  hookNumber: number

  constructor() {
    const degoId = window.degoCurrentDegoId

    this.degoId = degoId
    this.hookNumber = degoId.hooks.number
    degoId.hooks.number++
  }

  addUnmountFunction(func: () => void, id = cuid()) {
    this.degoId.hooks.unmountFunctions.set(id, func)
    return id
  }

  removeUnmountFunction(id: string) {
    this.degoId.hooks.unmountFunctions.delete(id)
  }

  requestReRender() {
    renderQueue.add(this.degoId)
  }

  setMemory(data: T) {
    this.degoId.hooks.memory[this.hookNumber] = data
  }

  getMemory(validator?: (data: T) => boolean): T {
    const data = this.degoId.hooks.memory[this.hookNumber]

    if (!validator || validator(data)) {
      return data
    } else {
      throw new Error('Did not find correct hook memory data type.')
    }
  }
}
