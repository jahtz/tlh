export type ZipWithOffsetResult<T> = [T | undefined, T | undefined][];

export function zipWithOffset<T>(first: T[], second: T[], offset: number): ZipWithOffsetResult<T> {
  if (offset < 0) {
    return zipWithOffset(second, first, -offset)
      .map(([e2, e1]) => [e1, e2]);
  }

  const result: ZipWithOffsetResult<T> = [];

  const maxIndex = first.length * 2 + second.length * 2 + offset;

  for (let index = 0; index < maxIndex; index++) {
    const firstIndex = index;
    const secondIndex = index - offset;

    const left = firstIndex >= 0 && firstIndex < first.length
      ? first[firstIndex]
      : undefined;

    const right = secondIndex >= 0 && secondIndex < second.length
      ? second[secondIndex]
      : undefined;

    if ((!!left || !!right) && !(left === undefined && right === undefined)) {
      result.push([left, right]);
    }
    if ((!!left || !!right) && left === undefined && right === undefined) {
      result.push([undefined, undefined]);
    }
  }

  return result;
}