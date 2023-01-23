import {testParser} from './parserBasics';
import {Akkadogramm, akkadogramm as aGr, akkadogrammParser, Sumerogramm, sumerogramm as sGr, sumerogrammParser} from './foreignWordsParser';

// Akkadogramm

describe('akkadogrammParser', () => testParser<Akkadogramm>('akkadogramm', akkadogrammParser, [
  // Akkadogramm
  {source: '_ŠI-PÁT', awaitedResult: aGr('ŠI-PÁT')},
  {source: '_A-NA', awaitedResult: aGr('A-NA')},
  {source: '_A+NA', awaitedResult: aGr('A+NA')}
]));

// Sumerogramm

describe('sumerogrammParser', () => testParser<Sumerogramm>('sumerogramm', sumerogrammParser, [

  {source: 'NINDA', awaitedResult: sGr('NINDA')},
  {source: 'LUGAL', awaitedResult: sGr('LUGAL')},

  // GIŠ.°D°INANNA start with <sGr>GIŠ.</sGr> and continues with <det>D</det>!
  {source: 'GIŠ.', awaitedResult: sGr('GIŠ.')},

  {source: 'NINDA.GUR.RA', awaitedResult: sGr('NINDA.GUR.RA')},
  {source: 'NINDA.GUR4.RA', awaitedResult: sGr('NINDA.GUR₄.RA')},
  {source: 'NINDA.GUR.RA4', awaitedResult: sGr('NINDA.GUR.RA₄')},

  {source: 'INANNA', awaitedResult: sGr('INANNA')},

  // {source: 'DUMU°MEŠ°.É.GAL', awaitedResult: sGr('DUMU'), det('MEŠ'), sGr('.É.GAL'))},

  // Sumerogramm im Wortinneren
  // {source: '°m°mur-ši--DINGIR-LIM', awaitedResult: w(det('m'), 'mur-ši-', sGr('DINGIR'), aGr('-LIM'))},
]));