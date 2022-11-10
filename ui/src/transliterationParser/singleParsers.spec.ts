import {transliteration} from './lineContentParser';
import {determinativ} from '../model/wordContent/determinativ';
import {materLectionis} from '../model/wordContent/materLectionis';
import {damageContent, DamageType} from '../model/wordContent/damages';
import {aoCorr} from '../model/wordContent/corrections';
import {aoEllipsis} from '../model/wordContent/ellipsis';
import {aoSign} from '../model/wordContent/sign';
import {aoKolonMark} from '../model/wordContent/kolonMark';
import {aoNote} from '../model/wordContent/footNote';
import {aoGap} from '../model/sentenceContent/gap';
import {aoIllegibleContent} from '../model/wordContent/illegible';
import {Parser} from 'parsimmon';
import {AOWordContent} from '../model/wordContent/wordContent';
import {numeralContent} from '../model/wordContent/numeralContent';
import {aoBasicText} from '../model/wordContent/basicText';
import {AOSentenceContent} from '../model/sentence';
import {ParagraphSeparator, paragraphSeparator, paragraphSeparatorDouble} from '../model/paragraphSeparator';

const determinativSpecialGenusCases: [string][] = [['m'], ['f']];
const determinativSpecialDeityCases: [string][] = [['m.D'], ['f.D']];

const materLectionisCases: [string][] = [['abc'], ['xyz']];

const curlyBraceCases: [string][] = [['AN'], ['Anderer Text!'], ['Text : mit : Doppel:punkten']];

export function testParseDamages(parser: Parser<AOWordContent>): void {

  test.each<{ toParse: string, expected: DamageType }>([
    {toParse: '[', expected: 'del_in'},
    {toParse: ']', expected: 'del_fin'},
    {toParse: '⸢', expected: 'laes_in'},
    {toParse: '⸣', expected: 'laes_fin'}
  ])(
    'should parse $toParse as Damage Content with Damage Type $expected',
    ({toParse, expected}) => expect(parser.tryParse(toParse)).toEqual(damageContent(expected))
  );
}

describe('damageParser', () => {
  testParseDamages(transliteration.damages);

  it.skip('should parse rasures', () => {
    fail('TODO: update...');
  });
});

// Corrections

export function testParseCorrections(parser: Parser<AOWordContent>): void {
  const cases = ['?', '(?)', '!', 'sic', '!?'];

  test.each(cases)(
    'should parse correction type %p as Correction Content with correction type %p',
    (toParse) => expect(parser.tryParse(toParse)).toEqual(aoCorr(toParse))
  );
}

describe('correctionsParser', () => testParseCorrections(transliteration.corrections));

// Paragraph separator

export function testParseParagraphSeparator(parser: Parser<ParagraphSeparator>): void {
  test.each<[string, ParagraphSeparator]>([
    ['§', paragraphSeparator],
    ['¬¬¬', paragraphSeparator],
    ['§§', paragraphSeparatorDouble],
    ['===', paragraphSeparatorDouble]
  ])(
    'should parse %p as ParseP',
    (toParse, expected) => expect(parser.tryParse(toParse)).toEqual(expected)
  );
}

describe('parseParagraphParser', () => testParseParagraphSeparator(transliteration.paragraphSeparator));

// Ellipsis

export function testParseEllipsis(parser: Parser<AOWordContent>): void {
  test.each([['…'], ['...']])(
    'should parse %p as Ellipsis',
    (toParse) => expect(parser.tryParse(toParse)).toEqual(aoEllipsis)
  );
}

describe('ellipsisParser', () => testParseEllipsis(transliteration.ellipsis));

// Hittite

export function testParseHittite(parser: Parser<AOWordContent>): void {
  const cases: string[] = ['abc', 'def', 'wyz'];

  test.each(cases)(
    'should parse %p as hittite',
    (toParse) => expect(parser.tryParse(toParse)).toEqual(aoBasicText(toParse)));
}

describe('hittite', () => testParseHittite(transliteration.basicText));

// Determinativ

function testParseDefaultDeterminativ(parser: Parser<AOWordContent>): void {
  const defaultCases: [string][] = [['ABC'], ['XYZ']];

  test.each(defaultCases)(
    'should parse °%p° as a determinativ',
    (toParse) => expect(parser.tryParse(`°${toParse}°`)).toEqual(determinativ(aoBasicText(toParse)))
  );
}

