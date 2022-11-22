import {AOLineBreak} from './sentenceContent/linebreak';

export interface TransliterationLine {
  lineInput: string;
  result?: AOLineBreak;
}

export function transliterationLine(lineInput: string, result?: AOLineBreak): TransliterationLine {
  return {lineInput, result};
}
