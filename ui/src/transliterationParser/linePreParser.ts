import {optWhitespace, Parser, regexp, Result, seqMap, string} from 'parsimmon';
import {LineNumberInput} from '../graphql';

export interface LinePreParseResult {
  lineNumber: LineNumberInput;
  content: string;
}

const linePreParser: Parser<LinePreParseResult> = seqMap(
  optWhitespace,
  regexp(/\d+?/).map((num) => parseInt(num)),
  string('\'').times(0, 1).map((ticks) => ticks.length === 0),
  optWhitespace,
  string('#'),
  optWhitespace,
  regexp(/[\w\W]+/),
  (_optWs0, number, isConfirmed, _optWs1, _hashTag, _optWs2, content) => ({lineNumber: {number, isConfirmed}, content})
);

/**
 * this functions tries to split a line that was given in the transliteration parser into 2 segments: the line number and the content of the line
 * @param {string} line - input from the transliteration parser *without* newlines
 */
export function preParseLine(line: string): Result<LinePreParseResult> {
  return linePreParser.parse(line);
}