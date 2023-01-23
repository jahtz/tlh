import {alt, oneOf, Parser, regexp, seq, string} from 'parsimmon';
import {xmlTextNode, XmlTextNode} from '../xmlModel/xmlModel';
import {correctionParser as corrections} from './correctionParser';
import {damageParser as damages} from './damageParser';
import {ellipsisParser as ellipsis} from './ellipsisParser';
import {footNoteParser as footNote, kolonMarkParser as kolonMark, signParser as sign} from './annotationsParser';
import {determinativeParser as determinative} from './determinativeParser';
import {materLectionisParser as materLectionis} from './materLectionisParser';
import {parsedWord} from '../model/sentenceContent/linebreak';
import {akkadogrammParser as akkadogramm, sumerogrammParser as sumerogramm} from './foreignWordsParser';
import {inscribedLetterMarker} from './inscribedLetterMarkerParser';

export const basicText: Parser<XmlTextNode> = seq(
  regexp(/[\p{Ll}〈〉<>˽]+/u),
  seq(
    alt(
      string('-').notFollowedBy(string('-')),
      oneOf('+×ₓ')
    ),
    regexp(/[\p{Ll}〈〉<>˽]+/u),
  )
).tie().map(xmlTextNode);

export const numeralContentParser = regexp(/[[\d]+/).map((result) => xmlTextNode(result));

export const simpleWordContentParser = alt(
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

export const wordContentParser = alt(
  akkadogramm,
  sumerogramm,
  simpleWordContentParser
);

export const aoIllegibleContent = xmlTextNode('x');

export const wordParser = alt(
  string('x').result([aoIllegibleContent]),
  wordContentParser.atLeast(1)
).map((x) => parsedWord(...x));
