import {AOWordContent} from './wordContent';
import {XmlFormat} from '../../editor/xmlLib';
import {success} from '../../functional/result';

export interface Ellipsis {
  type: 'AOEllipsis'
}

export const aoEllipsis: Ellipsis = {type: 'AOEllipsis'};

export function isEllipsis(c: AOWordContent): c is Ellipsis {
  return c.type === 'AOEllipsis';
}

export const ellipsisFormat: XmlFormat<Ellipsis> = {
  read: () => success(aoEllipsis),
  write: () => ['…']
};