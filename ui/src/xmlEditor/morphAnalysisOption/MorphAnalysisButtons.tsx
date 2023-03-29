import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {SingleMorphAnalysisOptionButton} from './SingleMorphAnalysisOptionButton';
import {isSingleMorphologicalAnalysis, MorphologicalAnalysis, MultiMorphologicalAnalysis} from '../../model/morphologicalAnalysis';
import {CanToggleAnalysisSelection} from './MorphAnalysisOptionContainer';
import {MultiMorphAnalysisOptionButtons} from './MultiMorphAnalysisOptionButtons';
import classNames from 'classnames';
import {analysisIsInNumerus, numeri, NumerusOption, stringifyNumerus} from './numerusOption';

interface IProps extends CanToggleAnalysisSelection {
  morphologicalAnalysis: MorphologicalAnalysis;
  enableEditMode: () => void;
}

export function MorphAnalysisOptionButtons({morphologicalAnalysis, toggleAnalysisSelection, enableEditMode}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [isReduced, setIsReduced] = useState(false);
  const [lastNumerusSelected, setLastNumerusSelected] = useState<NumerusOption>();

  const {number, translation, referenceWord, paradigmClass, determinative} = morphologicalAnalysis;
  const isSingleAnalysisOption = isSingleMorphologicalAnalysis(morphologicalAnalysis);

  function selectAll(ma: MultiMorphologicalAnalysis, numerus: NumerusOption): void {
    const targetState: boolean = lastNumerusSelected === undefined || lastNumerusSelected !== numerus;

    setLastNumerusSelected((current) => current === numerus ? undefined : numerus);

    ma.analysisOptions.forEach(({letter, analysis}) => {
      if (numerus === undefined || analysisIsInNumerus(analysis, numerus)) {
        toggleAnalysisSelection(letter, undefined, targetState);
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
          {numeri.map((numerus) =>
            <button key={numerus} type="button" className={classNames('p-2', 'border', 'border-teal-300', {'bg-teal-300': lastNumerusSelected === numerus})}
                    onClick={() => selectAll(morphologicalAnalysis, numerus)} tabIndex={-1}>
              {stringifyNumerus(numerus, t)}
            </button>)}
        </>}

        <button type="button" className="p-2 rounded-r border border-slate-500" onClick={enableEditMode}
                title={t('editMorphologicalAnalyses') || 'editMorphologicalAnalyses'}>
          &#x2699;
        </button>
      </div>

      {!isReduced && <div className="mt-2">
        {isSingleAnalysisOption
          ? <SingleMorphAnalysisOptionButton morphAnalysis={morphologicalAnalysis}
                                             toggleAnalysisSelection={(encLetter) => toggleAnalysisSelection(undefined, encLetter, undefined)}/>
          : <MultiMorphAnalysisOptionButtons morphAnalysis={morphologicalAnalysis}
                                             toggleAnalysisSelection={(letter, encLetter) => toggleAnalysisSelection(letter, encLetter, undefined)}/>}

      </div>}
    </div>
  );
}
