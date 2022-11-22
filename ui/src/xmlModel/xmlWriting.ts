import {isXmlCommentNode, isXmlTextNode, XmlNode} from './xmlModel';

export interface XmlWriteConfig {
  [tagName: string]: {
    inlineChildren: boolean
  };
}

export const tlhXmlWriteConfig: XmlWriteConfig = {
  docID: {inlineChildren: true},

  'AO:TxtPubl': {inlineChildren: true},

  w: {inlineChildren: true},
};

function writeAttributeValue(value: string): string {
  return value
    .replace(/&(?!amp;)/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function writeNode(node: XmlNode, xmlWriteConfig: XmlWriteConfig = tlhXmlWriteConfig, parentInline = false): string[] {
  if (isXmlCommentNode(node)) {
    return [`<!-- ${node.comment} -->`];
  } else if (isXmlTextNode(node)) {
    return [node.textContent];
  } else {
    const {tagName, attributes, children} = node;

    const writeConfig = xmlWriteConfig[tagName] || undefined;

    const writtenAttributes = Object.entries(attributes)
      .flatMap<string>(([name, value]) =>
        value !== undefined
          ? `${name}="${writeAttributeValue(value)}"`
          : [])
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

export function indent(s: string): string {
  return ' '.repeat(2) + s;
}
