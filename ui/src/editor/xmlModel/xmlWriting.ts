import {isXmlTextNode, XmlNode} from './xmlModel';

interface NodeWriteConfig {
  inlineChildren?: boolean;
}

export interface XmlWriteConfig {
  [tagName: string]: NodeWriteConfig;
}

export const tlhXmlWriteConfig: XmlWriteConfig = {
  docID: {inlineChildren: true},

  'AO:TxtPubl': {inlineChildren: true},

  w: {inlineChildren: true},
};

export function writeNode(node: XmlNode, xmlWriteConfig: XmlWriteConfig = tlhXmlWriteConfig, parentInline = false): string[] {
  if (isXmlTextNode(node)) {
    return [node.textContent];
  } else {
    const {tagName, attributes, children} = node;

    const writeConfig: NodeWriteConfig | undefined = xmlWriteConfig[tagName] || undefined;

    const writtenAttributes = Object.entries(attributes)
      .flatMap(([name, value]) => {
        if (!value) {
          return [];
        }

        const writtenValue = value
          .replaceAll(/&(?!amp;)/g, '&amp;')
          .replaceAll('<', '&lt;');

        return `${name}="${writtenValue}"`;
      })
      .join(' ');

    if (children.length === 0) {
      return [`<${tagName}${writtenAttributes.length === 0 ? '' : ' ' + writtenAttributes}/>`];
    } else if (children.length === 1 && isXmlTextNode(children[0])) {
      return [`<${tagName}${writtenAttributes.length === 0 ? '' : ' ' + writtenAttributes}>${children[0].textContent}</${tagName}>`];
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
