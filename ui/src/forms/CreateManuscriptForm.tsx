import {useTranslation} from 'react-i18next';
import {JSX} from 'react';
import {
  ManuscriptIdentifierInput,
  ManuscriptIdentifierType,
  ManuscriptLanguageAbbreviations,
  ManuscriptMetaDataInput,
  PalaeographicClassification,
  useCreateManuscriptMutation
} from '../graphql';
import {Field, FieldArray, FieldArrayRenderProps, Form, Formik, FormikErrors} from 'formik';
import {manuscriptSchema} from './manuscriptSchema';
import classNames from 'classnames';
import {ManuscriptIdInputField} from './ManuscriptIdInputField';
import {Navigate} from 'react-router-dom';
import {PalaeoClassField} from './PalaeographicField';
import {manuscriptsUrlFragment} from '../urls';
import {getNameForManuscriptLanguageAbbreviation, manuscriptLanguageAbbreviations} from './manuscriptLanguageAbbreviations';
import {blueButtonClasses, defaultInputClasses, redButtonClasses} from '../defaultDesign';
import {allKnownProvenances} from '../provenances';

function newManuscriptIdentifier(): ManuscriptIdentifierInput {
  return {
    identifier: '',
    identifierType: ManuscriptIdentifierType.CollectionNumber
  };
}

const initialValues: ManuscriptMetaDataInput = {
  mainIdentifier: newManuscriptIdentifier(),
  otherIdentifiers: [],
  palaeographicClassification: PalaeographicClassification.Unclassified,
  palaeographicClassificationSure: false,
  defaultLanguage: ManuscriptLanguageAbbreviations.Hit,
  bibliography: undefined,
  provenance: undefined,
  cthClassification: undefined
};

export function CreateManuscriptForm(): JSX.Element {

  const {t} = useTranslation('common');
  const [createManuscript, {data, loading, error}] = useCreateManuscriptMutation();

  const newIdentifier = data?.identifier;

  if (newIdentifier) {
    return <Navigate to={`/${manuscriptsUrlFragment}/${encodeURIComponent(newIdentifier)}/data`}/>;
  }

  const handleSubmit = async (manuscriptMetaData: ManuscriptMetaDataInput): Promise<void> => {
    try {
      await createManuscript({variables: {manuscriptMetaData}});
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="container mx-auto">

      <h1 className="mb-4 font-bold text-2xl text-center">{t('createManuscript')}</h1>

      <Formik initialValues={initialValues} validationSchema={manuscriptSchema} onSubmit={handleSubmit}>
        {({touched, errors, setFieldValue, values}) => <Form>

          <div className="mt-2">
            <label className="font-bold">{t('mainIdentifier')}*:</label>
            <ManuscriptIdInputField mainId="mainIdentifier" errors={errors.mainIdentifier} touched={touched.mainIdentifier}/>
          </div>

          <FieldArray name="otherIdentifiers">
            {(arrayHelpers: FieldArrayRenderProps) => <>
              <div className="mt-2">
                <label className="font-bold">{t('otherIdentifier_plural')}:</label>

                {values.otherIdentifiers && values.otherIdentifiers.map((_otherIdentifier: ManuscriptIdentifierInput, index: number) =>
                  <ManuscriptIdInputField
                    key={index} mainId={`otherIdentifiers.${index}`} deleteFunc={() => arrayHelpers.remove(index)}
                    errors={errors.otherIdentifiers ? errors.otherIdentifiers[index] as FormikErrors<ManuscriptIdentifierInput> : undefined}
                    touched={touched.otherIdentifiers ? touched.otherIdentifiers[index] : undefined}/>
                )}
              </div>

              <button type="button" className={blueButtonClasses} onClick={() => arrayHelpers.push(newManuscriptIdentifier())}>+</button>
            </>}
          </FieldArray>

          <PalaeoClassField palaeoClassSure={values.palaeographicClassificationSure}
                            setPalaeoClassSure={(value) => setFieldValue('palaeographicClassificationSure', value)}/>

          <div className="mt-2">
            <label htmlFor="provenance" className="font-bold">{t('provenance')}:</label>

            <Field name="provenance" id="provenance" placeholder={t('provenance')} list="provenances" className={defaultInputClasses}/>
            <datalist id="provenances">
              {allKnownProvenances.map(({englishName}) => <option key={englishName} value={englishName}/>)}
            </datalist>
          </div>

          <div className="my-2">
            <label htmlFor="defaultLanguage" className="font-bold">{t('defaultLanguage')}</label>

            <Field as="select" name="defaultLanguage" id="defaultLangauge" placeholder={t('defaultLanguage')} className={defaultInputClasses}>
              {manuscriptLanguageAbbreviations.map((abbreviation) =>
                <option key={abbreviation} value={abbreviation}>{getNameForManuscriptLanguageAbbreviation(abbreviation, t)}</option>)}
            </Field>
          </div>

          <div className="mt-2">
            <label htmlFor="cthClassification" className="font-bold">{t('(proposed)CthClassification')}:</label>

            <Field type="number" name="cthClassification" id="cthClassification" placeholder={t('(proposed)CthClassification')}
                   className={defaultInputClasses}/>
          </div>

          <div className="mt-2">
            <label htmlFor="bibliography" className="font-bold">{t('bibliography')}</label>

            <Field as="textarea" name="bibliography" id="bibliography" placeholder={t('bibliography')} className={defaultInputClasses}/>
          </div>


          {error && <div className={redButtonClasses}>{error.message}</div>}

          <div className="text-center">
            <button type="submit" disabled={loading || !!newIdentifier} className={classNames(blueButtonClasses, {'is-loading': loading})}>
              {t('createManuscript')}
            </button>
          </div>

        </Form>}
      </Formik>
    </div>
  );
}
