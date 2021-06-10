import {XmlFormat} from '../../editor/xmlLib';
import {AOWordContent} from './wordContent';
import {success} from '../../functional/result';

export interface AOKolonMark {
  type: 'AOKolonMark';
  content: string;
}

export const aoKolonMarkFormat: XmlFormat<AOKolonMark> = {
  read: (el) => success(aoKolonMark(el.textContent || '')),
  write: ({content}) => [`<AO:KolonMark>${content}</AO:KolonMark>`]
};

export function aoKolonMark(content: string): AOKolonMark {
  return {type: 'AOKolonMark', content};
}

export function isAoKolonMark(w: AOWordContent): w is AOKolonMark {
  return w.type === 'AOKolonMark';
}