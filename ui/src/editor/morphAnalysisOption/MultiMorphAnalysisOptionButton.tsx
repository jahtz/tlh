import React from 'react';
import {MultiMorphologicalAnalysis} from '../../model/morphologicalAnalysis';
import {useTranslation} from 'react-i18next';
import {Numerus} from './MorphologicalAnalysisOption';
import {analysisIsInNumerus} from '../WordNodeEditor';
import {LetteredAnalysisOptionButton} from './LetteredAnalysisOptionButton';
import {UpdatePrevNextButtons, UpdatePrevNextButtonsProps} from './UpdatePrevNextButtons';

interface IProps extends UpdatePrevNextButtonsProps {
  morphAnalysis: MultiMorphologicalAnalysis;

  toggleAnalysisSelection: (letter?: string, value?: boolean) => void;
}

export function MultiMorphAnalysisOptionButtons({morphAnalysis, toggleAnalysisSelection, initiateUpdate, initiateJumpElement}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  function selectAll(numerus?: Numerus): void {
    morphAnalysis
      .analysisOptions
      .filter(({analysis}) => !numerus || analysisIsInNumerus(analysis, numerus))
      .map(({letter}) => letter)
      .forEach((letter) => toggleAnalysisSelection(letter, true));
  }

  return (
    <div className="columns">
      <div className="column is-one-third-desktop">
        {morphAnalysis.analysisOptions.map((ao, index) =>
          <div key={index} className="mb-1">
            <LetteredAnalysisOptionButton ao={ao} select={() => toggleAnalysisSelection(ao.letter)}/>
          </div>
        )}
      </div>

      <div className="column is-one-third-desktop">
        <div className="mb-1">
          <button type="button" className="button is-warning is-fullwidth" onClick={() => selectAll()}>{t('selectAll')}</button>
        </div>
        <div className="mb-1">
          <button type="button" className="button is-warning is-fullwidth" onClick={() => selectAll(Numerus.Singular)}>{t('selectAllSingular')}</button>
        </div>
        <div className="mb-1">
          <button type="button" className="button is-warning is-fullwidth" onClick={() => selectAll(Numerus.Plural)}>{t('selectAllPlural')}</button>
        </div>
      </div>

      <div className="column">
        <UpdatePrevNextButtons initiateUpdate={initiateUpdate} initiateJumpElement={initiateJumpElement}/>
      </div>
    </div>
  );
}
