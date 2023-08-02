import {LetteredAnalysisOption, parseMultiAnalysisString, SelectableLetteredAnalysisOption} from './analysisOptions';
import {tlhWordAnalyzerUrl} from '../urls';
import {XmlElementNode} from 'simple_xml';
import {EncliticsAnalysis, isSingleEncliticsAnalysis, MultiEncliticsAnalysis, SingleEncliticsAnalysis, writeEncliticsAnalysis} from './encliticsAnalysis';
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
  analysis: string;
}

export interface SingleMorphologicalAnalysisWithoutEnclitics extends ISingleMorphologicalAnalysis {
  _type: 'SingleMorphAnalysisWithoutEnclitics';
  encliticsAnalysis: undefined;
  selected: boolean;
}

export interface SingleMorphologicalAnalysisWithSingleEnclitics extends ISingleMorphologicalAnalysis {
  _type: 'SingleMorphAnalysisWithSingleEnclitics';
  encliticsAnalysis: SingleEncliticsAnalysis;
  selected: boolean;
}

export interface SingleMorphologicalAnalysisWithMultiEnclitics extends ISingleMorphologicalAnalysis {
  _type: 'SingleMorphAnalysisWithMultiEnclitics';
  encliticsAnalysis: MultiEncliticsAnalysis;
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
  _type: 'MultiMorphAnalysisWithoutEnclitics';
  analysisOptions: SelectableLetteredAnalysisOption[];
  encliticsAnalysis: undefined;
}

export function multiMorphAnalysisWithoutEnclitics(number: number): MultiMorphologicalAnalysisWithoutEnclitics {
  return {
    _type: 'MultiMorphAnalysisWithoutEnclitics',
    number,
    translation: '',
    referenceWord: '',
    analysisOptions: [],
    encliticsAnalysis: undefined,
    determinative: undefined,
    paradigmClass: ''
  };
}

export interface MultiMorphologicalAnalysisWithSingleEnclitics extends IMultiMorphologicalAnalysis {
  _type: 'MultiMorphAnalysisWithSingleEnclitics';
  analysisOptions: SelectableLetteredAnalysisOption[];
  encliticsAnalysis: SingleEncliticsAnalysis;
}

export interface MultiMorphologicalAnalysisWithMultiEnclitics extends IMultiMorphologicalAnalysis {
  _type: 'MultiMorphAnalysisWithMultiEnclitics';
  analysisOptions: LetteredAnalysisOption[];
  // FIXME: MultiEncliticsAnalysis should not be selectable here!
  encliticsAnalysis: MultiEncliticsAnalysis;
  selectedAnalysisCombinations: SelectedMultiMorphAnalysisWithEnclitic[];
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

    if (encliticsAnalysis === undefined) {
      return {
        _type: 'MultiMorphAnalysisWithoutEnclitics',
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
        _type: 'MultiMorphAnalysisWithSingleEnclitics',
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
        _type: 'MultiMorphAnalysisWithMultiEnclitics',
        number,
        translation,
        referenceWord,
        // remove field selected for unit tests...
        analysisOptions: analysisOptions.map(({letter, analysis}) => ({letter, analysis})),
        paradigmClass,
        encliticsAnalysis,
        determinative: determinative,
        selectedAnalysisCombinations
      };
    }
  } else {

    const selected = selectedAnalyses.length > 0;

    const analysis = analysesString;

    if (encliticsAnalysis == undefined) {
      return {
        _type: 'SingleMorphAnalysisWithoutEnclitics',
        number,
        referenceWord,
        translation,
        paradigmClass,
        determinative: determinative,
        analysis,
        encliticsAnalysis,
        selected
      };
    } else if (isSingleEncliticsAnalysis(encliticsAnalysis)) {
      return {
        _type: 'SingleMorphAnalysisWithSingleEnclitics',
        number,
        referenceWord,
        translation,
        paradigmClass,
        determinative: determinative,
        analysis,
        encliticsAnalysis,
        selected
      };
    } else {
      return {
        _type: 'SingleMorphAnalysisWithMultiEnclitics',
        number,
        referenceWord,
        translation,
        paradigmClass,
        determinative: determinative,
        analysis,
        encliticsAnalysis
      };
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

// Fetching from TLHaly

export function fetchMorphologicalAnalyses(w: string, tl: string): Promise<Record<string, string> | undefined> {
  const formData = new FormData();
  formData.append('w', w);
  formData.append('tl', tl);

  return fetch(tlhWordAnalyzerUrl, {method: 'POST', body: formData})
    .then((res) => res.json());
}

