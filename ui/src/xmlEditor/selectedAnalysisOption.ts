import {
  SelectedMorphAnalysis,
  selectedMultiMorphAnalysisWithEnclitics,
  selectedMultiMorphAnalysisWithoutEnclitics,
  selectedSingleMorphAnalysis,
  selectedSingleMorphAnalysisWithEnclitic
} from '../model/selectedMorphologicalAnalysis';

/**
 * @deprecated
 */
export interface SelectedAnalysisOption {
  number: number;
  letter?: string;
  enclitics?: string[];
}

// Read

const morphRegex = /(\d+)([a-z]?)([R-Z]?)/;

export function readSelectedMorphology(morph: string): SelectedMorphAnalysis[] {
  return morph
    .split(' ')
    .map((selOpt) => selOpt.match(morphRegex))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map(([, numStr, maybeMorphLetter, maybeEncLetter]) => {

      const number = parseInt(numStr);

      if (maybeMorphLetter && maybeEncLetter) {
        return selectedMultiMorphAnalysisWithEnclitics(number, maybeMorphLetter, maybeEncLetter);
      } else if (maybeMorphLetter) {
        return selectedMultiMorphAnalysisWithoutEnclitics(number, maybeMorphLetter);
      } else if (maybeEncLetter) {
        return selectedSingleMorphAnalysisWithEnclitic(number, maybeEncLetter);
      } else {
        return selectedSingleMorphAnalysis(number);
      }
    });
}

// Write

function stringifySelectedAnalysisOption({number, letter, enclitics}: SelectedAnalysisOption): string {
  return number + (letter || '') + (enclitics?.join('') || '');
}

export function writeSelectedMorphologies(selectedMorphologies: SelectedAnalysisOption[]): string {
  return selectedMorphologies
    .map(stringifySelectedAnalysisOption)
    .join(' ');
}
