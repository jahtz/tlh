import React from 'react';
import {useTranslation} from 'react-i18next';
import {Numerus} from './MorphologicalAnalysisOption';
import {IoSettingsOutline} from 'react-icons/io5';
import {LetteredAnalysisOptionButton} from './LetteredAnalysisOptionButton';
import {MorphologicalAnalysis, MultiMorphologicalAnalysis} from '../../model/morphologicalAnalysis';
import classNames from 'classnames';
import {analysisIsInNumerus} from '../WordNodeEditor';

interface IProps {
  morphologicalAnalysis: MorphologicalAnalysis;

  toggleOrSetAnalysisSelection: (letter?: string, value?: boolean) => void;
  toggleEncliticsSelection: (letter: string) => void;

  toggleUpdate: () => void;
}

export function MorphAnalysisOptionButtons(
  {morphologicalAnalysis, toggleOrSetAnalysisSelection, toggleEncliticsSelection/*, selectAll*/, toggleUpdate}: IProps
): JSX.Element {

  const {number, translation, referenceWord, paradigmClass, encliticsAnalysis, determinativ} = morphologicalAnalysis;

  const {t} = useTranslation('common');

  const isSingleAnalysisOption = 'analysis' in morphologicalAnalysis;

  function selectAll(numerus?: Numerus): void {
    (morphologicalAnalysis as MultiMorphologicalAnalysis)
      .analysisOptions
      .filter(({analysis}) => !numerus || analysisIsInNumerus(analysis, numerus))
      .map(({letter}) => letter)
      .forEach((letter) => toggleOrSetAnalysisSelection(letter, true));
  }

  return (
    <div className="my-5">
      <h2 className="is-size-5 my-3">
        {number}) {translation} ({referenceWord}, {t('paradigmClass')}: <code>{paradigmClass}</code>
        {determinativ && <span>, {t('determinativ')}: <code>{determinativ}</code></span>})&nbsp;
        {!isSingleAnalysisOption && <button className="button" onClick={toggleUpdate}><IoSettingsOutline/></button>}
      </h2>

      {isSingleAnalysisOption
        ? <div className="my-3">
          <button className={classNames('button', 'is-fullwidth', 'button-text-left', {'is-link': morphologicalAnalysis.selected})}
                  onClick={() => toggleOrSetAnalysisSelection()}>
            {number} - {morphologicalAnalysis.analysis}
          </button>
        </div>
        : <div className="columns is-multiline">
          {morphologicalAnalysis.analysisOptions.map((ao, index) =>
            <div key={index} className="column is-one-third-desktop">
              <LetteredAnalysisOptionButton ao={ao} select={() => toggleOrSetAnalysisSelection(ao.letter)}/>
            </div>
          )}
        </div>
      }

      {encliticsAnalysis && 'analysisOptions' in encliticsAnalysis && <div className="columns">
        {encliticsAnalysis.analysisOptions.map((ao) =>
          <div className="column" key={ao.letter}>
            <LetteredAnalysisOptionButton ao={ao} select={() => toggleEncliticsSelection(ao.letter)}/>
          </div>
        )}
      </div>}

      {!isSingleAnalysisOption && <div className="columns">
        <div className="column is-one-third-desktop">
          <button type="button" className="button is-warning is-fullwidth" onClick={() => selectAll()}>{t('selectAllFromNumber')}</button>
        </div>
        <div className="column is-one-third-desktop">
          <button type="button" className="button is-warning is-fullwidth" onClick={() => selectAll(Numerus.Singular)}>
            {t('selectAllSingularFromNumber')}
          </button>
        </div>
        <div className="column is-one-third-desktop">
          <button type="button" className="button is-warning is-fullwidth" onClick={() => selectAll(Numerus.Plural)}>
            {t('selectAllPluralFromNumber')}
          </button>
        </div>
      </div>}

      {encliticsAnalysis && 'analysis' in encliticsAnalysis && <div className="box has-text-centered">
        {encliticsAnalysis && <span>{t('encliticsAnalysis')}: <code>{encliticsAnalysis.enclitics}</code> @ <code>{encliticsAnalysis.analysis}</code></span>
        }
      </div>}
    </div>
  );
}
