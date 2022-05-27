import {XmlWriter} from '../../xmlEditor/xmlModel/xmlWriting';
import {AOWordContent} from './wordContent';

export interface AOCorr {
  type: 'AOCorr',
  c: string;
}

export const aoCorrFormat: XmlWriter<AOCorr> = {
  write: ({c}) => [`<corr c="${c}"/>`]
};

export function aoCorr(c: string): AOCorr {
  return {type: 'AOCorr', c};
}

export function isCorrectionContent(c: AOWordContent): c is AOCorr {
  return c.type === 'AOCorr';
}