import {useState} from 'react';
import {useTranslation} from 'react-i18next';

interface IProps {
  onSubmit: (value: string) => void;
}

export function WordQuestionForm({onSubmit}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [value, setValue] = useState('');

  return (
    <>
      <div className="field">
        <input type="text" defaultValue={value} onChange={(event) => setValue(event.target.value)} className="input" placeholder={t('question')}/>
      </div>

      <button type="button" className="button is-primary is-fullwidth" onClick={() => onSubmit(value)}>
        {t('addNote')}
      </button>
    </>
  );
}