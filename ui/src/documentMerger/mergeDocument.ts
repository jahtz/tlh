import {findFirstXmlElementByTagName, isXmlElementNode, isXmlTextNode, xmlElementNode, XmlElementNode, XmlNode, XmlTextNode, xmlTextNode} from 'simple_xml';
import {ZipWithOffsetResult} from './zipWithOffset';
import {PublicationMap} from './publicationMap';


export const lineNumberRegex = /{(?<index>€(?<numbers>\d+|\d+\+\d+))}\s*(?<lines>[\W\w]+)/;

export interface MergeLine {
  lineNumberNode: XmlElementNode;
  rest: XmlNode[];
}

export interface MergeDocument {
  prior: XmlNode[];
  header: XmlElementNode;
  lines: MergeLine[];
  publicationMap: PublicationMap;
  mergedPublicationMapping: PublicationMap | undefined;
}

let leftTxtId = '';

export function readMergeDocument(rootNode: XmlElementNode): MergeDocument {
  const element: XmlElementNode | undefined = findFirstXmlElementByTagName(rootNode, 'text');
  const aoManuscript: XmlElementNode | undefined = findFirstXmlElementByTagName(rootNode, 'AO:Manuscripts');

  if (!element || !aoManuscript) {
    throw new Error('could not read document!');
  }

  const publicationMap: PublicationMap = new Map();

  aoManuscript.children
    .filter((node): node is XmlElementNode => isXmlElementNode(node))
    .filter(({tagName}) => tagName === 'AO:TxtPubl' || tagName === 'AO:InvNr')
    .flatMap(({children}) => children)
    .filter((node): node is XmlTextNode => isXmlTextNode(node))
    .forEach((childNode) => parsePublicationMapping(childNode.textContent, publicationMap));

  const result: MergeDocument = {
    prior: [],
    header: rootNode,
    lines: [],
    publicationMap,
    mergedPublicationMapping: undefined
  };

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
      return iterateTxtId(left);
    } else if (right && left == null) {
      return iterateTxtId(right);
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
  if (lnr === undefined || rnr === undefined || lnr == 'EMPTY LINE' || rnr == 'EMPTY LINE') {
    return undefined;
  }

  const leftMatch = lnr.match(lineNumberRegex);
  const rightMatch = rnr.match(lineNumberRegex);


  if (leftMatch && leftMatch.groups && rightMatch && rightMatch.groups) {
    const numbers: string[] = leftMatch.groups.numbers.split('+').concat(rightMatch.groups.numbers.split('+'));
    const lines: string[] = leftMatch.groups.lines.split('/').concat(rightMatch.groups.lines.split('/'));

    return `{€${numbers.join('+')}} ${lines.join('/')}`;
  } else {
    return undefined;
  }
}

function mergeLine(
  {lineNumberNode: leftLineNumberNode, rest: leftRest}: MergeLine,
  {lineNumberNode: rightLineNumberNode, rest: rightRest}: MergeLine
): MergeLine {

  const lnr = leftLineNumberNode.attributes.lnr || '';
  const rnr = rightLineNumberNode.attributes.lnr || '';

  const lineNumber = computeNewLineNumber(lnr, rnr) || (lnr + rnr);

  const language = leftLineNumberNode.attributes.lg || '';
  const txtid = (leftLineNumberNode.attributes.txtid + '+').replace('++', '+') || '';
  leftTxtId = txtid;
  const lineNumberNode: XmlElementNode = {
    tagName: 'lb', children: [], attributes: {'txtid': txtid, 'lnr': lineNumber, 'lg': language}
  };

  return {lineNumberNode, rest: [...leftRest, mergeSeparatorElement, ...rightRest]};
}

function iterateTxtId({lineNumberNode: leftLineNumberNode, rest: leftRest}: MergeLine): MergeLine {

  const lineNumber = leftLineNumberNode.attributes.lnr || '';
  const language = leftLineNumberNode.attributes.lg || '';
  const lineNumberNode: XmlElementNode = {
    tagName: 'lb', children: [], attributes: {'txtid': leftTxtId, 'lnr': lineNumber, 'lg': language}
  };

  return {lineNumberNode, rest: [...leftRest]};
}

const txtPublicationRegex = /(?<publication>[\W\w]+)({€(?<fragmentNum>\d+)})/;

