import React from 'react';
import {useTranslation} from 'react-i18next';
import {IoSettingsOutline} from 'react-icons/io5';
import {LetteredAnalysisOptionButton} from './LetteredAnalysisOptionButton';
import {MultiMorphAnalysisOptionButtons} from './MultiMorphAnalysisOptionButton';
import {SingleMorphAnalysisOptionButton} from './SingleMorphAnalysisOptionButton';
import {MorphologicalAnalysis} from '../../model/morphologicalAnalysis';


interface IProps {
  morphologicalAnalysis: MorphologicalAnalysis;

  toggleOrSetAnalysisSelection: (letter?: string, value?: boolean) => void;
  toggleEncliticsSelection: (letter: string) => void;

  initiateUpdate: () => void;
}

export function MorphAnalysisOptionButtons(
  {morphologicalAnalysis, toggleOrSetAnalysisSelection, toggleEncliticsSelection, initiateUpdate}: IProps
): JSX.Element {

  const {number, translation, referenceWord, paradigmClass, encliticsAnalysis, determinativ} = morphologicalAnalysis;

  const {t} = useTranslation('common');

  const isSingleAnalysisOption = 'analysis' in morphologicalAnalysis;

  return (
    <div className="my-5">
      <h2 className="is-size-5 my-3">
        {number}) {translation} ({referenceWord}, {t('paradigmClass')}: <code>{paradigmClass}</code>
        {determinativ && <span>, {t('determinativ')}: <code>{determinativ}</code></span>})&nbsp;
        {!isSingleAnalysisOption && <button className="button" onClick={initiateUpdate}><IoSettingsOutline/></button>}
      </h2>

      {isSingleAnalysisOption
        ? <SingleMorphAnalysisOptionButton morphAnalysis={morphologicalAnalysis} toggleAnalysisSelection={toggleOrSetAnalysisSelection}
                                           initiateUpdate={initiateUpdate} initiateJumpElement={(forward) => void 0}/>
        : <MultiMorphAnalysisOptionButtons morphAnalysis={morphologicalAnalysis} toggleAnalysisSelection={toggleOrSetAnalysisSelection}
                                           initiateUpdate={initiateUpdate} initiateJumpElement={(forward) => void 0}/>
      }

      {encliticsAnalysis && 'analysisOptions' in encliticsAnalysis && <div className="columns">
        {encliticsAnalysis.analysisOptions.map((ao) => <div className="column" key={ao.letter}>
          <LetteredAnalysisOptionButton ao={ao} select={() => toggleEncliticsSelection(ao.letter)}/>
        </div>)}
      </div>}

      {encliticsAnalysis && 'analysis' in encliticsAnalysis && <div className="box has-text-centered">
        {encliticsAnalysis && <span>{t('encliticsAnalysis')}: <code>{encliticsAnalysis.enclitics}</code> @ <code>{encliticsAnalysis.analysis}</code></span>}
      </div>}
    </div>
  );
}
