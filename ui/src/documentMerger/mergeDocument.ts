import {findFirstXmlElementByTagName, isXmlElementNode, XmlElementNode, XmlNode} from '../editor/xmlModel/xmlModel';
import {ZipWithOffsetResult} from './zipWithOffset';

const lineNumberRegex = /{€(?<fragment>\d)}\s*(?<lines>[\W\w]+)/;

export interface MergeLine {
  lineNumber: string;
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
      result.lines.push({lineNumber: node.attributes.lnr, rest: []});
    } else if (result.lines.length === 0) {
      result.prior.push(node);
    } else {
      result.lines[result.lines.length - 1].rest.push(node);
    }
  });

  return result;
}

export function mergeLines(mls: ZipWithOffsetResult<MergeLine>): MergeLine[] {
  return mls.map(([left, right]) => {
    if (left && right) {
      return mergeLine(left, right);
    } else if (left) {
      return left;
    } else if (right) {
      return right;
    } else {
      throw new Error('TODO');
    }
  });
}

const mergeSeparatorElement: XmlElementNode = {
  tagName: 'w',
  attributes: {},
  children: []
};

function mergeLine({lineNumber: leftLineNumber, rest: leftRest}: MergeLine, {lineNumber: rightLineNumber, rest: rightRest}: MergeLine): MergeLine {

  const leftMatch = leftLineNumber.match(lineNumberRegex);

  const rightMatch = rightLineNumber.match(lineNumberRegex);

  const lineNumber = (!leftMatch || !leftMatch.groups || !rightMatch || !rightMatch.groups)
    ? leftLineNumber + rightLineNumber
    : `{€${leftMatch.groups.fragment}+${rightMatch.groups.fragment}} ${leftMatch.groups.lines} / ${rightMatch.groups.lines}`;

  return {
    lineNumber,
    rest: [...leftRest, mergeSeparatorElement, ...rightRest]
  };
}