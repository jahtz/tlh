import {XmlWriter} from '../../xmlEditor/transliterationEditor/xmlModel/xmlWriting';
import {AOWordContent} from './wordContent';
import {clearUpperMultiStringContent, UpperMultiStringContent, writeMultiWordContent} from './multiStringContent';

/*
 * Determinativ:
 * - automatisch für Großbuchstaben markiert durch ° … ° (davor oder dahinter jeweils ein Spatium oder Bindestrich)
 * - auch °m°, °m.[...]°, °f° und °f.[...]° sind Determinative!
 */
export interface AODeterminativ {
  type: 'AODeterminativ';
  content: UpperMultiStringContent[];
}

export function determinativ(...content: (UpperMultiStringContent | string)[]): AODeterminativ {
  return {type: 'AODeterminativ', content: content.map(clearUpperMultiStringContent)};
}

export const determinativFormat: XmlWriter<AODeterminativ> = {
  write: ({content}) => [`<d>${content.flatMap(writeMultiWordContent).join('')}</d>`]
};

export function isDeterminativ(c: AOWordContent): c is AODeterminativ {
  return c.type === 'AODeterminativ';
}
