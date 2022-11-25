import {AOWord, convertAoWord2XmlStrings} from './word';
import {LineBreakData} from '../../xmlEditor/elementEditors/lineBreakData';
import {xmlElementNode, XmlElementNode} from '../../xmlModel/xmlModel';


export const paragraphSeparatorXmlNode: XmlElementNode = xmlElementNode('parsep');

export const paragraphSeparatorDoubleXmlNode: XmlElementNode = xmlElementNode('parsep_dbl');


export interface AOLineBreak {
  type: 'AOLineBreak';
  lb: LineBreakData;
  // => <w/>[]
  words: AOWord[];
  // => <parsep/> or <parsep_dbl/>
  maybeParagraphSeparator: XmlElementNode | undefined;
}

export function convertAoLineBreakToXmlString({lb: {textId, lnr, lg}, words}: AOLineBreak): string[] {
  return [
    `<lb lg="${lg}" lnr="${lnr}" txtid="${textId}"/>`,
    ...words.flatMap((w) => convertAoWord2XmlStrings(w))
  ];
}
