import {testParser} from './parserBasics';
import {determinativ, Determinative} from './determinativeParser';
import {MaterLectionis, materLectionis, materLectionisParser} from './materLectionisParser';

describe('materLectionisParser', () => testParser<Determinative | MaterLectionis>('materLectionisParser', materLectionisParser, [
  {source: '°at°', awaitedResult: materLectionis('at')},

  // special cases: °f° and °m° are determinatives!
  {source: '°f°', awaitedResult: determinativ('f')},
  {source: '°m°', awaitedResult: determinativ('m')},
]));