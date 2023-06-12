import {ManuscriptLanguageAbbreviations} from '../graphql';
import {TFunction} from 'i18next';

export const manuscriptLanguageAbbreviations: ManuscriptLanguageAbbreviations[] = [
  ManuscriptLanguageAbbreviations.Hit,
  ManuscriptLanguageAbbreviations.Luw,
  ManuscriptLanguageAbbreviations.Pal,
  ManuscriptLanguageAbbreviations.Hat,
  ManuscriptLanguageAbbreviations.Hur,
  ManuscriptLanguageAbbreviations.Akk,
  ManuscriptLanguageAbbreviations.Sum
];

export function getNameForManuscriptLanguageAbbreviation(abb: ManuscriptLanguageAbbreviations, t: TFunction): string {
  switch (abb) {
    case ManuscriptLanguageAbbreviations.Hit:
      return t('Hit');
    case ManuscriptLanguageAbbreviations.Luw:
      return t('Luw');
    case ManuscriptLanguageAbbreviations.Pal:
      return t('Pal');
    case ManuscriptLanguageAbbreviations.Hat:
      return t('Hat');
    case ManuscriptLanguageAbbreviations.Hur:
      return t('Hur');
    case ManuscriptLanguageAbbreviations.Akk:
      return t('Akk');
    case  ManuscriptLanguageAbbreviations.Sum:
      return t('Sum');
  }
}