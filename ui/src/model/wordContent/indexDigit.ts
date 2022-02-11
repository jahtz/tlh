import {AOWordContent} from './wordContent';

export interface IndexDigit {
  type: 'IndexDigit';
  content: number | 'x';
}

export function isIndexDigit(c: AOWordContent): c is IndexDigit {
  return c.type === 'IndexDigit';
}

export function indexDigit(content: number | 'x'): IndexDigit {
  return {type: 'IndexDigit', content};
}