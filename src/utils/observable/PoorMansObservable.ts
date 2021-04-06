interface NextableI<T> {
  value: T
  next?: NextableI<T>
}

export class PoorMansObservable<T extends unknown> {
  private resolve: (arg: T) => void = () => {}
  // generator *emulation* because it's not possible to clone JS generators
  private nextable: NextableI<Promise<T>> = { value: undefined as any, next: {} as any }

  constructor() {
    this.emit(undefined as any)
  }

  emit(arg: T) {
    const oldResolve = this.resolve
    const nextPromise = new Promise<T>((resolve) => {
      this.resolve = resolve
    })

    this.nextable = this.nextable.next as { value: Promise<T> }
    this.nextable.next = { value: nextPromise }

    oldResolve(arg)
  }

  async *values() {
    let currentNextable = this.nextable

    while (true) {
      currentNextable = currentNextable.next as { value: Promise<T> }
      const val = await currentNextable.value
      yield val
    }
  }

  [Symbol.asyncIterator] = this.values
}
