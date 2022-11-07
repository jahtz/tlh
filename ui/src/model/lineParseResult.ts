import {ParagraphSeparator} from './paragraphSeparator';
import {AOWord} from './sentenceContent/word';


export interface LineParseResult {
  type: 'LineParseResult';
  lineNumber: string;
  words: AOWord[];
  paragraphSeparator: ParagraphSeparator | undefined;
}

export function lineParseResult(lineNumber: string, words: AOWord[], paragraphSeparator: ParagraphSeparator | undefined = undefined): LineParseResult {
  return {type: 'LineParseResult', lineNumber, words, paragraphSeparator};
}
