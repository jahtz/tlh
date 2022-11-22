import {AOWordContent, convertAoWordToXmlString, convertAoWordContentToXmlNode} from '../wordContent/wordContent';
import {MorphologicalAnalysis, writeMorphAnalysisAttribute} from '../morphologicalAnalysis';
import {aoBasicText} from '../wordContent/basicText';
import {indent} from '../../xmlModel/xmlWriting';
import {Attributes, xmlElementNode, XmlElementNode} from '../../xmlModel/xmlModel';

export interface AOWord {
  _type: 'AoWord';
  lng?: string;
  mrp0sel?: string;
  morphologies?: MorphologicalAnalysis[];
  transliteration?: string;
  content: AOWordContent[];
}

export function convertAoWord2XmlStrings({transliteration, content, lng, mrp0sel, morphologies}: AOWord): string[] {
  return [
    '<w',
    ...(transliteration ? [indent(`trans="${transliteration}"`)] : []),
    ...(mrp0sel ? [indent(`mrp0sel="${mrp0sel || ''}"`)] : []),
    ...(lng ? [indent(`lng="${lng}"`)] : []),
    ...(morphologies || []).flatMap(writeMorphAnalysisAttribute).map(indent),
    `>${content.map(convertAoWordToXmlString).join('')}</w>`
  ];
}

export function convertAoWordToXml({transliteration, content, lng: lng, mrp0sel, morphologies}: AOWord): XmlElementNode {

  const attributes: Attributes = {mrp0sel, transliteration, lng};

  if (morphologies) {
    for (const morph of morphologies) {
      attributes[`mrp${morph.number}`] = 'TODO!';
    }
  }

  return xmlElementNode('w', attributes, content.map(convertAoWordContentToXmlNode));
}

export function parsedWord(...content: (AOWordContent | string)[]): AOWord {
  return {_type: 'AoWord', content: content.map((c) => typeof c === 'string' ? aoBasicText(c) : c)};
}
