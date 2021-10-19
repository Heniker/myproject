interface NextableI<T> {
  value: T
  next?: NextableI<T>
}

export class PoorMansObservable<T extends unknown> {
  // this methods is static so that calling it would be more explicit
  // i.e. normally you only need it in the same place where Observable is created
  static emit<J>(obs: PoorMansObservable<J>, value: J) {
    obs.emit(value)
  }

  private resolve: (arg: T) => void = () => {}

  private nextable: NextableI<Promise<T>> = { value: undefined as any, next: {} as any }

  private emit(arg: T) {
    const oldResolve = this.resolve
    const nextPromise = new Promise<T>((resolve) => {
      this.resolve = resolve
    })

    this.nextable = this.nextable.next as { value: Promise<T> }
    this.nextable.next = { value: nextPromise }

    oldResolve(arg)
  }

  constructor() {
    this.emit(undefined as any)
  }

  async *values() {
    let currentNextable = this.nextable

    while (true) {
      currentNextable = currentNextable.next as { value: Promise<T> }
      const val = await currentNextable.value
      yield val
    }
  }

  [Symbol.asyncIterator] = this.values.bind(this)
}
