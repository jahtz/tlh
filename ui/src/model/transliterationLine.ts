import {AOLineBreak} from './sentenceContent/linebreak';
import {Failure} from 'parsimmon';

export interface TransliterationLinePreParseError {
  _type: 'TransliterationLineParseError';
  error: Failure;
}

export interface TransliterationLineWordParseError {
  _type: 'TransliterationLineWordParseError';
  errors: Failure[];
}

export interface TransliterationLine {
  // _type: 'TransliterationLineParseSuccess';
  lineInput: string;
  result?: AOLineBreak;
}


