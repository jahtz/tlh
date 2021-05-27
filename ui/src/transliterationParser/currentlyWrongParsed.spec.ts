import {parsedWord as w} from "../model/sentenceContent/word";
import {sumerogramm as sg} from "../model/wordContent/sumerogramm";
import {transliteration} from "./parser";
import {determinativ as d} from "../model/wordContent/determinativ";
import {de, le, ls} from "./testHelpers";

describe('', () => {

  test.each([
    ['DUMU°MEŠ°].⸢É⸣.GAL-ma-an', w(sg('DUMU'), d('MEŠ'), sg(de, '.', ls, 'É', le, '.', 'GAL'), '-ma-an')]
  ])(
    'should parse %p as %p',
    (toParse, expected) => expect(transliteration.wordContents.tryParse(toParse)).toEqual(expected.content)
  );

});