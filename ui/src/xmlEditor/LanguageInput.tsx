import {useTranslation} from 'react-i18next';
import {JSX} from 'react';
import {getNameForManuscriptLanguageAbbreviation, manuscriptLanguageAbbreviations} from '../forms/manuscriptLanguageAbbreviations';

interface IProps {
  initialValue: string | undefined;
  parentLanguages?: { [key: string]: string | undefined };
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function LanguageInput({initialValue, parentLanguages, onChange, onFocus, onBlur}: IProps): JSX.Element {

  const {t} = useTranslation('common');
 
  const parentLangs = parentLanguages !== undefined
    ? Object.entries(parentLanguages)
      .map(([key, language]) => `${key}: ${language}`)
      .join(', ')
    : undefined;

  return (
    <div className="flex rounded border border-slate-500">
      <label htmlFor="language" className="p-2 rounded-l bg-slate-100 border-r border-slate-500 font-bold">
        {t('language')}{parentLangs && <> ({parentLangs})</>}:
      </label>

      <input defaultValue={initialValue} id="language" className="flex-grow p-2 rounded-r" placeholder={t('language') || 'language'}
             list="languages" onChange={(event) => onChange(event.target.value)} onFocus={onFocus} onBlur={onBlur}/>

      <datalist id="languages">
        {manuscriptLanguageAbbreviations.map((abbreviation) => <option key={abbreviation} value={abbreviation}>
          {getNameForManuscriptLanguageAbbreviation(abbreviation, t)}
        </option>)}
      </datalist>
    </div>
  );
}