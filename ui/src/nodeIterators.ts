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

export function getPriorSibling(rootNode: XmlElementNode, path: number[], untilTagName: string): XmlElementNode | undefined {
  const parent = getElementByPath(rootNode, path.slice(0, -1));

  return parent.children
    .slice(0, path[path.length - 1])
    .reverse()
    .find((xmlNode) => isXmlElementNode(xmlNode) && xmlNode.tagName === untilTagName) as XmlElementNode | undefined;
}