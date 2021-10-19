import { PoorMansObservable } from './PoorMansObservable'

export class Observable<T> extends PoorMansObservable<T> {
  private handlers: Set<(arg0: T) => unknown> = new Set()

  constructor() {
    super()
    void (async () => {
      for await (const arg of this) {
        for (const fn of this.handlers) {
          fn(arg)
        }
      }
    })()
  }

  on(cb: (arg0: T) => unknown) {
    this.handlers.add(cb)
  }

  off(cb: (arg0: T) => unknown) {
    this.handlers.delete(cb)
  }
}
