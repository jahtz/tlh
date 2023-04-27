interface NewOk<T> {
  readonly status: true;
  readonly value: T;
}

export function newOk<T>(value: T): NewOk<T> {
  return {status: true, value};
}

interface NewError<E> {
  readonly status: false;
  readonly error: E;
}

export function newError<E>(error: E): NewError<E> {
  return {status: false, error};
}

export type NewResult<T, E> = NewOk<T> | NewError<E>;

export function collectNewResult<T, U, E>(results: NewResult<T, E>[], f: (u: U, t: T) => U, start: U): NewResult<U, E> {
  return results.reduce<NewResult<U, E>>(
    (acc, t): NewResult<U, E> => flatMapNewResult(acc, (u) => t.status ? newOk(f(u, t.value)) : t),
    newOk(start)
  );
}

export function isNewOk<T, E>(newResult: NewResult<T, E>): newResult is NewOk<T> {
  return newResult.status;
}

export function isNewError<T, E>(newResult: NewResult<T, E>): newResult is NewError<E> {
  return !newResult.status;
}

export function mapNewResult<T, U, E>(res: NewResult<T, E>, f: (t: T) => U): NewResult<U, E> {
  return isNewOk(res) ? {status: true, value: f(res.value)} : res;
}

export function flatMapNewResult<T, U, E>(res: NewResult<T, E>, f: (t: T) => NewResult<U, E>): NewResult<U, E> {
  return isNewOk(res) ? f(res.value) : res;
}
