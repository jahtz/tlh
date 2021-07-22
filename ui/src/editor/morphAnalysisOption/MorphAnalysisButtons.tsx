import React from 'react';
import {useTranslation} from 'react-i18next';
import {isSingleMorphologicalAnalysis} from '../../model/morphologicalAnalysis';
import {MorphAnalysisButton} from './MorphAnalysisButton';
import {MorphAnalysisOptionIProps, Numerus} from './MorphologicalAnalysisOption';

export function MorphAnalysisOptionButtons({ma, selectedOption, selectAll, updateSelected}: MorphAnalysisOptionIProps): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <>

      {isSingleMorphologicalAnalysis(ma)
        ? <div className="my-3">
          <MorphAnalysisButton identifier={{num: ma.number}} analysis={ma.analysis} select={updateSelected} selectedOption={selectedOption}/>
        </div>
        : <>
          <div className="columns is-multiline">
            {ma.analyses.map(({letter, analysis}, index) =>
              <div key={index} className="column is-one-third-desktop">
                <MorphAnalysisButton identifier={{num: ma.number, letter}} analysis={analysis} select={updateSelected} selectedOption={selectedOption}/>
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

      {ma.other.length > 0 && <div className="box has-text-centered">{ma.other.join(' @ ')}</div>}

    </>
  );
}
