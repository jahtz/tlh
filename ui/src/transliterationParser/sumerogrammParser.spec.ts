import {testParser} from './parserBasics';
import {firstSyllableSumerogrammParser, innerWordSumerogrammParser, sumerogramm as sGr, Sumerogramm} from './sumerogrammParser';

// Sumerogramm as first syllable in word
describe('sumerogrammParser', () => testParser<Sumerogramm>('sumerogramm', firstSyllableSumerogrammParser, [

  {source: 'NINDA', awaitedResult: sGr('NINDA')},
  {source: 'LUGAL', awaitedResult: sGr('LUGAL')},

  // GIŠ.°D°INANNA start with <sGr>GIŠ.</sGr> and continues with <d>D</d>!
  // {source: 'GIŠ.', awaitedResult: sGr('GIŠ.')},

  {source: 'NINDA.GUR.RA', awaitedResult: sGr('NINDA.GUR.RA')},
  {source: 'NINDA.GUR4.RA', awaitedResult: sGr('NINDA.GUR₄.RA')},
  {source: 'NINDA.GUR.RA4', awaitedResult: sGr('NINDA.GUR.RA₄')},

  {source: 'INANNA', awaitedResult: sGr('INANNA')},
]));

// Sumerogramm as other syllables in word

describe('sumerogramm in word', () => testParser<Sumerogramm>('sumerogramm in word', innerWordSumerogrammParser, [
  {source: '-DINGIR', awaitedResult: sGr('DINGIR')},

  {source: '-NINDA', awaitedResult: sGr('NINDA')},
  {source: '-LUGAL', awaitedResult: sGr('LUGAL')},

  // GIŠ.°D°INANNA start with <sGr>GIŠ.</sGr> and continues with <d>D</d>!
  // {source: 'GIŠ.', awaitedResult: sGr('GIŠ.')},

  {source: '-NINDA.GUR.RA', awaitedResult: sGr('NINDA.GUR.RA')},
  {source: '-NINDA.GUR4.RA', awaitedResult: sGr('NINDA.GUR₄.RA')},
  {source: '-NINDA.GUR.RA4', awaitedResult: sGr('NINDA.GUR.RA₄')},

  {source: '-INANNA', awaitedResult: sGr('INANNA')},
]));
