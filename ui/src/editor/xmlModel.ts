import {tlhXmlWriteConfig} from './tlhNodeDisplayConfig';

interface Attributes {
  [name: string]: string;
}

export interface XmlElementNode {
  __type: 'XmlElementNode';
  tagName: string;
  attributes: Attributes;
  children: XmlNode[];
}

export interface XmlTextNode {
  __type: 'XmlTextNode';
  textContent: string;
}

export type XmlNode = XmlElementNode | XmlTextNode;

// Read

export function loadNode(el: ChildNode): XmlNode {
  if (el instanceof Text) {
    return {__type: 'XmlTextNode', textContent: el.textContent || ''};
  } else if (el instanceof Element) {
    return {
      __type: 'XmlElementNode',
      tagName: el.tagName,
      attributes: Array.from(el.attributes)
        .reduce<Attributes>((acc, {name, value}) => {
          return {...acc, [name]: value};
        }, {}),
      children: Array.from(el.childNodes)
        .map(loadNode)
        // Filter out empty text nodes
        .filter((node) => node.__type === 'XmlElementNode' || node.textContent.trim().length > 0)
    };
  } else {
    throw new Error(`unexpected element: ${el.nodeType}`);
  }
}

// Write

interface NodeWriteConfig {
  contractEmpty?: boolean;
  inlineChildren?: boolean;
}

export interface XmlWriteConfig {
  [tagName: string]: NodeWriteConfig;
}

export function writeNode(node: XmlNode, xmlWriteConfig: XmlWriteConfig = tlhXmlWriteConfig): string[] {
  if (node.__type === 'XmlTextNode') {
    return [node.textContent];
  } else {
    const {tagName, attributes, children} = node;

    const writeConfig: NodeWriteConfig | undefined = xmlWriteConfig[tagName] || undefined;

    const contractEmpty = !!writeConfig && !!writeConfig.contractEmpty;

    const writtenAttributes = Object.entries(attributes).map(([name, value]) => `${name}="${value}"`).join(' ');

    if (children.length === 0 && contractEmpty) {
      return [`<${tagName}${writtenAttributes.length === 0 ? '' : ' ' + writtenAttributes}/>`];
    } else {
      const writtenChildren = children.flatMap((n) => writeNode(n, xmlWriteConfig));

      const startTag = `<${tagName}${writtenAttributes.length === 0 ? '' : ' ' + writtenAttributes}>`;
      const endTag = `</${tagName}>`;

      return !!writeConfig && !!writeConfig.inlineChildren
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
