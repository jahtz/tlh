import {determinativ as d, determinativeParser} from './determinativeParser';
import {testParser} from './parserBasics';

describe('determinativeParser', () => testParser('determinative', determinativeParser, [
  {source: '°MUNUS°', awaitedResult: d('MUNUS')},
  {source: '°MEŠ°', awaitedResult: d('MEŠ')},
  {source: '°NA4°', awaitedResult: d('NA₄')},
  {source: '°LÚ.MEŠ°', awaitedResult: d('LÚ.MEŠ')},

  // Special cases
  {source: '°m°', awaitedResult: d('m')},
  {source: '°f°', awaitedResult: d('f')},
  {source: '°m.D°', awaitedResult: d('m.D')},
  {source: '°f.D°', awaitedResult: d('f.D')},
]));