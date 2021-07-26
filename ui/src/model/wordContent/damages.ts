import {AOWordContent} from './wordContent';

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

export function xmlifyDamageContent({damageType}: DamageContent): string[] {
  return [`<${damageType}/>`];
}

export type DamageType = 'del_in' | 'del_fin' | 'laes_in' | 'laes_fin' | 'ras_in' | 'ras_fin';

export function getSymbolForDamageType(damageType: DamageType): string {
  switch (damageType) {
  case 'del_in':
    return '[';
  case 'del_fin':
    return ']';
  case 'laes_in':
    return '⸢';
  case 'laes_fin':
    return '⸣';
  case 'ras_in':
  case  'ras_fin':
    return '*';
  }
}

