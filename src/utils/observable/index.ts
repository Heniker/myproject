import { PoorMansObservable } from './PoorMansObservable'

export class Observable<T> extends PoorMansObservable<T> {
  private handlers: Set<(arg0: T) => {}> = new Set()

  constructor() {
    super()
    ;(async () => {
      for await (const arg of this) {
        this.handlers.forEach((fn) => fn(arg))
      }
    })()
  }

  on(cb: (arg0: T) => {}) {
    this.handlers.add(cb)
  }

  off(cb: (arg0: T) => {}) {
    this.handlers.delete(cb)
  }
}
