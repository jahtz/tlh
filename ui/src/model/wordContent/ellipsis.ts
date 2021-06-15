import {AOWordContent} from './wordContent';
import {XmlWriter} from '../../editor/xmlModel';

export interface Ellipsis {
  type: 'AOEllipsis'
}

export const aoEllipsis: Ellipsis = {type: 'AOEllipsis'};

export function isEllipsis(c: AOWordContent): c is Ellipsis {
  return c.type === 'AOEllipsis';
}

export const ellipsisFormat: XmlWriter<Ellipsis> = {
  write: () => ['…']
};