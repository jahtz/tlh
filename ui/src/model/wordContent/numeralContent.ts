import {XmlFormat} from "../../editor/xmlLib";
import {AOWordContent} from "./wordContent";
import {flattenResults} from "../../functional/result";
import {clearUpperMultiStringContent, readMultiWordContent, UpperMultiStringContent, writeMultiWordContent} from "./multiStringContent";

/*
 * Zahl
 */
export interface AONumeralContent {
  type: 'AONumeralContent';
  content: UpperMultiStringContent[];
}

export function numeralContent(...content: (UpperMultiStringContent | string)[]): AONumeralContent {
  return {type: 'AONumeralContent', content: content.map(clearUpperMultiStringContent)};
}

export const numeralContentFormat: XmlFormat<AONumeralContent> = {
  read: (el) => flattenResults(Array.from(el.childNodes).map(readMultiWordContent))
    .map((content) => numeralContent(...content)),
  write: ({content}) => [`<num>${content.flatMap(writeMultiWordContent).join('')}</num>`]
}

export function isNumeralContent(c: AOWordContent): c is AONumeralContent {
  return c.type === 'AONumeralContent';
}