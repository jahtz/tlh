export interface MyOk<T> {
  status: true;
  value: T;
}

export function myOk<T>(value: T): MyOk<T> {
  return {status: true, value};
}

export interface MyError<E> {
  status: false;
  error: E;
}

export function myError<E>(error: E): MyError<E> {
  return {status: false, error};
}

export type MyResult<T, E> = MyOk<T> | MyError<E>;