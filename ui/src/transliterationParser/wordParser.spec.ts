import {transliteration} from './lineContentParser';
import {del_fin, del_in, laes_fin, laes_in, uc, ue, us} from './testHelpers';
import {determinativ as d} from '../model/wordContent/determinativ';
import {sumerogramm as sg} from '../model/wordContent/sumerogramm';
import {numeralContent} from '../model/wordContent/numeralContent';
import {materLectionis} from '../model/wordContent/materLectionis';
import {aoEllipsis} from '../model/wordContent/ellipsis';
import {AOWord, parsedWord} from '../model/sentenceContent/word';

interface TestData {
  toParse: string;
  expected: AOWord;
}

describe('transliteration Parser', () => {
  test.each<TestData>([
    {toParse: '...', expected: parsedWord(aoEllipsis)},
    // FIXME: what does (-) mean? Is this 'legal'?
    {toParse: 'im-ma(-)[', expected: parsedWord('im-ma', us, '-', ue, del_in)},
    {toParse: '°m°LUGAL--KAL', expected: parsedWord(d('m'), sg('LUGAL'), '-', sg('KAL'))},
    {toParse: 'DUMU°MEŠ°].⸢É⸣.GAL-ma-an', expected: parsedWord(sg('DUMU'), d('MEŠ'), sg(del_fin, '.', laes_in, 'É', laes_fin, '.', 'GAL'), '-ma-an')},
    {toParse: 'DINGIR?', expected: parsedWord(sg('DINGIR'), uc)},
    {toParse: '°UR[U°PÚ-na]', expected: parsedWord(d('UR', del_in, 'U'), 'PÚ-na', del_fin)},
    {toParse: '1', expected: parsedWord(numeralContent('1'))},
    {toParse: '°materlect°', expected: parsedWord(materLectionis('materlect'))}
  ])(
    '(word/$#) should parse input "$toParse" as wordContent $expected',
    ({toParse, expected}) => expect(transliteration.word.tryParse(toParse)).toEqual(expected)
  );
});