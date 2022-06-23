interface IMorphAnalysis {
  number: number;
}

interface SingleMorphAnalysis extends IMorphAnalysis {
  _type: 'SingleMorphAnalysis';
}

interface SingleMorphAnalysisWithEnclitic extends IMorphAnalysis {
  _type: 'SingleMorphAnalysisWithEnclitic';
  encLetter: string;
}

interface MultiMorphAnalysis extends IMorphAnalysis {
  _type: 'MultiMorphAnalysis';
  encLetter: string;
}

interface MultiMorphAnalysisWithEnclitic extends IMorphAnalysis {
  _type: 'MultiMorphAnalysisWithEnclitic';
  morphLetter: string;
  encLetter: string;
}

export type SelectedMorphAnalysis = SingleMorphAnalysis | SingleMorphAnalysisWithEnclitic | MultiMorphAnalysis | MultiMorphAnalysisWithEnclitic;