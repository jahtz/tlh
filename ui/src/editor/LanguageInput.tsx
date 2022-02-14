import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {allManuscriptLanguagesSelector} from '../store/store';

interface IProps {
  initialValue: string | undefined;
  onBlur: (value: string) => void;
}

export function LanguageInput({initialValue, onBlur}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const allManuscriptLanguages = useSelector(allManuscriptLanguagesSelector);

  return (
    <div>
      <label htmlFor="language" className="font-bold">{t('language')}:</label>

      <input defaultValue={initialValue} id="language" className="p-2 rounded border border-slate-500 mt-2 w-full" placeholder={t('language')} list="languages"
             onBlur={(event) => onBlur(event.target.value)}/>

      <datalist id="languages">
        {allManuscriptLanguages.map(({abbreviation}) => <option key={abbreviation}>{abbreviation}</option>)}
      </datalist>
    </div>

  );
}