import { Line, TLHParser } from 'simtex';
import { isXmlElementNode, XmlElementNode, XmlNode } from 'simple_xml';
import { createCompleteDocument, XmlCreationValues } from './xmlConversion/createCompleteDocument';
import { writeXml } from '../xmlEditor/StandAloneOXTED';

// TODO: add other nodes to filter out...
const tagNamesToFilter: string[] = [
  'LINE_PREFIX', 'PARSER_ERROR', 'PUBLICATION_NUMBER', 'INVENTORY_NUMBER', 'IDENTIFIER', 'UNDEFINED_DEGREE_SIGN', 'LANGUAGE_CHANGE', 'GAP',
  'DELIMITER', 'BASIC', 'METADATA', 'PARAGRAPH_LANGUAGE'
];

const exportLine = (line: Line): XmlNode[] => {
  return line.exportXml()
    // filter out "illegal nodes"
    .filter((node) => !isXmlElementNode(node) || !tagNamesToFilter.includes(node.tagName));
};

export function exportXmlNodesFromParser(parser: TLHParser): XmlNode[] {
  const lines = parser.getLines();

  if (lines.length === 0) {
    return [];
  }

  const nodes: XmlNode[] = [];

  const [firstLine, ...otherLines] = lines;

  let previousLineNodes: XmlNode[] = exportLine(firstLine);

  for (const line of otherLines) {
    // TODO: check level?
    // const statusLevel = line.getStatus().getLevel();

    const currentLineNodes = line.exportXml()
      // filter out "illegal nodes"
      .filter((node) => !isXmlElementNode(node) || !tagNamesToFilter.includes(node.tagName));

    if (line.isPartPreviousLine() && currentLineNodes.length >= 2) {
      const lastWFromPrevious = previousLineNodes.pop() as XmlElementNode<'w'>;
      const [lb, firstW, ...rest] = currentLineNodes;

      lastWFromPrevious.children.push(lb, ...(firstW as XmlElementNode).children);

      nodes.push(...previousLineNodes, lastWFromPrevious);
      previousLineNodes = rest;
    } else {
      nodes.push(...previousLineNodes);
      previousLineNodes = currentLineNodes;
    }
  }

  // push nodes of last line...
  nodes.push(...previousLineNodes);

  return nodes;
}

export function exportXmlFromParser(parser: TLHParser, xmlCreationValues: XmlCreationValues, expand = false): string {
  return writeXml(
    createCompleteDocument(exportXmlNodesFromParser(parser), xmlCreationValues),
    expand
  );
}