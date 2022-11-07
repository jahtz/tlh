import {damageContent, DamageContent} from '../model/wordContent/damages';
import {AOCorr, aoCorr} from '../model/wordContent/corrections';

export const del_fin: DamageContent = damageContent('del_fin');
export const del_in: DamageContent = damageContent('del_in');
export const laes_fin: DamageContent = damageContent('laes_fin');
export const laes_in: DamageContent = damageContent('laes_in');

export const rs: DamageContent = damageContent('ras_in');
export const re: DamageContent = damageContent('ras_fin');
export const supE: DamageContent = damageContent('del_in' /* DamageType.SupplementEnd*/);
export const supS: DamageContent = damageContent('del_in' /* DamageType.SupplementStart*/);
export const ue: DamageContent = damageContent('del_in' /* DamageType.UnknownDamageEnd*/);
export const us: DamageContent = damageContent('del_in' /* DamageType.UnknownDamageStart*/);


export const uc: AOCorr = aoCorr('?');
export const sc: AOCorr = aoCorr('!');
