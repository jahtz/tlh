import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {MorphAnalysisOptionIProps, Numerus} from './MorphologicalAnalysisOption';
import {IoSettingsOutline} from 'react-icons/io5';
import {LetteredAnalysisOptionButton} from './LetteredAnalysisOptionButton';
import classNames from 'classnames';
import {toggleStringValue} from '../../toggleValue';


interface MorphAnalysisButtonIProps {
  number: number;
  letter?: string;
  analysis: string;
  isSelected: boolean;
  select: (multipleChoice: boolean) => void;
}

function MorphAnalysisOptionButton({number, letter, analysis, isSelected, select}: MorphAnalysisButtonIProps): JSX.Element {
  return (
    <button type="button" onClick={(event) => select(event.ctrlKey || event.metaKey)}
            className={classNames('button', 'is-fullwidth', 'button-text-left', {'is-link': isSelected})}>
      {number}{letter} - {analysis}
    </button>
  );
}


interface IProps extends MorphAnalysisOptionIProps {
  toggleUpdate: () => void;
}

export function MorphAnalysisOptionButtons({morphologicalAnalysis, selectedOptions, selectAll, updateSelected: up, toggleUpdate}: IProps): JSX.Element {

  const {number, translation, referenceWord, paradigmClass, encliticsAnalysis, determinativ} = morphologicalAnalysis;

  const {t} = useTranslation('common');
  const [selectedEncliticLetters, setSelectedEncliticLetters] = useState<string[]>([]);

  const isSingleAnalysisOption = 'analysis' in morphologicalAnalysis;

  const needsEncliticsChoice = !!encliticsAnalysis && 'analysisOptions' in encliticsAnalysis;

  function updateSelectedEncliticsAnalysis(letter: string, multipleChoice: boolean): void {
    setSelectedEncliticLetters((oldEncliticLetters) => toggleStringValue(oldEncliticLetters, letter, multipleChoice));
  }

  function updateSelectedAnalysis(letter: string | undefined, isMultipleChoice: boolean): void {
    if (!needsEncliticsChoice) {
      up({number, letter}, isMultipleChoice);
    } else if (selectedEncliticLetters.length > 0) {
      // only single analysis
      up({number, letter, enclitics: selectedEncliticLetters}, isMultipleChoice);
    }
  }

  // selectedOptions.forEach((x) => console.info(number + ' :: ' + JSON.stringify(x)));

  const selectedEnclitics = selectedOptions.length > 0
    ? (selectedOptions[0].enclitics || []) :
    [];

  return (
    <div className="my-5">
      <h2 className="is-size-5 my-3">
        {number}) {translation} ({referenceWord}, {t('paradigmClass')}: <code>{paradigmClass}</code>
        {determinativ && <span>, {t('determinativ')}: <code>{determinativ}</code></span>})&nbsp;
        {!isSingleAnalysisOption && <button className="button" onClick={toggleUpdate}><IoSettingsOutline/></button>}
      </h2>

      {isSingleAnalysisOption
        ? <div className="my-3">
          <MorphAnalysisOptionButton number={number} analysis={morphologicalAnalysis.analysis} isSelected={selectedOptions.length > 0}
                                     select={(mc) => updateSelectedAnalysis(undefined, mc)}/>
        </div>
        : <div className="columns is-multiline">
          {morphologicalAnalysis.analysisOptions.map(({letter, analysis}, index) =>
            <div key={index} className="column is-one-third-desktop">
              <MorphAnalysisOptionButton number={number} letter={letter} analysis={analysis} isSelected={!!selectedOptions.find(({letter: l}) => letter === l)}
                                         select={(mc) => updateSelectedAnalysis(letter, mc)}/>
            </div>
          )}
        </div>
      }

      {encliticsAnalysis && 'analysisOptions' in encliticsAnalysis && <div className="columns">
        {encliticsAnalysis.analysisOptions.map(({letter, analysis}) =>
          <div className="column" key={letter}>
            <LetteredAnalysisOptionButton
              letter={letter} analysis={analysis}
              isPreSelected={selectedEncliticLetters.includes(letter)}
              isSelected={/* TODO! */selectedEnclitics.includes(letter)}
              select={(multipleChoice) => updateSelectedEncliticsAnalysis(letter, multipleChoice)}/>
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
