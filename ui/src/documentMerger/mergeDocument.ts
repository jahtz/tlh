import {findFirstXmlElementByTagName, isXmlElementNode, XmlElementNode, XmlNode} from '../editor/xmlModel/xmlModel';

export interface MergeLine {
  lb: XmlElementNode;
  rest: XmlNode[];
}

export interface MergeDocument {
  prior: XmlNode[];
  lines: MergeLine[];
}

export function readMergeDocument(rootNode: XmlElementNode): MergeDocument {
  const element: XmlElementNode | undefined = findFirstXmlElementByTagName(rootNode, 'text');

  if (!element) {
    throw new Error('could not read document!');
  }

  const result: MergeDocument = {prior: [], lines: []};

  element.children.forEach((node) => {
    if (isXmlElementNode(node) && node.tagName === 'lb') {
      result.lines.push({lb: node, rest: []});
    } else if (result.lines.length === 0) {
      result.prior.push(node);
    } else {
      result.lines[result.lines.length - 1].rest.push(node);
    }
  });

  return result;
}