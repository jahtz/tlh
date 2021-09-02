// regex means multiple whitespaces followed by (but not including) an opening curly brace
const letteredAnalysesSplitRegex = /\s+(?={)/;

export interface LetteredAnalysisOption {
  letter: string;
  analysis: string;
}

function parseAnalysisOption(as: string): LetteredAnalysisOption {
  const [letter, analysis] = as
    // Remove curly braces
    .substr(1, as.length - 2)
    .split('→')
    .map((s) => s.trim());

  return {letter, analysis};
}

export function parseAnalysisString(as: string): LetteredAnalysisOption[] | string {
  return as.includes('{')
    ? as.split(letteredAnalysesSplitRegex).map(parseAnalysisOption)
    : as;
}
