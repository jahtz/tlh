import {isMultiMorphologicalAnalysis, MorphologicalAnalysis, MultiMorphologicalAnalysis, SingleMorphologicalAnalysis} from '../../model/morphologicalAnalysis';
import {isMultiEncliticsAnalysis, MultiEncliticsAnalysis} from '../../model/encliticsAnalysis';
import {LetteredAnalysisOption, SelectableLetteredAnalysisOption} from '../../model/analysisOptions';
import {useTranslation} from 'react-i18next';
import {useState} from 'react';
import {convertSingleMorphAnalysisToMultiMorphAnalysis} from '../../model/morphologicalAnalysisConverter';
import update from 'immutability-helper';

interface IProps {
  initialMorphologicalAnalysis: MorphologicalAnalysis;
  onSubmit: (ma: MorphologicalAnalysis) => void;
  cancelUpdate: () => void;
}

const lowerAlphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
const upperAlphabet = 'RSTUVWXYZ'.split('');

function nextAnalysisOption(laos: LetteredAnalysisOption[], alphabet: string[] = lowerAlphabet): SelectableLetteredAnalysisOption {
  const usedLetters = laos.map(({letter}) => letter);

  const letter = alphabet.find((l) => !usedLetters.includes(l));

  if (!letter) {
    throw new Error('All letters are used!');
  }

  return {letter, analysis: '', selected: false};
}

