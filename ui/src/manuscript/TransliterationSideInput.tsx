import React, {useState} from 'react';
import {ManuscriptColumn, ManuscriptColumnModifier, manuscriptColumnModifiers, manuscriptColumns,} from '../model/manuscriptProperties/manuscriptProperties';
import {allManuscriptLanguages, getNameForManuscriptLanguage, ManuscriptLanguage} from '../model/manuscriptProperties/manuscriptLanugage';
import {useTranslation} from 'react-i18next';
import {parseTransliterationLine} from '../transliterationParser/parser';
import {defaultSideBasics, SideBasics, SideParseResult} from '../model/sideParseResult';
import {BulmaObjectSelect, SelectOption} from '../forms/BulmaFields';
import {Transliteration} from './TransliterationLineResult';
import {transliterationLine, TransliterationLine, xmlifyTransliterationLine} from '../model/transliterationLine';
import {ManuscriptSide, TransliterationInput} from '../generated/graphql';
import {BulmaTabs, Tabs} from '../BulmaTabs';
import {getNameForManuscriptSide, manuscriptSides} from '../model/manuscriptProperties/manuscriptSide';
import {LineParseResult} from '../model/lineParseResult';
import {aoLineBreak} from '../model/sentenceContent/linebreak';

interface IProps {
  mainIdentifier: string;
  onTransliterationUpdate: (t: TransliterationInput) => void;
}

interface IState {
  sideBasics: SideBasics;
  sideParseResult?: SideParseResult;
}

interface SideBasicsUpdate {
  side?: ManuscriptSide;
  language?: ManuscriptLanguage;
  column?: ManuscriptColumn;
  columnModifier?: ManuscriptColumnModifier;
}

interface SideParseResultComponentIProps {
  mainIdentifier: string;
  sideParseResult: SideParseResult;
}


function exportAsXml(mainIdentifier: string, {lineResults}: SideParseResult): string[] {
  return lineResults.map(xmlifyTransliterationLine);
}

function SideParseResultComponent({mainIdentifier, sideParseResult}: SideParseResultComponentIProps): JSX.Element {

  const {t} = useTranslation('common');

  const tabConfigs: Tabs = {
    rendered: {
      name: t('rendered'),
      render: () => <Transliteration lines={sideParseResult.lineResults}/>
    },
    asXml: {
      name: t('asXml'),
      render: () => <div className="box">
        {exportAsXml(mainIdentifier, sideParseResult).map((line, index) => <p key={index}>{line}</p>)}
      </div>
    }
  };

  return <BulmaTabs tabs={tabConfigs}/>;
}

export function TransliterationSideInput({mainIdentifier, onTransliterationUpdate}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [state, setState] = useState<IState>({sideBasics: defaultSideBasics});

  const manuscriptSideOptions: SelectOption<ManuscriptSide>[] = manuscriptSides
    .map((side) => ({value: side, label: getNameForManuscriptSide(side, t)}));

  const languageOptions: SelectOption<ManuscriptLanguage>[] = allManuscriptLanguages
    .map((language) => ({value: language, label: getNameForManuscriptLanguage(language/*, t*/)}));

  const columnOptions: SelectOption<ManuscriptColumn>[] = manuscriptColumns
    // FIXME: label!
    .map((column) => ({value: column, label: column}));

  const columnModifierOptions: SelectOption<ManuscriptColumnModifier>[] = manuscriptColumnModifiers
    // FIXME: label!
    .map((columnModifier) => ({value: columnModifier, label: columnModifier}));

  function updateTransliteration(input: string): void {
    const language = state.sideBasics.language;

    const lineResults: TransliterationLine[] = input
      .split('\n')
      .map((lineInput) => {
        const parseResult: LineParseResult | undefined = parseTransliterationLine(lineInput);

        if (!parseResult) {
          return transliterationLine(lineInput);
        }

        const {lineNumber, words} = parseResult;

        return transliterationLine(lineInput, aoLineBreak(mainIdentifier, lineNumber, language, words));
      });

    const sideParseResult = {
      sideBasics: state.sideBasics,
      lineResults
    };

    setState((state) => {
      return {...state, sideParseResult};
    });

    onTransliterationUpdate({
      side: state.sideBasics.side,
      input,
      resultXml: exportAsXml(mainIdentifier, sideParseResult).join('\n'),
      resultJson: JSON.stringify(sideParseResult) // FIXME: what to upload?
    });
  }

  function updateSideBasics({side, language, column, columnModifier}: SideBasicsUpdate): void {
    setState((state) => {
      return {
        ...state,
        sideBasics: {
          side: side || state.sideBasics.side,
          language: language || state.sideBasics.language,
          column: column || state.sideBasics.column,
          columnModifier: columnModifier || state.sideBasics.columnModifier
        }
      };
    });
  }

  return (
    <div className="box">

      <div className="field">
        <div className="field-body">
          <BulmaObjectSelect
            label={t('manuscriptSide')} id={'manuscriptSide'} currentValue={state.sideBasics.side}
            options={manuscriptSideOptions} onUpdate={(side) => updateSideBasics({side})}/>

          <BulmaObjectSelect
            label={t('defaultLanguage')} id={'language'} currentValue={state.sideBasics.language}
            options={languageOptions} onUpdate={(language) => updateSideBasics({language})}/>

          <BulmaObjectSelect
            label={t('manuscriptColumn')} id={'manuscriptColumn'} currentValue={state.sideBasics.column}
            options={columnOptions} onUpdate={(column) => updateSideBasics({column})}/>

          <BulmaObjectSelect
            label={t('manuscriptColumnModifier')} id={'manuscriptColumnModifier'}
            currentValue={state.sideBasics.columnModifier} options={columnModifierOptions}
            onUpdate={(columnModifier) => updateSideBasics({columnModifier})}/>
        </div>
      </div>

      <div className="columns">
        <div className="column">
          <label className="label">{t('transliteration')}:</label>
          <textarea className="textarea" name="transliteration" placeholder={t('transliteration')}
                    rows={20} onChange={(event) => updateTransliteration(event.target.value)}/>
        </div>

        <div className="column">
          <label className="label">{t('parseResult')}:</label>

          {state.sideParseResult
            ? <SideParseResultComponent mainIdentifier={mainIdentifier} sideParseResult={state.sideParseResult}/>
            : <div className="notification is-info has-text-centered">{t('no_result_yet')}</div>}
        </div>
      </div>
    </div>
  );
}