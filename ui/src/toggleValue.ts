export function toggleValue<T>(values: T[], value: T, multipleChoice: boolean, equals: (t1: T, t2: T) => boolean): T[] {
  if (multipleChoice) {
    return values.includes(value)
      ? values.filter((v) => !equals(v, value))
      : [...values, value].sort();
  } else {
    return values.length === 1 && values [0] === value
      ? [] : [value];
  }
}

export function toggleStringValue(values: string[], value: string, multipleChoice: boolean): string[] {
  return toggleValue(values, value, multipleChoice, (s1, s2) => s1 === s2);
}