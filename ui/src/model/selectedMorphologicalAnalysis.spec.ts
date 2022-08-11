import {
  readSelectedMorphology,
  SelectedMorphAnalysis,
  selectedMultiMorphAnalysisWithEnclitics as mw,
  selectedMultiMorphAnalysisWithoutEnclitics as mwo,
  selectedSingleMorphAnalysis as swo,
  selectedSingleMorphAnalysisWithEnclitic as sw
} from './selectedMorphologicalAnalysis';

describe('reading selected morphological analyses', () => {

  test.each<[string, ...SelectedMorphAnalysis[]]>([
    // Single without enclitics
    ['4', swo(4)],
    ['1 2', swo(1), swo(2)],

    // Single with enclitics
    ['1R', sw(1, 'R')],
    ['1S 2R 2S 3R', sw(1, 'S'), sw(2, 'R'), sw(2, 'S'), sw(3, 'R')],

    // Multi without enclitics
    ['1a', mwo(1, 'a')],
    ['2c 3', mwo(2, 'c'), swo(3)],

    // Multi with enclitics
    ['1aR', mw(1, 'a', 'R')],
    ['2cR 2cS', mw(2, 'c', 'R'), mw(2, 'c', 'S')],

    // Mixed
    ['1a 1b 1c', mwo(1, 'a'), mwo(1, 'b'), mwo(1, 'c')],
    ['1c 2aS 2aU 3 4bR 4bT', mwo(1, 'c'), mw(2, 'a', 'S'), mw(2, 'a', 'U'), swo(3), mw(4, 'b', 'R'), mw(4, 'b', 'T')],
  ])(
    'it should read an mrp0sel analysis string "%s" as %j',
    (toRead, ...awaited) => expect(readSelectedMorphology(toRead)).toEqual(awaited)
  );

});