import {XmlFormat} from '../../editor/xmlLib';
import {AOWordContent} from './wordContent';
import {flattenResults, transformResult} from '../../functional/result';
import {clearUpperMultiStringContent, readMultiWordContent, UpperMultiStringContent, writeMultiWordContent} from './multiStringContent';

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
  read: (el) => transformResult(
    flattenResults(Array.from(el.childNodes).map(readMultiWordContent)),
    (content) => numeralContent(...content),
    (errors) => errors.flat()
  ),
  write: ({content}) => [`<num>${content.flatMap(writeMultiWordContent).join('')}</num>`]
};

export function isNumeralContent(c: AOWordContent): c is AONumeralContent {
  return c.type === 'AONumeralContent';
}