import {testParser} from './parserBasics';
import {akkadogramm as aGr, Akkadogramm, firstSyllableAkkadogrammParser, otherSyllablesAkkadogrammParser} from './akkadogrammParser';

// Akkadogramm as first syllable in word
describe('akkadogrammParser', () => testParser<Akkadogramm>('akkadogramm', firstSyllableAkkadogrammParser, [
  // Akkadogramm
  {source: '_ŠI-PÁT', awaitedResult: aGr('ŠI-PÁT')},
  {source: '_A-NA', awaitedResult: aGr('A-NA')},
  {source: '_A+NA', awaitedResult: aGr('A+NA')}
]));


// Akkadogramm as other syllables in word
describe('akkadogrammParser', () => testParser<Akkadogramm>('akkadogramm', otherSyllablesAkkadogrammParser, [
  // Akkadogramm
  {source: 'ŠI-PÁT', awaitedResult: aGr('ŠI-PÁT')},
  {source: 'A-NA', awaitedResult: aGr('A-NA')},
  {source: 'A+NA', awaitedResult: aGr('A+NA')}
]));
