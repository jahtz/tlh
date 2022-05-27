import {AOWordContent} from './wordContent';
import {XmlWriter} from '../../xmlEditor/transliterationEditor/xmlModel/xmlWriting';

export interface InscribedLetter {
  type: 'InscribedLetter';
  content: string;
}

export function inscribedLetter(content: string): InscribedLetter {
  return {type: 'InscribedLetter', content};
}

export const inscribedLetterFormat: XmlWriter<InscribedLetter> = {
  write: () => ['x']
};

export function isInscribedLetter(c: AOWordContent): c is InscribedLetter {
  return c.type === 'InscribedLetter';
}