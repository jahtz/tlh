export abstract class NewAbstractResult<T, E> {

  abstract map<U>(f: (t: T) => U): NewAbstractResult<U, E>;

  abstract mapError<F>(f: (e: E) => F): NewAbstractResult<T, F>;

  abstract flatMap<U>(f: (t: T) => NewAbstractResult<U, E>): NewAbstractResult<U, E>;

  abstract handle(f: (t: T) => void, g: (e: E) => void): void;

  abstract toInterface(): IResult<T, E>;

  static ok<T, E>(value: T): NewAbstractResult<T, E> {
    return new NewNewOk(value);
  }

  static error<T, E>(error: E): NewAbstractResult<T, E> {
    return new NewNewError(error);
  }
}

export class NewNewOk<T> extends NewAbstractResult<T, never> {
  constructor(private readonly value: T) {
    super();
  }

  override map<U>(f: (t: T) => U): NewAbstractResult<U, never> {
    return new NewNewOk(f(this.value));
  }

  override mapError<F>(): NewAbstractResult<T, F> {
    return this;
  }

  override flatMap<U>(f: (t: T) => NewAbstractResult<U, never>): NewAbstractResult<U, never> {
    return f(this.value);
  }

  override handle(f: (t: T) => void/*, g: (e: never) => void*/): void {
    f(this.value);
  }

  override toInterface(): IResult<T, never> {
    return {status: true, value: this.value};
  }
}

export function newOk<T, E>(value: T): NewAbstractResult<T, E> {
  return new NewNewOk(value);
}

export function isOk<T, E>(result: NewAbstractResult<T, E>): result is NewNewOk<T> {
  return result instanceof NewNewOk;
}

export class NewNewError<E> extends NewAbstractResult<never, E> {
  constructor(private readonly error: E) {
    super();
  }

  override map<U>(): NewAbstractResult<U, E> {
    return this;
  }

  override mapError<T, F>(f: (e: E) => F): NewAbstractResult<T, F> {
    return new NewNewError(f(this.error));
  }

  override flatMap<U>(): NewAbstractResult<U, E> {
    return this;
  }

  override handle(f: (t: never) => void, g: (e: E) => void): void {
    g(this.error);
  }

  override toInterface(): IResult<never, E> {
    return {status: false, error: this.error};
  }
}

export function newError<T, E>(error: E): NewAbstractResult<T, E> {
  return new NewNewError(error);
}

// Interfaces

export interface IOk<T> {
  status: true;
  value: T;
}

export interface IError<E> {
  status: false;
  error: E;
}

export type IResult<T, E> = IOk<T> | IError<E>;