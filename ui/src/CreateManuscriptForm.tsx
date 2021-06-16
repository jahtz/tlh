import React from 'react';
import {useTranslation} from 'react-i18next';
import {
  LoggedInUserFragment,
  ManuscriptIdentifierInput,
  ManuscriptIdentifierType,
  ManuscriptMetaDataInput,
  PalaeographicClassification,
  useCreateManuscriptMutation
} from './generated/graphql';
import {ErrorMessage, Field, FieldArray, FieldArrayRenderProps, Form, Formik, FormikErrors} from 'formik';
import {manuscriptSchema} from './forms/schemas';
import classNames from 'classnames';
import {ManuscriptIdInputField} from './forms/ManuscriptIdInputField';
import {loginUrl} from './urls';
import {Redirect} from 'react-router-dom';
import {BulmaField} from './forms/BulmaFields';
import {useSelector} from 'react-redux';
import {activeUserSelector} from './store/store';
import {allPalaeographicClassifications, getNameForPalaeoClassification} from './palaeoClassification';
import {allKnownProvenances} from './provenances';

function newManuscriptIdentifier(): ManuscriptIdentifierInput {
  return {
    identifier: '',
    identifierType: ManuscriptIdentifierType.CollectionNumber
  };
}

export function CreateManuscriptForm(): JSX.Element {

  const {t} = useTranslation('common');
  const [createManuscript, {data, loading, error}] = useCreateManuscriptMutation();
  const currentUser: LoggedInUserFragment | undefined = useSelector(activeUserSelector);

  const createdManuscript: string | null | undefined = data?.me?.createManuscript;

  if (!currentUser) {
    return <Redirect to={loginUrl}/>;
  }

  if (createdManuscript) {
    return <Redirect to={`./manuscripts/${encodeURIComponent(createdManuscript)}/data`}/>;
  }

  const initialValues: ManuscriptMetaDataInput = {
    mainIdentifier: newManuscriptIdentifier(),
    otherIdentifiers: [],
    palaeographicClassification: PalaeographicClassification.Unclassified,
    palaeographicClassificationSure: false,
    bibliography: '',
    provenance: '',
    cthClassification: undefined
  };

  function handleSubmit(manuscriptMetaData: ManuscriptMetaDataInput): void {
    createManuscript({variables: {manuscriptMetaData}})
      .catch((e) => console.error(e));
  }

  return (
    <div className="container">
      <h1 className="title is-3 has-text-centered">{t('createManuscript')}</h1>

      <Formik initialValues={initialValues} validationSchema={manuscriptSchema} onSubmit={handleSubmit}>

        {({errors, touched, setFieldValue, values}) => {

          return (
            <Form>
              <div className="field">
                <label className="label">{t('mainIdentifier')}*:</label>
                <div className="control">
                  <ManuscriptIdInputField mainId="mainIdentifier" errors={errors.mainIdentifier} touched={touched.mainIdentifier}/>
                </div>
              </div>

              <FieldArray name="otherIdentifiers">
                {(arrayHelpers: FieldArrayRenderProps) =>
                  <>
                    <div className="field">
                      <label className="label">{t('otherIdentifier_plural')}:</label>
                      <div>
                        {values.otherIdentifiers!.map((otherIdentifier: ManuscriptIdentifierInput, index: number) =>
                          <ManuscriptIdInputField
                            mainId={`otherIdentifiers.${index}`} key={index}
                            deleteFunc={() => arrayHelpers.remove(index)}
                            errors={errors.otherIdentifiers ? errors.otherIdentifiers[index] as FormikErrors<ManuscriptIdentifierInput> : undefined}
                            touched={touched.otherIdentifiers ? touched.otherIdentifiers[index] : undefined}/>
                        )}
                      </div>
                    </div>

                    <div className="field">
                      <button className="button is-link" type="button"
                              onClick={() => arrayHelpers.push(newManuscriptIdentifier())}>+
                      </button>
                    </div>
                  </>

                }
              </FieldArray>

              <div className="field">
                <label className="label">{t('palaeographicClassification')}:</label>
                <div className="control">
                  <div className={classNames('select', 'is-fullwidth', {
                    'is-success': touched.palaeographicClassification && !errors.palaeographicClassification,
                    'is-danger': touched.palaeographicClassification && errors.palaeographicClassification
                  })}>
                    <Field as="select" id="palaeographicClassification" name="palaeographicClassification">
                      {allPalaeographicClassifications.map((pc) =>
                        <option key={pc} value={pc}>{getNameForPalaeoClassification(pc, t)}</option>
                      )}
                    </Field>
                  </div>
                </div>
                <ErrorMessage name="palaeographicClassification">
                  {msg => <p className="help is-danger">{msg}</p>}
                </ErrorMessage>
              </div>

              <div className="field">
                <div className="columns">
                  <div className="column">
                    <button type="button"
                            className={classNames('button', 'is-fullwidth', {'is-link': values.palaeographicClassificationSure})}
                            onClick={() => setFieldValue('palaeographicClassificationSure', true)}>
                      {t('sure')}
                    </button>
                  </div>
                  <div className="column">
                    <button type="button"
                            className={classNames('button', 'is-fullwidth', {'is-link': !values.palaeographicClassificationSure})}
                            onClick={() => setFieldValue('palaeographicClassificationSure', false)}>
                      {t('notSure')}
                    </button>
                  </div>
                </div>
                <ErrorMessage name="palaeographicClassificationSure">
                  {msg => <p className="help is-danger">{msg}</p>}
                </ErrorMessage>
              </div>

              <Field name="provenance" id="provenance" label={t('provenance')} list="provenances" component={BulmaField}/>
              <datalist id="provenances">
                {allKnownProvenances.map(({englishName}) => <option key={englishName} value={englishName}/>)}
              </datalist>

              <Field type="number" name="cthClassification" id="cthClassification" label={t('(proposed)CthClassification')} component={BulmaField}/>

              <Field name="bibliography" id="bibliography" label={t('bibliography')} component={BulmaField} asTextArea={true}/>

              {error && <div className="notification is-danger has-text-centered">{error.message}</div>}

              <div className="field">
                <button type="submit" disabled={loading || !!createdManuscript}
                        className={classNames('button', 'is-link', 'is-fullwidth', {'is-loading': loading})}>
                  {t('createManuscript')}
                </button>
              </div>

            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
