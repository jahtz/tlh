import {Failure, Result} from 'parsimmon';
import {LinePreParseResult, preParseLine} from './linePreParser';
import {parseTransliterationLineContent} from './lineContentParser';
import {ParagraphSeparatorNode} from '../model/sentenceContent/linebreak';
import {XmlElementNode} from '../xmlModel/xmlModel';

interface LinePreParsingError {
  type: 'LinePreParsingError';
  error: Failure;
}

interface LineWordParsingError {
  type: 'LineWordParsingError';
  errors: Failure[];
}

interface LineParseSuccess {
  type: 'LineParseSuccess';
  data: {
    // make object?
    lnr: string;
    words: XmlElementNode<'w'>[];
    maybeParagraphSeparator: ParagraphSeparatorNode | undefined;
  };
}

export function lineParseSuccess(lnr: string, words: XmlElementNode<'w'>[], maybeParagraphSeparator: ParagraphSeparatorNode | undefined = undefined): LineParseSuccess {
  return {type: 'LineParseSuccess', data: {lnr, words, maybeParagraphSeparator}};
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
