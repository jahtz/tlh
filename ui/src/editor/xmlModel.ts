import {tlhXmlWriteConfig} from './tlhNodeDisplayConfig';
import {letterHarmonization, localLetterCorrections, performCorrections} from './xmlLoader';

export interface GenericAttributes {
  [name: string]: string;
}

export interface XmlElementNode<A = GenericAttributes> {
  tagName: string;
  attributes: A;
  children: XmlNode[];
}

export function isXmlElementNode(node: XmlNode): node is XmlElementNode {
  return 'tagName' in node;
}

export interface XmlTextNode {
  textContent: string;
}

export function isXmlTextNode(node: XmlNode): node is XmlTextNode {
  return 'textContent' in node;
}

export type XmlNode = XmlElementNode | XmlTextNode;

// Read

function createTextNode(baseTextContent: string): XmlTextNode {
  const correctedText = performCorrections(baseTextContent, localLetterCorrections);

  const textContent = performCorrections(correctedText, letterHarmonization);

  return {textContent};
}

export function loadNode(el: ChildNode): XmlNode {
  if (el instanceof Text) {
    return createTextNode(el.textContent || '');
  } else if (el instanceof Element) {
    return {
      tagName: el.tagName,
      attributes: Array.from(el.attributes)
        .reduce<GenericAttributes>((acc, {name, value}) => {
          return {...acc, [name]: value};
        }, {}),
      children: Array.from(el.childNodes)
        .map(loadNode)
        // Filter out empty text nodes
        .filter((node) => isXmlElementNode(node) || node.textContent.trim().length > 0)
    };
  } else {
    throw new Error(`unexpected element: ${el.nodeType}`);
  }
}

// Write

interface NodeWriteConfig {
  inlineChildren?: boolean;
}

export interface XmlWriteConfig {
  [tagName: string]: NodeWriteConfig;
}

export function writeNode(node: XmlNode, xmlWriteConfig: XmlWriteConfig = tlhXmlWriteConfig, parentInline = false): string[] {
  if (isXmlTextNode(node)) {
    return [node.textContent];
  } else {
    const {tagName, attributes, children} = node;

    const writeConfig: NodeWriteConfig | undefined = xmlWriteConfig[tagName] || undefined;

    const writtenAttributes = Object.entries(attributes)
      .map(([name, value]) => {
        const writtenValue = value
          .replaceAll('<', '&lt;')
          .replaceAll(/&(?!amp;)/g, '&amp;');
        return `${name}="${writtenValue}"`;
      })
      .join(' ');

    if (children.length === 0) {
      return [`<${tagName}${writtenAttributes.length === 0 ? '' : ' ' + writtenAttributes}/>`];
    } else {
      const inlineChildren = !!writeConfig?.inlineChildren || parentInline;

      const writtenChildren = children.flatMap((n) => writeNode(n, xmlWriteConfig, inlineChildren));

      const startTag = `<${tagName}${writtenAttributes.length === 0 ? '' : ' ' + writtenAttributes}>`;
      const endTag = `</${tagName}>`;

      return inlineChildren
        ? [startTag + writtenChildren.join('') + endTag]
        : [startTag, ...writtenChildren.map(indent), endTag];
    }
  }
}

// Old version

export interface XmlWriter<T> {
  write: (t: T) => string[];
}

export function indent(s: string): string {
  return ' '.repeat(2) + s;
}
