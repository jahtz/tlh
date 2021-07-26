import {damageContent, DamageContent} from '../model/wordContent/damages';
import {AOCorr, aoCorr} from '../model/wordContent/corrections';

export const de: DamageContent = damageContent('del_fin');
export const ds: DamageContent = damageContent('del_in');
export const le: DamageContent = damageContent('laes_fin');
export const ls: DamageContent = damageContent('laes_in');
export const rs: DamageContent = damageContent('ras_in');
export const re: DamageContent = damageContent('ras_fin');
export const supE: DamageContent = damageContent('del_in' /* DamageType.SupplementEnd*/);
export const supS: DamageContent = damageContent('del_in' /* DamageType.SupplementStart*/);
export const ue: DamageContent = damageContent('del_in' /* DamageType.UnknownDamageEnd*/);
export const us: DamageContent = damageContent('del_in' /* DamageType.UnknownDamageStart*/);


export const uc: AOCorr = aoCorr('?');
export const sc: AOCorr = aoCorr('!');
