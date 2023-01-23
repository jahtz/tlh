import {damageParser, DamageType, del_fin, del_in, laes_fin, laes_in} from './damageParser';
import {testParser} from './parserBasics';

describe('damageParser', () => testParser<DamageType>('damageParser', damageParser, [
  {source: '[', awaitedResult: del_in},
  {source: ']', awaitedResult: del_fin},
  {source: '⸢', awaitedResult: laes_in},
  {source: '⸣', awaitedResult: laes_fin}
]));