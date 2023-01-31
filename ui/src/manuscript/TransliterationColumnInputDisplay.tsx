import {useTranslation} from 'react-i18next';
import {LineParseResult} from '../transliterationParser/lineParseResult';
import {SideParseResultComponent} from './SideParseResultComponent';
import {parseTransliterationLine} from '../transliterationParser/lineParser';
import {ManuscriptColumn} from '../graphql';
import {ManuscriptColumnModifier} from '../model/manuscriptProperties/manuscriptColumnModifier';
import {ManuscriptColumnInput} from './ManuscriptColumnInput';
import {Spec} from 'immutability-helper';

export interface ColumnInput {
  column: ManuscriptColumn;
  columnModifier: ManuscriptColumnModifier;
  currentLineParseResult?: LineParseResult[];
}

export const defaultColumnInput: ColumnInput = {
  column: ManuscriptColumn.I,
  columnModifier: ManuscriptColumnModifier.None,
  currentLineParseResult: undefined
};

interface IProps extends ColumnInput {
  updateColumnInput: (spec: Spec<ColumnInput>) => void;
  deleteColumnInput: () => void;
}

export function TransliterationColumnInputDisplay({column, columnModifier, currentLineParseResult, updateColumnInput, deleteColumnInput}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  const updateTransliteration = (value: string): void => updateColumnInput(
    {currentLineParseResult: {$set: value.split('\n').map((input) => parseTransliterationLine(input))}}
  );

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
          <textarea className="mt-2 p-2 rounded border border-slate-500 w-full" placeholder={t('transliteration')}
                    rows={20} onChange={(event) => updateTransliteration(event.target.value)}/>
        </section>

        <section className="col-span-2">
          <label className="font-bold block text-center">{t('parseResult')}:</label>

          {currentLineParseResult !== undefined
            ? <SideParseResultComponent lineParseResults={currentLineParseResult}/>
            : <div className="p-2 italic text-cyan-500 text-center">{t('no_result_yet')}...</div>}
        </section>
      </div>
    </div>
  );
}