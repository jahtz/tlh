import {alt, oneOf, Parser, seqMap, string} from 'parsimmon';
import {xmlElementNode, XmlElementNode, XmlNonEmptyNode, xmlTextNode} from '../xmlModel/xmlModel';
import {clearUpperMultiStringContent, upperText} from './parserBasics';
import {optionalIndexNumber} from './indexNumberParser';

export type Determinative = XmlElementNode<'d'>

export const determinativ = (...content: (XmlNonEmptyNode | string)[]): Determinative => xmlElementNode('d', {}, content.map(clearUpperMultiStringContent));

const determinativeFollowingSyllable: Parser<string> = seqMap(
  string('.'),
  upperText,
  (point, text) => point + text
);

const specialDeterminativeContent: Parser<string> = seqMap(
  oneOf('mf'),
  determinativeFollowingSyllable.times(0, 1),
  (genus, maybeRest) => maybeRest.length === 1 ? (genus + maybeRest[0]) : genus
);

const defaultDeterminativeContent: Parser<string> = seqMap(
  upperText,
  determinativeFollowingSyllable.many().tie(),
  (first, following) => first + following
);

export const determinativeParser: Parser<Determinative> = seqMap(
  string('°'),
  alt(
    specialDeterminativeContent,
    defaultDeterminativeContent
  ),
  optionalIndexNumber.times(0, 1),
  string('°'),
  (_openingCircle, content, maybeIndexNumber, /* _closingCircle*/) => determinativ(xmlTextNode(content + (maybeIndexNumber || '')))
);
