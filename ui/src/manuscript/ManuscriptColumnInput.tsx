import {MANUSCRIPT_COLUMN, MANUSCRIPT_COLUMN_MODIFIER, ManuscriptColumn, ManuscriptColumnModifier} from '../graphql';
import {useTranslation} from 'react-i18next';

interface IProps {
  column: ManuscriptColumn;
  updateColumn: (column: ManuscriptColumn) => void;
  columnModifier: ManuscriptColumnModifier;
  updateColumnModifier: (columnModifier: ManuscriptColumnModifier) => void;
  deleteColumnInput: () => void;
}

export function ManuscriptColumnInput({column, updateColumn, columnModifier, updateColumnModifier, deleteColumnInput}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <div className="my-2 flex flex-row">
      <label htmlFor="manuscriptColumn" className="p-2 font-bold">{t('column')}:</label>
      <input type="text" id="manuscriptColumn" list="manuscriptColumns" defaultValue={column} className="flex-grow p-2 rounded-l border border-slate-500"
             onChange={(event) => updateColumn(event.target.value as ManuscriptColumn)}/>

      <input type="text" id="manuscriptColumnModifier" list="manuscriptColumnModifiers" defaultValue={columnModifier}
             className="p-2 border border-slate-500" onChange={(event) => updateColumnModifier(event.target.value as ManuscriptColumnModifier)}/>

      <button type="button" className="p-2 rounded-r bg-red-600 text-white" onClick={deleteColumnInput}>X</button>

      <datalist id="manuscriptColumns">
        {MANUSCRIPT_COLUMN.map((column, index) => <option key={index} value={column}/>)}
      </datalist>

      <datalist id="manuscriptColumnModifiers">
        {MANUSCRIPT_COLUMN_MODIFIER.map((columnModifier, index) => <option key={index} value={columnModifier}/>)}
      </datalist>
    </div>
  );
}