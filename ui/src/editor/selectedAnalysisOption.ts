export interface SelectedAnalysisOption {
  number: number;
  letter?: string;
  enclitics?: string[];
}

function selectAnalysisOption(num: number, letter?: string, enclitics?: string[]): SelectedAnalysisOption {
  return {number: num, letter, enclitics};
}

export function compareSelectedAnalysisOptions(
  {number: num1, letter: letter1}: SelectedAnalysisOption,
  {number: num2, letter: letter2}: SelectedAnalysisOption
): number {
  const n1 = num1 * 1000 + (letter1?.charCodeAt(0) || 0);
  const n2 = num2 * 1000 + (letter2?.charCodeAt(0) || 0);
  return n1 - n2;
}

export function selectedAnalysisOptionEquals(
  {number: num1, letter: letter1, enclitics: enclitics1}: SelectedAnalysisOption,
  {number: num2, letter: letter2, enclitics: enclitics2}: SelectedAnalysisOption,
  compareEnclitics = false
): boolean {

  const encliticsEqual = !compareEnclitics || !!(enclitics1 && enclitics2 && enclitics1 === enclitics2);

  return num1 === num2 && letter1 === letter2 && encliticsEqual;
}

export function isSelected(value: SelectedAnalysisOption, selection: SelectedAnalysisOption[]): boolean {
  return !!selection.find((sa2) => selectedAnalysisOptionEquals(value, sa2));
}

export function stringifySelectedAnalysisOption({number, letter, enclitics}: SelectedAnalysisOption): string {
  return number + (letter || '') + (enclitics?.join('') || '');
}


const morphSplitCharacter = ' ';

const morphRegex = /(\d+)([a-z]*)([R-Z]*)/;

export function readSelectedMorphology(morph: string): SelectedAnalysisOption[] {
  return morph.split(morphSplitCharacter)
    .map((selOpt) => selOpt.match(morphRegex))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((match) => selectAnalysisOption(parseInt(match[1]), (match[2].trim() === '') ? undefined : match[2], (match[3].trim() === '') ? undefined : match[3].split('')));
}

export function writeSelectedMorphologies(selectedMorphologies: SelectedAnalysisOption[]): string {
  return selectedMorphologies.map(stringifySelectedAnalysisOption).join(morphSplitCharacter);
}
