import {array as yupArray, boolean as yupBoolean, mixed as yupMixed, number as yupNumber, object as yupObject, Schema, string as yupString} from 'yup';
import {ManuscriptIdentifierInput, ManuscriptIdentifierType, ManuscriptMetaDataInput, PalaeographicClassification} from '../graphql';
import {palaeographicClassifications} from './PalaeographicField';

export const manuscriptIdentifierTypes: ManuscriptIdentifierType[] = [
  ManuscriptIdentifierType.CollectionNumber,
  ManuscriptIdentifierType.ExcavationNumber,
  ManuscriptIdentifierType.PublicationShortReference,
];

const manuscriptIdentifierSchema: Schema<ManuscriptIdentifierInput> = yupObject({
  identifier: yupString().required(),
  identifierType: yupMixed<ManuscriptIdentifierType>()
    .oneOf(manuscriptIdentifierTypes)
    .required()
}).required();

export const manuscriptSchema: Schema<ManuscriptMetaDataInput> = yupObject({
  mainIdentifier: manuscriptIdentifierSchema,
  otherIdentifiers: yupArray(manuscriptIdentifierSchema).required(),
  palaeographicClassification: yupMixed<PalaeographicClassification>()
    .oneOf(palaeographicClassifications)
    .required(),
  palaeographicClassificationSure: yupBoolean().required(),
  cthClassification: yupNumber().notRequired(),
  provenance: yupString().notRequired(),
  bibliography: yupString().notRequired(),
}).required();
