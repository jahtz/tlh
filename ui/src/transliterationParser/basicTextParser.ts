import {alt, oneOf, Parser, regexp, seqMap, string} from 'parsimmon';

const newLowerText = /[\p{Ll}〈〉<>˽]+/u;

export const basicText: Parser<string> = seqMap(
  regexp(newLowerText),
  seqMap(
    alt(
      string('-').notFollowedBy(string('-')),
      oneOf('+×ₓ')
    ),
    regexp(newLowerText),
    (minus, text) => minus + text
  ).many().tie(),
  (first, following) => first + following
);
