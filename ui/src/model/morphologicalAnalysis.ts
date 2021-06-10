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

function parseAnalysis(as: string): string | AnalysisOption[] {
  if (as.includes('{')) {
    return as.split(analysesSplitRegex).map(parseAnalysisOption);
  } else {
    return as;
  }
}

export interface MorphologicalAnalysis {
  type: 'MorphAnalysis';
  number: number;
  transcription: string;
  translation: string;
  analyses: string | AnalysisOption[];
  other: string[];
}

export function morphologicalAnalysis(number: number, content: string): MorphologicalAnalysis {
  const [
    transcription,
    translation,
    analysesString,
    ...other
  ] = content.split('@').map((s) => s.trim());

  const analyses = parseAnalysis(analysesString);

  return {type: 'MorphAnalysis', number, translation, transcription, analyses, other};
}

export function readMorphAnalysis(number: number, value: string | null): MorphologicalAnalysis | undefined {
  return value ? morphologicalAnalysis(number, value) : undefined;
}

export function writeMorphAnalysisAttribute({number, transcription, translation, analyses, other}: MorphologicalAnalysis): string[] {
  return typeof analyses === 'string'
    ? [`mrp${number}="${transcription} @ ${translation} @ ${analyses} @ ${other.join(' @ ')}"`]
    : [
      `mrp${number}="${transcription} @ ${translation} @ `,
      ...analyses.map(({letter, analysis}) => `{${letter} → ${analysis}}`),
      ` @ ${other.join(' @ ')}"`
    ];
}