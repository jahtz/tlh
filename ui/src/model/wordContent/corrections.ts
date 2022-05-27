import {AOWordContent} from './wordContent';
import {XmlWriter} from '../../xmlModel/xmlWriting';

export interface AOCorr {
  type: 'AOCorr',
  c: string;
}

export const aoCorrFormat: XmlWriter<AOCorr> = ({c}) => [`<corr c="${c}"/>`];

export function aoCorr(c: string): AOCorr {
  return {type: 'AOCorr', c};
}

export function isCorrectionContent(c: AOWordContent): c is AOCorr {
  return c.type === 'AOCorr';
}