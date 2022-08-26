// Sumerogramm:
// - automatisch für Versalien
// - im Wortinnern durch vorausgehendes `--` markiert

import {AOWordContent} from './wordContent';
import {clearUpperMultiStringContent, UpperMultiStringContent, writeMultiWordContent} from './multiStringContent';
import {XmlWriter} from '../../xmlModel/xmlWriting';

export interface AOSumerogramm {
  type: 'AOSumerogramm';
  contents: UpperMultiStringContent[];
}

export function sumerogramm(...contents: (UpperMultiStringContent | string)[]): AOSumerogramm {
  return {type: 'AOSumerogramm', contents: contents.map(clearUpperMultiStringContent)};
}

export const sumerogrammFormat: XmlWriter<AOSumerogramm> = ({contents}) => [`<sGr>${contents.flatMap(writeMultiWordContent).join('')}</sGr>`];

export function isSumerogramm(c: AOWordContent): c is AOSumerogramm {
  return c.type === 'AOSumerogramm';
}