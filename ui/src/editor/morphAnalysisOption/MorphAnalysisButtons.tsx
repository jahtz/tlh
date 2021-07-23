import React from 'react';
import {useTranslation} from 'react-i18next';
import {isSingleMorphologicalAnalysis} from '../../model/morphologicalAnalysis';
import {MorphAnalysisButton} from './MorphAnalysisButton';
import {MorphAnalysisOptionIProps, Numerus} from './MorphologicalAnalysisOption';
import {IoSettingsOutline} from 'react-icons/io5';

interface IProps extends MorphAnalysisOptionIProps {
  toggleUpdate: () => void;
}

export function MorphAnalysisOptionButtons({ma, selectedOption, selectAll, updateSelected, toggleUpdate}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  const {number, translation, transcription} = ma;

  return (
    <>
      <h2 className="subtitle is-5">
        {number}) {translation} ({transcription})&nbsp;
        {!isSingleMorphologicalAnalysis(ma) && <button className="button" onClick={toggleUpdate}><IoSettingsOutline/></button>}
      </h2>

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

      {ma.other.length > 0 && <div className="box has-text-centered">{ma.other.join(' @ ')}</div>}

    </>
  );
}
