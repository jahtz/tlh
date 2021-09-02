import React from 'react';
import classNames from 'classnames';

interface IProps {
  identifier: string;
  analysis: string;
}

export function EncliticsAnalysisOptionButton({identifier, analysis}: IProps): JSX.Element {

  const isSelected = false;

  const classes = classNames('button', 'is-fullwidth', 'button-text-left', {'is-link': isSelected/*(identifier, selectedOption)*/});

  function updateSelected(): void {
    console.info('TODO!');
  }

  return <button type="button" onClick={updateSelected} className={classes} disabled>{identifier} - {analysis}</button>;

}