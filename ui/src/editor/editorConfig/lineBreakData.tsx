import {XmlElementNode} from '../xmlModel/xmlModel';

export interface LineBreakData {
  textId: string;
  lineNumber: string;
  lg: string | undefined;
}

export function readLineBreakData(node: XmlElementNode): LineBreakData {
  return {
    textId: node.attributes.txtid,
    lineNumber: node.attributes.lnr,
    lg: node.attributes.lg
  };
}

export function writeLineBreakData({textId, lineNumber, lg}: LineBreakData, originalNode: XmlElementNode): XmlElementNode {
  return {
    ...originalNode,
    attributes: {
      ...originalNode.attributes,
      txtid: textId,
      lnr: lineNumber,
      lg: lg || ''
    }
  };
}