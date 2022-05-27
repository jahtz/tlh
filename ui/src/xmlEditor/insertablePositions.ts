import {isXmlTextNode, XmlNode} from '../xmlModel/xmlModel';

export type NodePath = number[];

export interface InsertablePositions {
  asFirstChildOf?: string[];
  beforeElement?: string[];
  afterElement?: string[];
  asLastChildOf?: string[];
}

export function calculateInsertablePositions(
  positions: InsertablePositions,
  node: XmlNode,
  currentPath: NodePath = []
): string[] {

  const {asFirstChildOf, beforeElement, afterElement, asLastChildOf} = positions;

  if (isXmlTextNode(node)) {
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

  // FIXME: children!
  const childResults: string[] = node.children.flatMap((n, index) => calculateInsertablePositions(positions, n, [...currentPath, index]));

  // console.info(result);

  return [...result, ...childResults];
}