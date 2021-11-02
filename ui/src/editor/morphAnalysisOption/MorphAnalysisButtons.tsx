import React from 'react';
import {useTranslation} from 'react-i18next';
import {IoSettingsOutline} from 'react-icons/io5';
import {LetteredAnalysisOptionButton} from './LetteredAnalysisOptionButton';
import {MultiMorphAnalysisOptionButtons} from './MultiMorphAnalysisOptionButton';
import {SingleMorphAnalysisOptionButton} from './SingleMorphAnalysisOptionButton';
import {MorphologicalAnalysis} from '../../model/morphologicalAnalysis';
import {UpdatePrevNextButtonsProps} from './UpdatePrevNextButtons';


interface IProps extends UpdatePrevNextButtonsProps {
  morphologicalAnalysis: MorphologicalAnalysis;

  toggleOrSetAnalysisSelection: (letter?: string, value?: boolean) => void;
  toggleEncliticsSelection: (letter: string) => void;
}

export function MorphAnalysisOptionButtons(
  {morphologicalAnalysis, toggleOrSetAnalysisSelection, toggleEncliticsSelection, initiateUpdate, initiateJumpElement}: IProps
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
        ? <SingleMorphAnalysisOptionButton morphAnalysis={morphologicalAnalysis}
                                           toggleAnalysisSelection={() => toggleOrSetAnalysisSelection(undefined, undefined)}
                                           initiateUpdate={initiateUpdate} initiateJumpElement={initiateJumpElement}/>
        : <MultiMorphAnalysisOptionButtons morphAnalysis={morphologicalAnalysis}
                                           toggleAnalysisSelection={(letter) => toggleOrSetAnalysisSelection(letter, true)}
                                           initiateUpdate={initiateUpdate} initiateJumpElement={initiateJumpElement}/>
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
