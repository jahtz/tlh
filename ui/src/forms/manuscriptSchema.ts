import {array as yupArray, boolean as yupBoolean, mixed as yupMixed, number as yupNumber, object as yupObject, ObjectSchema, string as yupString} from 'yup';
import {
  ManuscriptIdentifierInput,
  ManuscriptIdentifierType,
  ManuscriptLanguageAbbreviations,
  ManuscriptMetaDataInput,
  PalaeographicClassification
} from '../graphql';
import {palaeographicClassifications} from './PalaeographicField';
import {manuscriptLanguageAbbreviations} from './manuscriptLanguageAbbreviations';

export const manuscriptIdentifierTypes: ManuscriptIdentifierType[] = [
  ManuscriptIdentifierType.CollectionNumber,
  ManuscriptIdentifierType.ExcavationNumber,
  ManuscriptIdentifierType.PublicationShortReference,
];

const identifierType = yupMixed<ManuscriptIdentifierType>()
  .oneOf(manuscriptIdentifierTypes)
  .required();

const manuscriptIdentifierSchema: ObjectSchema<ManuscriptIdentifierInput> = yupObject({
  identifier: yupString().required(),
  identifierType
}).required();

const palaeographicClassification = yupMixed<PalaeographicClassification>().oneOf(palaeographicClassifications).required();


const defaultLanguage = yupMixed<ManuscriptLanguageAbbreviations>().oneOf(manuscriptLanguageAbbreviations).required();

export const manuscriptSchema: ObjectSchema<ManuscriptMetaDataInput> = yupObject({
  mainIdentifier: manuscriptIdentifierSchema,
  otherIdentifiers: yupArray(manuscriptIdentifierSchema).required(),
  palaeographicClassification,
  palaeographicClassificationSure: yupBoolean().required(),
  defaultLanguage,
  provenance: yupString().notRequired(),
  cthClassification: yupNumber().notRequired(),
  bibliography: yupString().notRequired(),
}).required();
