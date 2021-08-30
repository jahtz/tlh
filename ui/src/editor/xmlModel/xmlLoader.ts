import {XmlNode} from './xmlModel';
import {loadNode, tlhXmlReadConfig, XmlReadConfig} from './xmlReading';

export type LetterCorrection = {
  [key: string]: string;
}

const globalLetterCorrections: LetterCorrection = {
  '\xa0': ' ' // non breakable space to normal space
};

export function performCorrections(text: string, corrections: LetterCorrection): string {
  return Object.entries(corrections).reduce<string>((acc, [key, value]) => acc.replaceAll(key, value), text);
}

export async function loadNewXml(file: File, xmlReadConfig: XmlReadConfig = tlhXmlReadConfig): Promise<XmlNode> {
  const content = await file.text();

  const correctedText = performCorrections(content, globalLetterCorrections);

  const doc = new DOMParser().parseFromString(correctedText, 'text/xml');

  return loadNode(doc.children[0], xmlReadConfig);
}
