export abstract class AOption<T> {

  static of<T>(t: T | undefined | null): AOption<T> {
    return t !== undefined && t !== null ? new Some(t) : None;
  }

  abstract map<U>(f: (t: T) => U): AOption<U>;

  abstract getOrElse(def: T): T;

  jsxMap<U>(f: (t: T) => U): AOption<U> {
    // use in tsx to suppress missing key annotation
    return this.map(f);
  }

}

class Some<T> extends AOption<T> {
  constructor(private readonly value: T) {
    super();
  }

  override map<U>(f: (t: T) => U): AOption<U> {
    return new Some(f(this.value));
  }

  override getOrElse(): T {
    return this.value;
  }
}

class ANone extends AOption<never> {
  override map<U>(): AOption<U> {
    return None;
  }

  override getOrElse<T>(value: T): T {
    return value;
  }
}

const None = new ANone();
