import {Failure} from 'parsimmon';
import {LineNumberInput} from '../graphql';
import {XmlElementNode} from '../xmlModel/xmlModel';
import {writeNode} from '../xmlModel/xmlWriting';
import {ParagraphSeparatorNode} from './paragraphSeparatorParser';

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
  lineNumber: LineNumberInput;
  words: XmlElementNode<'w'>[];
  maybeParagraphSeparator: ParagraphSeparatorNode | undefined;
}

export type LineParseResult = LinePreParsingError | LineWordParsingError | LineParseSuccess;

export function writeLineParseSuccessToXml({lineNumber: {number, isConfirmed}, words, maybeParagraphSeparator}: LineParseSuccess): string {
  return [
    // TODO: `<lb lg="${lg}" lnr="${number + (isConfirmed ? '\'' : '')}" txtid="${textId}"/>`,
    `<lb lnr="${number + (isConfirmed ? '\'' : '')}"/>`,
    ...words.flatMap((w) => writeNode(w)),
    ...(maybeParagraphSeparator ? writeNode(maybeParagraphSeparator) : [])
  ].join(' ');
}

export function writeLineParseResultToXml(lineParseResult: LineParseResult): string {
  switch (lineParseResult.type) {
    case 'LinePreParsingError':
      return '<error>TODO: 1!</error>';
    case 'LineWordParsingError':
      return '<error>TODO: 2!</error>';
    case 'LineParseSuccess':
      return writeLineParseSuccessToXml(lineParseResult);
  }
}
