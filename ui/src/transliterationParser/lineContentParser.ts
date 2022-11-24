import {alt, createLanguage, end, Failure, oneOf, optWhitespace, regexp, Result, Result as ParsimmonResult, seq, string, TypedLanguage} from 'parsimmon';
import {
  akkadogramm,
  aoBasicText,
  aoCorr,
  aoEllipsis,
  aoFootNote,
  aoIllegibleContent,
  aoKolonMark,
  aoSign,
  del_fin,
  del_in,
  determinativ,
  indexDigit,
  inscribedLetter,
  laes_fin,
  laes_in,
  materLectionis,
  ras_in,
  sumerogramm
} from '../model/wordContent';
import {paragraphSeparator, ParagraphSeparator, paragraphSeparatorDouble} from '../model/paragraphSeparator';
import {AOGap, aoGap} from '../model/sentenceContent/gap';
import {AOWord, parsedWord} from '../model/sentenceContent/word';
import {XmlElementNode, XmlNonEmptyNode, XmlTextNode} from '../xmlModel/xmlModel';

// Other

type LanguageSpec = {
  lowerText: string;
  upperText: string;

  indexDigit: XmlTextNode;

  // Multi string content
  damages: XmlElementNode;
  corrections: XmlElementNode;
  inscribedLetter: XmlTextNode;
  basicText: XmlTextNode;

  contentOfMultiStringContent: XmlNonEmptyNode;

  // Other content
  paragraphSeparator: ParagraphSeparator,
  ellipsis: XmlTextNode,

  gap: AOGap;

  // Simple word content
  specialDeterminativeContent: string;
  determinative: XmlElementNode;
  materLectionis: XmlElementNode;
  numeralContent: XmlTextNode;
  footNote: XmlElementNode;
  sign: XmlElementNode;
  kolonMark: XmlElementNode;
  illegible: XmlTextNode;

  simpleWordContent: XmlNonEmptyNode;

  // Word content
  foreignCharacter: XmlNonEmptyNode[];

  akkadogramm: XmlElementNode;
  sumerogramm: XmlElementNode;

  wordContent: XmlNonEmptyNode;

  word: AOWord;
}


function partitionResults<T>(ts: ParsimmonResult<T>[]): [T[], Failure[]] {
  return ts.reduce<[T[], Failure[]]>(
    ([ss, fs], t) =>
      t.status
        ? [[...ss, t.value], fs] as [T[], Failure[]]
        : [ss, [...fs, t]] as [T[], Failure []],
    [[], []]
  );
}

