import {AOWord} from "./sentenceContent/word";

export interface LineParseResult {
  type: 'LineParseResult';
  lineNumber: string;
  words: AOWord[]
}

export function lineParseResult(lineNumber: string, words: AOWord[]): LineParseResult {
  return {type: 'LineParseResult', lineNumber, words};
}