function parsePublicationMapping(textContent: string, publMap: PublicationMap): PublicationMap {

  let publicationName: string;
  let fragmentNumber: number;

  let oldFragmentNumber = publMap.size != 0
    ? (parseInt(Array.from(publMap.keys())[publMap.size - 1]) + 1).toString()
    : '1';

  const publicationMatch = textContent.match(txtPublicationRegex);

  if (publicationMatch && publicationMatch.groups) {
    const {publication, fragmentNum} = publicationMatch.groups;

    oldFragmentNumber = fragmentNum;
    publicationName = publication.replaceAll(/\n\t/g, '').trim();
    fragmentNumber = parseInt(fragmentNum);
  } else {
    publicationName = textContent;
    fragmentNumber = 1;
  }

  // check if fragmentNumber already taken, if yes, search for next one...
  const takenFragmentNumbers = Array.from(publMap.values())
    .map(([fragNumber]) => fragNumber);

  while (takenFragmentNumbers.includes(fragmentNumber)) {
    fragmentNumber++;
  }

  publMap.set(oldFragmentNumber, [fragmentNumber, publicationName]);
  return publMap;
}

export function mergeHeader(firstDocumentHeader: XmlElementNode, secondDocumentHeader: XmlElementNode): XmlElementNode {
  const docID = findFirstXmlElementByTagName(firstDocumentHeader, 'docID');
  let newDocID = 'docID';

  if (docID && isXmlTextNode(docID.children[0])) {
    newDocID = docID.children[0].textContent + '+';
  }

  firstDocumentHeader.tagName = 'doc';
  firstDocumentHeader.children.forEach((node) => {
    if (isXmlElementNode(node) && node.tagName === 'docID') {
      node.tagName = 'mDocID';
    }
  });

  secondDocumentHeader.tagName = 'doc';
  secondDocumentHeader.children.forEach((node) => {
    if (isXmlElementNode(node) && node.tagName === 'docID') {
      node.tagName = 'mDocID';
    }
  });

  return xmlElementNode('AOHeader', {}, [
    xmlElementNode('docID', {}, [xmlTextNode(newDocID)]),
    xmlElementNode('meta', {}, [
      xmlElementNode('merge', {date: new Date().toISOString(), editor: 'DocumentMerger'}),
      xmlElementNode('annotation'),
      xmlElementNode('merged', {}, [
        firstDocumentHeader,
        secondDocumentHeader
      ])
    ])
  ]);
}

export function replaceLNR(node: XmlElementNode, publicationMap: PublicationMap): string {
  let textLine: string = node.attributes['lnr'] ? node.attributes['lnr'] : 'empty';

  const lineMatch = textLine.match(lineNumberRegex);
  if (textLine && lineMatch && lineMatch.groups) {
    let lineIndex = lineMatch.groups.index;
    // console.log(lineMatch.groups);
    if (lineIndex.includes('+')) {
      const lineIndices = lineIndex.replace('€', '').split('+');
      if (lineIndices.length == 2 && publicationMap.get(lineIndices[1]) && publicationMap.get(lineIndices[0])) {
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        lineIndices[1] = lineIndices[1].replace(lineIndices[1], publicationMap.get(lineIndices[1])![0].toString());
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        lineIndices[0] = lineIndices[0].replace(lineIndices[0], publicationMap.get(lineIndices[0])![0].toString());
        lineIndex = '€' + lineIndices.join('+');
      }
    } else {

      if (publicationMap.get(lineIndex.substring(1)) === undefined) {
        console.log(publicationMap);
        console.log(node);
        console.log(textLine);
        console.log(lineIndex.substring(1));
        console.log(publicationMap.get(lineIndex.substring(1)));
      }
      // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
      lineIndex = lineIndex.replace(lineIndex.substring(1), publicationMap.get(lineIndex.substring(1))![0].toString());
    }
    textLine = textLine.replace(lineMatch.groups.index, lineIndex);

  } else if (publicationMap.values()) {
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    textLine = '{€' + Array.from(publicationMap.values()).pop()![0] + '} ' + textLine;
  }
  return textLine;
}

export function resetPublicationMap(publMap: PublicationMap): PublicationMap {
  const updatedMappings = new Map<string, string>();

  Array.from(publMap.entries())
    .map(([index, mapping]) => {
      if (index != mapping[0].toString()) {
        updatedMappings.set(index, mapping[0].toString());
      }
    });

  if (updatedMappings) {
    Array.from(updatedMappings.entries())
      .map(([key, value]) => {
        const pMap = publMap.get(key);
        if (pMap !== undefined) {
          publMap.set(value, pMap);
          publMap.delete(key);
        }
      });

    Array.from(updatedMappings.entries())
      .map(([index, mapping]) => {
        if (index.toString() != mapping[0]) {
          updatedMappings.set(index, mapping[0]);
        }
      });
  }

  return publMap;
}
