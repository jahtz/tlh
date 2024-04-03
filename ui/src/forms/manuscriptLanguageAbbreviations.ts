import {ManuscriptLanguageAbbreviations} from '../graphql';

export const manuscriptLanguageAbbreviations: ManuscriptLanguageAbbreviations[] = [
  ManuscriptLanguageAbbreviations.Hit,
  ManuscriptLanguageAbbreviations.Luw,
  ManuscriptLanguageAbbreviations.Pal,
  ManuscriptLanguageAbbreviations.Hat,
  ManuscriptLanguageAbbreviations.Hur,
  ManuscriptLanguageAbbreviations.Akk,
  ManuscriptLanguageAbbreviations.Sum,
];

export function getNameForManuscriptLanguageAbbreviation(abb: ManuscriptLanguageAbbreviations, t: (key: string) => string): string {
  return {
    [ManuscriptLanguageAbbreviations.Hit]: t('Hit'),
    [ManuscriptLanguageAbbreviations.Luw]: t('Luw'),
    [ManuscriptLanguageAbbreviations.Pal]: t('Pal'),
    [ManuscriptLanguageAbbreviations.Hat]: t('Hat'),
    [ManuscriptLanguageAbbreviations.Hur]: t('Hur'),
    [ManuscriptLanguageAbbreviations.Akk]: t('Akk'),
    [ManuscriptLanguageAbbreviations.Sum]: t('Sum'),
  }[abb];
}