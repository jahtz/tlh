import {useTranslation} from 'react-i18next';

interface IProps {
  comment: string;
  removeNote: () => void;
}

export function WordQuestion({comment, removeNote}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  // FIXME: delete button!

  return (
    <div className="p-2 mt-4 rounded border-l-4 border-teal-600 bg-teal-300">
      <div className="message-header">
        <p>{t('note')}</p>
        <button className="delete" onClick={removeNote}/>
      </div>
      <div className="message-body">{comment}</div>
    </div>
  );
}
