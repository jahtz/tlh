import {indent, XmlWriter} from '../../editor/xmlModel';
import {AOWordContent, aoWordContentFormat} from '../wordContent/wordContent';
import {MorphologicalAnalysis, writeMorphAnalysisAttribute} from '../morphologicalAnalysis';
import {AOSentenceContent} from '../sentence';
import {aoBasicText} from '../wordContent/basicText';

export interface AOWord {
  type: 'AOWord';
  content: AOWordContent[];
  language?: string;
  mrp0sel?: string;
  morphologies?: MorphologicalAnalysis[];
  transliteration?: string;
}

export const aoWordFormat: XmlWriter<AOWord> = {
  write: ({content, mrp0sel, transliteration, morphologies, language}) =>
    [
      `<w trans="${transliteration}"`,
      indent(`mrp0sel="${mrp0sel || ''}"`),
      ...(language ? [indent(`lg="${language}"`)] : []),
      ...(morphologies || []).flatMap(writeMorphAnalysisAttribute).map(indent),
      `>${content.map(aoWordContentFormat.write).join('')}</w>`
    ]
};

export function parsedWord(...content: (AOWordContent | string)[]): AOWord {
  return {type: 'AOWord', content: content.map((c) => typeof c === 'string' ? aoBasicText(c) : c)};
}

export function isAOWord(c: AOSentenceContent): c is AOWord {
  return c.type === 'AOWord';
}