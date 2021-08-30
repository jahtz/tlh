import {AnalysisOption, parseAnalysis} from './analysisOptions';
import {tlhAnalyzerUrl} from '../urls';
import {isXmlElementNode} from '../editor/xmlModel/xmlModel';
import {WordNode} from '../editor/WordContentEditor';
import {loadNode, tlhXmlReadConfig} from '../editor/xmlModel/xmlReading';

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

export function writeLetteredMorphologicalAnalysisValue({transcription, translation, analyses, other}: LetteredMorphologicalAnalysis): string[] {
  return [`${transcription} @ ${translation} @ `,
    ...analyses.map(({letter, analysis}) => `{${letter} → ${analysis}}`),
    ` @ ${other.join(' @ ')}`];
}

export function writeLetteredMorphologicalAnalysis({number, transcription, translation, analyses, other}: LetteredMorphologicalAnalysis): string[] {
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

export function writeSingleMorphologicalAnalysisValue({transcription, translation, analysis, other}: SingleMorphologicalAnalysis): string {
  return `${transcription} @ ${translation} @ ${analysis} @ ${other.join(' @ ')}`;
}

export function writeSingleMorphologicalAnalysis(sma: SingleMorphologicalAnalysis): string[] {
  return [`mrp${sma.number}="${writeSingleMorphologicalAnalysisValue(sma)}"`];
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

export function fetchMorphologicalAnalyses(w: string, tl = 'Hit'): Promise<WordNode | undefined> {
  // FIXME: set language!
  const formData = new FormData();
  formData.append('w', w);
  formData.append('tl', tl);

  return fetch(tlhAnalyzerUrl, {method: 'POST', body: formData})
    .then((res) => res.text())
    .then((resText) => {

      const wTag: ChildNode = new DOMParser().parseFromString(resText, 'text/xml').childNodes[0];

      const loadedTag = loadNode(wTag, tlhXmlReadConfig);

      return isXmlElementNode(loadedTag)
        ? loadedTag as WordNode
        : undefined;
    });
}
