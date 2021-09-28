import {Field, FieldArray, Form, Formik} from 'formik';
import React from 'react';
import {MorphologicalAnalysis, MultiMorphologicalAnalysis} from '../../model/morphologicalAnalysis';
import {LetteredAnalysisOption} from '../../model/analysisOptions';
import {useTranslation} from 'react-i18next';
import {IoSettingsOutline} from 'react-icons/io5';

interface IProps {
  ma: MorphologicalAnalysis;
  update: (newMa: MorphologicalAnalysis) => void;
  toggleUpdate: () => void;
}

const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

export function MorphAnalysisEditor({ma, update, toggleUpdate}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  function nextAnalysisOption(lma: MultiMorphologicalAnalysis): LetteredAnalysisOption {
    const usedLetters = lma.analysisOptions.map(({letter}) => letter);

    const letter = alphabet.find((l) => !usedLetters.includes(l));

    if (!letter) {
      throw new Error('All letters are used!');
    }

    return {letter, analysis: '', selected: false};
  }

  if ('analysis' in ma) {
    // TODO: disabled until further notice...
    return <div className="notification is-warning has-text-centered">This should be disabled and not selectable...</div>;
  }

  // FIXME: validationSchema for morphological analysis?!

  return (
    <Formik initialValues={ma} onSubmit={update}>
      {({values}) =>
        <Form>
          <div className="field has-addons">
            <div className="control">
              <button type="button" className="button is-static">{ma.number}</button>
            </div>
            <div className="control is-expanded">
              <Field name="translation" className="input" placeholder={t('translation')}/>
            </div>
            <div className="control is-expanded">
              <Field name="referenceWord" className="input" placeholder={t('referenceWord')}/>
            </div>
            <div className="control ">
              <Field name="paradigmClass" className="input" placeholder={t('paradigmClass')}/>
            </div>
            <div className="control">
              <button type="button" className="button" onClick={toggleUpdate}><IoSettingsOutline/></button>
            </div>
          </div>

          <FieldArray name={'analysisOptions'}>
            {(arrayHelpers) =>
              <div>

                {(values.analysisOptions as LetteredAnalysisOption[]).map(({letter}, index) =>
                  <div className="field has-addons" key={letter}>
                    <div className="control">
                      <button className="button is-static">{letter}</button>
                    </div>
                    <div className="control is-expanded">
                      <Field name={`analysisOptions.${index}.analysis`} className="input" placeholder={t('analysis')}/>
                    </div>
                    <div className="control">
                      <button type="button" className="button is-danger" onClick={() => arrayHelpers.remove(index)}>-</button>
                    </div>
                  </div>
                )}

                <div className="buttons">
                  <button type="button" className="button is-primary" onClick={() => arrayHelpers.push(nextAnalysisOption(values))}>+</button>
                  <button type="button" className="button is-warning" onClick={toggleUpdate}>{t('cancelEdit')}</button>
                  <button type="submit" className="button is-link">{t('updateAnalyses')}</button>
                </div>
              </div>
            }

          </FieldArray>
        </Form>
      }
    </Formik>
  );
}