import {isXmlElementNode, XmlElementNode, XmlNode} from 'simple_xml';
import {Spec} from 'immutability-helper';

export type NodePath = number[];

export interface InsertablePositions {
  asFirstChildOf?: string[];
  beforeElement?: string[];
  afterElement?: string[];
  asLastChildOf?: string[];
  newElement?: () => XmlElementNode;
  insertAction?: (path: number[], newNode: XmlElementNode, rootNode: XmlElementNode) => Spec<XmlNode>;
}

export function calculateInsertablePositions(
  positions: InsertablePositions,
  node: XmlNode,
  currentPath: NodePath = []
): string[] {

  const {asFirstChildOf, beforeElement, afterElement, asLastChildOf} = positions;

  if (!isXmlElementNode(node)) {
    return [];
  }

  const result: string[] = [];

  if (asFirstChildOf && asFirstChildOf.includes(node.tagName)) {
    result.push([...currentPath, 0].join('.'));
  }

  if (asLastChildOf && asLastChildOf.includes(node.tagName)) {
    result.push([...currentPath, node.children.length].join('.'));
  }

  if (beforeElement && beforeElement.includes(node.tagName)) {
    result.push([...currentPath].join('.'));
  }

  if (afterElement && afterElement.includes(node.tagName)) {
    result.push([...currentPath.slice(0, currentPath.length - 1), currentPath[currentPath.length - 1] + 1].join('.'));
  }

  const childResults: string[] = node.children.flatMap((n, index) => calculateInsertablePositions(positions, n, [...currentPath, index]));

  return [...result, ...childResults];
}