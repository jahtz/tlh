import {oneOf, Parser} from 'parsimmon';
import {upperText} from './parserBasics';

/**
 * FIXME: make tests!
 */
export const inscribedLetterMarker: Parser<string> = oneOf('x×')
  .lookahead(upperText)
  .result('×');
