import {PalaeographicClassification} from '../../graphql';
import {TFunction} from 'i18next';

export function getNameForPalaeoClassification(pc: PalaeographicClassification, t: TFunction): string {
  switch (pc) {
    case PalaeographicClassification.AssyroMittanianScript:
      return t('AssyroMittanianScript');
    case PalaeographicClassification.LateNewScript:
      return t('LateNewScript');
    case PalaeographicClassification.MiddleAssyrianScript:
      return t('MiddleAssyrianScript');
    case PalaeographicClassification.MiddleBabylonianScript:
      return t('MiddleBabylonianScript');
    case PalaeographicClassification.MiddleScript:
      return t('MiddleScript');
    case PalaeographicClassification.NewScript:
      return t('NewScript');
    case PalaeographicClassification.OldAssyrianScript:
      return t('OldAssyrianScript');
    case PalaeographicClassification.OldScript:
      return t('OldScript');
    case PalaeographicClassification.Unclassified:
      return t('Unclassified');
  }
}