import {Attributes} from 'simple_xml';

export enum DocumentEditTypes {
  Annotation = 'annot',
  Formatting = 'format',
  Join = 'join',
  KollationFoto = 'kolfot',
  SecondKollationFoto = 'kolfot2',
  Correction = 'kor',
  SecondCorrection = 'kor2',
  KollationFragment = 'koltaf',
  CorrectionWithoutFoto = 'korof',
  TransliterationCreation = 'trlst',
  TransliterationTransfer = 'uebern',
  ColonBorders = 'kolon',
  Validation = 'val',
  CthChange = 'cth'
}

export const allDocEditTypes: DocumentEditTypes[] = [
  DocumentEditTypes.Annotation,
  DocumentEditTypes.Formatting,
  DocumentEditTypes.Join,
  DocumentEditTypes.KollationFoto,
  DocumentEditTypes.SecondKollationFoto,
  DocumentEditTypes.Correction,
  DocumentEditTypes.SecondCorrection,
  DocumentEditTypes.KollationFragment,
  DocumentEditTypes.CorrectionWithoutFoto,
  DocumentEditTypes.TransliterationCreation,
  DocumentEditTypes.TransliterationTransfer,
  DocumentEditTypes.ColonBorders,
  DocumentEditTypes.Validation,
  DocumentEditTypes.CthChange
];

export function attributesForDocEditType(docEditType: DocumentEditTypes): Attributes {
  switch (docEditType) {
    case DocumentEditTypes.CthChange:
      return {alt: '', neu: ''};
    case DocumentEditTypes.Join:
      return {frgm: ''};
    case DocumentEditTypes.TransliterationTransfer:
      return {src: ''};
    default:
      return {};
  }
}

export const nameForDocEditType = (docEditType: DocumentEditTypes, t: (s: string) => string): string => {
  return {
    [DocumentEditTypes.Annotation]: t('Annotation'),
    [DocumentEditTypes.Formatting]: t('Formatting'),
    [DocumentEditTypes.Join]: t('Join'),
    [DocumentEditTypes.KollationFoto]: t('KollationFoto'),
    [DocumentEditTypes.SecondKollationFoto]: t('SecondKollationFoto'),
    [DocumentEditTypes.Correction]: t('Correction'),
    [DocumentEditTypes.SecondCorrection]: t('SecondCorrectino'),
    [DocumentEditTypes.KollationFragment]: t('KollationFragment'),
    [DocumentEditTypes.CorrectionWithoutFoto]: t('CorrectionWithoutFoto'),
    [DocumentEditTypes.TransliterationCreation]: t('TransliterationCreation'),
    [DocumentEditTypes.TransliterationTransfer]: t('TransliterationTransfer'),
    [DocumentEditTypes.ColonBorders]: t('ColonBorders'),
    [DocumentEditTypes.Validation]: t('Validation'),
    [DocumentEditTypes.CthChange]: t('CthChange')
  }[docEditType];
};