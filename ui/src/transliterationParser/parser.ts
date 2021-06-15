import {alt, createLanguage, end, oneOf, optWhitespace, Parser, regex, regexp, Result as ParsimmonResult, seq, string, TypedLanguage} from 'parsimmon';
import {lineParseResult, LineParseResult} from '../model/lineParseResult';
import {AOSign, aoSign} from '../model/wordContent/sign';
import {damageContent, DamageContent, DamageType} from '../model/wordContent/damages';
import {aoCorr, AOCorr} from '../model/wordContent/corrections';
import {paragraphSeparator, ParagraphSeparator, paragraphSeparatorDouble, ParagraphSeparatorDouble} from '../model/paragraph';
import {AODeterminativ, determinativ,} from '../model/wordContent/determinativ';
import {akkadogramm, AOAkkadogramm} from '../model/wordContent/akkadogramm';
import {AOSumerogramm, sumerogramm} from '../model/wordContent/sumerogramm';
import {inscribedLetter, InscribedLetter} from '../model/wordContent/inscribedLetter';
import {AOGap, aoGap} from '../model/sentenceContent/gap';
import {aoEllipsis, Ellipsis} from '../model/wordContent/ellipsis';
import {AOWord, parsedWord} from '../model/sentenceContent/word';
import {AOMaterLectionis, materLectionis} from '../model/wordContent/materLectionis';
import {AONumeralContent, numeralContent} from '../model/wordContent/numeralContent';
import {AOFootNote, aoNote} from '../model/wordContent/footNote';
import {aoIllegibleContent, AOIllegibleContent} from '../model/wordContent/illegible';
import {aoKolonMark, AOKolonMark} from '../model/wordContent/kolonMark';
import {AOSimpleWordContent, AOWordContent} from '../model/wordContent/wordContent';
import {aoBasicText, BasicText} from '../model/wordContent/basicText';
import {ForeignCharacter, UpperMultiStringContent} from '../model/wordContent/multiStringContent';
import {indexDigit, IndexDigit} from '../model/wordContent/indexDigit';

// Other

const lowerTextRegex = /\p{Ll}+/u;
const upperTextRegex = /\p{Lu}+/u;

type LanguageSpec = {
  indexDigit: IndexDigit;

  // Multi string content
  damages: DamageContent;
  corrections: AOCorr;
  inscribedLetter: InscribedLetter | IndexDigit;
  basicText: BasicText;

  contentOfMultiStringContent: UpperMultiStringContent;

  // Other content
  paragraphSeparator: ParagraphSeparator,
  paragraphSeparatorDouble: ParagraphSeparatorDouble,
  ellipsis: Ellipsis,

  gap: AOGap;

  // Simple word content
  specialDeterminativContent: string;
  determinativ: AODeterminativ;
  materLectionis: AOMaterLectionis | AODeterminativ;
  numeralContent: AONumeralContent;
  footNote: AOFootNote;
  sign: AOSign;
  kolonMark: AOKolonMark;
  illegible: AOIllegibleContent;

  simpleWordContent: AOSimpleWordContent;

  // Word content
  foreignCharacter: ForeignCharacter;

  akkadogramm: AOAkkadogramm;
  sumerogramm: AOSumerogramm;

  wordContent: AOWordContent;

  wordContents: AOWordContent[];
}

interface LinePreParseResult {
  lineNumber: string;
  content: string;
}

function newLinePreParseResult(lineNumber: string, content: string): LinePreParseResult {
  return {lineNumber, content};
}

