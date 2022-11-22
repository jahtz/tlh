import {AOWordContent} from './wordContent';

export interface AOSpace {
  type: 'AOSpace';
  c: string;
}

export function convertAoSpaceToXmlStrings({c}: AOSpace): string[] {
  return [`<space c="${c}"/>`];
}

export function aoSpace(c: string): AOSpace {
  return {type: 'AOSpace', c};
}

export function isSpace(c: AOWordContent): c is AOSpace {
  return c.type === 'AOSpace';
}