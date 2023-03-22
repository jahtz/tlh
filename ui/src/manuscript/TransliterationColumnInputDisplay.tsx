import {useTranslation} from 'react-i18next';
import {ColumnParseResultComponent} from './ColumnParseResultComponent';
import {ManuscriptColumn, ManuscriptColumnModifier} from '../graphql';
import {ManuscriptColumnInput} from './ManuscriptColumnInput';
import {Spec} from 'immutability-helper';
import {StatusEventCode, StatusLevel, TLHParser} from 'simtex';
import {XmlNode} from 'simple_xml';

export interface IStatusEvent {
  readonly level: StatusLevel,
  readonly code: StatusEventCode,
  readonly message: string
}

export interface LineParseResult {
  readonly statusLevel: StatusLevel;
  readonly events: IStatusEvent[];
  readonly nodes: XmlNode[];
}

export interface ColumnInput {
  column: ManuscriptColumn;
  columnModifier: ManuscriptColumnModifier;
  parserStatusLevel: StatusLevel;
  currentLineParseResult: LineParseResult[];
}

export const defaultColumnInput: ColumnInput = {
  column: ManuscriptColumn.I,
  columnModifier: ManuscriptColumnModifier.None,
  parserStatusLevel: StatusLevel.ok,
  currentLineParseResult: []
};

interface IProps extends ColumnInput {
  updateColumnInput: (spec: Spec<ColumnInput>) => void;
  deleteColumnInput: () => void;
}

export function TransliterationColumnInputDisplay({column, columnModifier, currentLineParseResult, updateColumnInput, deleteColumnInput}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  const updateTransliteration = (value: string): void => {
    const parser = new TLHParser(value);

    const parserLevel: StatusLevel = parser.getStatus().getLevel();

    const lineResults = parser.getLines().map<LineParseResult>((line) => {
      return {
        statusLevel: line.getStatus().getLevel(),
        events: line.getStatus().getEvents().map((statusEvent) => (
          {level: statusEvent.getLevel(), code: statusEvent.getCode(), message: statusEvent.getMessage()}
        )),
        nodes: line.exportXml()
      };
    });

    updateColumnInput({
      parserStatusLevel: {$set: parserLevel},
      currentLineParseResult: {$set: lineResults}
    });
  };

  return (
    <div className="mt-2 p-2 rounded border border-slate-500">

      <ManuscriptColumnInput
        column={column}
        updateColumn={(column) => updateColumnInput({column: {$set: column}})}
        columnModifier={columnModifier}
        updateColumnModifier={(columnModifier) => updateColumnInput({columnModifier: {$set: columnModifier}})}
        deleteColumnInput={deleteColumnInput}/>

      <div className="grid grid-cols-3 gap-2">
        <section>
          <label className="font-bold block text-center">{t('transliteration')}:</label>
          <textarea className="mt-2 p-2 rounded border border-slate-500 w-full" placeholder={t('transliteration') || 'transliteration'}
                    rows={20} onChange={(event) => updateTransliteration(event.target.value)}/>
        </section>

        <section className="col-span-2">
          <label className="font-bold block text-center">{t('parseResult')}:</label>

          {currentLineParseResult.length > 0
            ? <ColumnParseResultComponent lines={currentLineParseResult}/>
            : <div className="p-2 italic text-cyan-500 text-center">{t('no_result_yet')}...</div>}
        </section>
      </div>
    </div>
  );
}