import {findFirstXmlElementByTagName, isXmlElementNode, isXmlTextNode, xmlElementNode, XmlElementNode, XmlNode} from 'simple_xml';
import {ZipWithOffsetResult} from './zipWithOffset';

export const lineNumberRegex = /{€(?<fragment>\d)}\s*(?<lines>[\W\w]+)/;
export const txtPublicationRegex = /(?<publication>[\W\w]+)({€(?<lnr>\d+)})/;
export const lineNumberRegexNew = /{(?<index>€(\d+|\d+\+\d+))}\s*(?<lines>[\W\w]+)/;

export interface MergeLine {
  lineNumberNode: XmlElementNode;
  rest: XmlNode[];
}

export interface MergeDocument {
  prior: XmlNode[];
  header: XmlElementNode;
  lines: MergeLine[];
  publMap: Map<string, string[]>;
  MergedPublicationMapping: Map<string, string[]> | undefined;
}

export function readMergeDocument(rootNode: XmlElementNode): MergeDocument {
  const element: XmlElementNode | undefined = findFirstXmlElementByTagName(rootNode, 'text');
  const aoManuscript: XmlElementNode | undefined = findFirstXmlElementByTagName(rootNode, 'AO:Manuscripts');
  if (!element || !aoManuscript) {
    throw new Error('could not read document!');
  }
  const publicationMap: Map<string, string[]> = new Map<string, string[]>();
  aoManuscript.children.forEach((node) => {
    if (isXmlElementNode(node) && (node.tagName === 'AO:TxtPubl' || node.tagName === 'AO:InvNr')) {
      node.children.forEach((nnode) => {
        if (isXmlTextNode(nnode)) {
          parsePublicationMapping(nnode.textContent, publicationMap);
        }
      });
    }
  });
  const result: MergeDocument = {prior: [], header: rootNode, lines: [], publMap: publicationMap, MergedPublicationMapping: undefined};

  element.children.forEach((node) => {
    if (isXmlElementNode(node) && node.tagName === 'lb') {
      node.attributes['lnr'] = replaceLNR(node, publicationMap);

      result.lines.push({lineNumberNode: node, rest: []});
    } else if (result.lines.length === 0) {
      result.prior.push(node);
    } else {
      result.lines[result.lines.length - 1].rest.push(node);
    }
  });

  const headerElement: XmlElementNode | undefined = findFirstXmlElementByTagName(rootNode, 'AOHeader');
  if (headerElement) {
    result.header = headerElement;
  }

  return result;
}

