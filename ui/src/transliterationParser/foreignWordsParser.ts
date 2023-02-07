import {XmlElementNode} from '../xmlModel/xmlModel';
import {alt, Parser, seqMap} from 'parsimmon';
import {upperText} from './parserBasics';
import {optionalIndexNumber} from './indexNumberParser';
import {Correction, correctionParser as corrections} from './correctionParser';
import {damageParser as damages, DamageType} from './damageParser';
import {inscribedLetterMarker} from './inscribedLetterMarkerParser';

export type ForeignCharacter = DamageType | Correction | string;

export const foreignCharacterParser: Parser<ForeignCharacter[]> = seqMap(
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
