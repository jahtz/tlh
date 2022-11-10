import {optWhitespace, Parser, regexp, Result, seq, string} from 'parsimmon';


function newLinePreParseResult(lineNumber: string, content: string): LinePreParseResult {
  return {lineNumber, content};
}

const linePreParser: Parser<LinePreParseResult> = seq(
  regexp(/\d+'?/),
  optWhitespace,
  string('#'),
  optWhitespace,
  regexp(/[\w\W]+/)
).map(([number, , , , content]) => newLinePreParseResult(number, content));


export interface LinePreParseResult {
  lineNumber: string;
  content: string;
}

/**
 * this functions tries to split a line that was given in the transliteration parser into 2 segments: the line number and the content of the line
 * @param {string} line - input from the transliteration parser *without* newlines
 */
export function preParseLine(line: string): Result<LinePreParseResult> {
  return linePreParser.parse(line);
}