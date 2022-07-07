import {readSelectedMorphology} from './selectedAnalysisOption';
import {
  SelectedMorphAnalysis,
  selectedMultiMorphAnalysisWithEnclitics as multiWith,
  selectedMultiMorphAnalysisWithoutEnclitics as multiWithout,
  selectedSingleMorphAnalysis as singleWithout,
  selectedSingleMorphAnalysisWithEnclitic as singleWith
} from '../model/selectedMorphologicalAnalysis';

describe('reading selected morphological analyses', () => {

  test.each<[string, ...SelectedMorphAnalysis[]]>([
    // Single without enclitics
    ['4', singleWithout(4)],
    ['1 2', singleWithout(1), singleWithout(2)],

    // Single with enclitics
    ['1R', singleWith(1, 'R')],
    ['1S 2R 2S 3R', singleWith(1, 'S'), singleWith(2, 'R'), singleWith(2, 'S'), singleWith(3, 'R')],

    // Multi without enclitics
    ['1a', multiWithout(1, 'a')],
    ['2c 3', multiWithout(2, 'c'), singleWithout(3)],

    // Multi with enclitics
    ['1aR', multiWith(1, 'a', 'R')],
    ['2cR 2cS', multiWith(2, 'c', 'R'), multiWith(2, 'c', 'S')],

    // Mixed
    ['1a 1b 1c', multiWithout(1, 'a'), multiWithout(1, 'b'), multiWithout(1, 'c')],
    ['1c 2aS 2aU 3 4bR 4bT', multiWithout(1, 'c'), multiWith(2, 'a', 'S'), multiWith(2, 'a', 'U'), singleWithout(3), multiWith(4, 'b', 'R'), multiWith(4, 'b', 'T')],
  ])(
    'it should read an mrp0sel analysis string "%s" as %j',
    (toRead, ...awaited) => expect(readSelectedMorphology(toRead)).toEqual(awaited)
  );

});