import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {IoSettingsOutline} from 'react-icons/io5';
import {MultiMorphAnalysisSelection} from './MultiMorphAnalysisSelection';
import {SingleMorphAnalysisOptionButton} from './SingleMorphAnalysisOptionButton';
import {MorphologicalAnalysis, MultiMorphologicalAnalysis} from '../../model/morphologicalAnalysis';
import {Numerus} from './MorphAnalysisOptionContainer';
import {LetteredAnalysisOptionButtons} from './LetteredAnalysisOptionButtons';
import classNames from 'classnames';


interface IProps {
  morphologicalAnalysis: MorphologicalAnalysis;
  toggleAnalysisSelection: (index?: number) => void;
  toggleEncliticsSelection: (index: number) => void;
  enableEditMode: () => void;
}


export function analysisIsInNumerus(analysis: string, numerus: Numerus): boolean {
  return analysis.includes(numerus) || analysis.includes('ABL') || analysis.includes('INS') || analysis.includes('ALL');
}


const buttonClasses = 'p-2 mt-1 rounded border border-teal-300 w-full';

export function MorphAnalysisOptionButtons({
  morphologicalAnalysis,
  toggleAnalysisSelection,
  toggleEncliticsSelection,
  enableEditMode
}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [isReduced, setIsReduced] = useState(false);

  const {number, translation, referenceWord, paradigmClass, encliticsAnalysis, determinativ} = morphologicalAnalysis;
  const isSingleAnalysisOption = 'analysis' in morphologicalAnalysis;

  function selectAll(ma: MultiMorphologicalAnalysis, numerus?: Numerus): void {
    ma.analysisOptions
      .forEach(({analysis}, index) => {
        if (!numerus || analysisIsInNumerus(analysis, numerus)) {
          toggleAnalysisSelection(index);
        }
      });
  }

  return (
    <div>
      <div className="my-2">
        <div className="flex flex-row">
          <button onClick={() => setIsReduced((value) => !value)} className="p-2 rounded-l border-l border-y border-slate-500 font-bold text-lg">
            {isReduced ? <span>&gt;</span> : <span>&or;</span>}
          </button>
          <div className={classNames('flex-grow', 'p-2', 'border', 'border-slate-500', 'bg-gray-100', {'rounded-r': isSingleAnalysisOption})}>
            &nbsp;
            {number})&nbsp;<span className="text-red-600">{translation}</span>&nbsp;({referenceWord},
            {t('paradigmClass')}:&nbsp;<span className="text-red-600">{paradigmClass}</span>
            {determinativ && <span>, {t('determinativ')}:&nbsp;<span className="text-red-600">{determinativ}</span></span>})&nbsp;
          </div>
          {!isSingleAnalysisOption &&
            <button className="p-2 rounded-r border-r border-y border-slate-500" onClick={enableEditMode}><IoSettingsOutline/></button>}
        </div>
      </div>

      {!isReduced && <>
        {!isSingleAnalysisOption && <MultiMorphAnalysisSelection ma={morphologicalAnalysis}/>}

        <div className="grid grid-cols-3 gap-2">
          <div className={classNames({'col-span-2': !encliticsAnalysis || 'analysis' in encliticsAnalysis})}>
            {isSingleAnalysisOption
              ? <SingleMorphAnalysisOptionButton morphAnalysis={morphologicalAnalysis} toggleAnalysisSelection={() => toggleAnalysisSelection(undefined)}/>
              : <LetteredAnalysisOptionButtons analysisOptions={morphologicalAnalysis.analysisOptions} toggleAnalysisSelection={toggleAnalysisSelection}/>
            }

          </div>

          {encliticsAnalysis && 'analysisOptions' in encliticsAnalysis &&
            <LetteredAnalysisOptionButtons analysisOptions={encliticsAnalysis.analysisOptions} toggleAnalysisSelection={toggleEncliticsSelection}/>}

          <div>
            {!isSingleAnalysisOption && <>
              <button type="button" className={buttonClasses} onClick={() => selectAll(morphologicalAnalysis)} tabIndex={-1}>
                {t('selectAll')}
              </button>
              <button type="button" className={buttonClasses} onClick={() => selectAll(morphologicalAnalysis, Numerus.Singular)} tabIndex={-1}>
                {t('selectAllSingular')}
              </button>
              <button type="button" className={buttonClasses} onClick={() => selectAll(morphologicalAnalysis, Numerus.Plural)} tabIndex={-1}>
                {t('selectAllPlural')}
              </button>
            </>}
          </div>
        </div>

        {encliticsAnalysis && 'analysis' in encliticsAnalysis && <div className="mt-2 p-2 text-center rounded border border-slate-300 shadow-md">
          <span>{t('encliticsAnalysis')}: <code className="text-red-600">{encliticsAnalysis.enclitics}</code> @ <code
            className="text-red-600">{encliticsAnalysis.analysis}</code></span>
        </div>}
      </>}
    </div>
  );
}
