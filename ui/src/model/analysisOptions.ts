// regex means multiple whitespaces followed by (but not including) an opening curly brace
const analysesSplitRegex = /\s+(?={)/;

export interface AnalysisOption {
  type: 'AnalysisOption';
  letter: string;
  analysis: string;
}

function parseAnalysisOption(as: string): AnalysisOption {
  const [letter, analysis] = as
    // Remove curly braces
    .substr(1, as.length - 2)
    .split('→')
    .map((s) => s.trim());

  return {type: 'AnalysisOption', letter, analysis};
}

export function parseAnalysis(as: string): string | AnalysisOption[] {
  return as.includes('{')
    ? as.split(analysesSplitRegex).map(parseAnalysisOption)
    : as;
}
