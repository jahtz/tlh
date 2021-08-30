import {XmlWriter} from '../../editor/xmlModel/xmlWriting';
import {AOWordContent} from './wordContent';

export interface AOFootNote {
  type: 'AONote';
  content: string;
  number: number;
}

export const aoNoteFormat: XmlWriter<AOFootNote> = {
  write: ({content, number}) => [`<note c="${content}" n="${number}"/>`]
};

export function aoNote(content: string, number = -1): AOFootNote {
  return {type: 'AONote', content, number};
}

export function isAoFootNote(c: AOWordContent): c is AOFootNote {
  return c.type === 'AONote';
}