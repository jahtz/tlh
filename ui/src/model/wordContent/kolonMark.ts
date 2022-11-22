import {AOWordContent} from './wordContent';

export interface AOKolonMark {
  type: 'AOKolonMark';
  content: string;
}

export function convertAoKolonMarkToXmlStrings({content}: AOKolonMark): string[] {
  return [`<AO:KolonMark>${content}</AO:KolonMark>`];
}

export function aoKolonMark(content: string): AOKolonMark {
  return {type: 'AOKolonMark', content};
}

export function isAoKolonMark(w: AOWordContent): w is AOKolonMark {
  return w.type === 'AOKolonMark';
}