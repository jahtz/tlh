import {
  IMorphologicalAnalysis,
  ISingleMorphologicalAnalysis,
  MultiMorphologicalAnalysisWithMultiEnclitics,
  MultiMorphologicalAnalysisWithoutEnclitics,
  MultiMorphologicalAnalysisWithSingleEnclitics,
  SingleMorphologicalAnalysisWithMultiEnclitics,
  SingleMorphologicalAnalysisWithoutEnclitics,
  SingleMorphologicalAnalysisWithSingleEnclitics
} from '../../model/morphologicalAnalysis';
import {
  extractSelMorphAnalysesFromMultiMorphWithMultiEnc,
  extractSelMorphAnalysesFromMultiMorphWithoutEnc,
  extractSelMorphAnalysesFromMultiMorphWithSingleEnc,
  extractSelMorphAnalysesFromSingleMorphWithMultiEnc,
  extractSelMorphAnalysesFromSingleMorphWithoutEnc,
  extractSelMorphAnalysesFromSingleMorphWithSingleEnc
} from './wordNodeData';
import {MultiEncliticsAnalysis, SingleEncliticsAnalysis} from '../../model/encliticsAnalysis';
import {LetteredAnalysisOption, SelectableLetteredAnalysisOption} from '../../model/analysisOptions';
import {selectedMultiMorphAnalysisWithEnclitics} from '../../model/selectedMorphologicalAnalysis';

// Helpers

const baseMorphAnalysis: IMorphologicalAnalysis = {
  number: 1, referenceWord: '', translation: '', determinative: undefined, paradigmClass: ''
};

const encliticsAnalysis: SingleEncliticsAnalysis = {enclitics: '', analysis: ''};

function laos(...letters: string[]): LetteredAnalysisOption[] {
  return letters.map((letter) => ({letter, analysis: ''}));
}

function slaos(slaosMap: { [key: string]: boolean }): SelectableLetteredAnalysisOption[] {
  return Object.entries(slaosMap).map(([letter, selected]) => ({letter, analysis: '', selected}));
}

function multiEncliticsAnalysis(saosMap: { [key: string]: boolean }): MultiEncliticsAnalysis {
  return {
    enclitics: '',
    analysisOptions: slaos(saosMap)
  };
}

// single morphs

const baseSingleMorphAnalysis: ISingleMorphologicalAnalysis = {...baseMorphAnalysis, analysis: ''};