export function MorphAnalysisOptionEditor({initialMorphologicalAnalysis, onSubmit, cancelUpdate}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [morphAnalysis, setMorphAnalysis] = useState(initialMorphologicalAnalysis);

  const setTranslation = (value: string): void => setMorphAnalysis((ma) => update(ma, {translation: {$set: value}}));
  const setReferenceWord = (value: string): void => setMorphAnalysis((ma) => update(ma, {referenceWord: {$set: value}}));
  const setDeterminativ = (value: string): void => setMorphAnalysis((ma) => update(ma, {determinative: {$set: value}}));
  const setParadigmClass = (value: string): void => setMorphAnalysis((ma) => update(ma, {paradigmClass: {$set: value}}));

  // FIXME: sort multi morph analysis option (and multi enclitica?!) by letter!

  const updateMultiMorphAnalysisOption = (index: number, value: string): void =>
    setMorphAnalysis((ma) => update(ma, {analysisOptions: {[index]: {analysis: {$set: value}}}}));
  const removeMultiMorphAnalysisOption = (index: number): void =>
    setMorphAnalysis((ma) => update(ma, {analysisOptions: {$splice: [[index, 1]]}}));
  const addMultiMorphAnalysisOption = (): void => {
    const nextAnalysisOpt = nextAnalysisOption((morphAnalysis as MultiMorphologicalAnalysis).analysisOptions, lowerAlphabet);

    setMorphAnalysis((ma) => update(ma, {analysisOptions: {$push: [nextAnalysisOpt]}}));
  };

  const convertToMultiAnalysisOption = (sma: SingleMorphologicalAnalysis): void => setMorphAnalysis(convertSingleMorphAnalysisToMultiMorphAnalysis(sma));

  const updateMultiEncliticsAnalysisOption = (index: number, value: string): void =>
    setMorphAnalysis((ma) => update(ma, {encliticsAnalysis: {analysisOptions: {[index]: {analysis: {$set: value}}}}}));
  const removeMultiEncliticsAnalysisOption = (index: number): void =>
    setMorphAnalysis((ma) => update(ma, {encliticsAnalysis: {analysisOptions: {$splice: [[index, 1]]}}}));
  const addMultiEnclicitsAnalysisOption = (): void => {
    const nextEncliticsAnalysisOption = nextAnalysisOption((morphAnalysis.encliticsAnalysis as MultiEncliticsAnalysis).analysisOptions, upperAlphabet);

    setMorphAnalysis((ma) => update(ma, {encliticsAnalysis: {analysisOptions: {$push: [nextEncliticsAnalysisOption]}}}));
  };

  // const convertToMultiEncliticsAnalysisOption = (): void => void 0;

  return (
    <div>
      <div className="flex flex-row">
        <div className="px-4 py-2 rounded-l bg-gray-100 border-l border-y border-slate-500">{morphAnalysis.number}</div>

        <input type="text" name="translation" defaultValue={morphAnalysis.translation} className="flex-grow p-2 border border-slate-500"
               placeholder={t('translation')} onChange={(event) => setTranslation(event.target.value)}/>

        <input type="text" name="referenceWord" defaultValue={morphAnalysis.referenceWord} className="flex-grow p-2 border-r border-y border-slate-500"
               placeholder={t('referenceWord')} onChange={(event) => setReferenceWord(event.target.value)}/>

        <input type="text" name="determinative" defaultValue={morphAnalysis.determinative} className="flex-1 p-2 border-r border-y border-slate-500"
               placeholder={t('determinative')} onChange={(event) => setDeterminativ(event.target.value)}/>

        <input type="text" name="paradigmClass" defaultValue={morphAnalysis.paradigmClass} className="flex-1 p-2 rounded-r border-r border-y border-slate-500"
               placeholder={t('paradigmClass')} onChange={(event) => setParadigmClass(event.target.value)}/>
      </div>

      {isMultiMorphologicalAnalysis(morphAnalysis)
        ? (
          <div>
            {morphAnalysis.analysisOptions.map(({letter, analysis}, index) =>
              <div key={letter} className="mt-2 flex flex-row">
                <div className="px-4 py-2 rounded-l bg-gray-100 border-l border-y border-slate-500">{letter}</div>
                <input type="text" defaultValue={analysis} className="flex-grow p-2 border-l border-y border-slate-500" placeholder={t('analysis')}
                       onChange={(event) => updateMultiMorphAnalysisOption(index, event.target.value)}/>
                <button type="button" className="px-4 py-2 rounded-r bg-red-500 text-white" onClick={() => removeMultiMorphAnalysisOption(index)}>-</button>
              </div>)}

            <button type="button" className="mt-2 px-4 py-2 rounded bg-teal-500 text-white" onClick={addMultiMorphAnalysisOption}>
              + {t('newMorphAnalysisOption')}
            </button>
          </div>
        )
        : (
          <button type="button" className="mt-2 px-4 py-2 block rounded bg-teal-500 text-white"
                  onClick={() => convertToMultiAnalysisOption(morphAnalysis)}>
            + {t('newMorphAnalysisOption')}
          </button>
        )}

      {morphAnalysis.encliticsAnalysis !== undefined &&
        (isMultiEncliticsAnalysis(morphAnalysis.encliticsAnalysis)
            ? (
              <div>
                {/* FIXME: edit enclitics! */}

                {morphAnalysis.encliticsAnalysis.analysisOptions.map(({letter, analysis}, index) =>
                  <div key={letter} className="mt-2 flex flex-row">
                    <div className="px-4 py-2 rounded-l bg-gray-100 border-l border-y border-slate-500">{letter}</div>
                    <input type="text" defaultValue={analysis} className="flex-grow p-2 border-l border-y border-slate-500" placeholder={t('analysis')}
                           onChange={(event) => updateMultiEncliticsAnalysisOption(index, event.target.value)}/>
                    <button type="button" className="px-4 py-2 rounded-r bg-red-500 text-white" onClick={() => removeMultiEncliticsAnalysisOption(index)}>
                      -
                    </button>
                  </div>
                )}

                <button type="button" className="mt-2 px-4 py-2 rounded bg-teal-500 text-white" onClick={addMultiEnclicitsAnalysisOption}>
                  + {t('newEncliticsAnalysisOption')}
                </button>
              </div>
            )
            : (
              <>
                {/*<button type="button" className="mt-2 px-4 py-2 block rounded bg-teal-500 text-white opacity-50" disabled
                        onClick={() => convertToMultiEncliticsAnalysisOption(morphAnalysis.encliticsAnalysis)}>
                  + {t('newEncliticsAnalysisOption')}
                </button>*/}
              </>
            )
        )}

      <div className="mt-2">
        <button type="button" className="px-4 py-2 rounded bg-amber-400" onClick={cancelUpdate}>{t('cancelEdit')}</button>
        <button type="submit" className="ml-2 px-4 py-2 rounded bg-blue-600 text-white" onClick={() => onSubmit(morphAnalysis)}>{t('updateAnalyses')}</button>
      </div>
    </div>
  );
}