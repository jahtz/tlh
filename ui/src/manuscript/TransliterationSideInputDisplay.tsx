import {useTranslation} from 'react-i18next';
import {ManuscriptSide} from '../graphql';
import {Spec} from 'immutability-helper';
import {ColumnInput, defaultColumnInput, TransliterationColumnInputDisplay} from './TransliterationColumnInputDisplay';
import {ManuscriptSideInput} from './ManuscriptSideInput';

interface IProps extends SideInput {
  updateSideInput: (spec: Spec<SideInput>) => void;
}

export interface SideInput {
  side: ManuscriptSide;
  columns: ColumnInput[];
}

export const defaultSideInput: SideInput = {
  side: ManuscriptSide.NotIdentifiable,
  columns: [defaultColumnInput]
};

export function TransliterationSideInputDisplay({side, columns, updateSideInput}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <div className="p-4 rounded border border-slate-300 shadow-md shadow-slate-200">

      <ManuscriptSideInput currentSide={side} update={(side) => updateSideInput({side: {$set: side}})}/>

      {/* TODO: <ObjectSelect label={t('defaultLanguage')} id={'language'} currentValue={state.language} options={languageOptions}
      onUpdate={(language) => setState((state) => update(state, {language: {$set: language}}))}/> */}

      {columns.map((columnInput, index) =>
        <TransliterationColumnInputDisplay
          key={index}{...columnInput}
          updateColumnInput={(spec) => updateSideInput({columns: {[index]: spec}})}
          deleteColumnInput={() => updateSideInput({columns: {$splice: [[index, 1]]}})}/>
      )}

      <button type="button" className="my-2 p-2 rounded bg-blue-600 text-white" onClick={() => updateSideInput({columns: {$push: [defaultColumnInput]}})}>
        + {t('addColumn')}
      </button>
    </div>
  );
}