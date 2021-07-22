import {Field, FieldArray, Form, Formik} from 'formik';
import React from 'react';
import {isSingleMorphologicalAnalysis, LetteredMorphologicalAnalysis, MorphologicalAnalysis} from '../../model/morphologicalAnalysis';
import {AnalysisOption} from '../../model/analysisOptions';
import {useTranslation} from 'react-i18next';

interface IProps {
  ma: MorphologicalAnalysis;
  update: (newMa: MorphologicalAnalysis) => void;
}

const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

export function MorphAnalysisEditor({ma, update}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  function nextAnalysisOption(lma: LetteredMorphologicalAnalysis): AnalysisOption {
    const usedLetters = lma.analyses.map(({letter}) => letter);

    const letter = alphabet.find((l) => !usedLetters.includes(l));

    if (!letter) {
      throw new Error('All letters are used!');
    }

    return {type: 'AnalysisOption', letter, analysis: ''};
  }

  if (isSingleMorphologicalAnalysis(ma)) {
    // TODO: disabled until further notice...
    return <div className="notification is-warning has-text-centered">This should be disabled and not selectable...</div>;
  } else {

    return (
      <Formik initialValues={ma} onSubmit={update}>
        {({values}) =>
          <Form>
            <FieldArray name={'analyses'}>
              {(arrayHelpers) =>
                <div>

                  {values.analyses.map(({letter}, index) =>
                    <div className="field has-addons" key={letter}>
                      <div className="control">
                        <button className="button is-static">{letter}</button>
                      </div>
                      <div className="control is-expanded">
                        <Field name={`analyses.${index}.analysis`} className="input"/>
                      </div>
                      <div className="control">
                        <button type="button" className="button is-danger" onClick={() => arrayHelpers.remove(index)}>-</button>
                      </div>
                    </div>
                  )}

                  {/* TODO: edit other content of Morphological Analysis, too...
                <div className="field has-addons">
                  <div className="control">
                    <button className="button is-static">+</button>
                  </div>
                  <div className="control is-expanded">
                    <Field className="input" name="other"/>
                  </div>
                </div>
                */}

                  <div className="buttons">
                    <button type="button" className="button is-link" onClick={() => arrayHelpers.push(nextAnalysisOption(values))}>+</button>
                    <button type="submit" className="button">{t('updateAnalyses')}</button>
                  </div>
                </div>
              }

            </FieldArray>
          </Form>
        }
      </Formik>
    );
  }
}