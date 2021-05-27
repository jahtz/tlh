import {AOLineBreak, aoLineBreakFormat} from "./sentenceContent/linebreak";

export interface TransliterationLine {
  lineInput: string;
  result?: AOLineBreak;
}

export function transliterationLine(lineInput: string, result?: AOLineBreak): TransliterationLine {
  return {lineInput, result};
}

export function xmlifyTransliterationLine({lineInput, result}: TransliterationLine): string {
  return result
    ? aoLineBreakFormat.write(result).join('\n')
    : `<error>${lineInput}</error>`
}
