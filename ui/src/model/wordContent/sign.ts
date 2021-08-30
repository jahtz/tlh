import {XmlWriter} from '../../editor/xmlModel/xmlWriting';
import {AOWordContent} from './wordContent';

export interface AOSign {
  type: 'AOSign'
  content: string;
}

export const aoSignFormat: XmlWriter<AOSign> = {
  write: ({content}) => [`<AO:Sign>${content}</AO:Sign>`]
};

export function aoSign(content: string): AOSign {
  return {type: 'AOSign', content};
}

export function isAoSign(w: AOWordContent): w is AOSign {
  return w.type === 'AOSign';
}
