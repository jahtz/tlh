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

export interface IMorphologicalAnalysis {
  number: number;
  referenceWord: string;
  translation: string;
  paradigmClass: string;
  determinative: string | undefined;
}

// Single analysis

export interface ISingleMorphologicalAnalysis extends IMorphologicalAnalysis {
  _type: 'SingleMorphAnalysis';
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

export interface IMultiMorphologicalAnalysis extends IMorphologicalAnalysis {
  _type: 'MultiMorphAnalysis';
}

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
  // FIXME: MultiEncliticsAnalysis should not be selectable here!
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
    : {enclitics, analysis: analysesString};
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

  const [otherString, determinativeString] = splitAtSingle(restWithoutAnalyses, '@', true);

  const determinative = determinativeString && determinativeString.trim().length > 0
    ? determinativeString.trim()
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
    const analysisOptions: SelectableLetteredAnalysisOption[] = parseMultiAnalysisString(analysesString, selectedAnalysisLetters);

    const _type = 'MultiMorphAnalysis';

    if (encliticsAnalysis === undefined) {
      return {
        _type,
        number,
        translation,
        referenceWord,
        analysisOptions,
        paradigmClass,
        encliticsAnalysis,
        determinative: determinative
      } as MultiMorphologicalAnalysisWithoutEnclitics;
    } else if (isSingleEncliticsAnalysis(encliticsAnalysis)) {
      return {
        _type,
        number,
        translation,
        referenceWord,
        analysisOptions,
        paradigmClass,
        encliticsAnalysis,
        determinative: determinative
      } as MultiMorphologicalAnalysisWithSingleEnclitics;
    } else {
      const selectedAnalysisCombinations: SelectedMultiMorphAnalysisWithEnclitic[] = selectedAnalyses.map(({
        number,
        morphLetter,
        encLetter
      }) => selectedMultiMorphAnalysisWithEnclitics(number, morphLetter || '', encLetter || ''));

      return {
        _type,
        number,
        translation,
        referenceWord,
        // remove field selected for unit tests...
        analysisOptions: analysisOptions.map(({letter, analysis}) => ({letter, analysis})),
        paradigmClass,
        // TODO: remove field selected for unit tests...
        encliticsAnalysis,
        determinative: determinative,
        selectedAnalysisCombinations
      };
    }
  } else {
    const _type = 'SingleMorphAnalysis';

    const selected = selectedAnalyses.length > 0;

    const analysis = analysesString;

    if (encliticsAnalysis == undefined) {
      return {_type, number, referenceWord, translation, paradigmClass, determinative: determinative, analysis, encliticsAnalysis, selected};
    } else if (isSingleEncliticsAnalysis(encliticsAnalysis)) {
      return {_type, number, referenceWord, translation, paradigmClass, determinative: determinative, analysis, encliticsAnalysis, selected};
    } else {
      return {_type, number, referenceWord, translation, paradigmClass, determinative: determinative, analysis, encliticsAnalysis};
    }
  }
}

export function readMorphologiesFromNode(node: XmlElementNode, initialSelectedMorphologies: SelectedMorphAnalysis[]): MorphologicalAnalysis[] {
  return Object.entries(node.attributes)
    .map(([name, value]) => {
      const match = name.trim().match(morphologyAttributeNameRegex);

      return match
        ? readMorphologicalAnalysis(parseInt(match[1]), value || '', initialSelectedMorphologies)
        : undefined;
    })
    .filter((m): m is MorphologicalAnalysis => !!m);
}

// Writing

export function writeMorphAnalysisValue(morphologicalAnalysis: MorphologicalAnalysis): string {

  const {referenceWord, translation, paradigmClass, determinative} = morphologicalAnalysis;

  const enc = morphologicalAnalysis.encliticsAnalysis !== undefined
    ? writeEncliticsAnalysis(morphologicalAnalysis.encliticsAnalysis)
    : undefined;

  const analysisString = 'analysis' in morphologicalAnalysis
    ? morphologicalAnalysis.analysis
    : morphologicalAnalysis.analysisOptions.map(({letter, analysis}) => `{ ${letter} → ${analysis}}`).join(' ');

  return [referenceWord, translation, analysisString, paradigmClass + (enc ? ' += ' + enc : ''), determinative || ''].join(' @ ');
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

