import {LetteredAnalysisOption, parseMultiAnalysisString} from './analysisOptions';
import {tlhAnalyzerUrl} from '../urls';
import {XmlElementNode} from '../xmlModel/xmlModel';
import {EncliticsAnalysis, MultiEncliticsAnalysis, SingleEncliticsAnalysis, writeEncliticsAnalysis} from './encliticsAnalysis';
import {SelectedMorphAnalysis} from './selectedMorphologicalAnalysis';

const morphologyAttributeNameRegex = /^mrp(\d+)$/;

interface IMorphologicalAnalysis {
  number: number;
  referenceWord: string;
  translation: string;
  paradigmClass: string;
  determinativ?: string;
}

// Single analysis

interface ISingleMorphologicalAnalysis extends IMorphologicalAnalysis {
  analysis: string;
}

export interface SingleMorphologicalAnalysisWithoutEnclitics extends ISingleMorphologicalAnalysis {
  selected: boolean;
}

export function singleMorphAnalysisIsWithoutEnclitics(sa: SingleMorphologicalAnalysis): sa is SingleMorphologicalAnalysisWithoutEnclitics {
  return !('encliticsAnalysis' in sa) || !sa.encliticsAnalysis;
}

export interface SingleMorphologicalAnalysisWithSingleEnclitics extends ISingleMorphologicalAnalysis {
  encliticsAnalysis: SingleEncliticsAnalysis;
  selected: boolean;
}

export function singleMorphAnalysisIsWithSingleEnclitics(sa: SingleMorphologicalAnalysis): sa is SingleMorphologicalAnalysisWithSingleEnclitics {
  return 'encliticsAnalysis' in sa && sa.encliticsAnalysis && 'analysis' in sa.encliticsAnalysis;
}

export interface SingleMorphologicalAnalysisWithMultiEnclitics extends ISingleMorphologicalAnalysis {
  encliticsAnalysis: MultiEncliticsAnalysis;
}

export function singleMorphAnalysisIsWithMultiEnclitics(sa: SingleMorphologicalAnalysis): sa is SingleMorphologicalAnalysisWithMultiEnclitics {
  return 'encliticsAnalysis' in sa && sa.encliticsAnalysis && 'analysisOptions' in sa.encliticsAnalysis;
}

export type SingleMorphologicalAnalysis =
  SingleMorphologicalAnalysisWithoutEnclitics
  | SingleMorphologicalAnalysisWithSingleEnclitics
  | SingleMorphologicalAnalysisWithMultiEnclitics;

export function isSingleMorphologicalAnalysis(ma: MorphologicalAnalysis): ma is SingleMorphologicalAnalysis {
  return 'analysis' in ma;
}

// Multi analysis

interface IMultiMorphologicalAnalysis extends IMorphologicalAnalysis {
  analysisOptions: LetteredAnalysisOption[];
}

export type MultiMorphologicalAnalysisWithoutEnclitics = IMultiMorphologicalAnalysis;

export function multiMorphAnalysisIsWithoutEnclitics(ma: MultiMorphologicalAnalysis): ma is MultiMorphologicalAnalysisWithoutEnclitics {
  return !('encliticsAnalysis' in ma) || !ma.encliticsAnalysis;
}

export interface MultiMorphologicalAnalysisWithSingleEnclitics extends IMultiMorphologicalAnalysis {
  encliticsAnalysis: SingleEncliticsAnalysis;
}

export function multiMorphAnalysisIsWithSingleEnclitics(ma: MultiMorphologicalAnalysis): ma is MultiMorphologicalAnalysisWithSingleEnclitics {
  return 'encliticsAnalysis' in ma && ma.encliticsAnalysis && 'analysis' in ma.encliticsAnalysis;
}

export interface MultiMorphologicalAnalysisWithMultiEnclitics extends IMultiMorphologicalAnalysis {
  encliticsAnalysis: MultiEncliticsAnalysis;
}

export function multiMorphAnalysisIsWithMultiEnclitics(ma: MultiMorphologicalAnalysis): ma is MultiMorphologicalAnalysisWithMultiEnclitics {
  return 'encliticsAnalysis' in ma && ma.encliticsAnalysis && 'analysisOptions' in ma.encliticsAnalysis;
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

  const selected: SelectedMorphAnalysis[] = initialSelectedMorphologies.filter((sao) => sao.number === number);

  const selectedAnalysisLetters = selected
    .flatMap((selectedMorphAnalysis) => 'morphLetter' in selectedMorphAnalysis ? [selectedMorphAnalysis.morphLetter] : [])
    .filter((l): l is string => !!l);

  const selectedEncliticsLetters = Array.from(
    new Set(
      selected.flatMap((selectedMorphAnalysis): string[] => 'encLetter' in selectedMorphAnalysis ? [selectedMorphAnalysis.encLetter] : [])
    )
  );

  const encliticsAnalysis = encliticsChain ? readEncliticsChain(encliticsChain, selectedEncliticsLetters) : undefined;

  // TODO: don't include encliticsAnalysis if undefined!

  return analysesString.includes('{')
    ? {
      number,
      translation,
      referenceWord,
      analysisOptions: parseMultiAnalysisString(analysesString, selectedAnalysisLetters),
      paradigmClass,
      encliticsAnalysis,
      determinativ
    }
    : {number, translation, referenceWord, analysis: analysesString, paradigmClass, encliticsAnalysis, determinativ, selected: selected.length > 0};
}

export function readMorphologiesFromNode(node: XmlElementNode, initialSelectedMorphologies: SelectedMorphAnalysis[]): MorphologicalAnalysis[] {
  return Object.entries(node.attributes)
    .map(([name, value]) => {
      const match = name.trim().match(morphologyAttributeNameRegex);

      if (match) {
        return readMorphologicalAnalysis(parseInt(match[1]), value, initialSelectedMorphologies);
      }
    })
    .filter((m): m is MorphologicalAnalysis => !!m);
}

// Writing

export function writeMorphAnalysisValue(morphologicalAnalysis: MorphologicalAnalysis): string {

  const {referenceWord, translation, paradigmClass, determinativ} = morphologicalAnalysis;

  const enc = 'encliticsAnalysis' in morphologicalAnalysis ? writeEncliticsAnalysis(morphologicalAnalysis.encliticsAnalysis) : undefined;

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

