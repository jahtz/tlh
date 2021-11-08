import {GenericAttributes, isXmlElementNode, XmlNode, XmlTextNode} from './xmlModel';

type LetterCorrection = {
  [key: string]: string;
}

interface NodeReadConfig {
  letterCorrections: LetterCorrection;
  keepSpaces?: boolean;
}

export interface XmlReadConfig {
  [tagName: string]: NodeReadConfig;
}

function performCorrections(text: string, corrections: LetterCorrection): string {
  return Object.entries(corrections).reduce<string>((acc, [key, value]) => acc.replaceAll(key, value), text);
}

const localLetterCorrections: LetterCorrection = {
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

const letterHarmonization: LetterCorrection = {
  'á': 'á', 'à': 'à', 'â': 'â', 'ā': 'a',
  'é': 'é', 'è': 'è', 'ê': 'ê', 'ē': 'e',
  'í': 'í', 'ì': 'ì', 'î': 'î', 'ī': 'i',
  'ú': 'ú', 'ù': 'ù', 'û': 'û', 'ū': 'u',
  '=': '-'
};

export const tlhXmlReadConfig: XmlReadConfig = {
  w: {
    letterCorrections: {...localLetterCorrections, ...letterHarmonization},
    keepSpaces: true
  }
};

function createTextNode(baseTextContent: string, letterCorrections?: LetterCorrection): XmlTextNode {
  return letterCorrections
    ? {textContent: performCorrections(baseTextContent, letterCorrections)}
    : {textContent: baseTextContent};
}

export function loadNode(el: ChildNode, xmlReadConfig: XmlReadConfig, parentLetterCorrections?: LetterCorrection): XmlNode {
  if (el instanceof Text) {
    return createTextNode(el.textContent || '', parentLetterCorrections);
  } else if (el instanceof Element) {

    const nodeReadConfig: NodeReadConfig | undefined = xmlReadConfig[el.tagName] || undefined;

    return {
      tagName: el.tagName,
      attributes: Array.from(el.attributes)
        .reduce<GenericAttributes>((acc, {name, value}) => {
          return {...acc, [name]: value};
        }, {}),
      children: Array.from(el.childNodes)
        .map((c) => loadNode(c, xmlReadConfig, nodeReadConfig?.letterCorrections))
        // Filter out empty text nodes
        .filter((node) => isXmlElementNode(node) || (!!nodeReadConfig?.keepSpaces || node.textContent.trim().length > 0))
    };
  } else {
    throw new Error(`unexpected element: ${el.nodeType}`);
  }
}

export async function loadNewXml(file: File, xmlReadConfig: XmlReadConfig = tlhXmlReadConfig): Promise<XmlNode> {
  const content = await file.text();

  // non breakable space to normal space
  const correctedText = content.replaceAll('\xa0', '');

  const doc = new DOMParser().parseFromString(correctedText, 'text/xml');

  return loadNode(doc.children[0], xmlReadConfig);
}
