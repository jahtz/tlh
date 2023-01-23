import {alt, oneOf, Parser} from 'parsimmon';
import {upperText} from './parserBasics';

const normalIndexNumber: Parser<string> = oneOf('0123456789')
  .map((num) => String.fromCharCode('₀'.charCodeAt(0) + parseInt(num)))
  .atLeast(1)
  .tie();

const subIndexNumber: Parser<string> = oneOf('₀₁₂₃₄₅₆₇₈₉')
  .atLeast(1)
  .tie();

const unknownIndexNumber: Parser<string> = oneOf('xₓ')
  .notFollowedBy(upperText)
  .result('ₓ')
  .atLeast(1)
  .tie();

export const optionalIndexNumber: Parser<string | undefined> =
  alt(normalIndexNumber, subIndexNumber, unknownIndexNumber)
    .times(0, 1)
    .map((indexNumbers) => indexNumbers.length === 1 ? indexNumbers[0] : undefined);
