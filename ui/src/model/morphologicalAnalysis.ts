import {AnalysisOption, parseAnalysis} from './analysisOptions';

interface IMorphologicalAnalysis {
  number: number;
  transcription: string;
  translation: string;
  other: string[];
}


export interface LetteredMorphologicalAnalysis extends IMorphologicalAnalysis {
  type: 'LetteredMorphologicalAnalysis';
  analyses: AnalysisOption[];
}


function writeLetteredMorphologicalAnalysis({number, transcription, translation, analyses, other}: LetteredMorphologicalAnalysis): string[] {
  return [
    `mrp${number}="${transcription} @ ${translation} @ `,
    ...analyses.map(({letter, analysis}) => `{${letter} → ${analysis}}`),
    ` @ ${other.join(' @ ')}"`
  ];
}


export interface SingleMorphologicalAnalysis extends IMorphologicalAnalysis {
  type: 'SingleMorphologicalAnalysis';
  analysis: string;
}

export function writeSingleMorphologicalAnalysis({number, transcription, translation, analysis, other}: SingleMorphologicalAnalysis): string[] {
  return [`mrp${number}="${transcription} @ ${translation} @ ${analysis} @ ${other.join(' @ ')}"`];
}


export type MorphologicalAnalysis = LetteredMorphologicalAnalysis | SingleMorphologicalAnalysis;


export function isSingleMorphologicalAnalysis(ma: MorphologicalAnalysis): ma is SingleMorphologicalAnalysis {
  return ma.type === 'SingleMorphologicalAnalysis';
}


export function morphologicalAnalysis(number: number, content: string): MorphologicalAnalysis {
  const [
    transcription,
    translation,
    analysesString,
    ...otherWithEmptyStrings
  ] = content.split('@').map((s) => s.trim());

  const analyses: string | AnalysisOption[] = parseAnalysis(analysesString);

  const other = otherWithEmptyStrings.filter((s) => s.length > 0);

  return typeof analyses === 'string'
    ? {type: 'SingleMorphologicalAnalysis', number, translation, transcription, analysis: analyses, other}
    : {type: 'LetteredMorphologicalAnalysis', number, translation, transcription, analyses, other};
}

export function readMorphAnalysis(number: number, value: string | null): MorphologicalAnalysis | undefined {
  return value ? morphologicalAnalysis(number, value) : undefined;
}

export function writeMorphAnalysisAttribute(ma: MorphologicalAnalysis): string[] {
  return isSingleMorphologicalAnalysis(ma)
    ? writeSingleMorphologicalAnalysis(ma)
    : writeLetteredMorphologicalAnalysis(ma);
}