import {Parser, string} from 'parsimmon';
import {xmlTextNode, XmlTextNode} from '../xmlModel/xmlModel';
import {upperText} from './parserBasics';

/**
 * FIXME: make tests!
 */
export const inscribedLetterMarker: Parser<XmlTextNode> = string('x')
  .lookahead(upperText)
  .result(xmlTextNode('×'));
