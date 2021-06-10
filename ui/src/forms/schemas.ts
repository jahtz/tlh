import * as yup from 'yup';
import {
  CreateManuscriptMutationVariables,
  LoginMutationVariables,
  ManuscriptIdentifierInput,
  ManuscriptIdentifierType,
  PalaeographicClassification,
  UserInput
} from '../generated/graphql';

export const registerSchema: yup.SchemaOf<UserInput> = yup.object()
  .shape({
    // TODO: test password === passwordRepeat
    username: yup.string().min(4).max(50).required(),
    password: yup.string().min(4).max(50).required(),
    passwordRepeat: yup.string().min(4).max(50).required(),
    email: yup.string().email().required(),
    name: yup.string().required(),
    affiliation: yup.string().notRequired()
  })
  .required();

export const loginSchema: yup.SchemaOf<LoginMutationVariables> = yup.object()
  .shape({
    username: yup.string().min(4).max(50).required(),
    password: yup.string().min(4).max(50).required()
  })
  .required();

const manuscriptIdentifierSchema: yup.SchemaOf<ManuscriptIdentifierInput> = yup.object()
  .shape({
    identifier: yup.string().required(),
    identifierType: yup.mixed()
      .oneOf([
        ManuscriptIdentifierType.CollectionNumber,
        ManuscriptIdentifierType.ExcavationNumber,
        ManuscriptIdentifierType.PublicationShortReference
      ])
      .required()
  })
  .required();

export const manuscriptSchema: yup.SchemaOf<CreateManuscriptMutationVariables> = yup.object()
  .shape({
    // TODO: other fields!
    mainIdentifier: manuscriptIdentifierSchema.required(),
    otherIdentifiers: yup.array(manuscriptIdentifierSchema).notRequired(),
    palaeographicClassification: yup.mixed<PalaeographicClassification>()
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
    palaeographicClassificationSure: yup.boolean().required(),
    cthClassification: yup.number().notRequired(),
    provenance: yup.string().notRequired(), bibliography: yup.string().notRequired()
  })
  .required();
