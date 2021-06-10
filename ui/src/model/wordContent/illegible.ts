import {AOWordContent} from './wordContent';

export interface AOIllegibleContent {
  type: 'IllegibleContent'
}

export const aoIllegibleContent: AOIllegibleContent = {type: 'IllegibleContent'};

export function isIllegibleContent(c: AOWordContent): c is AOIllegibleContent {
  return c.type === 'IllegibleContent';
}

