import {testParser} from './parserBasics';
import {basicText} from './basicTextParser';

describe('basicText', () => {
  testParser<string>('basicText', basicText, [
    {source: 'pa-iz-zi', awaitedResult: 'pa-iz-zi'}
    // FIXME: add cases...
  ]);
});