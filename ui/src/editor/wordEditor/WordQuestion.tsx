import {useTranslation} from 'react-i18next';

interface IProps {
  comment: string;
  removeNote: () => void;
}

export function WordQuestion({comment, removeNote}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <div className="message is-primary">

      <div className="message-header">
        <p>{t('note')}</p>
        <button className="delete" onClick={removeNote}/>
      </div>
      <div className="message-body">{comment}</div>
    </div>
  );
}
