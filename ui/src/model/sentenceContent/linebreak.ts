import {AOWord, convertAoWord2XmlStrings} from './word';
import {LineBreakData} from '../../xmlEditor/elementEditors/lineBreakData';
import {xmlElementNode, XmlElementNode} from '../../xmlModel/xmlModel';


export const paragraphSeparatorXmlNode: XmlElementNode<'parsep'> = xmlElementNode('parsep');

export const paragraphSeparatorDoubleXmlNode: XmlElementNode<'parsep_dbl'> = xmlElementNode('parsep_dbl');


export type ParagraphSeparatorNode = XmlElementNode<'parsep'> | XmlElementNode<'parsep_dbl'>;

export interface AOLineBreak {
  type: 'AOLineBreak';
  lb: LineBreakData;
  // => <w/>[]
  words: AOWord[];
  // => <parsep/> or <parsep_dbl/>
  maybeParagraphSeparator: ParagraphSeparatorNode | undefined;
}

export function convertAoLineBreakToXmlString({lb: {textId, lnr, lg}, words}: AOLineBreak): string[] {
  return [
    `<lb lg="${lg}" lnr="${lnr}" txtid="${textId}"/>`,
    ...words.flatMap((w) => convertAoWord2XmlStrings(w))
  ];
}
