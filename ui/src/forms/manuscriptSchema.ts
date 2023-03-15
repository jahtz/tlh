import {array as yupArray, boolean as yupBoolean, mixed as yupMixed, number as yupNumber, object as yupObject, Schema, string as yupString} from 'yup';
import {
  MANUSCRIPT_IDENTIFIER_TYPE,
  ManuscriptIdentifierInput,
  ManuscriptIdentifierType,
  ManuscriptMetaDataInput,
  PALAEOGRAPHIC_CLASSIFICATION,
  PalaeographicClassification
} from '../graphql';

const manuscriptIdentifierSchema: Schema<ManuscriptIdentifierInput> = yupObject({
  identifier: yupString().required(),
  identifierType: yupMixed<ManuscriptIdentifierType>()
    .oneOf(MANUSCRIPT_IDENTIFIER_TYPE)
    .required()
}).required();

export const manuscriptSchema: Schema<ManuscriptMetaDataInput> = yupObject({
  mainIdentifier: manuscriptIdentifierSchema,
  otherIdentifiers: yupArray(manuscriptIdentifierSchema).required(),
  palaeographicClassification: yupMixed<PalaeographicClassification>()
    .oneOf(PALAEOGRAPHIC_CLASSIFICATION)
    .required(),
  palaeographicClassificationSure: yupBoolean().required(),
  cthClassification: yupNumber().notRequired(),
  provenance: yupString().notRequired(),
  bibliography: yupString().notRequired(),
}).required();
