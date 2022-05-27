import {XmlWriter} from '../../xmlEditor/transliterationEditor/xmlModel/xmlWriting';
import {AOWordContent} from './wordContent';

export interface AOKolonMark {
  type: 'AOKolonMark';
  content: string;
}

export const aoKolonMarkFormat: XmlWriter<AOKolonMark> = {
  write: ({content}) => [`<AO:KolonMark>${content}</AO:KolonMark>`]
};

export function aoKolonMark(content: string): AOKolonMark {
  return {type: 'AOKolonMark', content};
}

export function isAoKolonMark(w: AOWordContent): w is AOKolonMark {
  return w.type === 'AOKolonMark';
}