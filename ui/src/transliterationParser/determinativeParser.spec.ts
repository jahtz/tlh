import {determinativ as det, determinativeParser} from './determinativeParser';
import {testParser} from './parserBasics';

describe('determinativeParser', () => testParser('determinative', determinativeParser, [
  {source: '°MUNUS°', awaitedResult: det('MUNUS')},
  {source: '°MEŠ°', awaitedResult: det('MEŠ')},
  {source: '°NA4°', awaitedResult: det('NA₄')},
  {source: '°LÚ.MEŠ°', awaitedResult: det('LÚ.MEŠ')},

  // Special cases
  {source: '°m°', awaitedResult: det('m')},
  {source: '°f°', awaitedResult: det('f')},
  {source: '°m.D°', awaitedResult: det('m.D')},
  {source: '°f.D°', awaitedResult: det('f.D')},
]));