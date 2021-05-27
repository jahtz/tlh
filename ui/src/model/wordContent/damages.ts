import {XmlFormat} from "../../editor/xmlLib";
import {AOWordContent} from "./wordContent";
import {success} from "../../functional/result";

export interface DamageContent {
  type: 'Damage';
  damageType: DamageType;
}

export function damageContent(damageType: DamageType): DamageContent {
  return {type: 'Damage', damageType};
}

export function isDamageContent(c: AOWordContent): c is DamageContent {
  return c.type === 'Damage';
}

/*
// FIXME: implement!
const damageContentFormat: XmlFormat<DamageContent> = {
  read: (el) => damageContent(null),
  write: ({damageType}) => ['']
}
 */

export function xmlifyDamageContent({damageType}: DamageContent): string[] {
  return [xmlifyDamage(damageType)];
}

export enum DamageType {
  DeletionStart = 'DeletionStart',
  DeletionEnd = 'DeletionEnd',
  LesionStart = 'LesionStart',
  LesionEnd = 'LesionEnd',
  RasureStart = 'RasureStart',
  RasureEnd = 'RasureEnd',
  // TODO: not defined in dtd?
  SurplusStart = 'SurplusStart',
  SurplusEnd = 'SurplusEnd',
  SupplementStart = 'SupplementStart',
  SupplementEnd = 'SupplementEnd',
  UnknownDamageStart = 'UnknownDamageStart',
  UnknownDamageEnd = 'UnknownDamageEnd'
}

export const deletionStartFormat: XmlFormat<DamageType.DeletionStart> = {
  read: () => success(DamageType.DeletionStart),
  write: () => ['<del_in/>']
};

export const deletionEndFormat: XmlFormat<DamageType.DeletionEnd> = {
  read: () => success(DamageType.DeletionEnd),
  write: () => ['<del_fin/>']
};

export const rasureStartFormat: XmlFormat<DamageType.RasureStart> = {
  read: () => success(DamageType.RasureStart),
  write: () => ['<ras_in/>']
};

export const rasureEndFormat: XmlFormat<DamageType.RasureEnd> = {
  read: () => success(DamageType.RasureEnd),
  write: () => ['<ras_fin/>']
};

export const lesionStartFormat: XmlFormat<DamageType.LesionStart> = {
  read: () => success(DamageType.LesionStart),
  write: () => ['<laes_in/>']
};

export const lesionEndFormat: XmlFormat<DamageType.LesionEnd> = {
  read: () => success(DamageType.LesionEnd),
  write: () => ['<laes_fin/>']
};

function xmlifyDamage(damageType: DamageType): string {
  switch (damageType) {
    case DamageType.DeletionEnd:
      return '<del_fin/>';
    case DamageType.DeletionStart:
      return '<del_in/>';
    case DamageType.LesionEnd:
      return '<laes_fin/>';
    case DamageType.LesionStart:
      return '<laes_in/>';
    case DamageType.RasureEnd:
      return '<ras_fin/>';
    case DamageType.RasureStart:
      return '<ras_in/>';
    case DamageType.SupplementEnd:
      return '<sup_fin/>';
    case DamageType.SupplementStart:
      return '<sup_in/>';
    case DamageType.SurplusEnd:
      return '<sur_fin/>';
    case DamageType.SurplusStart:
      return '<sur_in/>';
    case DamageType.UnknownDamageEnd:
      return '<ub_fin/>';
    case DamageType.UnknownDamageStart:
      return '<ub_in/>';
  }
}

export function getSymbolForDamageType(damageType: DamageType): string {
  switch (damageType) {
    case DamageType.DeletionEnd:
      return ']';
    case DamageType.DeletionStart:
      return '[';
    case DamageType.LesionEnd:
      return '⸣';
    case DamageType.LesionStart:
      return '⸢';
    case DamageType.RasureStart:
    case  DamageType.RasureEnd:
      return '*';
    case DamageType.SupplementEnd:
      return '〉';
    case DamageType.SupplementStart:
      return '〈';
    case DamageType.SurplusEnd:
      return '〉〉';
    case DamageType.SurplusStart:
      return '〈〈';
    case DamageType.UnknownDamageEnd:
      return ')';
    case DamageType.UnknownDamageStart:
      return '(';
  }
}

