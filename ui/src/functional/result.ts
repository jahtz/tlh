interface Success<T> {
  status: true;
  value: T;
}

export function success<T, E = string>(value: T): Result<T, E> {
  return new Result({status: true, value});
}

function isSuccess<T, E = string>(r: InnerResult<T, E>): r is Success<T> {
  return r.status;
}

export function myTry<T, E = string>(f: () => T, ef: (msg: string) => E): Result<T, E> {
  try {
    return success(f());
  } catch (e) {
    return failure(ef(e.message));
  }
}

interface Failure<E = string> {
  status: false;
  message: E;
}

export function failure<T, E = string>(message: E): Result<T, E> {
  return new Result({status: false, message});
}

type InnerResult<T, E = string> = Success<T> | Failure<E>;

export class Result<T, E = string> {

  constructor(private r: InnerResult<T, E>) {
  }

  get(): T | undefined {
    return isSuccess(this.r) ? this.r.value : undefined;
  }

  getError(): E | undefined {
    return isSuccess(this.r) ? undefined : this.r.message;
  }

  isSuccess(): boolean {
    return isSuccess(this.r);
  }

  transformTo<R>(sf: (t: T) => R, ef: (e: E) => R): R {
    return isSuccess(this.r) ? sf(this.r.value) : ef(this.r.message);
  }

  transform<S, F>(sf: (t: T) => Result<S, F>, ef: (e: E) => Result<S, F>): Result<S, F> {
    return isSuccess(this.r) ? sf(this.r.value) : ef(this.r.message);
  }

  map<S>(f: (t: T) => S): Result<S, E> {
    return isSuccess(this.r) ? success(f(this.r.value)) : failure(this.r.message);
  }

  transformContent<S, F>(sf: (t: T) => S, ef: (e: E) => F): Result<S, F> {
    return isSuccess(this.r) ? success(sf(this.r.value)) : failure(ef(this.r.message));
  }
}

// Helper functions

export function zipResult<S, T, E = string>(r1: Result<S, E>, r2: Result<T, E>): Result<[S, T], E[]> {
  return r1.transform(
    (s) => r2.isSuccess() ? success([s, r2.get() as T]) : failure([r2.getError() as E]),
    (e) => r2.isSuccess() ? failure([e]) : failure([e, r2.getError() as E])
  );
}

export function flattenResults<T, E = string>(rs: Result<T, E>[]): Result<T[], E[]> {
  const [successes, errors] = rs.reduce<[T[], E[]]>(
    ([ss, es], r) => r.isSuccess() ? [[...ss, r.get() as T], es] : [ss, [...es, r.getError() as E]],
    [[], []]
  );

  return errors.length === 0 ? success(successes) : failure(errors);
}
