import {AOWordContent} from './wordContent';

export interface AOEllipsis {
  type: 'AOEllipsis';
}

export const aoEllipsis: AOEllipsis = {type: 'AOEllipsis'};

export function isEllipsis(c: AOWordContent): c is AOEllipsis {
  return c.type === 'AOEllipsis';
}