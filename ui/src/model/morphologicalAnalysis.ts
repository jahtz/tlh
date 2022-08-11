import {LetteredAnalysisOption, parseMultiAnalysisString, SelectableLetteredAnalysisOption} from './analysisOptions';
import {tlhAnalyzerUrl} from '../urls';
import {XmlElementNode} from '../xmlModel/xmlModel';
import {
  EncliticsAnalysis,
  isMultiEncliticsAnalysis,
  isSingleEncliticsAnalysis,
  MultiEncliticsAnalysis,
  SingleEncliticsAnalysis,
  writeEncliticsAnalysis
} from './encliticsAnalysis';
import {SelectedMorphAnalysis, SelectedMultiMorphAnalysisWithEnclitic, selectedMultiMorphAnalysisWithEnclitics} from './selectedMorphologicalAnalysis';

const morphologyAttributeNameRegex = /^mrp(\d+)$/;

interface IMorphologicalAnalysis {
  number: number;
  referenceWord: string;
  translation: string;
  paradigmClass: string;
  determinativ: string | undefined;
}

// Single analysis

interface ISingleMorphologicalAnalysis extends IMorphologicalAnalysis {
  analysis: string;
}

export interface SingleMorphologicalAnalysisWithoutEnclitics extends ISingleMorphologicalAnalysis {
  encliticsAnalysis: undefined;
  selected: boolean;
}

export function singleMorphAnalysisIsWithoutEnclitics(sa: SingleMorphologicalAnalysis): sa is SingleMorphologicalAnalysisWithoutEnclitics {
  return sa.encliticsAnalysis === undefined;
}

export interface SingleMorphologicalAnalysisWithSingleEnclitics extends ISingleMorphologicalAnalysis {
  encliticsAnalysis: SingleEncliticsAnalysis;
  selected: boolean;
}

export function singleMorphAnalysisIsWithSingleEnclitics(sa: SingleMorphologicalAnalysis): sa is SingleMorphologicalAnalysisWithSingleEnclitics {
  return sa.encliticsAnalysis !== undefined && isSingleEncliticsAnalysis(sa.encliticsAnalysis);
}

export interface SingleMorphologicalAnalysisWithMultiEnclitics extends ISingleMorphologicalAnalysis {
  encliticsAnalysis: MultiEncliticsAnalysis;
}

export function singleMorphAnalysisIsWithMultiEnclitics(sa: SingleMorphologicalAnalysis): sa is SingleMorphologicalAnalysisWithMultiEnclitics {
  return sa.encliticsAnalysis !== undefined && isMultiEncliticsAnalysis(sa.encliticsAnalysis);
}

export type SingleMorphologicalAnalysis =
  SingleMorphologicalAnalysisWithoutEnclitics
  | SingleMorphologicalAnalysisWithSingleEnclitics
  | SingleMorphologicalAnalysisWithMultiEnclitics;

export function isSingleMorphologicalAnalysis(ma: MorphologicalAnalysis): ma is SingleMorphologicalAnalysis {
  return 'analysis' in ma;
}

// Multi analysis

type IMultiMorphologicalAnalysis = IMorphologicalAnalysis;

export interface MultiMorphologicalAnalysisWithoutEnclitics extends IMultiMorphologicalAnalysis {
  analysisOptions: SelectableLetteredAnalysisOption[];
  encliticsAnalysis: undefined;
}

export function multiMorphAnalysisIsWithoutEnclitics(ma: MultiMorphologicalAnalysis): ma is MultiMorphologicalAnalysisWithoutEnclitics {
  return ma.encliticsAnalysis === undefined;
}

export interface MultiMorphologicalAnalysisWithSingleEnclitics extends IMultiMorphologicalAnalysis {
  analysisOptions: SelectableLetteredAnalysisOption[];
  encliticsAnalysis: SingleEncliticsAnalysis;
}

export function multiMorphAnalysisIsWithSingleEnclitics(ma: MultiMorphologicalAnalysis): ma is MultiMorphologicalAnalysisWithSingleEnclitics {
  return ma.encliticsAnalysis !== undefined && ma.encliticsAnalysis && 'analysis' in ma.encliticsAnalysis;
}

