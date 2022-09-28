import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {SingleMorphAnalysisOptionButton} from './SingleMorphAnalysisOptionButton';
import {isSingleMorphologicalAnalysis, MorphologicalAnalysis, MultiMorphologicalAnalysis} from '../../model/morphologicalAnalysis';
import {CanToggleAnalysisSelection} from './MorphAnalysisOptionContainer';
import {MultiMorphAnalysisOptionButtons} from './MultiMorphAnalysisOptionButtons';
import classNames from 'classnames';

interface IProps extends CanToggleAnalysisSelection {
  morphologicalAnalysis: MorphologicalAnalysis;
  enableEditMode: () => void;
}

enum Numerus {
  Singular = 'SG', Plural = 'PL'
}

export function analysisIsInNumerus(analysis: string, numerus: Numerus): boolean {
  const firstAnalysisPart = analysis.includes('_')
    ? analysis.split('_')[0]
    : analysis;

  return firstAnalysisPart.includes(numerus) || firstAnalysisPart.includes('ABL') || firstAnalysisPart.includes('INS') || firstAnalysisPart.includes('ALL');
}

export function MorphAnalysisOptionButtons({morphologicalAnalysis, toggleAnalysisSelection, enableEditMode}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [isReduced, setIsReduced] = useState(false);
  const [lastAllSelected, setLastAllSelected] = useState<Numerus>();

  const {number, translation, referenceWord, paradigmClass, determinative} = morphologicalAnalysis;
  const isSingleAnalysisOption = isSingleMorphologicalAnalysis(morphologicalAnalysis);

  function selectAll(ma: MultiMorphologicalAnalysis, numerus?: Numerus): void {

    const targetState = lastAllSelected !== undefined
      ? lastAllSelected !== numerus
      : undefined;

    setLastAllSelected((current) => current === numerus ? undefined : numerus);

    ma.analysisOptions
      .forEach(({analysis}, index) => {
        if (!numerus || analysisIsInNumerus(analysis, numerus)) {
          toggleAnalysisSelection(index, undefined, targetState);
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

        <div className="flex-grow p-2 border-l border-y border-slate-500 bg-gray-100">
          <span className="text-red-600">{translation}</span>&nbsp;({referenceWord},&nbsp;
          {t('paradigmClass')}:&nbsp;<span className="text-red-600">{paradigmClass}</span>
          {determinative && <span>, {t('determinative')}:&nbsp;<span className="text-red-600">{determinative}</span></span>})&nbsp;
        </div>

        {!isSingleAnalysisOption && <>
          <button type="button" className={classNames('p-2', 'border', 'border-teal-300')} onClick={() => selectAll(morphologicalAnalysis)} tabIndex={-1}>
            {t('all')}
          </button>
          <button type="button" className={classNames('p-2', 'border', 'border-teal-300', {'bg-teal-300': lastAllSelected === Numerus.Singular})}
                  onClick={() => selectAll(morphologicalAnalysis, Numerus.Singular)} tabIndex={-1}>
            {t('SG')}
          </button>
          <button type="button" className={classNames('p-2', 'border', 'border-teal-300', {'bg-teal-300': lastAllSelected === Numerus.Plural})}
                  onClick={() => selectAll(morphologicalAnalysis, Numerus.Plural)} tabIndex={-1}>
            {t('PL')}
          </button>
        </>}

        <button type="button" className="p-2 rounded-r border border-slate-500" onClick={enableEditMode} title={t('editMorphologicalAnalyses')}>
          &#x2699;
        </button>
      </div>

      {!isReduced && <div className="mt-2">
        {isSingleAnalysisOption
          ? <SingleMorphAnalysisOptionButton morphAnalysis={morphologicalAnalysis}
                                             toggleAnalysisSelection={(encLetterIndex) => toggleAnalysisSelection(undefined, encLetterIndex, undefined)}/>
          : <MultiMorphAnalysisOptionButtons morphAnalysis={morphologicalAnalysis}
                                             toggleAnalysisSelection={(letterIndex, encLetterIndex) => toggleAnalysisSelection(letterIndex, encLetterIndex, undefined)}/>}

      </div>}
    </div>
  );
}
