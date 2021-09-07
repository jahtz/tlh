import {LetteredAnalysisOption, parseMultiAnalysisString} from './analysisOptions';
import {tlhAnalyzerUrl} from '../urls';
import {isXmlElementNode} from '../editor/xmlModel/xmlModel';
import {WordNode} from '../editor/WordContentEditor';
import {loadNode, tlhXmlReadConfig} from '../editor/xmlModel/xmlReading';

interface IEncliticsAnalysis {
  enclitics: string;

}

interface SingleEncliticsAnalysis extends IEncliticsAnalysis {
  analysis: string;
  selected: boolean;
}

interface MultiEncliticsAnalysis extends IEncliticsAnalysis {
  analysisOptions: LetteredAnalysisOption[];
}

type EncliticsAnalysis = SingleEncliticsAnalysis | MultiEncliticsAnalysis;

export function writeEncliticsAnalysis(encliticsAnalysis: EncliticsAnalysis) {
  return 'analysis' in encliticsAnalysis
    ? encliticsAnalysis.enclitics + ' @ ' + encliticsAnalysis.analysis
    : encliticsAnalysis.enclitics + ' @ ' + encliticsAnalysis.analysisOptions.map(({letter}) => letter).join('');
}

interface IMorphologicalAnalysis {
  number: number;
  referenceWord: string;
  translation: string;
  paradigmClass: string;
  encliticsAnalysis?: EncliticsAnalysis;
  determinativ?: string;
  selected?: boolean;
}

export interface SingleMorphologicalAnalysis extends IMorphologicalAnalysis {
  analysis: string;
  selected: boolean;
}

export interface MultiMorphologicalAnalysis extends IMorphologicalAnalysis {
  analysisOptions: LetteredAnalysisOption[];
}

export type MorphologicalAnalysis = SingleMorphologicalAnalysis | MultiMorphologicalAnalysis;


export function writeMorphAnalysisValue(morphologicalAnalysis: MorphologicalAnalysis): string {

  const {referenceWord, translation, paradigmClass, encliticsAnalysis, determinativ} = morphologicalAnalysis;

  const enc = encliticsAnalysis ? writeEncliticsAnalysis(encliticsAnalysis) : '';

  const analysisString = 'analysis' in morphologicalAnalysis
    ? morphologicalAnalysis.analysis
    : morphologicalAnalysis.analysisOptions.map(({letter, analysis}) => `{${letter} → ${analysis}}`).join(' ');


  return `${referenceWord} @ ${translation} @ ${analysisString} @ ${paradigmClass} @ ${enc} @ ${determinativ}`;
}

function writeMorphologicalAnalysis(sma: MorphologicalAnalysis): string[] {
  return [`mrp${sma.number}="${writeMorphAnalysisValue(sma)}"`];
}


function splitAtSingle(value: string, splitString: string, splitAtLast = false): [string, string | undefined] {
  const splitIndex = splitAtLast
    ? value.lastIndexOf(splitString)
    : value.indexOf(splitString);

  return splitIndex >= 0
    ? [value.substring(0, splitIndex).trim(), value.substring(splitIndex + splitString.length).trim()]
    : [value, undefined];
}

function readEncliticsChain(encliticsChain: string): EncliticsAnalysis | undefined {
  const splitEncliticsChain = encliticsChain.split('@').map((s) => s.trim());

  if (!splitEncliticsChain || splitEncliticsChain.length < 2) {
    return undefined;
  }

  const [enclitics, analysesString] = splitEncliticsChain;

  return analysesString.includes('{')
    ? {enclitics, analysisOptions: parseMultiAnalysisString(splitEncliticsChain[1])}
    : {enclitics, analysis: analysesString, selected: false};
}

export function readMorphologicalAnalysis(number: number, content: string | null): MorphologicalAnalysis | undefined {
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

  const encliticsAnalysis = encliticsChain ? readEncliticsChain(encliticsChain) : undefined;

  return analysesString.includes('{')
    ? {number, translation, referenceWord, analysisOptions: parseMultiAnalysisString(analysesString), paradigmClass, encliticsAnalysis, determinativ}
    : {number, translation, referenceWord, analysis: analysesString, paradigmClass, encliticsAnalysis, determinativ, selected: false};
}


export function writeMorphAnalysisAttribute(ma: MorphologicalAnalysis): string[] {
  return writeMorphologicalAnalysis(ma);
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
