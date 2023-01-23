import {alt, Parser, string} from 'parsimmon';
import {xmlTextNode, XmlTextNode} from '../xmlModel/xmlModel';

export const aoEllipsis = xmlTextNode('…');

export const ellipsisParser: Parser<XmlTextNode> = alt(
  string('…'),
  string('...')
).result(aoEllipsis);