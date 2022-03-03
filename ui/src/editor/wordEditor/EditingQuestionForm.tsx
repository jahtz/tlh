import {useState} from 'react';
import {useTranslation} from 'react-i18next';

interface IProps {
  initialValue?: string;
  cancel: () => void;
  onSubmit: (value: string) => void;
}

export function EditingQuestionForm({initialValue = '', cancel, onSubmit}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [value, setValue] = useState(initialValue);

  return (
    <div>
      <input type="text" className="p-2 my-2 rounded border border-slate-500 w-full" defaultValue={value} onChange={(event) => setValue(event.target.value)}
             placeholder={t('question')}/>

      <div className="grid grid-cols-2">
        <button type="button" className="p-2 rounded-l border border-slate-500" onClick={cancel}>{t('cancel')}</button>
        <button type="button" className="p-2 rounded-r bg-blue-500 text-white" onClick={() => onSubmit(value)}>{t('addEditingQuestion')}</button>
      </div>
    </div>
  );
}