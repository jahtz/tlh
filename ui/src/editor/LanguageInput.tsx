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
    <div className="field">
      <div className="control">
        <input defaultValue={initialValue} className="input" placeholder={t('language')} list="languages"
               onBlur={(event) => onBlur(event.target.value)}/>
      </div>

      <datalist id="languages">
        {allManuscriptLanguages.map(({abbreviation}) => <option key={abbreviation}>{abbreviation}</option>)}
      </datalist>
    </div>

  );
}