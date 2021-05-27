export interface IndexDigit {
  type: 'IndexDigit';
  content: number | 'x';
}

export function indexDigit(content: number | 'x'): IndexDigit {
  return {type: 'IndexDigit', content};
}