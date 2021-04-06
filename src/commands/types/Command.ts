export abstract class Command {
  public abstract name: string

  abstract run(): void
}
