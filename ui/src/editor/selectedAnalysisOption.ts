export interface SelectedAnalysisOption {
  num: number;
  letter?: string;
}

function selectAnalysisOption(num: number, letter?: string): SelectedAnalysisOption {
  return {num, letter};
}

export function selectedAnalysisOptionEquals(
  {num: num1, letter: letter1}: SelectedAnalysisOption,
  {num: num2, letter: letter2}: SelectedAnalysisOption
): boolean {
  return num1 === num2 && letter1 === letter2;
}

export function isSelected(value: SelectedAnalysisOption, selection: SelectedAnalysisOption[]): boolean {
  return !!selection.find((sa2) => selectedAnalysisOptionEquals(value, sa2));
}

export function stringifySelectedAnalysisOption({num, letter}: SelectedAnalysisOption): string {
  return num + (letter || '');
}


const morphSplitCharacter = ' ';

const morphRegex = /(\d+)([a-z]*)/;

export function readSelectedMorphology(morph: string): SelectedAnalysisOption[] {
  return morph.split(morphSplitCharacter)
    .map((selOpt) => selOpt.match(morphRegex))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((match) => selectAnalysisOption(parseInt(match[1]), (match[2].trim() === '') ? undefined : match[2]));
}

export function writeSelectedMorphologies(selectedMorphologies: SelectedAnalysisOption[]): string {
  return selectedMorphologies.map(stringifySelectedAnalysisOption).join(morphSplitCharacter);
}