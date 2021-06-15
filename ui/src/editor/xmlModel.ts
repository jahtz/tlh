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

// Read, Write

interface Attributes {
  [name: string]: string;
}

export function loadNode(el: ChildNode): XmlNode {
  if (el instanceof Text) {
    return {__type: 'XmlTextNode', textContent: el.textContent || ''};
  } else if (el instanceof Element) {
    return {
      __type: 'XmlElementNode',
      tagName: el.tagName,
      attributes: Array.from(el.attributes).reduce<Attributes>((acc, {name, value}) => {
        return {...acc, [name]: value};
      }, {}),
      children: Array.from(el.childNodes).map(loadNode)
    };
  } else {
    throw new Error(`unexpected element: ${el.nodeType}`);
  }
}

// Old version

export interface XmlWriter<T> {
  write: (t: T) => string[];
}

export function indent(s: string): string {
  return ' '.repeat(2) + s;
}
