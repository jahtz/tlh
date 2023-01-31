import {alt, Parser, string} from 'parsimmon';
import {xmlElementNode, XmlElementNode} from '../xmlModel/xmlModel';


export const paragraphSeparatorXmlNode: XmlElementNode<'parsep'> = xmlElementNode('parsep');

export const paragraphSeparatorDoubleXmlNode: XmlElementNode<'parsep_dbl'> = xmlElementNode('parsep_dbl');

export type ParagraphSeparatorNode = XmlElementNode<'parsep'> | XmlElementNode<'parsep_dbl'>;


export const paragraphSeparatorParser: Parser<ParagraphSeparatorNode> = alt(
  alt(string('§§'), string('===')).result(paragraphSeparatorDoubleXmlNode),
  alt(string('§').notFollowedBy(string('§')), string('¬¬¬')).result(paragraphSeparatorXmlNode),
);