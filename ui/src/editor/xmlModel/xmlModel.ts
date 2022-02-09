export interface XmlElementNode {
  tagName: string;
  attributes: Record<string, string>;
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

// Helper functions

export function findFirstXmlElementByTagName(node: XmlNode, tagName: string): XmlElementNode | undefined {
  if (isXmlTextNode(node)) {
    return undefined;
  }

  if (node.tagName === tagName) {
    return node;
  }

  for (const c of node.children) {
    const found = findFirstXmlElementByTagName(c, tagName);

    if (found) {
      return found;
    }
  }
}