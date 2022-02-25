import {useTranslation} from 'react-i18next';

interface IProps {
  comment: string;
  removeNote: () => void;
}

export function WordQuestion({comment, removeNote}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  // FIXME: delete button!

  return (
    <div className="rounded border-l-4 border-teal-600">
      <div className="p-2 rounded-tr bg-teal-500">
        {t('note')}
        <button className="px-2 rounded bg-white float-right" onClick={removeNote}>X</button>
      </div>
      <div className="p-2 rounded-br bg-teal-400">{comment}</div>
    </div>
  );
}
