import {aoEllipsis, ellipsisParser} from './ellipsisParser';
import {testParser} from './parserBasics';

describe('ellipsisParser', () => testParser('ellipsisParser', ellipsisParser, [
  {source: '...', awaitedResult: aoEllipsis},
  {source: '…', awaitedResult: aoEllipsis}
]));