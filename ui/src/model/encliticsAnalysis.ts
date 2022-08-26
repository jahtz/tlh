import {SelectableLetteredAnalysisOption} from './analysisOptions';

interface IEncliticsAnalysis {
  enclitics: string;
}

export interface SingleEncliticsAnalysis extends IEncliticsAnalysis {
  analysis: string;
  selected: boolean;
}

export interface MultiEncliticsAnalysis extends IEncliticsAnalysis {
  analysisOptions: SelectableLetteredAnalysisOption[];
}

export type EncliticsAnalysis = SingleEncliticsAnalysis | MultiEncliticsAnalysis;

export function isSingleEncliticsAnalysis(ea: EncliticsAnalysis): ea is SingleEncliticsAnalysis {
  return 'analysis' in ea;
}

export function isMultiEncliticsAnalysis(ea: EncliticsAnalysis): ea is MultiEncliticsAnalysis {
  return 'analysisOptions' in ea;
}

export function writeEncliticsAnalysis(encliticsAnalysis: EncliticsAnalysis): string {
  return 'analysis' in encliticsAnalysis
    ? encliticsAnalysis.enclitics + ' @ ' + encliticsAnalysis.analysis
    : encliticsAnalysis.enclitics + ' @ ' + encliticsAnalysis.analysisOptions.map(({letter, analysis}) => `{ ${letter} → ${analysis}}`).join(' ');
}
