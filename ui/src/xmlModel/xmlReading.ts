import {isXmlTextNode, XmlNode, XmlTextNode} from './xmlModel';
import update from 'immutability-helper';
import {Either} from './either';

type LetterCorrection = [string, string][];

interface NodeReadConfig {
  letterCorrections: LetterCorrection;
  keepSpaces?: boolean;
}

export interface XmlReadConfig {
  [tagName: string]: NodeReadConfig;
}

function performCorrections(text: string, corrections: LetterCorrection): string {
  return corrections.reduce<string>((acc, [key, value]) => acc.replace(new RegExp(key, 'g'), value), text);
}

const letterCorrections: LetterCorrection = [
  // Corrections
  ['š', 'š' /* kombi zu 161 */], ['Š', 'Š' /* kombi zu 160 */],
  ['ḫ̮', 'ḫ'], ['Ḫ̮', 'Ḫ'], ['ḫ', 'ḫ'], ['Ḫ', 'Ḫ'], ['h', 'ḫ'], ['H', 'Ḫ'],
  ['̮', '' /* Achtung, überzähliger Bogen unter Het! schlecht sichtbar */],
  ['〈', '〈' /* U+3008 aus CJK zu  U+2329 */], ['〉', '〉'],
  // Harmonizations
  ['á', 'á'], ['à', 'à'], ['â', 'â'], ['ā', 'ā'],
  ['é', 'é'], ['è', 'è'], ['ê', 'ê'], ['ē', 'e'],
  ['í', 'í'], ['ì', 'ì'], ['î', 'î'], ['ī', 'ī'],
  ['ú', 'ú'], ['ù', 'ù'], ['û', 'û'], ['ū', 'ū'],
];

export const tlhXmlReadConfig: XmlReadConfig = {
  w: {letterCorrections, keepSpaces: true}
};

function createTextNode(baseTextContent: string, letterCorrections?: LetterCorrection): XmlTextNode {
  return letterCorrections
    ? {textContent: performCorrections(baseTextContent, letterCorrections)}
    : {textContent: baseTextContent};
}

function loadNode(el: ChildNode, xmlReadConfig: XmlReadConfig, parentLetterCorrections?: LetterCorrection): XmlNode {
  if (el instanceof Text) {
    return createTextNode(el.textContent || '', parentLetterCorrections);
  } else if (el instanceof Element) {

    const nodeReadConfig: NodeReadConfig | undefined = xmlReadConfig[el.tagName] || undefined;

    return {
      tagName: el.tagName,
      attributes: Array.from(el.attributes).reduce((acc, {name, value}) => update(acc, {[name]: {$set: value}}), {}),
      children: Array.from(el.childNodes)
        .map((c) => loadNode(c, xmlReadConfig, nodeReadConfig?.letterCorrections))
        // Filter out empty text nodes
        .filter((node) => !isXmlTextNode(node) || (!!nodeReadConfig?.keepSpaces || node.textContent.trim().length > 0))
    };
  } else if (el instanceof Comment) {
    // ignore...?
    return {comment: el.textContent || ''};
  } else {
    throw new Error(`unexpected element: ${el.nodeType}`);
  }
}

export type ParseResult = Either<string, XmlNode>;

export function parseNewXml(content: string, xmlReadConfig: XmlReadConfig = tlhXmlReadConfig): ParseResult {
  const doc = new DOMParser().parseFromString(content, 'text/xml');

  const rootElement = doc.children[0];

  if (rootElement.tagName === 'parsererror') {
    return {_type: 'Left', value: new XMLSerializer().serializeToString(rootElement)};
  } else {
    return {_type: 'Right', value: loadNode(rootElement, xmlReadConfig)};
  }
}

export async function loadNewXml(file: File, xmlReadConfig: XmlReadConfig = tlhXmlReadConfig): Promise<ParseResult> {
  return parseNewXml(
    // non-breakable space to normal space
    (await file.text()).replace(/\xa0/g, ''),
    xmlReadConfig
  );
}

