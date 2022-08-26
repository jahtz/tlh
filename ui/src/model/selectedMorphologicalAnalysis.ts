interface ISelectedMorphAnalysis {
  number: number;
}

interface SelectedSingleMorphAnalysis extends ISelectedMorphAnalysis {
  _type: 'SelectedSingleMorphAnalysis';
  morphLetter: undefined;
  encLetter: undefined;
}

export function selectedSingleMorphAnalysis(number: number): SelectedSingleMorphAnalysis {
  return {_type: 'SelectedSingleMorphAnalysis', number, morphLetter: undefined, encLetter: undefined};
}

interface SelectedSingleMorphAnalysisWithEnclitic extends ISelectedMorphAnalysis {
  _type: 'SelectedSingleMorphAnalysisWithEnclitic';
  morphLetter: undefined;
  encLetter: string;
}

export function selectedSingleMorphAnalysisWithEnclitic(number: number, encLetter: string): SelectedSingleMorphAnalysisWithEnclitic {
  return {_type: 'SelectedSingleMorphAnalysisWithEnclitic', number, morphLetter: undefined, encLetter};
}

interface SelectedMultiMorphAnalysis extends ISelectedMorphAnalysis {
  _type: 'SelectedMultiMorphAnalysis';
  morphLetter: string;
  encLetter: undefined;
}

export function selectedMultiMorphAnalysisWithoutEnclitics(number: number, morphLetter: string): SelectedMultiMorphAnalysis {
  return {_type: 'SelectedMultiMorphAnalysis', number, morphLetter, encLetter: undefined};
}

export interface SelectedMultiMorphAnalysisWithEnclitic extends ISelectedMorphAnalysis {
  _type: 'SelectedMultiMorphAnalysisWithEnclitic';
  morphLetter: string;
  encLetter: string;
}

export function stringifyMultiMorphAnalysisWithEnclitics({number, morphLetter, encLetter}: SelectedMultiMorphAnalysisWithEnclitic): string {
  return `${number}${morphLetter}${encLetter}`;
}

export function selectedMultiMorphAnalysisWithEnclitics(number: number, morphLetter: string, encLetter: string): SelectedMultiMorphAnalysisWithEnclitic {
  return {_type: 'SelectedMultiMorphAnalysisWithEnclitic', number, morphLetter, encLetter};
}

export type SelectedMorphAnalysis =
  SelectedSingleMorphAnalysis
  | SelectedSingleMorphAnalysisWithEnclitic
  | SelectedMultiMorphAnalysis
  | SelectedMultiMorphAnalysisWithEnclitic;

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

