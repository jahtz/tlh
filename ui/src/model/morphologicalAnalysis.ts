import {LetteredAnalysisOption, parseAnalysisString} from './analysisOptions';
import {tlhAnalyzerUrl} from '../urls';
import {isXmlElementNode} from '../editor/xmlModel/xmlModel';
import {WordNode} from '../editor/WordContentEditor';
import {loadNode, tlhXmlReadConfig} from '../editor/xmlModel/xmlReading';

interface EncliticsAnalysis {
  enclitics: string;
  analysis: string | LetteredAnalysisOption[];
}

function writeEncliticsAnalysis({enclitics, analysis}: EncliticsAnalysis) {
  return enclitics + ' @ ' + analysis;
}

export interface MorphologicalAnalysis {
  number: number;
  referenceWord: string;
  translation: string;
  analysis: string | LetteredAnalysisOption[];
  paradigmClass: string;
  encliticsAnalysis?: EncliticsAnalysis;
  determinativ?: string;
}

export function writeMorphAnalysisValue(
  {referenceWord, translation, analysis, paradigmClass, encliticsAnalysis, determinativ}: MorphologicalAnalysis
): string {

  const enc = encliticsAnalysis ? writeEncliticsAnalysis(encliticsAnalysis) : '';

  const analysisString = typeof analysis === 'string'
    ? analysis
    : analysis.map(({letter, analysis}) => `{${letter} → ${analysis}}`).join(' ');


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
    ? [
      value.substring(0, splitIndex).trim(),
      value.substring(splitIndex + splitString.length).trim()
    ]
    : [value, undefined];
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

  const splitEncliticsChain = encliticsChain
    ? encliticsChain.split('@').map((s) => s.trim())
    : undefined;

  const encliticsAnalysis: EncliticsAnalysis | undefined = splitEncliticsChain && splitEncliticsChain.length > 1
    ? {enclitics: splitEncliticsChain[0], analysis: parseAnalysisString(splitEncliticsChain[1])}
    : undefined;

  const analysis: LetteredAnalysisOption[] | string = parseAnalysisString(analysesString);

  return {number, translation, referenceWord, analysis, paradigmClass, encliticsAnalysis, determinativ};
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
