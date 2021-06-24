import classNames from 'classnames';
import {MorphologicalAnalysis} from '../model/morphologicalAnalysis';
import React, {MouseEvent} from 'react';
import {isSelected, SelectedAnalysisOption} from './selectedAnalysisOption';

interface MorphAnalysisButtonIProps {
  identifier: SelectedAnalysisOption;
  analysis: string;
  selectedOption: SelectedAnalysisOption[];
  select: (s: SelectedAnalysisOption, ctrl: boolean) => void;
}

function MorphAnalysisButton({identifier, analysis, selectedOption, select}: MorphAnalysisButtonIProps): JSX.Element {

  const classes = classNames('button', 'is-fullwidth', 'button-text-left', {'is-link': isSelected(identifier, selectedOption)});

  function updateSelected(event: MouseEvent<HTMLButtonElement>): void {
    select(identifier, event.ctrlKey);
  }

  return <button onClick={updateSelected} className={classes}>{identifier.num}{identifier.letter} - {analysis}</button>;
}

interface MorphAnalysisOptionIProps {
  ma: MorphologicalAnalysis;
  selectedOption: SelectedAnalysisOption[];
  updateSelected: (s: SelectedAnalysisOption, ctrl: boolean) => void;
}

export function MorphAnalysisOption({ma, selectedOption, updateSelected}: MorphAnalysisOptionIProps): JSX.Element {

  const {number, translation, transcription, analyses, other} = ma;

  return (
    <div className="my-3">
      <h2 className="subtitle is-5">{number}) {translation} ({transcription})</h2>

      <div className="columns is-multiline">
        {typeof analyses === 'string'
          ? <div className="column is-fullwidth">
            <MorphAnalysisButton identifier={{num: number}} analysis={analyses} select={updateSelected} selectedOption={selectedOption}/>
          </div>
          : analyses.map(({letter, analysis}, index) =>
            <div key={index} className="column is-one-third-desktop">
              <MorphAnalysisButton identifier={{num: number, letter}} analysis={analysis} select={updateSelected} selectedOption={selectedOption}/>
            </div>
          )}
      </div>

      <div className="box has-text-centered">{other.join(' @ ')}</div>
    </div>
  );
}
