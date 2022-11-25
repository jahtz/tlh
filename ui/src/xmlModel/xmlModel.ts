import {Spec} from 'immutability-helper';

export type Attributes = Record<string, string | undefined>;

export interface XmlElementNode<tagNameType extends string = string> {
  tagName: tagNameType;
  attributes: Attributes;
  children: XmlNode[];
}

export function xmlElementNode<TagName extends string = string>(tagName: TagName, attributes: Attributes = {}, children: XmlNode[] = []): XmlElementNode<TagName> {
  return {tagName, attributes, children};
}

export function isXmlElementNode(node: XmlNode): node is XmlElementNode {
  return 'tagName' in node;
}

export interface XmlTextNode {
  textContent: string;
}

export function xmlTextNode(textContent: string): XmlTextNode {
  return {textContent};
}

export function isXmlTextNode(node: XmlNode): node is XmlTextNode {
  return 'textContent' in node;
}

export interface XmlCommentNode {
  comment: string;
}

export function isXmlCommentNode(node: XmlNode): node is XmlCommentNode {
  return 'comment' in node;
}

export type XmlNonEmptyNode = XmlElementNode | XmlTextNode;

export type XmlNode = XmlNonEmptyNode | XmlCommentNode;

// Helper functions

export function getElementByPath(rootNode: XmlElementNode, path: number[]): XmlElementNode {
  return path.reduce(
    (acc, index) => acc.children[index] as XmlElementNode,
    rootNode
  );
}

export function buildActionSpec(innerAction: Spec<XmlNode>, path: number[]): Spec<XmlNode> {
  return path.reduceRight(
    (acc, index) => ({children: {[index]: acc}}),
    innerAction
  );
}

export function findFirstXmlElementByTagName(node: XmlNode, tagName: string): XmlElementNode | undefined {
  if (isXmlTextNode(node) || isXmlCommentNode(node)) {
    return undefined;
  }

  if (node.tagName === tagName) {
    return node;
  }

  for (const child of node.children) {
    const found: XmlElementNode | undefined = findFirstXmlElementByTagName(child, tagName);

    if (found) {
      return found;
    }
  }

  return undefined;
}