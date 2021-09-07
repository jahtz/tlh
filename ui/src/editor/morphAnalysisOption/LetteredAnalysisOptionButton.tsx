import React from 'react';
import classNames from 'classnames';

interface IProps {
  letter: string;
  analysis: string;
  isSelected: boolean;
  isPreSelected?: boolean;
  select: (multipleChoice: boolean) => void;
}

export function LetteredAnalysisOptionButton({letter, analysis, isSelected, isPreSelected, select}: IProps): JSX.Element {
  return (
    <button type="button" onClick={(event) => select(event.metaKey || event.ctrlKey)}
            className={classNames('button', 'is-fullwidth', 'button-text-left', {
              'is-link': isPreSelected || isSelected,
              'is-light': isPreSelected && !isSelected
            })}>
      {letter} - {analysis}
    </button>
  );
}