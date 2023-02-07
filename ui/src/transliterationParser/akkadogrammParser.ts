import {xmlElementNode, XmlElementNode, XmlNonEmptyNode} from '../xmlModel/xmlModel';
import {oneOf, Parser, seq, seqMap, string} from 'parsimmon';
import {clearUpperMultiStringContent} from './parserBasics';
import {DamageType} from './damageParser';
import {Correction} from './correctionParser';
import {foreignCharacterParser, joinStrings} from './foreignWordsParser';

export type Akkadogramm = XmlElementNode<'aGr'>;

export const akkadogramm = (...contents: (XmlNonEmptyNode | string)[]) => xmlElementNode('aGr', {}, contents.map(clearUpperMultiStringContent));

const akkadogrammContentParser: Parser<Akkadogramm> = seqMap(
  foreignCharacterParser,
  seq(
    oneOf('-+'),
    foreignCharacterParser
  ).many(),
  (first: (DamageType | Correction | string)[], rest) => akkadogramm(/*mark, */...joinStrings([...first, ...rest.flat().flat()]))
);

export const firstSyllableAkkadogrammParser: Parser<Akkadogramm> = seqMap(
  string('_'),
  akkadogrammContentParser,
  (mark, akkadogramm) => akkadogramm
);

export const otherSyllablesAkkadogrammParser: Parser<Akkadogramm> = akkadogrammContentParser;
