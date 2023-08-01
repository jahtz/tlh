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
  Validation = 'val'
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
];