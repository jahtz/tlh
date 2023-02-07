import {wordParser} from './wordParser';
import {parsedWord as w} from '../transliterationParser/wordParser';
import {akkadogramm as aGr} from './akkadogrammParser';
import {sumerogramm as sGr} from './sumerogrammParser';
import {determinativ as d} from './determinativeParser';
import {XmlElementNode} from '../xmlModel/xmlModel';
import {testParser} from './parserBasics';

export interface SuccessfulTestData<T> {
  source: string;
  awaitedResult: T;
}

type Word = XmlElementNode<'w'>;

// FIXME: enable!
describe('word', () => testParser<Word>('word', wordParser, [
  // Basic
  {source: 'pár-ši-ia', awaitedResult: w('pár-ši-ia')},
  {source: 'me-ma-i', awaitedResult: w('me-ma-i')},
  {source: 'kat+ta', awaitedResult: w('kat+ta')},

  // SumerogrammParser
  {source: 'NINDA', awaitedResult: w(sGr('NINDA'))},
  {source: 'LUGAL', awaitedResult: w(sGr('LUGAL'))},
  {source: 'LUGAL-uš', awaitedResult: w(sGr('LUGAL'), '-uš')},
  {source: 'NINDA.GUR4.RA', awaitedResult: w(sGr('NINDA.GUR₄.RA'))},
  {source: 'GIŠ.°D°INANNA', awaitedResult: w(sGr('GIŠ.'), d('D'), sGr('INANNA'))},
  {source: 'GIŠ.°D°INANNA', awaitedResult: w(sGr('GIŠ.'), d('D'), sGr('INANNA'))},
  {source: 'DUMU°MEŠ°.É.GAL', awaitedResult: w(sGr('DUMU'), d('MEŠ'), sGr('.É.GAL'))},

  // SumerogrammParser im Wortinneren
  {source: '°m°mur-ši--DINGIR-LIM', awaitedResult: w(d('m'), 'mur-ši-', sGr('DINGIR'), aGr('-LIM'))},

  // Akkadogramm
  {source: '_ŠI-PÁT', awaitedResult: w(aGr('ŠI-PÁT'))},
  {source: '_A-NA', awaitedResult: w(aGr('A-NA'))},
  {source: '_A+NA', awaitedResult: w(aGr('A+NA'))},

  // Akkadische Präposition
  // FIXME: prepending a preposition with '~' is not yet supported...
  // {source: '_A-NA~É.GAL', awaitedResult: w(aGr('A-NA'), ' ', sGr('É.GAL'))},
  // {source: '_I-NA~°GIŠ°MA.ṢÁ.AB', awaitedResult: w(aGr('IŠ-TU'), ' ', d('GIŠ'), sGr('MA.SÁ.AB'))},

  // Determinativ
  {source: '°MUNUS°', awaitedResult: w(d('MUNUS'))},
  {source: '°MUNUS°ŠU.GI', awaitedResult: w(d('MUNUS'), sGr('ŠU.GI'))},
  {source: 'DINGIR°MEŠ°', awaitedResult: w(sGr('DINGIR'), d('MEŠ'))},
  {source: 'DINGIR°MEŠ°-aš', awaitedResult: w(sGr('DINGIR'), d('MEŠ'), '-aš')},
  {source: '°m°ḫa-at-tu-ši-li', awaitedResult: w(d('m'), 'ḫa-at-tu-ši-li')},
  {source: '°NA4°ḫu-wa-ši-ia', awaitedResult: w(d('NA₄'), 'ḫu-wa-ši-ia')},
  {source: '°LÚ.MEŠ°MUḪALDIM', awaitedResult: w(d('LÚ.MEŠ'), sGr('MUḪALDIM'))},
  {source: '°m.D°IŠKUR-šar-ru-um-ma', awaitedResult: w(d('m.D'), sGr('IŠKUR'), '-šar-ru-um-ma')},

  // Eingeschrieben Zeichen
  {source: 'KAxU', awaitedResult: w(sGr('KA×U'))},
  {source: 'KA×U', awaitedResult: w(sGr('KA×U'))},
]));