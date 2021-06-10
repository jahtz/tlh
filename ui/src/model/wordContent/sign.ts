import {XmlFormat} from '../../editor/xmlLib';
import {AOWordContent} from './wordContent';
import {success} from '../../functional/result';

export interface AOSign {
  type: 'AOSign'
  content: string;
}

export const aoSignFormat: XmlFormat<AOSign> = {
  read: (el) => success(aoSign(el.textContent || '')),
  write: ({content}) => [`<AO:Sign>${content}</AO:Sign>`]
};

export function aoSign(content: string): AOSign {
  return {type: 'AOSign', content};
}

export function isAoSign(w: AOWordContent): w is AOSign {
  return w.type === 'AOSign';
}
