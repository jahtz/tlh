import {AOWordContent} from './wordContent';

export interface AOCorr {
  type: 'AOCorr',
  c: string;
}

export function convertAoCorrToXmlStrings({c}: AOCorr): string[] {
  return [`<corr c="${c}"/>`];
}

export function aoCorr(c: string): AOCorr {
  return {type: 'AOCorr', c};
}

export function isCorrectionContent(c: AOWordContent): c is AOCorr {
  return c.type === 'AOCorr';
}