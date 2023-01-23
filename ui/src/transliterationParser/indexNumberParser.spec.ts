import {optionalIndexNumber} from './indexNumberParser';
import {testParser} from './parserBasics';

describe('indexNumberParser', () => testParser('indexNumber', optionalIndexNumber, [
  // Default numbers should be made to subscript numbers
  {source: '0', awaitedResult: '₀'},
  {source: '1', awaitedResult: '₁'},
  {source: '2', awaitedResult: '₂'},
  {source: '3', awaitedResult: '₃'},
  {source: '4', awaitedResult: '₄'},
  {source: '5', awaitedResult: '₅'},
  {source: '6', awaitedResult: '₆'},
  {source: '7', awaitedResult: '₇'},
  {source: '8', awaitedResult: '₈'},
  {source: '9', awaitedResult: '₉'},

  // Other cases
  {source: '12', awaitedResult: '₁₂'},
  {source: '₁₂', awaitedResult: '₁₂'},
]));