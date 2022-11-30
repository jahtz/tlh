import {xmlElementNode, XmlElementNode, XmlNonEmptyNode, xmlTextNode} from '../../xmlModel/xmlModel';
import {writeNode} from '../../xmlModel/xmlWriting';

export interface LineBreakData {
  textId: string;
  lnr: string;
  lg: string | undefined;
}


export function parsedWord(...content: (XmlNonEmptyNode | string)[]): XmlElementNode<'w'> {
  return xmlElementNode('w', {}, content.map((c) => typeof c === 'string' ? xmlTextNode(c) : c));
}


export const paragraphSeparatorXmlNode: XmlElementNode<'parsep'> = xmlElementNode('parsep');

export const paragraphSeparatorDoubleXmlNode: XmlElementNode<'parsep_dbl'> = xmlElementNode('parsep_dbl');

export type ParagraphSeparatorNode = XmlElementNode<'parsep'> | XmlElementNode<'parsep_dbl'>;


export interface AOLineBreak {
  type: 'AOLineBreak';
  // => <lb/>
  lb: LineBreakData;
  words: XmlElementNode<'w'>[];
  maybeParagraphSeparator: ParagraphSeparatorNode | undefined;
}

export function convertAoLineBreakToXmlString({lb: {textId, lnr, lg}, words, maybeParagraphSeparator}: AOLineBreak): string[] {
  return [
    `<lb lg="${lg}" lnr="${lnr}" txtid="${textId}"/>`,
    ...words.flatMap((w) => writeNode(w)),
    ...(maybeParagraphSeparator ? writeNode(maybeParagraphSeparator) : [])
  ];
}
