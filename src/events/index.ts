export * from './debug'

export const activate = async () => {
  (await import('./debug')).activate()
}
