import {testParser} from './parserBasics';
import {
  aoFootNote,
  aoGapNode,
  aoKolonMark,
  aoSign,
  FootNote,
  footNoteParser,
  Gap,
  gapParser,
  KolonMark,
  kolonMarkParser,
  Sign,
  signParser
} from './annotationsParser';

describe('footNoteParser', () => {
  testParser<FootNote>('kolonMarkParser', footNoteParser, [
    {source: '{F: example...}', awaitedResult: aoFootNote('example...')}
  ]);
});

describe('gapParser', () => {
  testParser<Gap>('gapParser', gapParser, [
    {source: '{G: example...}', awaitedResult: aoGapNode('example...')}
  ]);
});

describe('kolonMarkParser', () => {
  testParser<KolonMark>('kolonMarkParser', kolonMarkParser, [
    {source: '{K: example...}', awaitedResult: aoKolonMark('example...')}
  ]);
});

describe('signParser', () => {
  testParser<Sign>('signParser', signParser, [
    {source: '{S: example...}', awaitedResult: aoSign('example...')}
  ]);
});