import {ellipsisParser} from './ellipsisParser';
import {testParser} from './parserBasics';

describe('ellipsisParser', () => testParser('ellipsisParser', ellipsisParser, [
  {source: '...', awaitedResult: '…'},
  {source: '…', awaitedResult: '…'}
]));