// Akadogramm: automatisch für Zeichen in VERSALIEN, denen ein `-` oder `_` vorausgeht

import {AOWordContent} from "./wordContent";
import {XmlFormat} from "../../editor/xmlLib";
import {flattenResults, transformResult} from "../../functional/result";
import {clearUpperMultiStringContent, readMultiWordContent, UpperMultiStringContent, writeMultiWordContent} from "./multiStringContent";

export interface AOAkkadogramm {
  type: 'AOAkkadogramm';
  contents: UpperMultiStringContent[];
}

export function akkadogramm(...contents: (UpperMultiStringContent | string)[]): AOAkkadogramm {
  return {type: 'AOAkkadogramm', contents: contents.map(clearUpperMultiStringContent)};
}

export const akkadogrammFormat: XmlFormat<AOAkkadogramm> = {
  read: (el) => transformResult(
    flattenResults(Array.from(el.childNodes).map(readMultiWordContent)),
    (content) => akkadogramm(...content),
    (errors) => errors.flat()
  ),
  write: ({contents}) => [`<aGr>${contents.flatMap(writeMultiWordContent).join('')}</aGr>`]
}

export function isAkkadogramm(c: AOWordContent): c is AOAkkadogramm {
  return c.type === 'AOAkkadogramm';
}