export function mergeLines(mls: ZipWithOffsetResult<MergeLine>): MergeLine[] {
  return mls.map(([left, right]) => {
    if (left && right) {
      return mergeLine(left, right);
    } else if (left && right == null) {
      return left;
    } else if (right && left == null) {
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

function computeNewLineNumber(lnr: string | undefined, rnr: string | undefined): string | undefined {
  if (lnr === undefined || rnr === undefined) {
    return undefined;
  }

  const leftMatch = lnr.match(lineNumberRegex);
  const rightMatch = rnr.match(lineNumberRegex);

  // TODO: make lineNumber a node!
  return leftMatch && leftMatch.groups && rightMatch && rightMatch.groups
    ? `{€${leftMatch.groups.fragment}+${rightMatch.groups.fragment}} ${leftMatch.groups.lines} / ${rightMatch.groups.lines}`
    : undefined;
}

function mergeLine(
  {lineNumberNode: leftLineNumberNode, rest: leftRest}: MergeLine,
  {lineNumberNode: rightLineNumberNode, rest: rightRest}: MergeLine
): MergeLine {

  const lnr = leftLineNumberNode.attributes.lnr || '';
  const rnr = rightLineNumberNode.attributes.lnr || '';

  const lineNumber = computeNewLineNumber(lnr, rnr) || (lnr + rnr);

  const lineNumberNode: XmlElementNode = {
    tagName: 'lb', children: [], attributes: {'lnr': lineNumber}
  };

  return {lineNumberNode, rest: [...leftRest, mergeSeparatorElement, ...rightRest]};
}

function parsePublicationMapping(txtPublication: string, publMap: Map<string, string[]>) {
  // <publcationString, {oldPubNr, newPublNr}>
  const publMatch = txtPublication.match(txtPublicationRegex);
  let publName: string;
  let publNumber = 1;
  let oldPublNumber = publMap.size != 0 ? (parseInt(Array.from(publMap.keys())[publMap.size - 1]) + 1).toString() : '1';

  if (publMatch && publMatch.groups) {
    oldPublNumber = '' + publMatch.groups.lnr;
    publNumber = parseInt(publMatch.groups.lnr);
    publName = publMatch.groups.publication;
  } else {
    publName = txtPublication;
  }
  const indices = [];
  for (const value of Array.from(publMap.values())) {
    indices.push(value[0]);
  }
  while (indices.includes(publNumber.toString())) {
    publNumber++;
  }

  publMap.set(oldPublNumber, [publNumber.toString(), publName]);
  return publMap;
}

export function mergeHeader(firstDocumentHeader: XmlElementNode, secondDocumentHeader: XmlElementNode) {
  secondDocumentHeader.tagName = 'doc';
  secondDocumentHeader.children.forEach((node) => {
    if (isXmlElementNode(node) && node.tagName === 'docID') {
      node.tagName = 'mDocID';
    }
  });
  const meta = findFirstXmlElementByTagName(firstDocumentHeader, 'meta');
  if (meta?.children) {
    const merged = xmlElementNode<'merged'>('merged');
    merged.children.push(secondDocumentHeader);
    meta.children.push(merged);
  }
  return firstDocumentHeader;
}

export function replaceLNR(node: XmlElementNode, publicationMap: Map<string, string[]>) {
  let textLine: string = node.attributes['lnr'] ? node.attributes['lnr'] : 'empty';


  const lineMatch = textLine.match(lineNumberRegexNew);
  if (textLine && lineMatch && lineMatch.groups) {
    let lineIndex = lineMatch.groups.index;
    if (lineIndex.includes('+')) {
      const lineIndices = lineIndex.split('+');
      if (lineIndices.length == 2 && publicationMap.get(lineIndices[1]) && publicationMap.get(lineIndices[0])) {
        lineIndices[1] = lineIndices[1].replace(lineIndices[1], publicationMap.get(lineIndices[1])![0]);
        lineIndices[0] = lineIndices[0].replace(lineIndices[0].substring(1), publicationMap.get(lineIndices[0]?.substring(1))![0]);
        lineIndex = lineIndices.join('+');
      }
    } else {

      if (publicationMap.get(lineIndex.substring(1)) === undefined) {
        console.log(publicationMap);
        console.log(node);
        console.log(textLine);
        console.log(lineIndex.substring(1));
        console.log(publicationMap.get(lineIndex.substring(1)));
      }
      lineIndex = lineIndex.replace(lineIndex.substring(1), publicationMap.get(lineIndex.substring(1))![0]);
    }
    textLine = textLine.replace(lineMatch.groups.index, lineIndex);

  } else {
    textLine = '{€' + Array.from(publicationMap.values()).pop()![0] + '}' + textLine;
  }
  return textLine;
}

export function resetPublicationMap(publMap: Map<string, string[]>) {
  const updatedMappings: Map<string, string> = new Map<string, string>();
  Array.from(publMap.entries()).map((entry) => {
    const index = entry[0];
    const mapping = entry[1];
    if (index.toString() != mapping[0]) {
      updatedMappings.set(index, mapping[0]);
    }
  });
  if (updatedMappings!) {
    Array.from(updatedMappings.entries()).map((mapping) => {
      publMap.set(mapping[1], publMap.get(mapping[0])!);
      publMap.delete(mapping[0]);
    });
  }
  Array.from(updatedMappings!.entries()).map((entry) => {
    const index = entry[0];
    const mapping = entry[1];
    if (index.toString() != mapping[0]) {
      updatedMappings.set(index, mapping[0]);
    }
  });
  return publMap;
}