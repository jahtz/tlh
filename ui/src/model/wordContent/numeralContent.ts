import {XmlWriter} from '../../xmlEditor/xmlModel/xmlWriting';
import {AOWordContent} from './wordContent';
import {clearUpperMultiStringContent, UpperMultiStringContent, writeMultiWordContent} from './multiStringContent';

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

export const numeralContentFormat: XmlWriter<AONumeralContent> = {
  write: ({content}) => [`<num>${content.flatMap(writeMultiWordContent).join('')}</num>`]
};

export function isNumeralContent(c: AOWordContent): c is AONumeralContent {
  return c.type === 'AONumeralContent';
}