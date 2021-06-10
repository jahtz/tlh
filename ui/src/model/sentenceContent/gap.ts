import {readAttribute, XmlFormat} from '../../editor/xmlLib';
import {AOSentenceContent} from '../sentence';
import {success} from '../../functional/result';

export interface AOGap {
  type: 'gap';
  c: string;
  t?: string;
}

export const aoGapFormat: XmlFormat<AOGap> = {
  read: (el) => success(
    aoGap(
      readAttribute(el, 'c', (v) => v || ''),
      readAttribute(el, 't', (v) => v || undefined)
    )
  ),
  write: ({c, t}) => t ? [`<gap c="${c}" t="${t}"/>`] : [`<gap c="${c}"/>`]
};

export function aoGap(c: string, t?: string): AOGap {
  return {type: 'gap', c, t};
}

export function isAOGap(c: AOSentenceContent): c is AOGap {
  return c.type === 'gap';
}