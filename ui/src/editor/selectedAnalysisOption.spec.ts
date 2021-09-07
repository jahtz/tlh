import {readSelectedMorphology, SelectedAnalysisOption} from './selectedAnalysisOption';

describe('reading selected morphological analyses', () => {

  const s1 = '4';
  const sm1: SelectedAnalysisOption[] = [{number: 4}];

  const s2 = '1 2';
  const sm2: SelectedAnalysisOption[] = [{number: 1}, {number: 2}];

  const s3 = '1a';
  const sm3: SelectedAnalysisOption[] = [{number: 1, letter: 'a'}];

  const s4 = '2c 3';
  const sm4: SelectedAnalysisOption[] = [{number: 2, letter: 'c'}, {number: 3}];

  const s5 = '1aR';
  const sm5: SelectedAnalysisOption[] = [{number: 1, letter: 'a', enclitics: ['R']}];

  const s6 = '2cRS';
  const sm6: SelectedAnalysisOption[] = [{number: 2, letter: 'c', enclitics: ['R', 'S']}];

  const s7 = '1c 2aSU 3 4bRT';
  const sm7: SelectedAnalysisOption[] = [{number: 1, letter: 'c'}, {number: 2, letter: 'a', enclitics: ['S', 'U']}, {number: 3}, {
    number: 4,
    letter: 'b',
    enclitics: ['R', 'T']
  }];

  test.each`
  toRead   | awaited
  ${s1}    | ${sm1}
  ${s2}    | ${sm2}
  ${s3}    | ${sm3}
  ${s4}    | ${sm4}
  ${s5}    | ${sm5}
  ${s6}    | ${sm6}
  ${s7}    | ${sm7}
  `(
    'it should read $toRead as $expected',
    ({toRead, awaited}) => expect(readSelectedMorphology(toRead)).toEqual(awaited)
  );

});