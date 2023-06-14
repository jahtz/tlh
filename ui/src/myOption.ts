export abstract class AOption<T> {

  static of<T>(t: T | undefined | null): AOption<T> {
    return t !== undefined && t !== null ? new Some(t) : None;
  }

  abstract map<U>(f: (t: T) => U): AOption<U>;

  abstract get(): T | undefined;

}

class Some<T> extends AOption<T> {
  constructor(private readonly value: T) {
    super();
  }

  override map<U>(f: (t: T) => U): AOption<U> {
    return new Some(f(this.value));
  }

  override get(): T | undefined {
    return this.value;
  }
}

class ANone extends AOption<never> {
  override map<U>(): AOption<U> {
    return None;
  }

  override get<T>(): T | undefined {
    return undefined;
  }
}

const None = new ANone();
