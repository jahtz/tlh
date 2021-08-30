import {XmlWriter} from '../../editor/xmlModel/xmlWriting';
import {AOWordContent} from './wordContent';

export interface AOSpace {
  type: 'AOSpace';
  c: string;
}

export const aoSpaceFormat: XmlWriter<AOSpace> = {
  write: ({c}) => [`<space c="${c}"/>`]
};

export function aoSpace(c: string): AOSpace {
  return {type: 'AOSpace', c};
}

export function isSpace(c: AOWordContent): c is AOSpace {
  return c.type === 'AOSpace';
}