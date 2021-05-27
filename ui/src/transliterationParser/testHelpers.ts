import {damageContent, DamageContent, DamageType} from "../model/wordContent/damages";
import {AOCorr, aoCorr} from "../model/wordContent/corrections";

export const de: DamageContent = damageContent(DamageType.DeletionEnd);
export const ds: DamageContent = damageContent(DamageType.DeletionStart);
export const le: DamageContent = damageContent(DamageType.LesionEnd);
export const ls: DamageContent = damageContent(DamageType.LesionStart);
export const supE: DamageContent = damageContent(DamageType.SupplementEnd);
export const supS: DamageContent = damageContent(DamageType.SupplementStart);
export const ue: DamageContent = damageContent(DamageType.UnknownDamageEnd);
export const us: DamageContent = damageContent(DamageType.UnknownDamageStart);
export const rs: DamageContent = damageContent(DamageType.RasureStart);
export const re: DamageContent = damageContent(DamageType.RasureEnd);

export const uc: AOCorr = aoCorr('?');
export const sc: AOCorr = aoCorr('!');
