import {AOWordContent} from './wordContent';
import {XmlWriter} from '../../xmlModel/xmlWriting';

export interface AOSign {
  type: 'AOSign';
  content: string;
}

export const aoSignFormat: XmlWriter<AOSign> = ({content}) => [`<AO:Sign>${content}</AO:Sign>`];

export function aoSign(content: string): AOSign {
  return {type: 'AOSign', content};
}

export function isAoSign(w: AOWordContent): w is AOSign {
  return w.type === 'AOSign';
}
