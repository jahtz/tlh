import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {SingleMorphAnalysisOptionButton} from './SingleMorphAnalysisOptionButton';
import {isSingleMorphologicalAnalysis, MorphologicalAnalysis, MultiMorphologicalAnalysis} from '../../model/morphologicalAnalysis';
import {Numerus} from './MorphAnalysisOptionContainer';
import classNames from 'classnames';
import {MultiMorphAnalysisOptionButtons} from './MultiMorphAnalysisOptionButtons';

interface IProps {
  morphologicalAnalysis: MorphologicalAnalysis;
  toggleAnalysisSelection: (letterIndex: number | undefined, encLetterIndex: number | undefined) => void;
  enableEditMode: () => void;
}

export function analysisIsInNumerus(analysis: string, numerus: Numerus): boolean {
  return analysis.includes(numerus) || analysis.includes('ABL') || analysis.includes('INS') || analysis.includes('ALL');
}

export function MorphAnalysisOptionButtons({morphologicalAnalysis, toggleAnalysisSelection, enableEditMode}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [isReduced, setIsReduced] = useState(false);

  const {number, translation, referenceWord, paradigmClass, determinativ} = morphologicalAnalysis;
  const isSingleAnalysisOption = isSingleMorphologicalAnalysis(morphologicalAnalysis);

  function selectAll(ma: MultiMorphologicalAnalysis, numerus?: Numerus): void {
    ma.analysisOptions
      .forEach(({analysis}, index) => {
        if (!numerus || analysisIsInNumerus(analysis, numerus)) {
          toggleAnalysisSelection(index, undefined);
        }
      });
  }

  return (
    <div className="mt-2">
      <div className="flex flex-row">
        <button onClick={() => setIsReduced((value) => !value)} className="p-2 rounded-l border-l border-y border-slate-500 font-bold text-lg">
          {isReduced ? <span>&gt;</span> : <span>&or;</span>}
        </button>

        <span className="p-2 border-l border-y border-slate-500">{number}</span>

        <div className={classNames('flex-grow', 'p-2', 'border', 'border-slate-500', 'bg-gray-100', {'rounded-r': isSingleAnalysisOption})}>
          <span className="text-red-600">{translation}</span>&nbsp;({referenceWord},&nbsp;
          {t('paradigmClass')}:&nbsp;<span className="text-red-600">{paradigmClass}</span>
          {determinativ && <span>, {t('determinativ')}:&nbsp;<span className="text-red-600">{determinativ}</span></span>})&nbsp;
        </div>

        {!isSingleAnalysisOption && <>
          <button type="button" className="p-2 border border-teal-300" onClick={() => selectAll(morphologicalAnalysis)} tabIndex={-1}>
            {t('ALL')}
          </button>
          <button type="button" className="p-2 border border-teal-300" onClick={() => selectAll(morphologicalAnalysis, Numerus.Singular)} tabIndex={-1}>
            {t('SG')}
          </button>
          <button type="button" className="p-2 border border-teal-300" onClick={() => selectAll(morphologicalAnalysis, Numerus.Plural)} tabIndex={-1}>
            {t('PL')}
          </button>
        </>}

        {!isSingleAnalysisOption &&
          /* FIXME: implement edit mode for single morph analysis! */
          <button type="button" className="p-2 rounded-r border border-slate-500" onClick={enableEditMode} title={t('editMorphologicalAnalyses')}>
            &#x2699;
          </button>}
      </div>

      {!isReduced && <div className="mt-2">
        {isSingleAnalysisOption
          ? <SingleMorphAnalysisOptionButton morphAnalysis={morphologicalAnalysis}
                                             toggleAnalysisSelection={(encLetterIndex) => toggleAnalysisSelection(undefined, encLetterIndex)}/>
          : <MultiMorphAnalysisOptionButtons morphAnalysis={morphologicalAnalysis}
                                             toggleAnalysisSelection={(letterIndex, encLetterIndex) => toggleAnalysisSelection(letterIndex, encLetterIndex)}/>}

      </div>}
    </div>
  );
}
