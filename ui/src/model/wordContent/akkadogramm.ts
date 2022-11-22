// Akadogramm: automatisch für Zeichen in VERSALIEN, denen ein `-` oder `_` vorausgeht

import {AOWordContent} from './wordContent';
import {clearUpperMultiStringContent, UpperMultiStringContent, writeMultiWordContent} from './multiStringContent';

export interface AOAkkadogramm {
  type: 'AOAkkadogramm';
  contents: UpperMultiStringContent[];
}

export function akkadogramm(...contents: (UpperMultiStringContent | string)[]): AOAkkadogramm {
  return {type: 'AOAkkadogramm', contents: contents.map(clearUpperMultiStringContent)};
}

export function convertAoAkkadogrammToXmlStrings({contents}: AOAkkadogramm): string[] {
  return [`<aGr>${contents.flatMap(writeMultiWordContent).join('')}</aGr>`];
}

export function isAkkadogramm(c: AOWordContent): c is AOAkkadogramm {
  return c.type === 'AOAkkadogramm';
}
