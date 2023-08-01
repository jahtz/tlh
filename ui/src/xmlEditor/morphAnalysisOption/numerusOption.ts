export enum NumerusOption {
  All = 'All',
  Singular = 'SG',
  Plural = 'PL'
}

export const numeri: NumerusOption[] = [NumerusOption.Singular, NumerusOption.Plural, NumerusOption.All];

export function analysisIsInNumerus(analysis: string, numerus: NumerusOption): boolean {
  const firstAnalysisPart = analysis.split('_')[0];

  return numerus === NumerusOption.All || firstAnalysisPart.includes(numerus) ||
    firstAnalysisPart.includes('ABL') || firstAnalysisPart.includes('INS') || firstAnalysisPart.includes('ALL');
}

export function stringifyNumerus(numerus: NumerusOption, t: (key: string) => string): string {
  return {
    [NumerusOption.Singular]: t('SG'),
    [NumerusOption.Plural]: t('PL'),
    [NumerusOption.All]: t('All'),
  }[numerus];
}