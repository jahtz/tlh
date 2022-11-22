import {DamageContent, isDamageContent, xmlifyDamageContent} from './damages';
import {aoBasicText, BasicText, isBasicText} from './basicText';
import {AOCorr, convertAoCorrToXmlStrings, isCorrectionContent} from './corrections';
import {InscribedLetter, isInscribedLetter} from './inscribedLetter';
import {IndexDigit} from './indexDigit';

export type UpperMultiStringContent = AOCorr | DamageContent | InscribedLetter | BasicText | IndexDigit;

// FIXME: index digit!
export type ForeignCharacter = UpperMultiStringContent[];

export function clearUpperMultiStringContent(c: UpperMultiStringContent | string): UpperMultiStringContent {
  return typeof c === 'string' ? aoBasicText(c) : c;
}

/**
 * @deprecated
 * @param c
 */
export function writeMultiWordContent(c: UpperMultiStringContent): string[] {
  if (isCorrectionContent(c)) {
    return convertAoCorrToXmlStrings(c);
  } else if (isDamageContent(c)) {
    return xmlifyDamageContent(c);
  } else if (isInscribedLetter(c)) {
    return ['x'];
  } else if (isBasicText(c)) {
    return [c.content];
  } else {
    return [c.content.toString()];
  }
}