interface ISelectedMorphAnalysis {
  number: number;
}

interface SelectedSingleMorphAnalysis extends ISelectedMorphAnalysis {
  _type: 'SelectedSingleMorphAnalysis';
}

export function selectedSingleMorphAnalysis(number: number): SelectedSingleMorphAnalysis {
  return {_type: 'SelectedSingleMorphAnalysis', number};
}

interface SelectedSingleMorphAnalysisWithEnclitic extends ISelectedMorphAnalysis {
  _type: 'SelectedSingleMorphAnalysisWithEnclitic';
  encLetter: string;
}

export function selectedSingleMorphAnalysisWithEnclitic(number: number, encLetter: string): SelectedSingleMorphAnalysisWithEnclitic {
  return {_type: 'SelectedSingleMorphAnalysisWithEnclitic', number, encLetter};
}

interface SelectedMultiMorphAnalysis extends ISelectedMorphAnalysis {
  _type: 'SelectedMultiMorphAnalysis';
  morphLetter: string;
}

export function selectedMultiMorphAnalysisWithoutEnclitics(number: number, morphLetter: string): SelectedMultiMorphAnalysis {
  return {_type: 'SelectedMultiMorphAnalysis', number, morphLetter};
}

interface SelectedMultiMorphAnalysisWithEnclitic extends ISelectedMorphAnalysis {
  _type: 'SelectedMultiMorphAnalysisWithEnclitic';
  morphLetter: string;
  encLetter: string;
}

export function selectedMultiMorphAnalysisWithEnclitics(number: number, morphLetter: string, encLetter: string): SelectedMultiMorphAnalysisWithEnclitic {
  return {_type: 'SelectedMultiMorphAnalysisWithEnclitic', number, morphLetter, encLetter};
}

export type SelectedMorphAnalysis =
  SelectedSingleMorphAnalysis
  | SelectedSingleMorphAnalysisWithEnclitic
  | SelectedMultiMorphAnalysis
  | SelectedMultiMorphAnalysisWithEnclitic;