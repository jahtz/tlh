import {AOWordContent} from './wordContent';

export interface BasicText {
  type: 'BasicTest';
  content: string;
}

export function aoBasicText(content: string): BasicText {
  return {type: 'BasicTest', content};
}

export function isBasicText(c: AOWordContent): c is BasicText {
  return c.type === 'BasicTest';
}