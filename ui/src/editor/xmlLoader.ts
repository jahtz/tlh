import {loadNode, XmlNode} from './xmlModel';

export type LetterCorrection = {
  [key: string]: string;
}

const globalLetterCorrections: LetterCorrection = {
  '\xa0': ' ' // non breakable space to normal space
};

export const localLetterCorrections: LetterCorrection = {
  'š': 'š', // kombi zu 161
  'Š': 'Š', // kombi zu 160

  'ḫ̮': 'ḫ',
  'Ḫ̮': 'Ḫ',

  'ḫ': 'ḫ',
  'Ḫ': 'Ḫ',

  'h': 'ḫ',
  'H': 'Ḫ',

  '̮': '', // Achtung, überzähliger Bogen unter Het! schlecht sichtbar

  '〈': '〈', // U+3008 aus CJK zu  U+2329
  '〉': '〉'
};

export const letterHarmonization: LetterCorrection = {
  'á': 'á', 'à': 'à', 'â': 'â', 'ā': 'a',
  'é': 'é', 'è': 'è', 'ê': 'ê', 'ē': 'e',
  'í': 'í', 'ì': 'ì', 'î': 'î', 'ī': 'i',
  'ú': 'ú', 'ù': 'ù', 'û': 'û', 'ū': 'u',
  '=': '-'
};

export function performCorrections(text: string, corrections: LetterCorrection): string {
  return Object.entries(corrections).reduce<string>((acc, [key, value]) => acc.replaceAll(key, value), text);
}

export async function loadNewXml(file: File): Promise<XmlNode> {
  const content = await file.text();

  const correctedText = performCorrections(content, globalLetterCorrections);

  const doc = new DOMParser().parseFromString(correctedText, 'text/xml');

  return loadNode(doc.children[0]);
}
