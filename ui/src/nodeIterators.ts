import {getElementByPath, isXmlElementNode, XmlElementNode, XmlNode} from 'simple_xml';

function takeUntil<T>(values: T[], f: (t: T) => boolean): T[] {
  const result = [];

  for (const t of values) {
    if (f(t)) {
      break;
    }

    result.push(t);
  }

  return result;
}

export function getSiblingsUntil(rootNode: XmlElementNode, path: number[], untilTagName: string): XmlNode[] {
  const parent = getElementByPath(rootNode, path.slice(0, -1));

  const childrenAfter = parent.children.slice(path[path.length - 1] + 1);

  return Array.from(
    takeUntil(
      childrenAfter,
      (n) => isXmlElementNode(n) && n.tagName === untilTagName
    )
  );
}

function arrayRemoveLast<T>(a: T[]): [T[], T | undefined] {
  const aCopy = [...a];
  const last = aCopy.pop();

  return [aCopy, last];
}

export function getPriorSibling(rootNode: XmlElementNode, path: number[], untilTagName: string): XmlElementNode | undefined {
  const parent = getElementByPath(rootNode, path.slice(0, -1));

  return parent.children
    .slice(0, path[path.length - 1])
    .reverse()
    .find((xmlNode) => isXmlElementNode(xmlNode) && xmlNode.tagName === untilTagName) as XmlElementNode | undefined;
}

export function getPriorSiblingPath(rootNode: XmlElementNode, path: number[], untilTagName: string): number[] | undefined {
  const [pathStart, pathEnd] = arrayRemoveLast(path);

  const parent = getElementByPath(rootNode, pathStart);

  if (parent.children.length === 0 || pathEnd === undefined) {
    return undefined;
  }

  const lastIndex = pathEnd === parent.children.length ? pathEnd - 1 : pathEnd;

  for (let index = lastIndex; index >= 0; index--) {
    const child = parent.children[index];
    if (isXmlElementNode(child) && child.tagName === untilTagName) {
      return [...pathStart, index];
    }
  }

  return undefined;
}