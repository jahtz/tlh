interface Success<T> {
  status: true;
  value: T;
}

export function success<T, E = string>(value: T): Result<T, E> {
  return {status: true, value};
}

export function isSuccess<T, E = string>(r: Result<T, E>): r is Success<T> {
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
  error: E;
}

export function failure<T, E = string>(message: E): Result<T, E> {
  return {status: false, error: message};
}

export type Result<T, E = string> = Success<T> | Failure<E>;

// Helper functions

export function mapResult<T, S, E = string>(result: Result<T, E>, f: (t: T) => S): Result<S, E> {
  return isSuccess(result) ? success(f(result.value)) : failure(result.error);
}

export function zipResult<S, T, E = string>(r1: Result<S, E>, r2: Result<T, E>): Result<[S, T], E[]> {
  if (isSuccess(r1)) {
    return isSuccess(r2) ? success([r1.value, r2.value]) : failure([r2.error]);
  } else {
    return isSuccess(r2) ? failure([r1.error]) : failure([r1.error, r2.error]);
  }
}

export function transformResult<T, E, S, F>(result: Result<T, E>, sf: (t: T) => S, ef: (e: E) => F): Result<S, F> {
  return isSuccess(result) ? success(sf(result.value)) : failure(ef(result.error));
}

export function flattenResults<T, E = string>(rs: Result<T, E>[]): Result<T[], E[]> {
  const [successes, errors] = rs.reduce<[T[], E[]]>(
    ([ss, es], r) => isSuccess(r) ? [[...ss, r.value], es] : [ss, [...es, r.error]],
    [[], []]
  );

  return errors.length === 0 ? success(successes) : failure(errors);
}
