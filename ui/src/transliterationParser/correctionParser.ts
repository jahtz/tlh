import {alt, Parser, string} from 'parsimmon';
import {xmlElementNode, XmlElementNode} from '../xmlModel/xmlModel';

export type Correction = XmlElementNode<'corr'>;

export const aoCorr = (c: string) => xmlElementNode('corr', {c});

export const correctionParser: Parser<Correction> = alt(
  string('?'),
  string('(?)'),
  string('!?'),
  string('!'),
  string('sic'),
).map(aoCorr);