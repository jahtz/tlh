import {testParser} from './parserBasics';
import {determinativ as det, Determinative} from './determinativeParser';
import {MaterLectionis, materLectionis, materLectionisParser} from './materLectionisParser';

describe('materLectionisParser', () => testParser<Determinative | MaterLectionis>('materLectionisParser', materLectionisParser, [
  {source: '°at°', awaitedResult: materLectionis('at')},

  // special cases: °f° and °m° are determinatives!
  {source: '°f°', awaitedResult: det('f')},
  {source: '°m°', awaitedResult: det('m')},
]));