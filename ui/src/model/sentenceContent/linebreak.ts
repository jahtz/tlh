import {AOWord, aoWordFormat} from './word';
import {XmlWriter} from '../../xmlModel/xmlWriting';
import {ParagraphSeparator} from '../paragraphSeparator';

export interface AOLineBreak {
  type: 'AOLineBreak';
  textId: string;
  lnr: string;
  language: string;
  words: AOWord[];
  maybeParagraphSeparator: ParagraphSeparator | undefined;
}

export const aoLineBreakFormat: XmlWriter<AOLineBreak> = ({textId, lnr, language, words}) => [
  `<lb lg="${language}" lnr="${lnr}" txtid="${textId}"/>`,
  ...words.flatMap((w) => aoWordFormat(w))
];

export function aoLineBreak(
  textId: string,
  lnr: string,
  language: string,
  words: AOWord[],
  maybeParagraphSeparator: ParagraphSeparator | undefined
): AOLineBreak {
  return {type: 'AOLineBreak', textId, lnr, language, words, maybeParagraphSeparator};
}
