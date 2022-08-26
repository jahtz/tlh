// regex means multiple whitespaces followed by (but not including) an opening curly brace
const letteredAnalysesSplitRegex = /\s*(?={)/;

export interface LetteredAnalysisOption {
  letter: string;
  analysis: string;
}

export interface SelectableLetteredAnalysisOption extends LetteredAnalysisOption {
  selected: boolean;
}

function parseAnalysisOption(as: string): LetteredAnalysisOption {
  const [letter, analysis] = as
    // Remove curly braces
    .substring(1, as.length - 1)
    .trim()
    .split('→')
    .map((s) => s.trim());

  return {letter, analysis};
}

function parseSelectableAnalysisOption(as: string, selectedLetters: string[]): SelectableLetteredAnalysisOption {
  const {letter, analysis} = parseAnalysisOption(as);

  return {letter, analysis, selected: selectedLetters.includes(letter)};
}

export function parseMultiAnalysisString(as: string, selectedLetters: string[]): SelectableLetteredAnalysisOption[] {
  return as.split(letteredAnalysesSplitRegex).map((s) => parseSelectableAnalysisOption(s, selectedLetters));
}