describe('wordNodeData', () => {

  // Single morphs without enclitics
  test.each<{ ma: SingleMorphologicalAnalysisWithoutEnclitics, expected: string[] }>([
    {ma: {_type: 'SingleMorphAnalysisWithoutEnclitics', ...baseSingleMorphAnalysis, encliticsAnalysis: undefined, selected: false}, expected: []},
    {ma: {_type: 'SingleMorphAnalysisWithoutEnclitics', ...baseSingleMorphAnalysis, encliticsAnalysis: undefined, selected: true}, expected: ['1']}
  ])(
    'should extract selection from $ma as $expected',
    ({ma, expected}) => expect(extractSelMorphAnalysesFromSingleMorphWithoutEnc(ma)).toEqual(expected)
  );

  // Single morph analysis with single enclitics
  test.each<{ ma: SingleMorphologicalAnalysisWithSingleEnclitics, expected: string[] }>([
    {ma: {_type: 'SingleMorphAnalysisWithSingleEnclitics', ...baseSingleMorphAnalysis, encliticsAnalysis, selected: false}, expected: []},
    {ma: {_type: 'SingleMorphAnalysisWithSingleEnclitics', ...baseSingleMorphAnalysis, encliticsAnalysis, selected: true}, expected: ['1']}
  ])(
    'should extract selection from $ma as $expected',
    ({ma, expected}) => expect(extractSelMorphAnalysesFromSingleMorphWithSingleEnc(ma)).toEqual(expected)
  );

  // single morph analysis with multi enclitics
  test.each<{ ma: SingleMorphologicalAnalysisWithMultiEnclitics, expected: string[] }>([
    {
      ma: {
        _type: 'SingleMorphAnalysisWithMultiEnclitics', ...baseSingleMorphAnalysis,
        encliticsAnalysis: {enclitics: '', analysisOptions: slaos({R: false, S: false, T: false})}
      }, expected: []
    },
    {
      ma: {
        _type: 'SingleMorphAnalysisWithMultiEnclitics', ...baseSingleMorphAnalysis,
        encliticsAnalysis: {enclitics: '', analysisOptions: slaos({R: true, S: true, T: true})}
      }, expected: ['1R', '1S', '1T']
    }
  ])(
    'should extract selection from $ma as $expected',
    ({ma, expected}) => expect(extractSelMorphAnalysesFromSingleMorphWithMultiEnc(ma)).toEqual(expected)
  );

  // multi morph analysis without enclitics
  test.each<{ ma: MultiMorphologicalAnalysisWithoutEnclitics, expected: string[] }>([
    {
      ma: {
        ...baseSingleMorphAnalysis,
        _type: 'MultiMorphAnalysisWithoutEnclitics',
        encliticsAnalysis: undefined,
        analysisOptions: slaos({a: false, b: false, c: false})
      },
      expected: []
    },
    {
      ma: {
        ...baseSingleMorphAnalysis,
        _type: 'MultiMorphAnalysisWithoutEnclitics',
        encliticsAnalysis: undefined,
        analysisOptions: slaos({a: true, b: false, c: true})
      },
      expected: ['1a', '1c']
    }
  ])(
    'should extract selection from $ma as $expected',
    ({ma, expected}) => expect(extractSelMorphAnalysesFromMultiMorphWithoutEnc(ma)).toEqual(expected)
  );

  // multi morph analysis with single enclitics
  test.each<{ ma: MultiMorphologicalAnalysisWithSingleEnclitics, expected: string[] }>([
    {
      ma: {
        ...baseSingleMorphAnalysis,
        _type: 'MultiMorphAnalysisWithSingleEnclitics',
        encliticsAnalysis,
        analysisOptions: slaos({a: false, b: false, c: false})
      }, expected: []
    },
    {
      ma: {...baseSingleMorphAnalysis, _type: 'MultiMorphAnalysisWithSingleEnclitics', encliticsAnalysis, analysisOptions: slaos({a: true, b: true, c: true})},
      expected: ['1a', '1b', '1c']
    }
  ])(
    'should extract selection from $ma as $expected',
    ({ma, expected}) => expect(extractSelMorphAnalysesFromMultiMorphWithSingleEnc(ma)).toEqual(expected)
  );

  // multi morph analysis with multi enclitics
  test.each<{ ma: MultiMorphologicalAnalysisWithMultiEnclitics, expected: string[] }>([
    {
      ma: {
        ...baseSingleMorphAnalysis,
        _type: 'MultiMorphAnalysisWithMultiEnclitics',
        analysisOptions: laos('a', 'b', 'c'),
        encliticsAnalysis: multiEncliticsAnalysis({R: false, S: false, T: false}),
        selectedAnalysisCombinations: []
      },
      expected: []
    },
    {
      ma: {
        ...baseSingleMorphAnalysis,
        _type: 'MultiMorphAnalysisWithMultiEnclitics',
        analysisOptions: laos('a', 'b', 'c'),
        encliticsAnalysis: multiEncliticsAnalysis({R: false, S: false, T: false}),
        selectedAnalysisCombinations: [
          selectedMultiMorphAnalysisWithEnclitics(1, 'a', 'R'),
          selectedMultiMorphAnalysisWithEnclitics(1, 'b', 'S')
        ]
      },
      expected: ['1aR', '1bS']
    }
  ])(
    'should extract selection from $ma as $expected',
    ({ma, expected}) => expect(extractSelMorphAnalysesFromMultiMorphWithMultiEnc(ma)).toEqual(expected)
  );

});
