import {aoCorr, correctionParser} from './correctionParser';
import {testParser} from './parserBasics';

describe('correctionParser', () => testParser('correction', correctionParser, [
  {source: '?', awaitedResult: aoCorr('?')},
  {source: '(?)', awaitedResult: aoCorr('(?)')},
  {source: '!?', awaitedResult: aoCorr('!?')},
  {source: '!', awaitedResult: aoCorr('!')},
  {source: 'sic', awaitedResult: aoCorr('sic')}
]));