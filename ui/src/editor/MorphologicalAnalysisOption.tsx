import classNames from 'classnames';
import {isSingleMorphologicalAnalysis, MorphologicalAnalysis} from '../model/morphologicalAnalysis';
import React, {MouseEvent} from 'react';
import {isSelected, SelectedAnalysisOption} from './selectedAnalysisOption';
import {useTranslation} from 'react-i18next';

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
  selectAll: (numerus?: Numerus) => void;
}

export enum Numerus {
  Singular = 'SG', Plural = 'PL'
}

export function MorphAnalysisOption({ma, selectedOption, updateSelected, selectAll}: MorphAnalysisOptionIProps): JSX.Element {

  const {t} = useTranslation('common');

  const {number, translation, transcription, other} = ma;

  return (
    <div className="my-3">
      <h2 className="subtitle is-5">{number}) {translation} ({transcription})</h2>


      {isSingleMorphologicalAnalysis(ma)
        ? <div className="my-3">
          <MorphAnalysisButton identifier={{num: number}} analysis={ma.analysis} select={updateSelected} selectedOption={selectedOption}/>
        </div>
        : <>
          <div className="columns is-multiline">
            {ma.analyses.map(({letter, analysis}, index) =>
              <div key={index} className="column is-one-third-desktop">
                <MorphAnalysisButton identifier={{num: number, letter}} analysis={analysis} select={updateSelected} selectedOption={selectedOption}/>
              </div>
            )}
          </div>
          <div className="columns">
            <div className="column is-one-third-desktop">
              <button type="button" className="button is-warning is-fullwidth" onClick={() => selectAll()}>{t('selectAllFromNumber')}</button>
            </div>
            <div className="column is-one-third-desktop">
              <button type="button" className="button is-warning is-fullwidth"
                      onClick={() => selectAll(Numerus.Singular)}>{t('selectAllSingularFromNumber')}</button>
            </div>
            <div className="column is-one-third-desktop">
              <button type="button" className="button is-warning is-fullwidth"
                      onClick={() => selectAll(Numerus.Plural)}>{t('selectAllPluralFromNumber')}</button>
            </div>
          </div>
        </>
      }

      {other.length > 0 && <div className="box has-text-centered">{other.join(' @ ')}</div>}
    </div>
  );
}