export const transliteration: TypedLanguage<LanguageSpec> = createLanguage<LanguageSpec>({
  lowerText: () => regexp(/\p{Ll}+/u),
  upperText: () => regexp(/\p{Lu}+/u),

  damages: () => alt(
    string('[').result(del_in),
    string(']').result(del_fin),
    string('⸢').result(laes_in),
    string('⸣').result(laes_fin),
    // FIXME: rasure has start and end!
    string('*').result(ras_in),
  ),

  corrections: () => alt(
    string('?'),
    string('(?)'),
    string('!?'),
    string('!'),
    string('sic'),
  ).map(aoCorr),

  paragraphSeparator: () => alt(
    alt(string('§'), string('¬¬¬')).result(paragraphSeparator),
    alt(string('§§'), string('===')).result(paragraphSeparatorDouble)
  ),

  ellipsis: () => alt(string('…'), string('...')).result(aoEllipsis),

  basicText: () => alt(
    regexp(/[\p{Ll}〈<〉>˽]+/u),
    string('-').notFollowedBy(string('-')),
    oneOf('×ₓ')
  ).atLeast(1).tie().map(aoBasicText),

  materLectionis: (r) => seq(
    string('°'),
    alt(
      r.lowerText,
      string('.')
    ).atLeast(1).tie(),
    string('°')
  ).map(([, result,]) => result === 'm' || result === 'f' ? determinativ(aoBasicText(result)) : materLectionis(result)),

  numeralContent: () => regexp(/[[\d]+/).map((result) => aoBasicText(result)),

  illegible: () => string('x').result(aoIllegibleContent),

  sign: () => seq(string('{S:'), optWhitespace, regexp(/[^}]*/), string('}'))
    .map(([, , content,]) => aoSign(content)),

  kolonMark: () => seq(string('{K:'), optWhitespace, regexp(/[^}]*/), string('}'))
    .map(([, , content,]) => aoKolonMark(content)),

  footNote: () => seq(string('{F:'), optWhitespace, regexp(/[^}]*/), string('}'))
    .map(([, , content,]) => aoFootNote(content)),

  gap: () => seq(string('{G:'), optWhitespace, regexp(/[^}]*/), string('}'))
    .map(([, , content,]) => aoGap(content)),

  inscribedLetter: (r) => seq(
    string('x'),
    r.upperText.times(0, 1)
  ).map(([, result]) => result.length === 0 ? indexDigit('x') : inscribedLetter(result[0])),

  indexDigit: () => alt(
    // FIXME: subscript!
    regexp(/\d+/),
    regexp(/[₀₁₂₃₄₅₆₇₈₉]+/).map((res) => (res.charCodeAt(0) % 10).toString()),
    string('x')
  ).lookahead(end).map(indexDigit),

  simpleWordContent: r => alt(
    r.corrections,
    r.damages,
    r.inscribedLetter,
    r.ellipsis,
    r.sign,
    r.footNote,
    r.kolonMark,
    r.basicText,
    // Do not change order of parsers!
    alt(r.determinative, r.materLectionis, r.numeralContent),
  ),

  contentOfMultiStringContent: (r) => alt(
    r.corrections,
    r.damages,
    r.inscribedLetter,
    r.upperText.map(aoBasicText)
  ),

  foreignCharacter: r => seq(
    r.upperText.map(aoBasicText),
    r.contentOfMultiStringContent.many(),
    r.indexDigit.times(0, 1)
  ).map(([first, rest, indexDigit]) => [first, ...rest, ...indexDigit]),

  specialDeterminativeContent: (r) => seq(
    oneOf('mf'),
    seq(
      string('.'),
      r.upperText
    ).tie().times(0, 1)
  ).map(([genus, rest]) => rest ? (genus + rest) : genus),

  determinative: r => seq(
    string('°'),
    alt<string>(
      seq(
        r.upperText,
        seq(string('.'), r.upperText,).many().tie()
      ).tie(),
      r.specialDeterminativeContent
    ),
    string('°')
  ).map(([, content,]) => determinativ(aoBasicText(content))),

  akkadogramm: r => seq(
    alt(
      string('_').result([]),
      string('-').notFollowedBy(string('-')).result(['-']),
    ),
    r.foreignCharacter,
    seq(
      string('-'),
      r.foreignCharacter
    ).many()
  ).map(([mark, first, rest]) => akkadogramm(...mark, ...first, ...rest.flat().flat())),

  sumerogramm: r => seq(
    string('--').times(0, 1),
    r.foreignCharacter,
    seq(
      string('.'),
      r.foreignCharacter
    ).many(),
  ).map(([, first, rest]) => sumerogramm(...first, ...rest.flat().flat())),

  wordContent: r => alt(r.akkadogramm, r.sumerogramm, r.simpleWordContent),

  word: r => alt(
    r.illegible.result([aoIllegibleContent]),
    r.wordContent.atLeast(1)
  ).map((x) => parsedWord(...x)),

});

const spaceNotInAccoladesRegex = /\s+(?![^{]*})/;

interface ContentParseError {
  type: 'ContentParseError';
  errors: Failure[];
}

interface ContentParseSuccess {
  type: 'ContentParseSuccess';
  words: AOWord[];
  maybeParSep: ParagraphSeparator | undefined;
}

export type ContentParseResult = ContentParseError | ContentParseSuccess;

export function parseTransliterationLineContent(content: string): ContentParseResult {
  // split by spaces not in accolades to get single contents (word, parsep or parsep_dbl)
  const stringContents: string[] = content.split(spaceNotInAccoladesRegex);

  if (stringContents.length === 0) {
    // no words or other content in line
    return {type: 'ContentParseSuccess', words: [], maybeParSep: undefined};
  }

  // check last element for special processing (paragraphSeparator)
  const lastContentParSepParseResult: Result<ParagraphSeparator> = transliteration.paragraphSeparator.parse(stringContents[stringContents.length - 1].trim());

  const [wordContents, maybeParSep] = lastContentParSepParseResult.status
    ? [stringContents.slice(0, stringContents.length - 1), lastContentParSepParseResult.value]
    : [stringContents, undefined];

  const wordResults = wordContents.map((input) => transliteration.word.parse(input));

  const [words, errors] = partitionResults(wordResults);

  return errors.length > 0
    ? {type: 'ContentParseError', errors}
    : {type: 'ContentParseSuccess', words, maybeParSep};
}


