import {alt, Parser, string} from 'parsimmon';

export const ellipsisParser: Parser<'…'> = alt(
  string('…'),
  string('...')
).result('…');