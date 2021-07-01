import {XmlWriter} from '../../editor/xmlModel';
import {AOSentenceContent} from '../sentence';
import {AOWord, aoWordFormat} from './word';

export interface AOLineBreak {
  type: 'AOLineBreak';
  textId: string;
  side: string;
  column: string;
  lineNumber: string;
  language: string;
  words: AOWord[]
}

export const aoLineBreakFormat: XmlWriter<AOLineBreak> = {
  write: ({textId, /*side, column,*/ lineNumber, language, words}) =>
    [`<lb lg="${language}" lnr="${lineNumber}" txtid="${textId}"/>`, ...words.flatMap((w) => aoWordFormat.write(w))]
};

export function aoLineBreak(textId: string, lnr: string, language: string, words: AOWord[]): AOLineBreak {
  // TODO: split lnr in side, paragraphNumber, lineNumber and lineNumberIsAbsolute
  const [lineNumber, column, side] = lnr.split(' ').reverse();

  return {type: 'AOLineBreak', side, column, language, lineNumber, textId, words};
}

export function isAOLineBreak(c: AOSentenceContent): c is AOLineBreak {
  return c.type === 'AOLineBreak';
}