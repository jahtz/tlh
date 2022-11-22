import {AOWord, convertAoWord2XmlStrings} from './word';
import {ParagraphSeparator} from '../paragraphSeparator';
import {LineBreakData} from '../../xmlEditor/elementEditors/lineBreakData';

export interface AOLineBreak {
  type: 'AOLineBreak';
  lb: LineBreakData;
  // => <w/>[]
  words: AOWord[];
  // => <parsep/> or <parsep_dbl/>
  maybeParagraphSeparator: ParagraphSeparator | undefined;
}

export function convertAoLineBreakToXmlString({lb: {textId, lnr, lg}, words}: AOLineBreak): string[] {
  return [
    `<lb lg="${lg}" lnr="${lnr}" txtid="${textId}"/>`,
    ...words.flatMap((w) => convertAoWord2XmlStrings(w))
  ];
}