const lineParser: Parser<LinePreParseResult> = seq(
  regexp(/\d+'?/),
  optWhitespace,
  string('#'),
  optWhitespace,
  regexp(/[\w\W]+/)
).map(([number, , , , content]) => newLinePreParseResult(number, content));

export const transliteration: TypedLanguage<LanguageSpec> = createLanguage<LanguageSpec>({
  damages: () => alt(
    string('[').result(DamageType.DeletionStart),
    string(']').result(DamageType.DeletionEnd),
    string('⸢').result(DamageType.LesionStart),
    string('⸣').result(DamageType.LesionEnd),
    // FIXME: rasure has start and end!
    string('*').result(DamageType.RasureStart),
    regexp(/[〈<]{2}/).result(DamageType.SurplusStart),
    regexp(/[〉>]{2}/).result(DamageType.SurplusEnd),
    regexp(/[〈<]/).result(DamageType.SupplementStart),
    regex(/[〉>]/).result(DamageType.SupplementEnd),
    string('(').result(DamageType.UnknownDamageStart),
    string(')').result(DamageType.UnknownDamageEnd),
  ).map(damageContent),

  corrections: () => alt(
    string('?'),
    string('(?)'),
    string('!?'),
    string('!'),
    string('sic'),
  ).map(x => aoCorr(x)),

  paragraphSeparator: () => alt(string('§'), string('¬¬¬')).result(paragraphSeparator),
  paragraphSeparatorDouble: () => alt(string('§§'), string('===')).result(paragraphSeparatorDouble),

  ellipsis: () => alt(string('…'), string('...')).result(aoEllipsis),

  basicText: () => alt(
    regexp(lowerTextRegex),
    string('-').notFollowedBy(string('-')),
    oneOf('×ₓ')
  ).atLeast(1).tie().map(aoBasicText),

  materLectionis: () => seq(
    string('°'),
    alt(
      regexp(lowerTextRegex),
      string('.')
    ).atLeast(1).tie(),
    string('°')
  ).map(([, result,]) => result === 'm' || result === 'f' ? determinativ(aoBasicText(result)) : materLectionis(result)),

  numeralContent: () => regexp(/[[\d]+/).map((result) => numeralContent(aoBasicText(result))),

  illegible: () => string('x').result(aoIllegibleContent),

  sign: () => seq(string('{S:'), optWhitespace, regexp(/[^}]*/), string('}'))
    .map(([, , content,]) => aoSign(content)),

  kolonMark: () => seq(string('{K:'), optWhitespace, regexp(/[^}]*/), string('}'))
    .map(([, , content,]) => aoKolonMark(content)),

  footNote: () => seq(string('{F:'), optWhitespace, regexp(/[^}]*/), string('}'))
    .map(([, , content,]) => aoNote(content)),

  gap: () => seq(string('{G:'), optWhitespace, regexp(/[^}]*/), string('}'))
    .map(([, , content,]) => aoGap(content)),

  inscribedLetter: () => seq(
    string('x'),
    regexp(upperTextRegex).times(0, 1)
  ).map(([, result]) => result.length === 0 ? indexDigit('x') : inscribedLetter(result[0])),

  indexDigit: () => alt(
    // FIXME: subscript!
    regexp(/\d+/).map(parseInt),
    regexp(/[₀₁₂₃₄₅₆₇₈₉]+/).map((res) => res.charCodeAt(0) % 10),
    string('x')
  ).lookahead(end).map(indexDigit),

  simpleWordContent: r => alt<AOSimpleWordContent>(
    r.corrections,
    r.damages,
    r.inscribedLetter,
    r.ellipsis,
    r.sign,
    r.footNote,
    r.kolonMark,
    r.basicText,
    // Do not change order of parsers!
    alt(r.determinativ, r.materLectionis, r.numeralContent),
  ),

  contentOfMultiStringContent: r => alt<UpperMultiStringContent>(
    r.corrections,
    r.damages,
    r.inscribedLetter,
    regexp(upperTextRegex).map(aoBasicText)
  ),

  foreignCharacter: r => seq(
    regexp(upperTextRegex).map(aoBasicText),
    r.contentOfMultiStringContent.many(),
    r.indexDigit.times(0, 1)
  ).map(([first, rest, indexDigit]) => [first, ...rest, ...indexDigit]),

  specialDeterminativContent: () => seq(
    oneOf('mf'),
    seq(string('.'), regexp(upperTextRegex)).tie().times(0, 1)
  ).map(([genus, rest]) => rest ? (genus + rest) : genus),

  determinativ: r => seq(
    string('°'),
    alt<string>(
      alt(regexp(upperTextRegex), string('.')).atLeast(1).tie(),
      r.specialDeterminativContent
    ),
    string('°')
  ).map(([, content,]) => determinativ(aoBasicText(content))),

  akkadogramm: r => seq(
    oneOf('_-').map((m) => m === '-' ? [m] : []),
    r.foreignCharacter,
    seq(
      string('-'),
      r.foreignCharacter
    ).many()
  ).map(([mark, first, rest]) => akkadogramm(...mark, ...first, ...rest.flat().flat())),

  sumerogramm: r => seq(
    string('--').times(0, 1),
    // r.foreignCharacter,
    alt(
      string('.'),
      r.foreignCharacter
    ).atLeast(1),
  ).map(([, rest]) => sumerogramm(...rest.flat().flat())),


  wordContent: r => alt(r.akkadogramm, r.sumerogramm, r.simpleWordContent, r.paragraphSeparatorDouble, r.paragraphSeparator),

  wordContents: r => alt<AOWordContent[]>(
    r.illegible.result([aoIllegibleContent]),
    r.wordContent.atLeast(1)
  )
});

const spaceNotInAccoladesRegex = /\s+(?![^{]*})/;

export function parseTransliterationLine(transliterationLineInput: string): LineParseResult | undefined {

  // step 0: trim line content
  const trimmedLine = transliterationLineInput.trim();

  // step 1: extract line number and actual content
  const linePreParsingResult: ParsimmonResult<LinePreParseResult> = lineParser.parse(trimmedLine);

  if (!linePreParsingResult.status) {
    return undefined;
  }

  const {lineNumber, content} = linePreParsingResult.value;

  // step 2: split by spaces not in accolades to get single words
  const words: string[] = content.split(spaceNotInAccoladesRegex);

  // step 4: parse words
  const newContent: AOWord[] = words.map((input) => {
    const wordParseResult: ParsimmonResult<AOWordContent[]> = transliteration.wordContents.parse(input);

    return parsedWord(...(wordParseResult.status ? wordParseResult.value : []));
  });

  return lineParseResult(lineNumber, newContent);
}
