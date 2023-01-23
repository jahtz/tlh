import {wordParser} from './wordParser';
import {parsedWord as w} from '../model/sentenceContent/linebreak';
import {akkadogramm as aGr, sumerogramm as sGr} from './foreignWordsParser';
import {determinativ as det} from './determinativeParser';
import {XmlElementNode} from '../xmlModel/xmlModel';
import {testParser} from './parserBasics';

export interface SuccessfulTestData<T> {
  source: string;
  awaitedResult: T;
}

type Word = XmlElementNode<'w'>;

describe.skip('word', () => testParser<Word>('word', wordParser, [
  // Basic
  {source: 'pár-ši-ia', awaitedResult: w('pár-ši-ia')},
  {source: 'me-ma-i', awaitedResult: w('me-ma-i')},
  {source: 'kat+ta', awaitedResult: w('kat+ta')},

  // Sumerogramm
  {source: 'NINDA', awaitedResult: w(sGr('NINDA'))},
  {source: 'LUGAL', awaitedResult: w(sGr('LUGAL'))},
  {source: 'LUGAL-uš', awaitedResult: w(sGr('LUGAL'), '-uš')},
  {source: 'NINDA.GUR4.RA', awaitedResult: w(sGr('NINDA.GUR4.RA'))},
  {source: 'GIŠ.°D°INANNA', awaitedResult: w(sGr('GIŠ.'), det('D'), sGr('INANNA'))},
  {source: 'DUMU°MEŠ°.É.GAL', awaitedResult: w(sGr('DUMU'), det('MEŠ'), sGr('.É.GAL'))},

  // Sumerogramm im Wortinneren
  {source: '°m°mur-ši--DINGIR-LIM', awaitedResult: w(det('m'), 'mur-ši-', sGr('DINGIR'), aGr('-LIM'))},

  // Akkadogramm
  {source: '_ŠI-PÁT', awaitedResult: w(aGr('ŠI-PÁT'))},
  {source: '_A-NA', awaitedResult: w('A-NA')},
  {source: '_A+NA', awaitedResult: w(aGr('A+NA'))},

  // Akkadische Präposition
  {source: '_A-NA~É.GAL', awaitedResult: w(aGr('A-NA'), ' ', sGr('É.GAL'))},
  {source: '_I-NA~°GIŠ°MA.ṢÁ.AB', awaitedResult: w(aGr('IŠ-TU'), ' ', det('GIŠ'), sGr('MA.SÁ.AB'))},

  // Determinativ
  {source: '°MUNUS°', awaitedResult: w(det('MUNUS'))},
  {source: '°MUNUS°ŠU.GI', awaitedResult: w(det('MUNUS'), sGr('ŠU.GI'))},
  {source: 'DINGIR°MEŠ°-aš', awaitedResult: w(sGr('DINGIR'), det('MEŠ'), '-aš')},
  {source: '°m°ḫa-at-tu-ši-li', awaitedResult: w(det('m'), 'ḫa-at-tu-ši-li')},
  {source: '°NA4°ḫu-wa-ši-ia', awaitedResult: w(det('NA₄'), 'ḫu-wa-ši-ia')},
  {source: '°LÚ.MEŠ°MUḪALDIM', awaitedResult: w(det('LÚ.MEŠ'), sGr('MUḪALDIM'))},
  {source: '°m.D°IŠKUR-šar-ru-um-ma', awaitedResult: w(det('m.D'), sGr('IŠKUR'), '-šar-ru-um-ma')},

  // Eingeschrieben Zeichen
  {source: 'KAxU', awaitedResult: w(sGr('KA×U'))},
  {source: 'KA×U', awaitedResult: w(sGr('KA×U'))},
]));