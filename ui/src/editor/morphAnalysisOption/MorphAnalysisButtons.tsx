import React from 'react';
import {useTranslation} from 'react-i18next';
import {IoSettingsOutline} from 'react-icons/io5';
import {MultiMorphAnalysisOptionButtons, MultiMorphAnalysisSelection} from './MultiMorphAnalysisOptionButton';
import {SingleMorphAnalysisOptionButton} from './SingleMorphAnalysisOptionButton';
import {MorphologicalAnalysis, MultiMorphologicalAnalysis} from '../../model/morphologicalAnalysis';
import {UpdatePrevNextButtons, UpdatePrevNextButtonsProps} from './UpdatePrevNextButtons';
import {Numerus} from './MorphologicalAnalysisOption';
import {analysisIsInNumerus} from '../WordNodeEditor';


interface IProps extends UpdatePrevNextButtonsProps {
  morphologicalAnalysis: MorphologicalAnalysis;

  toggleAnalysisSelection: (letter?: string) => void;
  toggleEncliticsSelection: (letter: string) => void;
}

export function MorphAnalysisOptionButtons(
  {morphologicalAnalysis, toggleAnalysisSelection, toggleEncliticsSelection, initiateUpdate, initiateJumpElement}: IProps
): JSX.Element {

  const {number, translation, referenceWord, paradigmClass, encliticsAnalysis, determinativ} = morphologicalAnalysis;

  const {t} = useTranslation('common');

  const isSingleAnalysisOption = 'analysis' in morphologicalAnalysis;

  function selectAll(ma: MultiMorphologicalAnalysis, numerus?: Numerus): void {
    ma.analysisOptions
      .filter(({analysis}) => !numerus || analysisIsInNumerus(analysis, numerus))
      .map(({letter}) => letter)
      .forEach((letter) => toggleAnalysisSelection(letter));
  }


  return (
    <>
      <h2 className="is-size-5 my-2">
        {number}) {translation} ({referenceWord}, {t('paradigmClass')}: <code>{paradigmClass}</code>
        {determinativ && <span>, {t('determinativ')}: <code>{determinativ}</code></span>})&nbsp;
        {!isSingleAnalysisOption && <button className="button" onClick={initiateUpdate}><IoSettingsOutline/></button>}
      </h2>

      {!isSingleAnalysisOption && <MultiMorphAnalysisSelection ma={morphologicalAnalysis}/>}

      <div className="columns">
        <div className="column">
          {isSingleAnalysisOption
            ? <SingleMorphAnalysisOptionButton morphAnalysis={morphologicalAnalysis} toggleAnalysisSelection={() => toggleAnalysisSelection(undefined)}/>
            : <MultiMorphAnalysisOptionButtons analysisOptions={morphologicalAnalysis.analysisOptions} toggleAnalysisSelection={toggleAnalysisSelection}/>
          }

        </div>
        {encliticsAnalysis && 'analysisOptions' in encliticsAnalysis && <div className="column">
          <MultiMorphAnalysisOptionButtons analysisOptions={encliticsAnalysis.analysisOptions} toggleAnalysisSelection={toggleEncliticsSelection}/>
        </div>}
        <div className="column is-one-third">
          <UpdatePrevNextButtons initiateUpdate={initiateUpdate} initiateJumpElement={initiateJumpElement}/>

          {!isSingleAnalysisOption && <>
            <div className="mb-1">
              <button type="button" className="button is-outlined is-primary is-fullwidth"
                      onClick={() => selectAll(morphologicalAnalysis)}>{t('selectAll')}</button>
            </div>
            <div className="mb-1">
              <button type="button" className="button is-outlined is-primary is-fullwidth" onClick={() => selectAll(morphologicalAnalysis, Numerus.Singular)}>
                {t('selectAllSingular')}
              </button>
            </div>
            <div className="mb-1">
              <button type="button" className="button is-outlined is-primary is-fullwidth" onClick={() => selectAll(morphologicalAnalysis, Numerus.Plural)}>
                {t('selectAllPlural')}
              </button>
            </div>
          </>}
        </div>
      </div>

      {encliticsAnalysis && 'analysis' in encliticsAnalysis && <div className="box has-text-centered">
        <span>{t('encliticsAnalysis')}: <code>{encliticsAnalysis.enclitics}</code> @ <code>{encliticsAnalysis.analysis}</code></span>
      </div>}
    </>
  );
}