export interface MultiMorphologicalAnalysisWithMultiEnclitics extends IMultiMorphologicalAnalysis {
  analysisOptions: LetteredAnalysisOption[];
  encliticsAnalysis: MultiEncliticsAnalysis;
  selectedAnalysisCombinations: SelectedMultiMorphAnalysisWithEnclitic[];
}

export function multiMorphAnalysisIsWithMultiEnclitics(ma: MultiMorphologicalAnalysis): ma is MultiMorphologicalAnalysisWithMultiEnclitics {
  return ma.encliticsAnalysis !== undefined && ma.encliticsAnalysis && 'analysisOptions' in ma.encliticsAnalysis;
}

export type MultiMorphologicalAnalysis =
  MultiMorphologicalAnalysisWithoutEnclitics
  | MultiMorphologicalAnalysisWithSingleEnclitics
  | MultiMorphologicalAnalysisWithMultiEnclitics;

export function isMultiMorphologicalAnalysis(ma: MorphologicalAnalysis): ma is MultiMorphologicalAnalysis {
  return 'analysisOptions' in ma;
}

export type MorphologicalAnalysis = SingleMorphologicalAnalysis | MultiMorphologicalAnalysis;

// Helper functions

function splitAtSingle(value: string, splitString: string, splitAtLast = false): [string, string | undefined] {
  const splitIndex = splitAtLast
    ? value.lastIndexOf(splitString)
    : value.indexOf(splitString);

  return splitIndex >= 0
    ? [value.substring(0, splitIndex).trim(), value.substring(splitIndex + splitString.length).trim()]
    : [value, undefined];
}

// Reading

function readEncliticsChain(encliticsChain: string, selectedEnclitics: string[]): EncliticsAnalysis | undefined {
  const splitEncliticsChain = encliticsChain.split('@').map((s) => s.trim());

  if (!splitEncliticsChain || splitEncliticsChain.length < 2) {
    return undefined;
  }

  const [enclitics, analysesString] = splitEncliticsChain;

  return analysesString.includes('{')
    ? {enclitics, analysisOptions: parseMultiAnalysisString(splitEncliticsChain[1], selectedEnclitics)}
    : {enclitics, analysis: analysesString, selected: false};
}

