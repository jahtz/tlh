import {Field, FieldArray, Form, Formik} from 'formik';
import {isMultiMorphologicalAnalysis, MorphologicalAnalysis} from '../../model/morphologicalAnalysis';
import {isMultiEncliticsAnalysis, MultiEncliticsAnalysis} from '../../model/encliticsAnalysis';
import {LetteredAnalysisOption, SelectableLetteredAnalysisOption} from '../../model/analysisOptions';
import {LetteredAnalysisOptionEditor} from './LetteredAnalysisOptionEditor';
import {useTranslation} from 'react-i18next';

interface IProps {
  morphologicalAnalysis: MorphologicalAnalysis;
  onSubmit: (ma: MorphologicalAnalysis) => void;
  cancelUpdate: () => void;
}

const lowerAlphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

const upperAlphabet = 'RSTUVWXYZ'.split('');

function nextAnalysisOption(laos: LetteredAnalysisOption[], alphabet: string[]): SelectableLetteredAnalysisOption {
  const usedLetters = laos.map(({letter}) => letter);

  const letter = alphabet.find((l) => !usedLetters.includes(l));

  if (!letter) {
    throw new Error('All letters are used!');
  }

  return {letter, analysis: '', selected: false};
}


export function MorphAnalysisOptionEditor({morphologicalAnalysis, onSubmit, cancelUpdate}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <Formik initialValues={morphologicalAnalysis} onSubmit={onSubmit}>
      {({values}) => <Form>

        <div className="flex flex-row">
          <div className="px-4 py-2 rounded-l bg-gray-100 border-l border-y border-slate-500">{morphologicalAnalysis.number}</div>

          <Field name="translation" className="flex-grow p-2 border border-slate-500" placeholder={t('translation')}/>

          <Field name="referenceWord" className="flex-grow p-2 border-r border-y border-slate-500" placeholder={t('referenceWord')}/>

          <Field name="determinative" className="flex-1 p-2 border-r border-y border-slate-500" placeholder={t('determinative')}/>

          <Field name="paradigmClass" className="flex-1 p-2 rounded-r border-r border-y border-slate-500" placeholder={t('paradigmClass')}/>
        </div>

        {isMultiMorphologicalAnalysis(values) && <FieldArray name="analysisOptions">
          {(arrayHelpers) => <div>

            {(values.analysisOptions as LetteredAnalysisOption[]).map(({letter}, index) =>
              <LetteredAnalysisOptionEditor key={letter} preName="analysisOptions" letter={letter} index={index} arrayHelpers={arrayHelpers}/>
            )}

            <button type="button" className="mt-2 px-4 py-2 rounded bg-teal-500 text-white"
                    onClick={() => arrayHelpers.push(nextAnalysisOption(values.analysisOptions, lowerAlphabet))}>
              + {t('newMorphAnalysisOption')}
            </button>
          </div>}

        </FieldArray>}

        {(values.encliticsAnalysis !== undefined && isMultiEncliticsAnalysis(values.encliticsAnalysis)) && <FieldArray name="encliticsAnalysis.analysisOptions">
          {(arrayHelpers) => <div>
            {/* FIXME: edit enclitics! */}

            {(values.encliticsAnalysis as MultiEncliticsAnalysis).analysisOptions.map(({letter}, index) =>
              <LetteredAnalysisOptionEditor key={index} preName="encliticsAnalysis.analysisOptions" letter={letter} index={index} arrayHelpers={arrayHelpers}/>
            )}

            <button type="button" className="mt-2 px-4 py-2 rounded bg-teal-500 text-white"
                    onClick={() => arrayHelpers.push(nextAnalysisOption((values.encliticsAnalysis as MultiEncliticsAnalysis).analysisOptions, upperAlphabet))}>
              + {t('newEncliticsAnalysisOption')}
            </button>
          </div>}
        </FieldArray>}

        <div className="mt-2">
          <button type="button" className="px-4 py-2 rounded bg-amber-400" onClick={cancelUpdate}>{t('cancelEdit')}</button>
          <button type="submit" className="ml-2 px-4 py-2 rounded bg-blue-600 text-white">{t('updateAnalyses')}</button>
        </div>
      </Form>}
    </Formik>
  );
}