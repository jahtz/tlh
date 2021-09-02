import React from 'react';
import {useTranslation} from 'react-i18next';
import {MorphAnalysisOptionButton} from './MorphAnalysisOptionButton';
import {MorphAnalysisOptionIProps, Numerus} from './MorphologicalAnalysisOption';
import {IoSettingsOutline} from 'react-icons/io5';
import {EncliticsAnalysisOptionButton} from './EncliticsAnalysisOptionButton';

interface IProps extends MorphAnalysisOptionIProps {
  toggleUpdate: () => void;
}

export function MorphAnalysisOptionButtons({ma, selectedOption, selectAll, updateSelected, toggleUpdate}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  const {number, translation, referenceWord, analysis, paradigmClass, encliticsAnalysis, determinativ} = ma;

  const isSingleAnalysisOption = typeof analysis === 'string';

  return (
    <>
      <h2 className="subtitle is-5">
        {number}) {translation} ({referenceWord})&nbsp;
        {!isSingleAnalysisOption && <button className="button" onClick={toggleUpdate}><IoSettingsOutline/></button>}
      </h2>

      {isSingleAnalysisOption
        ? <div className="my-3">
          <MorphAnalysisOptionButton identifier={{num: number}} analysis={analysis} select={updateSelected} selectedOption={selectedOption}/>
        </div>
        : <>
          <div className="columns is-multiline">
            {analysis.map(({letter, analysis}, index) =>
              <div key={index} className="column is-one-third-desktop">
                <MorphAnalysisOptionButton identifier={{num: number, letter}} analysis={analysis} select={updateSelected} selectedOption={selectedOption}/>
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

      {encliticsAnalysis && typeof encliticsAnalysis.analysis !== 'string' && <div className="columns">
        {encliticsAnalysis.analysis.map(({letter, analysis}) =>
          <div className="column" key={letter}>
            <EncliticsAnalysisOptionButton identifier={letter} analysis={analysis}/>
          </div>
        )}
      </div>}

      <div className="box has-text-centered">
        {t('paradigmClass')}: <code>{paradigmClass}</code>

        {determinativ && <span>, {t('determinativ')}: <code>{determinativ}</code></span>}

        {encliticsAnalysis && typeof encliticsAnalysis.analysis === 'string' &&
        <span>, {t('encliticsAnalysis')}: <code>{encliticsAnalysis.enclitics}</code> @ <code>{encliticsAnalysis.analysis}</code></span>
        }
      </div>
    </>
  );
}
