import {xmlElementNode, XmlElementNode, XmlNonEmptyNode, xmlTextNode} from '../xmlModel/xmlModel';
import {alt, Parser, seq, seqMap, string} from 'parsimmon';
import {clearUpperMultiStringContent, upperText} from './parserBasics';
import {optionalIndexNumber} from './indexNumberParser';
import {correctionParser as corrections} from './correctionParser';
import {damageParser as damages} from './damageParser';
import {inscribedLetterMarker} from './inscribedLetterMarkerParser';

export const foreignCharacterParser = seqMap(
  upperText.map(xmlTextNode),
  alt(
    corrections,
    damages,
    inscribedLetterMarker,
    upperText.map(xmlTextNode)
  ).many(),
  optionalIndexNumber,
  (first, rest, indexDigit) => indexDigit !== undefined ? [first, ...rest, indexDigit] : [first, ...rest]
);

// Akkadogramm

export type Akkadogramm = XmlElementNode<'aGr'>;

export const akkadogramm = (...contents: (XmlNonEmptyNode | string)[]) => xmlElementNode('aGr', {}, contents.map(clearUpperMultiStringContent));

export const akkadogrammParser: Parser<Akkadogramm> = seqMap(
  alt(
    string('_').result([]),
    string('-').notFollowedBy(string('-')).result(['-']),
  ),
  foreignCharacterParser,
  seq(
    string('-'),
    foreignCharacterParser
  ).many(),
  (mark, first, rest) => akkadogramm(...mark, ...first, ...rest.flat().flat())
);

// Sumerogramm

export type Sumerogramm = XmlElementNode<'sGr'>;

export const sumerogramm = (...contents: (XmlNonEmptyNode | string)[]) => xmlElementNode('sGr', {}, contents.map(clearUpperMultiStringContent));

export const sumerogrammParser: Parser<Sumerogramm> = seqMap(
  string('--').result('-').times(0, 1),
  foreignCharacterParser,
  seq(
    string('.'),
    foreignCharacterParser
  ).many(),
  (start, first, rest) => {

    // FIXME: starting minus belongs to prior text...
    const startingMinus = start.length === 1
      ? [start[0]]
      : [];

    return sumerogramm(...startingMinus, ...first, ...rest.flat().flat());
  });