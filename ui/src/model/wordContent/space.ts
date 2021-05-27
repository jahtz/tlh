import {attributeReader, XmlFormat} from "../../editor/xmlLib";
import {AOWordContent} from "./wordContent";
import {success} from "../../functional/result";

export interface AOSpace {
  type: 'AOSpace';
  c: string;
}

export const aoSpaceFormat: XmlFormat<AOSpace> = {
  read: (el) => success(aoSpace(attributeReader(el, 'c', (v) => v || ''))),
  write: ({c}) => [`<space c="${c}"/>`]
}

export function aoSpace(c: string): AOSpace {
  return {type: 'AOSpace', c};
}

export function isSpace(c: AOWordContent): c is AOSpace {
  return c.type === 'AOSpace';
}