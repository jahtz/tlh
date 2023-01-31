import {alt, Parser, regexp, string} from 'parsimmon';
import {xmlElementNode, XmlElementNode, XmlNonEmptyNode, xmlTextNode} from '../xmlModel/xmlModel';
import {Correction, correctionParser as corrections} from './correctionParser';
import {damageParser as damages, DamageType} from './damageParser';
import {ellipsisParser as ellipsis} from './ellipsisParser';
import {FootNote, footNoteParser as footNote, KolonMark, kolonMarkParser as kolonMark, Sign, signParser as sign} from './annotationsParser';
import {Determinative, determinativeParser as determinative} from './determinativeParser';
import {MaterLectionis, materLectionisParser as materLectionis} from './materLectionisParser';
import {Akkadogramm, akkadogrammParser as akkadogramm, Sumerogramm, sumerogrammParser as sumerogramm} from './foreignWordsParser';
import {inscribedLetterMarker} from './inscribedLetterMarkerParser';
import {basicText} from './basicTextParser';

export function parsedWord(...content: (XmlNonEmptyNode | string)[]): XmlElementNode<'w'> {
  return xmlElementNode('w', {}, content.map((c) => typeof c === 'string' ? xmlTextNode(c) : c));
}


export const numeralContentParser: Parser<string> = regexp(/[[\d]+/);

type SimpleWordContent = Correction | DamageType | Sign | FootNote | KolonMark | Determinative | MaterLectionis | string;

export const simpleWordContentParser: Parser<SimpleWordContent> = alt<SimpleWordContent>(
  corrections,
  damages,
  inscribedLetterMarker,
  ellipsis,
  sign,
  footNote,
  kolonMark,
  basicText,
  // Do not change order of parsers!
  determinative,
  materLectionis,
  numeralContentParser,
);

type WordContent = Akkadogramm | Sumerogramm | SimpleWordContent;

export const wordContentParser: Parser<WordContent> = alt<WordContent>(
  akkadogramm,
  sumerogramm,
  simpleWordContentParser
);

export const wordParser = alt(
  string('x').result([xmlTextNode('x')]),
  wordContentParser.atLeast(1)
).map((x) => parsedWord(...x));