function testParseSpecialGenusDeterminativ(parser: Parser<AOWordContent>): void {
  test.each(determinativSpecialGenusCases)(
    'should parse °%p° as a determinativ [!Special Case!]',
    (toParse) => expect(parser.tryParse(`°${toParse}°`)).toEqual(determinativ(aoBasicText(toParse)))
  );
}

function testParseSpecialDeityDeterminativ(parser: Parser<AOWordContent>): void {
  test.each(determinativSpecialDeityCases)(
    'should parse °%p° as a determinativ [!Special Case!]',
    (toParse) => expect(parser.tryParse(`°${toParse}°`)).toEqual(determinativ(aoBasicText(toParse)))
  );
}

export function testParseDeterminativ(parser: Parser<AOWordContent>): void {
  testParseDefaultDeterminativ(parser);
  testParseSpecialGenusDeterminativ(parser);
  testParseSpecialDeityDeterminativ(parser);
}

describe('determinativ', () => {
  const parser = transliteration.determinative;

  testParseDeterminativ(parser);

  test.each(materLectionisCases)(
    'should not parse °%p° (=> real mater lectionis)',
    (toParse) => expect(parser.parse(`°${toParse}°`).status).toBeFalsy()
  );
});

// Mater Lectionis

export function testParseMaterLectionis(parser: Parser<AOWordContent>): void {
  test.each(materLectionisCases)(
    'should parse °%p° as mater lectionis',
    (toParse) => expect(parser.tryParse(`°${toParse}°`)).toEqual(materLectionis(toParse))
  );
}

describe('materLectionis', () => {
  const parser = transliteration.materLectionis;

  testParseMaterLectionis(parser);
  testParseSpecialGenusDeterminativ(parser);
});

// Illegible Content

export function testParseIllegibleContent(parser: Parser<AOWordContent>): void {
  expect(parser.tryParse('x')).toEqual(aoIllegibleContent);
}

describe('illegible', () => testParseIllegibleContent(transliteration.illegible));

// Sign content

export function testParseSignContent(parser: Parser<AOWordContent>): void {
  test.each(curlyBraceCases)(
    'should parse {S:%p} as a sign',
    (toParse) => expect(parser.tryParse(`{S:${toParse}}`)).toEqual(aoSign(toParse))
  );
}

describe('signParser', () => testParseSignContent(transliteration.sign));

// Gaps

export function testParseGapContent(parser: Parser<AOSentenceContent>): void {
  test.each(curlyBraceCases)(
    'should parse {G:%p} as a gap',
    (toParse) => expect(parser.tryParse(`{G:${toParse}}`)).toEqual(aoGap(toParse))
  );
}

describe('gapParser', () => testParseGapContent(transliteration.gap));

// Foot Note

export function testParseFootNote(parser: Parser<AOWordContent>): void {
  test.each(curlyBraceCases)(
    'should parse {F:%p} as a foot note',
    (toParse) => expect(parser.tryParse(`{F:${toParse}}`)).toEqual(aoNote(toParse))
  );
}

describe('footNoteParser', () => testParseFootNote(transliteration.footNote));

// Kolon Mark

export function testParseKolonMark(parser: Parser<AOWordContent>): void {
  test.each(curlyBraceCases)(
    'should parse {K:%p} as a kolon mark',
    (toParse) => expect(parser.tryParse(`{K:${toParse}}`)).toEqual(aoKolonMark(toParse))
  );
}

describe('kolonMarkParser', () => testParseKolonMark(transliteration.kolonMark));

// Numeral content

export function testParseNumeralContent(parser: Parser<AOWordContent>): void {
  test.each(['1', '3', '4', '77'])(
    'should parse %p as numeral content',
    (toParse) => expect(parser.tryParse(toParse)).toEqual(numeralContent(aoBasicText(toParse)))
  );
}

describe('numeralContentParser', () => testParseNumeralContent(transliteration.numeralContent));

// Inscribed Letter

export function testParseInscribedLetter(parser: Parser<AOWordContent>): void {
  it.skip('should parse an inscribed letter', () => {
    fail('TODO: implement!');
  });
}

describe('inscribedLetterParser', () => testParseInscribedLetter(transliteration.inscribedLetter));

// Index Digit

export function testParseIndexDigit(parser: Parser<any>): void {
  it.skip('should parse an index digit', () => {
    fail('TODO: implement!');
  });
}

describe('indexDigitParser', () => testParseIndexDigit(transliteration.indexDigit));
