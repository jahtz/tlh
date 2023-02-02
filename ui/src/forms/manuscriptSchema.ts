import {array as yupArray, boolean as yupBoolean, mixed as yupMixed, number as yupNumber, object as yupObject, SchemaOf, string as yupString} from 'yup';
import {
  CreateManuscriptMutationVariables,
  MANUSCRIPT_IDENTIFIER_TYPE,
  ManuscriptIdentifierInput,
  PALAEOGRAPHIC_CLASSIFICATION,
  PalaeographicClassification
} from '../graphql';

const manuscriptIdentifierSchema: SchemaOf<ManuscriptIdentifierInput> = yupObject({
  identifier: yupString().required(),
  identifierType: yupMixed()
    .oneOf(MANUSCRIPT_IDENTIFIER_TYPE)
    .required()
}).required();

export const manuscriptSchema: SchemaOf<CreateManuscriptMutationVariables> = yupObject()
  .shape({
    mainIdentifier: manuscriptIdentifierSchema.required(),
    otherIdentifiers: yupArray(manuscriptIdentifierSchema).notRequired(),
    palaeographicClassification: yupMixed<PalaeographicClassification>()
      .oneOf(PALAEOGRAPHIC_CLASSIFICATION)
      .required(),
    palaeographicClassificationSure: yupBoolean().required(),
    cthClassification: yupNumber().notRequired(),
    provenance: yupString().notRequired(),
    bibliography: yupString().notRequired(),
  }).required();
