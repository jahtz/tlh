import {isSelected, SelectedAnalysisOption} from '../selectedAnalysisOption';
import classNames from 'classnames';
import React, {MouseEvent} from 'react';

interface IProps {
  identifier: SelectedAnalysisOption;
  analysis: string;
  selectedOption: SelectedAnalysisOption[];
  select: (s: SelectedAnalysisOption, ctrl: boolean) => void;
}

export function MorphAnalysisButton({identifier, analysis, selectedOption, select}: IProps): JSX.Element {

  const classes = classNames('button', 'is-fullwidth', 'button-text-left', {'is-link': isSelected(identifier, selectedOption)});

  function updateSelected(event: MouseEvent<HTMLButtonElement>): void {
    select(identifier, event.ctrlKey || event.metaKey);
  }

  return <button onClick={updateSelected} className={classes}>{identifier.num}{identifier.letter} - {analysis}</button>;
}