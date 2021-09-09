export interface SelectedAnalysisOption {
  number: number;
  letter?: string;
  enclitics?: string[];
}

function stringifySelectedAnalysisOption({number, letter, enclitics}: SelectedAnalysisOption): string {
  return number + (letter || '') + (enclitics?.join('') || '');
}

const morphSplitCharacter = ' ';

const morphRegex = /(\d+)([a-z]*)([R-Z]*)/;

export function readSelectedMorphology(morph: string): SelectedAnalysisOption[] {
  return morph
    .split(morphSplitCharacter)
    .map((selOpt) => selOpt.match(morphRegex))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((match) => ({
      number: parseInt(match[1]),
      letter: match[2].trim() === '' ? undefined : match[2],
      enclitics: match[3].trim() === '' ? undefined : match[3].split('')
    }));
}

export function writeSelectedMorphologies(selectedMorphologies: SelectedAnalysisOption[]): string {
  return selectedMorphologies
    .map(stringifySelectedAnalysisOption)
    .join(morphSplitCharacter);
}
