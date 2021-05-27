import {failableAttributeReader, XmlFormat} from "../../editor/xmlLib";
import {failure, success} from '../../functional/result';
import {AOWordContent} from "./wordContent";

export type AOCorrType = '(?)' | 'sic' | '!' | '?' | '!?';

export interface AOCorr {
  type: 'AOCorr',
  c: AOCorrType;
}

function isAoCorrType(v: string | null): v is AOCorrType {
  return !!v && (v === '(?)' || v === 'sic' || v === '!' || v === '?' || v === '!?');
}

export const aoCorrFormat: XmlFormat<AOCorr> = {
  read: (el) =>
    failableAttributeReader(el, 'c', (v) => isAoCorrType(v) ? success<AOCorrType, string[]>(v) : failure<AOCorrType, string[]>([`Value '${v}' is not allowed!`]))
      .map((corrType) => aoCorr(corrType)),
  write: ({c}) => [`<corr c="${c}"/>`]
}

export function aoCorr(c: AOCorrType): AOCorr {
  return {type: 'AOCorr', c};
}

export function isCorrectionContent(c: AOWordContent): c is AOCorr {
  return c.type === 'AOCorr';
}