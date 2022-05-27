import {AOWordContent} from './wordContent';
import {XmlWriter} from '../../xmlModel/xmlWriting';

export interface AOSpace {
  type: 'AOSpace';
  c: string;
}

export const aoSpaceFormat: XmlWriter<AOSpace> = ({c}) => [`<space c="${c}"/>`];

export function aoSpace(c: string): AOSpace {
  return {type: 'AOSpace', c};
}

export function isSpace(c: AOWordContent): c is AOSpace {
  return c.type === 'AOSpace';
}