import {XmlWriter} from '../../xmlEditor/xmlModel/xmlWriting';
import {AOWordContent} from './wordContent';

/**
 * Mater lectionis:
 * vor und nach der Mater Lectionis (Kleinbuchstaben markiert durch ° … °; davor oder dahinter jeweils ein Spatium oder Bindestrich)
 */
export interface AOMaterLectionis {
  type: 'AOMaterLectionis';
  content: string;
}

export function materLectionis(content: string): AOMaterLectionis {
  return {type: 'AOMaterLectionis', content};
}

export const materLectionisFormat: XmlWriter<AOMaterLectionis> = {
  write: ({content}) => [`<SP___AO_3a_MaterLect>${content}</SP___AO_3a_MaterLect>`]
};

export function isMaterLectionis(c: AOWordContent): c is AOMaterLectionis {
  return c.type === 'AOMaterLectionis';
}
