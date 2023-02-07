import {xmlElementNode, XmlElementNode, XmlNonEmptyNode} from '../xmlModel/xmlModel';
import {Parser, seqMap, string} from 'parsimmon';
import {clearUpperMultiStringContent} from './parserBasics';
import {ForeignCharacter, foreignCharacterParser as foreignCharacter, joinStrings} from './foreignWordsParser';

export type Sumerogramm = XmlElementNode<'sGr'>;

export const sumerogramm = (...contents: (XmlNonEmptyNode | string)[]) => xmlElementNode('sGr', {}, contents.map(clearUpperMultiStringContent));

const sumerogrammParser: Parser<Sumerogramm> = seqMap(
  foreignCharacter,
  seqMap(
    string('.'),
    foreignCharacter,
    (point, foreignChars): ForeignCharacter[] => [point, ...foreignChars]
  ).many().map((foreignChars) => foreignChars.flat()),
  (first: ForeignCharacter[], rest: ForeignCharacter[]) => sumerogramm(...joinStrings([...first, ...rest]))
);

export const firstSyllableSumerogrammParser: Parser<Sumerogramm> = sumerogrammParser;

export const innerWordSumerogrammParser: Parser<Sumerogramm> = seqMap(
  string('-'),
  sumerogrammParser,
  (minus, sumerogramm) => sumerogramm
);