import {xmlElementNode, XmlElementNode} from '../xmlModel/xmlModel';

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

export const paragraphSeparatorXmlNode: XmlElementNode = xmlElementNode('parsep');

export const paragraphSeparatorDoubleXmlNode: XmlElementNode = xmlElementNode('parsep_dbl');