import {emptyNode, XmlElementNode} from '../xmlModel/xmlModel';

export interface ParagraphSeparator {
  type: 'ParagraphSeparator';
  double: boolean;
}

export const paragraphSeparator: ParagraphSeparator = {
  type: 'ParagraphSeparator',
  double: false
};

export const paragraphSeparatorDouble: ParagraphSeparator = {
  type: 'ParagraphSeparator',
  double: true
};

export const paragraphSeparatorXmlNode: XmlElementNode = emptyNode('parsep');

export const paragraphSeparatorDoubleXmlNode: XmlElementNode = emptyNode('parsep_dbl');