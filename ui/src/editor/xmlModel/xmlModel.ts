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