export function readMorphologicalAnalysis(number: number, content: string | null, initialSelectedMorphologies: SelectedMorphAnalysis[]): MorphologicalAnalysis | undefined {
  if (!content) {
    return undefined;
  }

  const [referenceWord, restWithoutReferenceWord] = splitAtSingle(content, '@');

  if (!restWithoutReferenceWord) {
    return undefined;
  }

  const [translation, restWithoutTranslation] = splitAtSingle(restWithoutReferenceWord, '@');

  if (!restWithoutTranslation) {
    return undefined;
  }

  const [analysesString, restWithoutAnalyses] = splitAtSingle(restWithoutTranslation, '@');

  if (!restWithoutAnalyses) {
    return undefined;
  }

  const [otherString, determinativString] = splitAtSingle(restWithoutAnalyses, '@', true);

  const determinativ = determinativString && determinativString.trim().length > 0
    ? determinativString.trim()
    : undefined;

  const [paradigmClass, encliticsChain] = splitAtSingle(otherString, '+=');

  const selectedAnalyses: SelectedMorphAnalysis[] = initialSelectedMorphologies.filter((sao) => sao.number === number);

  const selectedAnalysisLetters = selectedAnalyses
    .flatMap((selectedMorphAnalysis) => 'morphLetter' in selectedMorphAnalysis ? [selectedMorphAnalysis.morphLetter] : [])
    .filter((l): l is string => !!l);

  const selectedEncliticsLetters = Array.from(
    new Set(
      selectedAnalyses.flatMap((selectedMorphAnalysis): string[] =>
        selectedMorphAnalysis.encLetter !== undefined
          ? [selectedMorphAnalysis.encLetter]
          : []
      )
    )
  );

  const encliticsAnalysis = encliticsChain ? readEncliticsChain(encliticsChain, selectedEncliticsLetters) : undefined;

  if (analysesString.includes('{')) {
    const analysisOptions = parseMultiAnalysisString(analysesString, selectedAnalysisLetters);

    if (encliticsAnalysis === undefined) {
      return {
        number,
        translation,
        referenceWord,
        analysisOptions,
        paradigmClass,
        encliticsAnalysis,
        determinativ
      } as MultiMorphologicalAnalysisWithoutEnclitics;
    } else if (isSingleEncliticsAnalysis(encliticsAnalysis)) {
      return {
        number,
        translation,
        referenceWord,
        analysisOptions,
        paradigmClass,
        encliticsAnalysis,
        determinativ
      } as MultiMorphologicalAnalysisWithSingleEnclitics;
    } else {
      const selectedAnalysisCombinations: SelectedMultiMorphAnalysisWithEnclitic[] = selectedAnalyses.map(({
        number,
        morphLetter,
        encLetter
      }) => selectedMultiMorphAnalysisWithEnclitics(number, morphLetter || '', encLetter || ''));

      return {
        number,
        translation,
        referenceWord,
        analysisOptions,
        paradigmClass,
        encliticsAnalysis,
        determinativ,
        selectedAnalysisCombinations
      };
    }
  } else {
    const selected = selectedAnalyses.length > 0;

    const analysis = analysesString;

    if (encliticsAnalysis == undefined) {
      return {number, referenceWord, translation, paradigmClass, determinativ, analysis, encliticsAnalysis, selected};
    } else if (isSingleEncliticsAnalysis(encliticsAnalysis)) {
      return {number, referenceWord, translation, paradigmClass, determinativ, analysis, encliticsAnalysis, selected};
    } else {
      return {number, referenceWord, translation, paradigmClass, determinativ, analysis, encliticsAnalysis};
    }
  }
}

export function readMorphologiesFromNode(node: XmlElementNode, initialSelectedMorphologies: SelectedMorphAnalysis[]): MorphologicalAnalysis[] {
  return Object.entries(node.attributes)
    .map(([name, value]) => {
      const match = name.trim().match(morphologyAttributeNameRegex);

      return match
        ? readMorphologicalAnalysis(parseInt(match[1]), value, initialSelectedMorphologies)
        : undefined;
    })
    .filter((m): m is MorphologicalAnalysis => !!m);
}

// Writing

export function writeMorphAnalysisValue(morphologicalAnalysis: MorphologicalAnalysis): string {

  const {referenceWord, translation, paradigmClass, determinativ} = morphologicalAnalysis;

  const enc = morphologicalAnalysis.encliticsAnalysis !== undefined
    ? writeEncliticsAnalysis(morphologicalAnalysis.encliticsAnalysis)
    : undefined;

  const analysisString = 'analysis' in morphologicalAnalysis
    ? morphologicalAnalysis.analysis
    : morphologicalAnalysis.analysisOptions.map(({letter, analysis}) => `{ ${letter} → ${analysis}}`).join(' ');

  return [referenceWord, translation, analysisString, paradigmClass + (enc ? ' += ' + enc : ''), determinativ || ''].join(' @ ');
}

function writeMorphologicalAnalysis(sma: MorphologicalAnalysis): string[] {
  return [`mrp${sma.number}="${writeMorphAnalysisValue(sma)}"`];
}


export function writeMorphAnalysisAttribute(ma: MorphologicalAnalysis): string[] {
  return writeMorphologicalAnalysis(ma);
}

// Fetching from TLHaly

export function fetchMorphologicalAnalyses(w: string, tl = 'Hit'): Promise<Record<string, string> | undefined> {
  // FIXME: set language!
  const formData = new FormData();
  formData.append('w', w);
  formData.append('tl', tl);

  return fetch(tlhAnalyzerUrl, {method: 'POST', body: formData})
    .then((res) => res.json());
}

