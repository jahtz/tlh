import {AOWordContent} from './wordContent';

export interface InscribedLetter {
  type: 'InscribedLetter';
  content: string;
}

export function inscribedLetter(content: string): InscribedLetter {
  return {type: 'InscribedLetter', content};
}

export function isInscribedLetter(c: AOWordContent): c is InscribedLetter {
  return c.type === 'InscribedLetter';
}