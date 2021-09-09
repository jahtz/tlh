// regex means multiple whitespaces followed by (but not including) an opening curly brace
const letteredAnalysesSplitRegex = /\s+(?={)/;

export interface LetteredAnalysisOption {
  letter: string;
  analysis: string;
  selected: boolean;
}

export function getSelectedLetters(laos: LetteredAnalysisOption[]): string[] {
  return laos
    .filter(({selected}) => selected)
    .map(({letter}) => letter);
}

function parseAnalysisOption(as: string, selectedLetters: string[]): LetteredAnalysisOption {
  const [letter, analysis] = as
    // Remove curly braces
    .substr(1, as.length - 2)
    .split('→')
    .map((s) => s.trim());

  return {letter, analysis, selected: selectedLetters.includes(letter)};
}

export function parseMultiAnalysisString(as: string, selectedLetters: string[]): LetteredAnalysisOption[] {
  return as.split(letteredAnalysesSplitRegex).map((s) => parseAnalysisOption(s, selectedLetters));
}


