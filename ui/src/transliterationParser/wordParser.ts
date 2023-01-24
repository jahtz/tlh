import {alt, oneOf, Parser, regexp, seq, string} from 'parsimmon';
import {xmlTextNode} from '../xmlModel/xmlModel';
import {Correction, correctionParser as corrections} from './correctionParser';
import {damageParser as damages, DamageType} from './damageParser';
import {ellipsisParser as ellipsis} from './ellipsisParser';
import {FootNote, footNoteParser as footNote, KolonMark, kolonMarkParser as kolonMark, Sign, signParser as sign} from './annotationsParser';
import {Determinative, determinativeParser as determinative} from './determinativeParser';
import {MaterLectionis, materLectionisParser as materLectionis} from './materLectionisParser';
import {parsedWord} from '../model/sentenceContent/linebreak';
import {Akkadogramm, akkadogrammParser as akkadogramm, Sumerogramm, sumerogrammParser as sumerogramm} from './foreignWordsParser';
import {inscribedLetterMarker} from './inscribedLetterMarkerParser';

export const basicText: Parser<string> = seq(
  regexp(/[\p{Ll}〈〉<>˽]+/u),
  seq(
    alt(
      string('-').notFollowedBy(string('-')),
      oneOf('+×ₓ')
    ),
    regexp(/[\p{Ll}〈〉<>˽]+/u),
  )
).tie();

export const numeralContentParser: Parser<string> = regexp(/[[\d]+/);

type SimpleWordContent = Correction | DamageType | Sign | FootNote | KolonMark | Determinative | MaterLectionis | string;

export const simpleWordContentParser = alt<SimpleWordContent>(
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

export const wordContentParser = alt<Akkadogramm | Sumerogramm | SimpleWordContent>(
  akkadogramm,
  sumerogramm,
  simpleWordContentParser
);

export const aoIllegibleContent = xmlTextNode('x');

export const wordParser = alt(
  string('x').result([aoIllegibleContent]),
  wordContentParser.atLeast(1)
).map((x) => parsedWord(...x));
