import {failure, Result, success} from '../../functional/result';
import {DamageContent, damageContent, DamageType, isDamageContent, xmlifyDamageContent} from './damages';
import {aoBasicText, BasicText, isBasicText} from './basicText';
import {AOCorr, aoCorrFormat, isCorrectionContent} from './corrections';
import {InscribedLetter, inscribedLetterFormat, isInscribedLetter} from './inscribedLetter';
import {IndexDigit} from './indexDigit';
import {xmlLoadError, XmlLoadError} from '../../editor/xmlLib';

export type UpperMultiStringContent = AOCorr | DamageContent | InscribedLetter | BasicText | IndexDigit;

// FIXME: index digit!
export type ForeignCharacter = UpperMultiStringContent[];

export function clearUpperMultiStringContent(c: UpperMultiStringContent | string): UpperMultiStringContent {
  return typeof c === 'string' ? aoBasicText(c) : c;
}

/**
 * @deprecated
 * @param el
 */
export function readMultiWordContent(el: ChildNode): Result<UpperMultiStringContent, XmlLoadError[]> {
  if (el instanceof Element) {
    switch (el.tagName) {
    case 'del_in':
      return success(damageContent(DamageType.DeletionStart));
    case 'del_fin':
      return success(damageContent(DamageType.DeletionEnd));
    case 'ras_in':
      return success(damageContent(DamageType.RasureStart));
    case 'ras_fin':
      return success(damageContent(DamageType.RasureEnd));
    case 'laes_in':
      return success(damageContent(DamageType.LesionStart));
    case 'laes_fin':
      return success(damageContent(DamageType.LesionEnd));
    default:
      return failure([xmlLoadError(`Illegal tag name found: ${el.tagName}`, [el.tagName])]);
    }
  } else if (el instanceof Text) {
    return success(aoBasicText(el.textContent || ''));
  } else {
    return failure([xmlLoadError(`Illegal tag found: ${el.nodeType}`, [])]);
  }
}

/**
 * @deprecated
 * @param c
 */
export function writeMultiWordContent(c: UpperMultiStringContent): string[] {
  if (isCorrectionContent(c)) {
    return aoCorrFormat.write(c);
  } else if (isDamageContent(c)) {
    return xmlifyDamageContent(c);
  } else if (isInscribedLetter(c)) {
    return inscribedLetterFormat.write(c);
  } else if (isBasicText(c)) {
    return [c.content];
  } else {
    return [c.content.toString()];
  }
}