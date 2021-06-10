import {AOWordContent} from './wordContent';
import {XmlFormat} from '../../editor/xmlLib';
import {success} from '../../functional/result';

export interface InscribedLetter {
  type: 'InscribedLetter';
  content: string;
}

export function inscribedLetter(content: string): InscribedLetter {
  return {type: 'InscribedLetter', content};
}

export const inscribedLetterFormat: XmlFormat<InscribedLetter> = {
  read: (/*TODO: el*/) => success(inscribedLetter('TODO!')),
  write: () => ['x']
};

export function isInscribedLetter(c: AOWordContent): c is InscribedLetter {
  return c.type === 'InscribedLetter';
}