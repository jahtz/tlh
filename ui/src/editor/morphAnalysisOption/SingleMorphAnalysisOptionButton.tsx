import React from 'react';
import classNames from 'classnames';
import {SingleMorphologicalAnalysis} from '../../model/morphologicalAnalysis';
import {UpdatePrevNextButtons, UpdatePrevNextButtonsProps} from './UpdatePrevNextButtons';

interface IProps extends UpdatePrevNextButtonsProps {
  morphAnalysis: SingleMorphologicalAnalysis;

  toggleAnalysisSelection: (letter?: string, value?: boolean) => void;
}

export function SingleMorphAnalysisOptionButton({morphAnalysis, toggleAnalysisSelection, initiateUpdate, initiateJumpElement}: IProps): JSX.Element {

  return (
    <>
      <button className={classNames('button', 'is-fullwidth', 'button-text-left', {'is-link': morphAnalysis.selected})}
              onClick={() => toggleAnalysisSelection()}>
        {morphAnalysis.number} - {morphAnalysis.analysis}
      </button>

      <div className="mt-2">
        <UpdatePrevNextButtons initiateUpdate={initiateUpdate} initiateJumpElement={initiateJumpElement}/>
      </div>
    </>
  );
}