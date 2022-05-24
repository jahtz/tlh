import {useState} from 'react';
import {useTranslation} from 'react-i18next';

interface IProps {
  initialValue?: string;
  cancel: () => void;
  onSubmit: (value: string) => void;
  strings: {
    add: string;
    placeHolder: string;
  };
}

export function WordStringChildEditForm({initialValue = '', cancel, onSubmit, strings}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [value, setValue] = useState(initialValue);

  return (
    <div>
      <input type="text" className="p-2 my-2 rounded border border-slate-500 w-full" defaultValue={value} placeholder={strings.placeHolder}
             onChange={(event) => setValue(event.target.value)}/>

      <div className="grid grid-cols-2">
        <button type="button" className="p-2 rounded-l border border-slate-500" onClick={cancel}>{t('cancel')}</button>
        <button type="button" className="p-2 rounded-r bg-blue-500 text-white" onClick={() => onSubmit(value)}>{strings.add}</button>
      </div>
    </div>
  );
}