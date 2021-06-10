import {XmlFormat} from '../../editor/xmlLib';
import {success} from '../../functional/result';
import {AOWordContent} from './wordContent';

export interface AOCorr {
  type: 'AOCorr',
  c: string;
}

export const aoCorrFormat: XmlFormat<AOCorr> = {
  read: (el) => success(aoCorr(el.getAttribute('c') || '')),
  write: ({c}) => [`<corr c="${c}"/>`]
};

export function aoCorr(c: string): AOCorr {
  return {type: 'AOCorr', c};
}

export function isCorrectionContent(c: AOWordContent): c is AOCorr {
  return c.type === 'AOCorr';
}