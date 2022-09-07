import {array as yupArray, boolean as yupBoolean, mixed as yupMixed, number as yupNumber, object as yupObject, SchemaOf, string as yupString} from 'yup';
import {CreateManuscriptMutationVariables, ManuscriptIdentifierInput, ManuscriptIdentifierType, PalaeographicClassification} from '../graphql';

const manuscriptIdentifierSchema: SchemaOf<ManuscriptIdentifierInput> = yupObject({
  identifier: yupString().required(),
  identifierType: yupMixed()
    .oneOf([
      ManuscriptIdentifierType.CollectionNumber,
      ManuscriptIdentifierType.ExcavationNumber,
      ManuscriptIdentifierType.PublicationShortReference
    ])
    .required()
}).required();

export const manuscriptSchema: SchemaOf<CreateManuscriptMutationVariables> = yupObject()
  .shape({
    mainIdentifier: manuscriptIdentifierSchema.required(),
    otherIdentifiers: yupArray(manuscriptIdentifierSchema).notRequired(),
    palaeographicClassification: yupMixed<PalaeographicClassification>()
      .oneOf([
        PalaeographicClassification.Unclassified,
        PalaeographicClassification.AssyroMittanianScript,
        PalaeographicClassification.LateNewScript,
        PalaeographicClassification.MiddleAssyrianScript,
        PalaeographicClassification.MiddleBabylonianScript,
        PalaeographicClassification.MiddleScript,
        PalaeographicClassification.NewScript,
        PalaeographicClassification.OldAssyrianScript,
        PalaeographicClassification.OldScript
      ])
      .required(),
    palaeographicClassificationSure: yupBoolean().required(),
    cthClassification: yupNumber().notRequired(),
    provenance: yupString().notRequired(),
    bibliography: yupString().notRequired(),
  }).required();
