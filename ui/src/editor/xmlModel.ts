export interface XmlAttribute {
  __type: 'XmlAttribute';
  name: string;
  value: string;
}

function xmlAttribute(name: string, value: string): XmlAttribute {
  return {__type: 'XmlAttribute', name, value};
}

export interface XmlElementNode {
  __type: 'XmlElementNode';
  tagName: string;
  attributes: XmlAttribute[]; // TODO: { [name: string] }
  children: XmlNode[];
}

export interface XmlTextNode {
  __type: 'XmlTextNode';
  textContent: string;
}

export type XmlNode = XmlElementNode | XmlTextNode;

// Read, Write

export function loadNode(el: ChildNode): XmlNode {
  if (el instanceof Text) {
    return {__type: 'XmlTextNode', textContent: el.textContent || ''};
  } else if (el instanceof Element) {
    return {
      __type: 'XmlElementNode',
      tagName: el.tagName,
      attributes: Array.from(el.attributes).map(({name, value}) => xmlAttribute(name, value)),
      children: Array.from(el.childNodes).map(loadNode)
    };
  } else {
    throw new Error(`unexpected element: ${el.nodeType}`);
  }
}

