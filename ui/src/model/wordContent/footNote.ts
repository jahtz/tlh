import {AOWordContent} from './wordContent';
import {XmlWriter} from '../../xmlModel/xmlWriting';

export interface AOFootNote {
  type: 'AONote';
  content: string;
  number: number;
}

export const aoNoteFormat: XmlWriter<AOFootNote> = ({content, number}) => [`<note c="${content}" n="${number}"/>`];

export function aoNote(content: string, number = -1): AOFootNote {
  return {type: 'AONote', content, number};
}

export function isAoFootNote(c: AOWordContent): c is AOFootNote {
  return c.type === 'AONote';
}