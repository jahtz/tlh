import {ParagraphSeparator} from './paragraphSeparator';
import {AOWord} from './sentenceContent/word';
import {Failure, Result} from 'parsimmon';
import {LinePreParseResult, preParseLine} from '../transliterationParser/linePreParser';
import {parseTransliterationLineContent} from '../transliterationParser/lineContentParser';

export interface LinePreParsingError {
  type: 'LinePreParsingError';
  error: Failure;
}

export interface LineWordParsingError {
  type: 'LineWordParsingError';
  errors: Failure[];
}

export interface LineParseSuccess {
  type: 'LineParseSuccess';
  lnr: string;
  words: AOWord[];
  maybeParagraphSeparator: ParagraphSeparator | undefined;
}

export function lineParseSuccess(lnr: string, words: AOWord[], maybeParagraphSeparator: ParagraphSeparator | undefined = undefined): LineParseSuccess {
  return {type: 'LineParseSuccess', lnr, words, maybeParagraphSeparator};
}

export type LineParseResult = LinePreParsingError | LineWordParsingError | LineParseSuccess;

export function parseTransliterationLine(transliterationLineInput: string): LineParseResult {

  // extract line number and actual content
  const linePreParsingResult: Result<LinePreParseResult> = preParseLine(transliterationLineInput.trim());

  if (!linePreParsingResult.status) {
    return {type: 'LinePreParsingError', error: linePreParsingResult};
  }

  const {lineNumber, content} = linePreParsingResult.value;

  const contentParseResult = parseTransliterationLineContent(content);

  if ('errors' in contentParseResult) {
    return {type: 'LineWordParsingError', errors: contentParseResult.errors};
  }

  const {words, maybeParSep} = contentParseResult;

  return lineParseSuccess(lineNumber, words, maybeParSep);
}
