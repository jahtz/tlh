import React from 'react';
import classNames from 'classnames';
import {LetteredAnalysisOption} from '../../model/analysisOptions';

interface IProps {
  ao: LetteredAnalysisOption;
  select: () => void;
}

export function LetteredAnalysisOptionButton({ao: {letter, analysis, selected}, select}: IProps): JSX.Element {
  return (
    <button type="button" className={classNames('button', 'is-fullwidth', 'button-text-left', {'is-link': selected})} onClick={select}>
      {letter} - {analysis}
    </button>
  );
}