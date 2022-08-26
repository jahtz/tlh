import {AOWord, aoWordFormat} from './word';
import {XmlWriter} from '../../xmlModel/xmlWriting';

export interface AOLineBreak {
  type: 'AOLineBreak';
  textId: string;
  side: string;
  column: string;
  lineNumber: string;
  language: string;
  words: AOWord[];
}

export const aoLineBreakFormat: XmlWriter<AOLineBreak> =  ({textId, /*side, column,*/ lineNumber, language, words}) =>
    [`<lb lg="${language}" lnr="${lineNumber}" txtid="${textId}"/>`, ...words.flatMap((w) => aoWordFormat(w))];

export function aoLineBreak(textId: string, lnr: string, language: string, words: AOWord[]): AOLineBreak {
  // TODO: split lnr in side, paragraphNumber, lineNumber and lineNumberIsAbsolute
  const [lineNumber, column, side] = lnr.split(' ').reverse();

  return {type: 'AOLineBreak', side, column, language, lineNumber, textId, words};
}
