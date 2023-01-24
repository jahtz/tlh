import {xmlElementNode, XmlElementNode, XmlNonEmptyNode} from '../xmlModel/xmlModel';
import {alt, oneOf, Parser, seq, seqMap, string} from 'parsimmon';
import {clearUpperMultiStringContent, upperText} from './parserBasics';
import {optionalIndexNumber} from './indexNumberParser';
import {Correction, correctionParser as corrections} from './correctionParser';
import {damageParser as damages, DamageType} from './damageParser';
import {inscribedLetterMarker} from './inscribedLetterMarkerParser';

const foreignCharacterParser: Parser<(DamageType | Correction | string)[]> = seqMap(
  upperText,
  alt<DamageType | Correction | string>(
    corrections,
    damages,
    inscribedLetterMarker,
    upperText
  ).many(),
  optionalIndexNumber,
  (first, rest, indexDigit) => indexDigit !== undefined ? [first, ...rest, indexDigit] : [first, ...rest]
);

type NodeOrString = XmlElementNode | string;

type ReduceValues = [NodeOrString[], string | undefined];

export function joinStrings(values: NodeOrString[]): NodeOrString[] {
  if (values.length === 0) {
    return [];
  }

  const [first, ...rest] = values;

  const initialValues: ReduceValues = typeof first === 'string'
    ? [[], first]
    : [[first], undefined];

  const [newValues, remaining] = rest.reduce<ReduceValues>(([acc, current], next) => {
    if (current === undefined) {
      if (typeof next === 'string') {
        return [acc, next];
      } else {
        return [[...acc, next], undefined];
      }
    } else {
      if (typeof next === 'string') {
        return [acc, current + next];
      } else {
        return [[...acc, current, next], undefined];
      }
    }
  }, initialValues);

  return [...newValues, ...(remaining !== undefined ? [remaining] : [])];
}

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
    oneOf('-+'),
    foreignCharacterParser
  ).many(),
  (mark: string[], first: (DamageType | Correction | string)[], rest) => akkadogramm(...joinStrings([...mark, ...first, ...rest.flat().flat()]))
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

    return sumerogramm(...startingMinus, ...joinStrings([...first, ...rest.flat().flat()]));
  });