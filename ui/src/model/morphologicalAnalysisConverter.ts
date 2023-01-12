import {
  MultiMorphologicalAnalysis,
  MultiMorphologicalAnalysisWithMultiEnclitics,
  MultiMorphologicalAnalysisWithoutEnclitics,
  MultiMorphologicalAnalysisWithSingleEnclitics,
  SingleMorphologicalAnalysis,
  SingleMorphologicalAnalysisWithMultiEnclitics,
  SingleMorphologicalAnalysisWithoutEnclitics,
  SingleMorphologicalAnalysisWithSingleEnclitics
} from './morphologicalAnalysis';

function convertSingleMorphAnalysisWithoutEncliticsToMultiMorphAnalysis(
  {analysis, selected, ...rest}: SingleMorphologicalAnalysisWithoutEnclitics
): MultiMorphologicalAnalysisWithoutEnclitics {

  return {
    ...rest,
    _type: 'MultiMorphAnalysisWithoutEnclitics',
    analysisOptions: [
      {letter: 'a', analysis, selected},
      {letter: 'b', analysis: '', selected: false}
    ]
  };
}

function convertSingleMorphAnalysisWithSingleEncliticsToMultiMorphAnalysis(
  {analysis, selected, ...rest}: SingleMorphologicalAnalysisWithSingleEnclitics
): MultiMorphologicalAnalysisWithSingleEnclitics {
  return {
    ...rest,
    _type: 'MultiMorphAnalysisWithSingleEnclitics',
    analysisOptions: [
      {letter: 'a', analysis, selected},
      {letter: 'b', analysis: '', selected: false}
    ]
  };
}

function convertSingleMorphAnalysisWithMultiEncliticsToMultiMorphAnalysis(
  {analysis, ...rest}: SingleMorphologicalAnalysisWithMultiEnclitics
): MultiMorphologicalAnalysisWithMultiEnclitics {
  return {
    ...rest,
    _type: 'MultiMorphAnalysisWithMultiEnclitics',
    analysisOptions: [
      {letter: 'a', analysis},
      {letter: 'b', analysis: ''}
    ],
    selectedAnalysisCombinations: [
      // TODO!
    ]
  };
}


export function convertSingleMorphAnalysisToMultiMorphAnalysis(sma: SingleMorphologicalAnalysis): MultiMorphologicalAnalysis {
  switch (sma._type) {
    case 'SingleMorphAnalysisWithoutEnclitics':
      return convertSingleMorphAnalysisWithoutEncliticsToMultiMorphAnalysis(sma);
    case 'SingleMorphAnalysisWithSingleEnclitics':
      return convertSingleMorphAnalysisWithSingleEncliticsToMultiMorphAnalysis(sma);
    case 'SingleMorphAnalysisWithMultiEnclitics':
      return convertSingleMorphAnalysisWithMultiEncliticsToMultiMorphAnalysis(sma);
  }
}

