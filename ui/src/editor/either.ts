export interface Left<E> {
  _type: 'Left';
  value: E;
}

export function isLeft<E, S>(either: Either<E, S>): either is Left<E> {
  return either._type === 'Left';
}

export interface Right<S> {
  _type: 'Right';
  value: S;
}

export function isRight<E, S>(either: Either<E, S>): either is Right<S> {
  return either._type === 'Right';
}

export type Either<E, S> = Left<E> | Right<S>;