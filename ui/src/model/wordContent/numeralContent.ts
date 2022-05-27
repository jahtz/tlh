import {AOWordContent} from './wordContent';
import {clearUpperMultiStringContent, UpperMultiStringContent, writeMultiWordContent} from './multiStringContent';
import {XmlWriter} from '../../xmlModel/xmlWriting';

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

export const numeralContentFormat: XmlWriter<AONumeralContent> = ({content}) => [`<num>${content.flatMap(writeMultiWordContent).join('')}</num>`];

export function isNumeralContent(c: AOWordContent): c is AONumeralContent {
  return c.type === 'AONumeralContent';
}