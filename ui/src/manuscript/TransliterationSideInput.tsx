import {useState} from 'react';
import {ManuscriptColumn, ManuscriptColumnModifier, manuscriptColumnModifiers, manuscriptColumns,} from '../model/manuscriptProperties/manuscriptProperties';
import {allManuscriptLanguages, ManuscriptLanguage} from '../model/manuscriptProperties/manuscriptLanugage';
import {useTranslation} from 'react-i18next';
import {defaultSideBasics, SideBasics, SideParseResult} from '../model/sideParseResult';
import {ObjectSelect, SelectOption} from '../forms/BulmaFields';
import {Transliteration} from './TransliterationLineResult';
import {transliterationLine, TransliterationLine, xmlifyTransliterationLine} from '../model/transliterationLine';
import {ManuscriptSide, TransliterationInput} from '../graphql';
import {BulmaTabs, Tabs} from '../genericElements/BulmaTabs';
import {getNameForManuscriptSide, manuscriptSides} from '../model/manuscriptProperties/manuscriptSide';
import {LineParseResult, parseTransliterationLine} from '../model/lineParseResult';

interface IProps {
  textId: string;
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
      render: () => <div className="p-2 rounded border border-slate-300 shadow shadow-slate-200">
        {exportAsXml(mainIdentifier, sideParseResult).map((line, index) => <p key={index}>{line}</p>)}
      </div>
    }
  };

  return <BulmaTabs tabs={tabConfigs}/>;
}

export function TransliterationSideInput({textId, onTransliterationUpdate}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [state, setState] = useState<IState>({sideBasics: defaultSideBasics});

  const manuscriptSideOptions: SelectOption<ManuscriptSide>[] = manuscriptSides
    .map((side) => ({value: side, label: getNameForManuscriptSide(side, t)}));

  const languageOptions: SelectOption<ManuscriptLanguage>[] = allManuscriptLanguages
    .map((language) => ({value: language, label: language.toString()}));

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

        const parseResult: LineParseResult = parseTransliterationLine(lineInput);

        if ('error' in parseResult) {
          // TODO: pre parsing error
          return transliterationLine(lineInput);
        }

        if ('errors' in parseResult) {
          // TODO: word parser errors
          return transliterationLine(lineInput);
        }

        const {lnr, words, maybeParagraphSeparator} = parseResult;

        return transliterationLine(lineInput, {type: 'AOLineBreak', textId, lnr, language, words, maybeParagraphSeparator});
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
      resultXml: exportAsXml(textId, sideParseResult).join('\n'),
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
    <div className="p-2 rounded border border-slate-300 shadow-md shadow-slate-200">
      <div className="grid grid-cols-4 gap-2">
        <ObjectSelect label={t('manuscriptSide')} id={'manuscriptSide'} currentValue={state.sideBasics.side}
                      options={manuscriptSideOptions} onUpdate={(side) => updateSideBasics({side})}/>

        <ObjectSelect label={t('defaultLanguage')} id={'language'} currentValue={state.sideBasics.language}
                      options={languageOptions} onUpdate={(language) => updateSideBasics({language})}/>

        <ObjectSelect label={t('manuscriptColumn')} id={'manuscriptColumn'} currentValue={state.sideBasics.column}
                      options={columnOptions} onUpdate={(column) => updateSideBasics({column})}/>

        <ObjectSelect label={t('manuscriptColumnModifier')} id={'manuscriptColumnModifier'}
                      currentValue={state.sideBasics.columnModifier} options={columnModifierOptions}
                      onUpdate={(columnModifier) => updateSideBasics({columnModifier})}/>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div>
          <label className="font-bold block text-center">{t('transliteration')}:</label>
          <textarea className="mt-2 p-2 rounded border border-slate-500 w-full" name="transliteration" placeholder={t('transliteration')}
                    rows={20} onChange={(event) => updateTransliteration(event.target.value)}/>
        </div>

        <div>
          <label className="font-bold block text-center">{t('parseResult')}:</label>

          {state.sideParseResult
            ? <SideParseResultComponent mainIdentifier={textId} sideParseResult={state.sideParseResult}/>
            : <div className="notification is-info has-text-centered">{t('no_result_yet')}</div>}
        </div>
      </div>
    </div>
  );
}