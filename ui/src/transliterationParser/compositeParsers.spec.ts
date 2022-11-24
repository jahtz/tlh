import {transliteration} from './lineContentParser';
import {akkadogramm, indexDigit, inscribedLetter, sumerogramm} from '../model/wordContent';
import {Parser} from 'parsimmon';
import {
  testParseCorrections,
  testParseDamages,
  testParseDeterminativ,
  testParseFootNote,
  testParseInscribedLetter,
  testParseKolonMark,
  testParseMaterLectionis,
  testParseNumeralContent,
  testParseSignContent
} from './singleParsers.spec';
import {XmlNonEmptyNode} from '../xmlModel/xmlModel';

function testParseContentOfMultiContent(parser: Parser<XmlNonEmptyNode>): void {
  // testParseHittite(parser);
  // FIXME: parse upper text!
  testParseCorrections(parser);
  testParseDamages(parser);
  testParseInscribedLetter(parser);
}

describe('contentOfMultiStringContentParser', () => testParseContentOfMultiContent(transliteration.contentOfMultiStringContent));

function testParseSimpleWordContent(parser: Parser<XmlNonEmptyNode>): void {
  testParseContentOfMultiContent(parser);
  testParseDeterminativ(parser);
  testParseMaterLectionis(parser);
  testParseNumeralContent(parser);
  testParseFootNote(parser);
  testParseSignContent(parser);
  testParseKolonMark(parser);
  //  testParseIllegibleContent(parser);
}

describe('simpleWordContentParser', () => testParseSimpleWordContent(transliteration.simpleWordContent));

// Akkadogramm

function testParseAkkadogramm(parser: Parser<XmlNonEmptyNode>): void {
  test.each`
  toParse       | expected
  ${'_ABC'}     | ${akkadogramm('ABC')}
  ${'_LUGAL'}   | ${akkadogramm('LUGAL')}
  ${'_LUGxAL'}  | ${akkadogramm('LUG', inscribedLetter('AL'))}
  ${'_LUGxALx'} | ${akkadogramm('LUG', inscribedLetter('AL'), indexDigit('x'))}
  ${'_Ú-UL'}    | ${akkadogramm('Ú', '-', 'UL')}
  ${'_Úx-UL'}   | ${akkadogramm('Ú', indexDigit('x'), '-', 'UL')}
  ${'-ABC'}     | ${akkadogramm('-', 'ABC')}
  ${'-LUGAL'}   | ${akkadogramm('-', 'LUGAL')}
  ${'-LUGxAL'}  | ${akkadogramm('-', 'LUG', inscribedLetter('AL'))}
  ${'-LUGxALx'} | ${akkadogramm('-', 'LUG', inscribedLetter('AL'), indexDigit('x'))}
  ${'-Ú-UL'}    | ${akkadogramm('-', 'Ú', '-', 'UL')}
  ${'-Úx-UL'}   | ${akkadogramm('-', 'Ú', indexDigit('x'), '-', 'UL')}
  `(
    'should parse $toParse as an akkadogramm $expected',
    ({toParse, expected}) => expect(parser.tryParse(toParse)).toEqual(expected)
  );
}

describe('akkadogramm', () => testParseAkkadogramm(transliteration.akkadogramm));

// Sumerogramm

function testParseSumerogramm(parser: Parser<XmlNonEmptyNode>): void {
  test.each`
  toParse        | expected
  ${'ABC'}       | ${sumerogramm('ABC')}
  ${'LUGAL'}     | ${sumerogramm('LUGAL')}
  ${'GUx.MAḪ'}   | ${sumerogramm('GU', indexDigit('x'), '.', 'MAḪ')}
  ${'--ABC'}     | ${sumerogramm('ABC')}
  ${'--LUGAL'}   | ${sumerogramm('LUGAL')}
  ${'--GUx.MAḪ'} | ${sumerogramm('GU', indexDigit('x'), '.', 'MAḪ')}
  `(
    'should parse $toParse as sumerogramm $expected',
    ({toParse, expected}) => expect(parser.tryParse(toParse)).toEqual(expected)
  );
}

describe('sumerogramm', () => testParseSumerogramm(transliteration.sumerogramm));

// Word Content

function testParseWordContent(parser: Parser<XmlNonEmptyNode>): void {
  testParseAkkadogramm(parser);
  testParseSumerogramm(parser);
  testParseSimpleWordContent(parser);
//  testParseIllegibleContent(parser);
}

describe('wordContent', () => testParseWordContent(transliteration.wordContent));