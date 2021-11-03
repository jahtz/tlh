import React from 'react';
import classNames from 'classnames';
import {LetteredAnalysisOption} from '../../model/analysisOptions';

interface IProps {
  analysisOptions: LetteredAnalysisOption[];
  toggleAnalysisSelection: (letter: string) => void;
}

export function LetteredAnalysisOptionButtons({analysisOptions, toggleAnalysisSelection}: IProps): JSX.Element {
  return (
    <>
      {analysisOptions.map(({letter, analysis, selected}, index) =>
        <div key={index} className="mb-1">
          <button type="button" className={classNames('button', 'is-fullwidth', 'button-text-left', {'is-link': selected})}
                  onClick={() => toggleAnalysisSelection(letter)}>
            {letter} - {analysis}
          </button>
        </div>
      )}
    </>
  );
}
