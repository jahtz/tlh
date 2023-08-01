import {PalaeographicClassification} from '../../graphql';

export function getNameForPalaeoClassification(pc: PalaeographicClassification, t: (key: string) => string): string {
  return {
    [PalaeographicClassification.AssyroMittanianScript]: t('AssyroMittanianScript'),
    [PalaeographicClassification.LateNewScript]: t('LateNewScript'),
    [PalaeographicClassification.MiddleAssyrianScript]: t('MiddleAssyrianScript'),
    [PalaeographicClassification.MiddleBabylonianScript]: t('MiddleBabylonianScript'),
    [PalaeographicClassification.MiddleScript]: t('MiddleScript'),
    [PalaeographicClassification.NewScript]: t('NewScript'),
    [PalaeographicClassification.OldAssyrianScript]: t('OldAssyrianScript'),
    [PalaeographicClassification.OldScript]: t('OldScript'),
    [PalaeographicClassification.Unclassified]: t('Unclassified'),
  }[pc];
}